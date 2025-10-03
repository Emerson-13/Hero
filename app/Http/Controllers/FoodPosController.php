<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Ingredient;
use App\Models\Menu;
use App\Models\Order;
use App\Models\OrderMenu;
use App\Models\Transaction;
use App\Models\Discount;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Models\PrinterDevice;
use Illuminate\Support\Facades\Log;
use Mike42\Escpos\Printer;
use Mike42\Escpos\PrintConnectors\WindowsPrintConnector;

class FoodPosController extends Controller
{
    public function index(Request $request)
    {
        $userId = auth()->id();

        $query = Menu::with('ingredients')->where('user_id', $userId);

        // Filter by category if selected
        if ($request->has('category') && $request->category !== 'all') {
            $query->where('category_id', $request->category);
        }

        // Filter by search keyword
        if ($request->has('search') && $request->search !== '') {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                ->orWhere('description', 'like', "%$search%")
                ->orWhere('barcode', 'like', "%$search%")
                ->orWhere('price', 'like', "%$search%");
            });
        }

        // Paginate menus
        $menus = $query->paginate(6)->withQueryString();

        // Compute stock and servings
        $menus->getCollection()->transform(function ($menu) {
            $stock = PHP_INT_MAX;
            $computedServings = [];

            foreach ($menu->ingredients as $ingredient) {
                $needed = $ingredient->pivot->quantity ?? 0;
                $available = $needed > 0 ? floor($ingredient->stock / $needed) : 0;
                $stock = min($stock, $available);

                $computedServings[] = [
                    'ingredient_id' => $ingredient->id,
                    'ingredient_name' => $ingredient->name,
                    'needed_per_menu' => $needed,
                    'available_stock' => $ingredient->stock,
                    'possible_servings' => $available,
                ];
            }

            $menu->computed_stock = $stock === PHP_INT_MAX ? 0 : $stock;
            $menu->computed_servings = $computedServings;

            return $menu;
        });

        $categories = Category::where('user_id', $userId)->get();

        $totals = null;
        if ($request->filled('menu')) {
            $menusInput = $request->input('menus', []);
            $discountCode = $request->input('discount_code');
            $amountPaid = $request->input('amount_paid', 0);
            $totals = $this->computeTotals($menusInput, $discountCode, $amountPaid, $userId);
        }

        return Inertia::render('User/PosMenu', [
            'menus' => $menus,
            'categories' => $categories,
            'selectedCategory' => $request->category ?? 'all',
            'search' => $request->search ?? '',
            'totals' => $totals,
            'user_id' => $userId,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_name' => 'nullable|string|max:255',
            'payment_method' => 'required|string',
            'reference_number' => 'nullable|string|required_if:payment_method,online,credit,debit',
            'menus' => 'required|array|min:1',
            'menus.*.menu_id' => 'required|exists:menus,id',
            'menus.*.quantity' => 'required|integer|min:1',
            'amount_paid' => 'required|numeric|min:0',
            'discount_code' => 'nullable|string',
            'shipping_address' => 'nullable|string',
        ]);

        $userId = auth()->id();

        // --- Discount handling (same as bago mo) ---
        $enteredCode = strtoupper(trim($validated['discount_code'] ?? ''));
        $discount = Discount::where('user_id', $userId)
            ->where('code', $enteredCode)
            ->where('is_active', true)
            ->first();

        $discountRate = $discount && $discount->type === 'percentage' ? ($discount->value / 100) : 0;
        $discountValue = $discount && $discount->type === 'fixed' ? $discount->value : 0;
        $discountType = $discount->discount_type ?? null;
        $isGov = $discountType === 'gov';
        $appliesTo = $discount->applies_to ?? 'none';

        $targetIds = [];
        if ($discount && isset($discount->target_ids)) {
            $targetIds = is_array($discount->target_ids)
                ? $discount->target_ids
                : json_decode($discount->target_ids, true) ?? [];
        }

        DB::beginTransaction();

        try {
            // master order
            $order = Order::create([
                'user_id' => $userId,
                'amount_paid' => $validated['amount_paid'],
                'subtotal' => 0,
                'total_discount' => 0,
                'total_tax' => 0,
                'total_price' => 0,
                'change' => 0,
                'status' => 'completed',
                'payment_status' => 'paid',
                'shipping_address' => $validated['shipping_address'] ?? null,
            ]);

            $subtotal = 0;
            $totalTax = 0;
            $totalDiscount = 0;
            $grandTotal = 0;

            $neededIngredients = [];
                $menusCache = [];

                foreach ($validated['menus'] as $menuData) {
                    $menu = Menu::with('ingredients')->where('user_id', $userId)->findOrFail($menuData['menu_id']);
                    $menusCache[$menu->id] = $menu;
                    $qty = (int)$menuData['quantity'];

                    foreach ($menu->ingredients as $ingredient) {
                        $perMenuQty = (float)($ingredient->pivot->quantity ?? 0);
                        $need = $perMenuQty * $qty;
                        if (!isset($neededIngredients[$ingredient->id])) $neededIngredients[$ingredient->id] = 0;
                        $neededIngredients[$ingredient->id] += $need;
                    }
                }

                // --- lock ingredients and check stock ---
                $ingredientRecords = Ingredient::whereIn('id', array_keys($neededIngredients))
                    ->lockForUpdate()
                    ->get()
                    ->keyBy('id');

                $shortages = [];
                foreach ($neededIngredients as $ingId => $needQty) {
                    $ingredient = $ingredientRecords->get($ingId);
                    if (!$ingredient) throw new \Exception("Ingredient id {$ingId} not found");
                    if ($ingredient->stock < $needQty) $shortages[] = "{$ingredient->name} needs {$needQty}, available {$ingredient->stock}";
                }

                if (!empty($shortages)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Not enough stock for some ingredients',
                        'shortages' => $shortages
                    ], 400);
                }

                // --- deduct stock ---
                foreach ($neededIngredients as $ingId => $needQty) {
                    $ingredientRecords->get($ingId)->decrement('stock', $needQty);
                }

            // 3) create OrderMenu rows and compute totals
            foreach ($validated['menus'] as $menuData) {
                $menu = $menusCache[$menuData['menu_id']];
                $qty = (int)$menuData['quantity'];
                $price = (float)$menu->price;
                $lineSubtotal = $qty * $price;
                $subtotal += $lineSubtotal;

                // --- Discount
                $isDiscounted = false;
                if ($discount) {
                    if ($appliesTo === 'all') $isDiscounted = true;
                    elseif ($appliesTo === 'categories' && in_array($menu->category_id, $targetIds)) $isDiscounted = true;
                    elseif ($appliesTo === 'menus' && in_array($menu->id, $targetIds)) $isDiscounted = true;
                }

                $discountAmount = 0;
                $vat = 0;
                $taxType = strtolower(trim($menu->tax_type));

                if ($isDiscounted) {
                    if ($isGov) {
                        $discountAmount = $discountRate > 0
                            ? $lineSubtotal * $discountRate
                            : $discountValue * $qty;
                        $vat = 0;
                    } else {
                        if ($taxType === 'vatable') {
                            $vat = $lineSubtotal * 0.12;
                            $discountAmount = $discountRate > 0
                                ? $lineSubtotal * $discountRate
                                : $discountValue * $qty;
                        } elseif ($taxType === 'zero_rated') {
                            $discountAmount = $discountRate > 0
                                ? $lineSubtotal * $discountRate
                                : $discountValue * $qty;
                            $vat = 0;
                        } elseif ($taxType === 'vat_exempt') {
                            $vat = $lineSubtotal * 0.12;
                            $discountAmount = $discountRate > 0
                                ? $lineSubtotal * $discountRate
                                : $discountValue * $qty;
                        }
                    }
                } else {
                    if ($taxType === 'vatable') $vat = $lineSubtotal * 0.12;
                    elseif ($taxType === 'zero_rated') $vat = 0;
                    elseif ($taxType === 'vat_exempt') $vat = $lineSubtotal * 0.12;
                }

                $totalTax += $vat;
                $totalDiscount += $discountAmount;
                $lineTotal = $lineSubtotal + $vat - $discountAmount;
                $grandTotal += $lineTotal;
    
                // create order_menu record
                OrderMenu::create([
                    'order_id' => $order->id,
                    'menu_id' => $menu->id,
                    'menu_name' => $menu->name,
                    'quantity' => $qty,
                    'price' => $price,
                    'discount' => round($discountAmount, 2),
                    'tax' => round($vat, 2),
                    'subtotal' => round($lineTotal, 2),
                    'total' => round($lineTotal, 2),
                ]);
            }

            // 4) All checks passed — decrement ingredient stocks (single pass)
            foreach ($neededIngredients as $ingId => $needQty) {
                // using query decrement is atomic; we locked earlier, so this is safe
                Ingredient::where('id', $ingId)->decrement('stock', $needQty);
            }

            $change = max($validated['amount_paid'] - $grandTotal, 0);

            $order->update([
                'subtotal' => round($subtotal, 2),
                'total_discount' => round($totalDiscount, 2),
                'total_tax' => round($totalTax, 2),
                'total_price' => round($grandTotal, 2),
                'change' => round($change, 2),
            ]);

            // transaction creation (same as before)...
            $transaction = Transaction::create([
                'order_id' => $order->id,
                'user_id' => $userId,
                'amount' => $grandTotal,
                'payment_method' => $validated['payment_method'],
                'status' => 'success',
                'reference_number' => $validated['reference_number'] ?? null,
                'invoice_number' => 'INV-' . strtoupper(Str::random(8)),
                'transaction_date' => now(),
            ]);

            DB::commit();
                    // --- Printing Receipt (same as before, just loop sa OrderMenu) ---
                    try {
                        $printerDevice = PrinterDevice::where('user_id', $userId)->first();
                        if (!$printerDevice) throw new \Exception('No printer device found.');

                        $printerName = trim($printerDevice->name);
                        $connector = new WindowsPrintConnector($printerName);
                        $printer = new Printer($connector);

                        $user = $order->user;
                        $userName = $user->company_name ?? $user->name;
                        $userAddress = $user->address ?? '';

                        $printer->setJustification(Printer::JUSTIFY_CENTER);
                        $paperWidth = 32;

                        // Header
                        $header = "HERO STORE\n$userName\n$userAddress\nOfficial Receipt\n#{$transaction->invoice_number}\n"
                                . date('Y-m-d H:i:s', strtotime($transaction->created_at))
                                . "\n" . str_repeat("-", $paperWidth);
                        $printer->text($header);
                        $printer->feed();

                        // Customer info
                        $printer->setJustification(Printer::JUSTIFY_LEFT);
                        $customerInfo = "Customer: " . ($order->customer_name ?? "N/A") . "\n"
                                        . "Payment: " . $transaction->payment_method . "\n"
                                        . str_repeat("-", $paperWidth);
                        $printer->text($customerInfo);
                        $printer->feed();

                        // Menus
                        foreach ($order->menus as $menu) {
                            $menuText = $menu->menu_name . "\n";
                            $qtyPrice = "{$menu->quantity} x " . number_format($menu->price, 2);
                            $total = " " . number_format($menu->subtotal, 2);
                            $menuText .= str_pad($qtyPrice, $paperWidth - strlen($total), " ") . $total . "\n";

                            if ($menu->discount > 0) $menuText .= "Disc: " . number_format($menu->discount, 2) . "\n";
                            if ($menu->tax > 0) $menuText .= "Vat: " . number_format($menu->tax, 2) . "\n";

                            $printer->text($menuText);
                            $printer->feed();
                        }

                        $printer->text(str_repeat("-", $paperWidth));
                        $printer->feed();

                        // Totals
                        $totals = "";
                        $totals .= str_pad("Subtotal:", $paperWidth - strlen(number_format($order->subtotal, 2)), " ") . number_format($order->subtotal, 2) . "\n";
                        $totals .= str_pad("Discount:", $paperWidth - strlen(number_format($order->total_discount, 2)), " ") . number_format($order->total_discount, 2) . "\n";
                        $totals .= str_pad("VAT:", $paperWidth - strlen(number_format($order->total_tax, 2)), " ") . number_format($order->total_tax, 2) . "\n";
                        $totals .= str_pad("Total:", $paperWidth - strlen(number_format($order->total, 2)), " ") . number_format($order->total, 2) . "\n";
                        $totals .= str_pad("Paid:", $paperWidth - strlen(number_format($order->amount_paid, 2)), " ") . number_format($order->amount_paid, 2) . "\n";
                        $totals .= str_pad("Change:", $paperWidth - strlen(number_format($order->change, 2)), " ") . number_format($order->change, 2) . "\n";

                        $printer->text($totals);
                        $printer->feed(2);

                        // Footer
                        $printer->setJustification(Printer::JUSTIFY_CENTER);
                        $footer = "Thank you for your purchase!\nVisit us again :)";
                        $printer->text($footer);
                        $printer->feed(2);

                        $printer->pulse();
                        $printer->cut();
                        $printer->close();

                    } catch (\Exception $e) {
                        \Log::error("PrintReceipt Error: " . $e->getMessage());
                    }

                    return back()->with('success', 'Order recorded successfully.');

                } catch (\Exception $e) {
                    DB::rollBack();
                    Log::error("Order Store Error: " . $e->getMessage());
                    return back()->with('error', 'Failed to record order. Error: ' . $e->getMessage());
                }
            }


    public function calculate(Request $request)
    {
        $menus = $request->input('menus', []);
        $discountCode = $request->input('discount_code');
        $amountPaid = $request->input('amount_paid', 0);
        $userId = auth()->id();

        $totals = $this->computeTotals($menus, $discountCode, $amountPaid, $userId);

        return response()->json($totals);
    }

   public function computeTotals(array $menus, $discountCode, $amountPaid, $userId)
    {
        $subtotal = 0;
        $totalTax = 0;
        $totalDiscount = 0;
        $grandTotal = 0;
        $detailedMenu = [];

        $enteredCode = strtoupper(trim($discountCode ?? ''));
        $discount = Discount::where('user_id', $userId)
            ->where('code', $enteredCode)
            ->where('is_active', true)
            ->first();

        $discountRate = $discount && $discount->type === 'percentage' ? ($discount->value / 100) : 0;
        $discountValue = $discount && $discount->type === 'fixed' ? $discount->value : 0;
        $discountType = $discount->discount_type ?? null;
        $isGov = $discountType === 'gov';
        $appliesTo = $discount->applies_to ?? 'none';
        $targetIds = $discount && isset($discount->target_ids)
            ? (is_array($discount->target_ids) ? $discount->target_ids : json_decode($discount->target_ids, true) ?? [])
            : [];

        $neededIngredients = [];

        foreach ($menus as $menuData) {
            $menu = Menu::with('ingredients')->where('user_id', $userId)->findOrFail($menuData['menu_id']);
            $qty = (int)$menuData['quantity'];
            $price = (float)$menu->price;
            $lineSubtotal = $qty * $price;
            $subtotal += $lineSubtotal;

            // --- discount calc ---
            $isDiscounted = false;
            if ($discount) {
                if ($appliesTo === 'all') $isDiscounted = true;
                elseif ($appliesTo === 'categories' && in_array($menu->category_id, $targetIds)) $isDiscounted = true;
                elseif ($appliesTo === 'menus' && in_array($menu->id, $targetIds)) $isDiscounted = true;
            }

            $discountAmount = 0;
            $vat = 0;
            $taxType = strtolower(trim($menu->tax_type));

            if ($isDiscounted) {
                if ($isGov) {
                    $discountAmount = $discountRate > 0 ? $lineSubtotal * $discountRate : $discountValue * $qty;
                    $vat = 0;
                } else {
                    if ($taxType === 'vatable') {
                        $vat = $lineSubtotal * 0.12;
                        $discountAmount = $discountRate > 0 ? $lineSubtotal * $discountRate : $discountValue * $qty;
                    } elseif ($taxType === 'zero_rated') {
                        $discountAmount = $discountRate > 0 ? $lineSubtotal * $discountRate : $discountValue * $qty;
                        $vat = 0;
                    } elseif ($taxType === 'vat_exempt') {
                        $vat = $lineSubtotal * 0.12;
                        $discountAmount = $discountRate > 0 ? $lineSubtotal * $discountRate : $discountValue * $qty;
                    }
                }
            } else {
                if ($taxType === 'vatable') $vat = $lineSubtotal * 0.12;
                elseif ($taxType === 'zero_rated') $vat = 0;
                elseif ($taxType === 'vat_exempt') $vat = $lineSubtotal * 0.12;
            }

            $totalTax += $vat;
            $totalDiscount += $discountAmount;
            $lineTotal = $lineSubtotal + $vat - $discountAmount;
            $grandTotal += $lineTotal;

            $detailedMenu[] = [
                'menu_id' => $menu->id,
                'menu_name' => $menu->name,
                'quantity' => $qty,
                'price' => $price,
                'subtotal' => $lineSubtotal,
                'discount' => round($discountAmount, 2),
                'tax' => round($vat, 2),
                'total' => round($lineTotal, 2),
            ];
        }
    
         $total = $subtotal + $totalTax - $totalDiscount;
        $change = max($amountPaid - $total, 0);

        return [
            'subtotal' => round($subtotal, 2),
            'total_tax' => round($totalTax, 2),
            'total_discount' => round($totalDiscount, 2),
            'grand_total' => round($grandTotal, 2),
            'change' => round($change, 2),
            'detailed_menus' => $detailedMenu,
        ];
    }
}