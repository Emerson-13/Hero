<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Item;
use App\Models\Order;
use App\Models\OrderItem;
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

class RetailPosController extends Controller
{
    public function index(Request $request)
    {
        $userId = auth()->id();

        $query = Item::where('user_id', $userId);

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

        // Paginate
        $items = $query->paginate(6)->withQueryString();

        $categories = Category::where('user_id', $userId)->get();

        $totals = null;
        if ($request->filled('items')) {
            $itemsInput = $request->input('items', []);
            $discountCode = $request->input('discount_code');
            $amountPaid = $request->input('amount_paid', 0);
            $totals = $this->computeTotals($itemsInput, $discountCode, $amountPaid, $userId);
        }

        return Inertia::render('User/Pos', [
            'items' => $items,
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
            'items' => 'required|array|min:1',
            'items.*.item_id' => 'required|exists:items,id',
            'items.*.quantity' => 'required|integer|min:1',
            'amount_paid' => 'required|numeric|min:0',
            'discount_code' => 'nullable|string',
            'shipping_address' => 'nullable|string',
        ]);

        $userId = auth()->id();

        // --- Discount handling ---
        $enteredCode = strtoupper(trim($validated['discount_code']));
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
            // --- Create order ---
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

            foreach ($validated['items'] as $itemData) {
                $item = Item::where('user_id', $userId)->findOrFail($itemData['item_id']);
                $qty = $itemData['quantity'];
                $price = $item->price;
                $lineSubtotal = $qty * $price;
                $subtotal += $lineSubtotal;

                // --- Discount Logic ---
                $isDiscounted = false;
                if ($discount) {
                    if ($appliesTo === 'all') $isDiscounted = true;
                    elseif ($appliesTo === 'categories' && in_array($item->category_id, $targetIds)) $isDiscounted = true;
                    elseif ($appliesTo === 'items' && in_array($item->id, $targetIds)) $isDiscounted = true;
                }

                $discountAmount = 0;
                $vat = 0;
                $taxType = strtolower(trim($item->tax_type));

                if ($isDiscounted) {
                    if ($isGov) {
                        $discountAmount = $discountRate > 0
                            ? $lineSubtotal * $discountRate
                            : $discountValue * $qty;
                        $vat = 0;
                        $gross = $lineSubtotal - $discountAmount;
                    } else {
                        if ($taxType === 'vatable') {
                            $vat = $lineSubtotal * 0.12;
                            $discountAmount = $discountRate > 0
                                ? $lineSubtotal * $discountRate
                                : $discountValue * $qty;
                            $gross = $lineSubtotal + $vat - $discountAmount;
                        } elseif ($taxType === 'zero_rated') {
                            $discountAmount = $discountRate > 0
                                ? $lineSubtotal * $discountRate
                                : $discountValue * $qty;
                            $vat = 0;
                            $gross = $lineSubtotal - $discountAmount;
                        } elseif ($taxType === 'vat_exempt') {
                            $vat = $lineSubtotal * 0.12;
                            $discountAmount = $discountRate > 0
                                ? $lineSubtotal * $discountRate
                                : $discountValue * $qty;
                            $gross = $lineSubtotal + $vat - $discountAmount;
                        }
                    }
                } else {
                    if ($taxType === 'vatable') {
                        $vat = $lineSubtotal * 0.12;
                    } elseif ($taxType === 'zero_rated') {
                        $vat = 0;
                    } elseif ($taxType === 'vat_exempt') {
                        $vat = $lineSubtotal * 0.12;
                    }
                    $gross = $lineSubtotal + $vat;
                }

                $totalTax += $vat;
                $totalDiscount += $discountAmount;
                $lineTotal = $lineSubtotal + $vat - $discountAmount;
                $grandTotal += $lineTotal;
 
                // --- Create OrderItem ---
                OrderItem::create([
                    'order_id' => $order->id,
                    'item_id' => $item->id,
                    'item_name' => $item->name,
                    'quantity' => $qty,
                    'price' => $price,
                    'discount' => round($discountAmount, 2),
                    'tax' => round($vat, 2),
                    'subtotal' => round($lineTotal, 2),
                    'total' => round($lineTotal, 2),
                ]);

                $item->decrement('stock', $qty);
            }

            $change = max($validated['amount_paid'] - $grandTotal, 0);

            $order->update([
                'subtotal' => round($subtotal, 2),
                'total_discount' => round($totalDiscount, 2),
                'total_tax' => round($totalTax, 2),
                'total_price' => round($grandTotal, 2),
                'change' => round($change, 2),
            ]);

            // --- Create Transaction ---
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
            

            // --- Printing Receipt ---
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

                // Items
                foreach ($order->items as $item) {
                    $itemText = $item->item_name . "\n";
                    $qtyPrice = "{$item->quantity} x " . number_format($item->price, 2);
                    $total = " " . number_format($item->subtotal, 2);
                    $itemText .= str_pad($qtyPrice, $paperWidth - strlen($total), " ") . $total . "\n";

                    if ($item->discount > 0) $itemText .= "Disc: " . number_format($item->discount, 2) . "\n";
                    if ($item->tax > 0) $itemText .= "Vat: " . number_format($item->tax, 2) . "\n";

                    $printer->text($itemText);
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
        $items = $request->input('items', []);
        $discountCode = $request->input('discount_code');
        $amountPaid = $request->input('amount_paid', 0);
        $userId = auth()->id();

        $totals = $this->computeTotals($items, $discountCode, $amountPaid, $userId);

        return response()->json($totals);
    }

    public function computeTotals(array $items, $discountCode, $amountPaid, $userId)
    {
        $subtotal = 0;
        $totalTax = 0;
        $totalDiscount = 0;
        $grandTotal = 0;
        $detailedItems = [];

        $discount = Discount::where('user_id', $userId)
            ->where('code', strtoupper(trim($discountCode)))
            ->where('is_active', true)
            ->first();

        $discountRate = 0;
        $discountValue = 0;
        $discountType = null;
        $appliesTo = 'none';
        $targetIds = [];
        $isGov = false;

        if ($discount) {
            $discountRate = $discount->type === 'percentage' ? ($discount->value / 100) : 0;
            $discountValue = $discount->type === 'fixed' ? $discount->value : 0;
            $discountType = $discount->discount_type;
            $isGov = $discountType === 'gov';
            $appliesTo = $discount->applies_to;
            $targetIds = is_array($discount->target_ids)
                ? $discount->target_ids
                : json_decode($discount->target_ids, true) ?? [];
        }

        foreach ($items as $itemData) {
            $item = Item::where('user_id', $userId)->findOrFail($itemData['item_id']);
            $qty = $itemData['quantity'];
            $price = $item->price;
            $lineSubtotal = $qty * $price;
            $subtotal += $lineSubtotal;

            $isDiscounted = false;
            if ($discount) {
                if ($appliesTo === 'all') $isDiscounted = true;
                elseif ($appliesTo === 'categories' && in_array($item->category_id, $targetIds)) $isDiscounted = true;
                elseif ($appliesTo === 'items' && in_array($item->id, $targetIds)) $isDiscounted = true;
            }

            $discountAmount = 0;
            $vat = 0;
            $taxType = strtolower(trim($item->tax_type));

            if ($isDiscounted) {
                if ($isGov) {
                    $discountAmount = $discountRate > 0
                        ? $lineSubtotal * $discountRate
                        : $discountValue * $qty;
                    $vat = 0;
                    $gross = $lineSubtotal - $discountAmount;
                } else {
                    if ($taxType === 'vatable') {
                        $vat = $lineSubtotal * 0.12;
                        $discountAmount = $discountRate > 0
                            ? $lineSubtotal * $discountRate
                            : $discountValue * $qty;
                        $gross = $lineSubtotal + $vat - $discountAmount;
                    } elseif ($taxType === 'zero_rated') {
                        $discountAmount = $discountRate > 0
                            ? $lineSubtotal * $discountRate
                            : $discountValue * $qty;
                        $vat = 0;
                        $gross = $lineSubtotal - $discountAmount;
                    } elseif ($taxType === 'vat_exempt') {
                        $vat = $lineSubtotal * 0.12;
                        $discountAmount = $discountRate > 0
                            ? $lineSubtotal * $discountRate
                            : $discountValue * $qty;
                        $gross = $lineSubtotal + $vat - $discountAmount;
                    }
                }
            } else {
                if ($taxType === 'vatable') {
                    $vat = $lineSubtotal * 0.12;
                } elseif ($taxType === 'zero_rated') {
                    $vat = 0;
                } elseif ($taxType === 'vat_exempt') {
                    $vat = $lineSubtotal * 0.12;
                }

                $gross = $lineSubtotal + $vat;
            }

            $totalTax += $vat;
            $totalDiscount += $discountAmount;
            $lineTotal = $lineSubtotal + $vat - $discountAmount;
            $grandTotal += $lineTotal;

            $detailedItems[] = [
                'item_id' => $item->id,
                'quantity' => $qty,
                'tax' => round($vat, 2),
                'discount' => round($discountAmount, 2),
                'line_total' => round($lineTotal, 2),
            ];
        }

        $total = $subtotal + $totalTax - $totalDiscount;
        $change = max($amountPaid - $total, 0);

        return [
            'subtotal' => round($subtotal, 2),
            'discount' => round($totalDiscount, 2),
            'tax' => round($totalTax, 2),
            'total' => round($total, 2),
            'change' => round($change, 2),
            'items' => $detailedItems,
        ];
    }
}
