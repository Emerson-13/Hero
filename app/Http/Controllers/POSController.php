<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Category;
use App\Models\Product;
use App\Models\Sale;
use App\Models\Transaction;
use App\Models\Discount;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use App\Models\PrinterDevice;
use Illuminate\Support\Facades\Log;
use Mike42\Escpos\Printer;
use Mike42\Escpos\PrintConnectors\WindowsPrintConnector;


class POSController extends Controller
{
 public function index(Request $request)
{
    $merchantId = auth()->user()->merchant_id ?? auth()->id();

    $query = Product::where('merchant_id', $merchantId);

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

    // Paginate the filtered result
    $products = $query->paginate(6)->withQueryString(); // keeps search/category in pagination links

    $categories = Category::where('merchant_id', $merchantId)->get();

    $totals = null;
    if ($request->filled('items')) {
        $items = $request->input('items', []);
        $discountCode = $request->input('discount_code');
        $amountPaid = $request->input('amount_paid', 0);
        $totals = $this->computeTotals($items, $discountCode, $amountPaid, $merchantId);
    }

    return Inertia::render('Merchant/Pos', [
        'products' => $products,
        'categories' => $categories,
        'selectedCategory' => $request->category ?? 'all',
        'search' => $request->search ?? '',
        'totals' => $totals,
        'merchant_id' => $merchantId,
    ]);
}

public function store(Request $request)
{
    $validated = $request->validate([
        'customer_name' => 'nullable|string|max:255',
        'payment_method' => 'required|string',
        'items' => 'required|array|min:1',
        'items.*.product_id' => 'required|exists:products,id',
        'items.*.quantity' => 'required|integer|min:1',
        'total' => 'required|numeric|min:0',
        'amount_paid' => 'required|numeric|min:0',
        'discount_code' => 'nullable|string',
    ]);

    $user = auth()->user();
    $merchantId = $user->merchant_id ?? $user->id;
    $staffId = $user->merchant_id ? $user->id : null;

    $enteredCode = strtoupper(trim($validated['discount_code']));
    $discount = Discount::where('merchant_id', $merchantId)
        ->where('code', $enteredCode)
        ->where('is_active', true)
        ->first();

    $discountRate = $discount && $discount->type === 'percentage' ? ($discount->value / 100) : 0;
    $discountValue = $discount && $discount->type === 'fixed' ? $discount->value : 0;
    $discountType = $discount->discount_type ?? null; // 'gov' or 'promo'
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
        $transaction = Transaction::create([
            'merchant_id' => $merchantId,
            'staff_id' => $staffId,
            'invoice_number' => 'INV-' . strtoupper(Str::random(8)),
            'payment_method' => $validated['payment_method'],
            'customer_name' => $validated['customer_name'],
            'amount_paid' => $validated['amount_paid'],
            'total' => 0,
            'reference_number' => null,
            'status' => 'complete',
        ]);

        $subtotal = 0;
        $totalTax = 0;
        $totalDiscount = 0;
        $grandTotal = 0;

        foreach ($validated['items'] as $item) {
            $product = Product::where('merchant_id', $merchantId)->findOrFail($item['product_id']);
            $qty = $item['quantity'];
            $price = $product->price;
            $lineSubtotal = $qty * $price;

            $subtotal += $lineSubtotal;

            $isDiscounted = false;
            if ($discount) {
                if ($appliesTo === 'all') {
                    $isDiscounted = true;
                } elseif ($appliesTo === 'categories' && in_array($product->category_id, $targetIds)) {
                    $isDiscounted = true;
                } elseif ($appliesTo === 'products' && in_array($product->id, $targetIds)) {
                    $isDiscounted = true;
                }
            }

            $discountAmount = 0;
            $tax = 0;

            if ($isDiscounted) {
                if ($isGov) {
                    // GOV: No VAT, discount from raw standard price
                    $discountAmount = $discountRate > 0
                        ? $lineSubtotal * $discountRate
                        : $discountValue * $qty;
                } else {
                    // PROMO: Apply VAT first, then discount
                    $vat = $lineSubtotal * 0.12;
                    $tax += $vat;
                    $gross = $lineSubtotal + $vat;

                    $discountAmount = $discountRate > 0
                        ? $gross * $discountRate
                        : $discountValue * $qty;

                    $totalTax += $tax;
                }
            } else {
                // No discount, normal VAT
                $tax = $lineSubtotal * 0.12;
                $totalTax += $tax;
            }

            $totalDiscount += $discountAmount;

            $lineTotal = $lineSubtotal + $tax - $discountAmount;
            $grandTotal += $lineTotal;

            Sale::create([
                'transaction_id' => $transaction->id,
                'product_id' => $product->id,
                'product_name' => $product->name,
                'quantity' => $qty,
                'price' => $price,
                'discount' => round($discountAmount, 2),
                'tax' => round($tax, 2),
                'total' => round($lineTotal, 2),
            ]);

            $product->decrement('stock', $qty);
        }

        $change = max($validated['amount_paid'] - $grandTotal, 0);

        $transaction->update([
            'subtotal' => round($subtotal, 2),
            'discount' => round($totalDiscount, 2),
            'tax' => round($totalTax, 2),
            'total' => round($grandTotal, 2),
            'change' => round($change, 2),
        ]);

        DB::commit();
         Log::info("Attempting to print receipt for transaction ID: {$transaction->id}");
        // === Printing receipt ===
        try {
               \Log::info('Attempting to print receipt for transaction ID: ' . $transaction->id);

    $printerDevice = PrinterDevice::first();

    if (!$printerDevice) {
        \Log::error('No printer device found in database.');
        throw new \Exception('No printer device found.');
    }

    $printerName = $printerDevice->name;

    \Log::info('Using printer name: ' . $printerName);

    $connector = new \Mike42\Escpos\PrintConnectors\WindowsPrintConnector($printerName);
    $printer = new \Mike42\Escpos\Printer($connector);

            $merchantName = $transaction->merchant->company_name ?? $transaction->merchant->name;
            $merchantAddress = $transaction->merchant->address ?? '';

            $printer->setJustification(Printer::JUSTIFY_CENTER);
            $printer->text("HERO STORE\n");
            $printer->text($merchantName . "\n");
            $printer->text($merchantAddress . "\n");
            $printer->text("Official Receipt\n");
            $printer->text("#" . $transaction->invoice_number . "\n");
            $printer->text(date('Y-m-d H:i:s', strtotime($transaction->created_at)) . "\n");
            $printer->feed();

            $printer->setJustification(Printer::JUSTIFY_LEFT);
            foreach ($transaction->sales as $item) {
                $printer->text($item->product_name . "\n");
                $printer->text($item->quantity . " x ₱" . number_format($item->price, 2) .
                    "   ₱" . number_format($item->total, 2) . "\n");
                if ($item->discount > 0) {
                    $printer->text("  Disc: ₱" . number_format($item->discount, 2) . "\n");
                }
                if ($item->tax > 0) {
                    $printer->text("  Tax: ₱" . number_format($item->tax, 2) . "\n");
                }
            }
            $printer->feed();

            $printer->text("Subtotal: ₱" . number_format($transaction->subtotal, 2) . "\n");
            $printer->text("Discount: ₱" . number_format($transaction->discount, 2) . "\n");
            $printer->text("Tax: ₱" . number_format($transaction->tax, 2) . "\n");
            $printer->text("Total: ₱" . number_format($transaction->total, 2) . "\n");
            $printer->text("Paid: ₱" . number_format($transaction->amount_paid, 2) . "\n");
            $printer->text("Change: ₱" . number_format($transaction->change, 2) . "\n");
            $printer->feed();

            $printer->setJustification(Printer::JUSTIFY_CENTER);
            $printer->text("Thank you for your purchase!\n");
            $printer->text("Visit us again :)\n");

            $printer->pulse(); // open cash drawer

            $printer->cut();
            $printer->close();

         Log::info("Receipt printed successfully for transaction ID: {$transaction->id}");
        } catch (\Exception $e) {
            Log::error("PrintReceipt Error for transaction ID {$transaction->id}: " . $e->getMessage());
            // optionally continue without breaking transaction flow
        }

        return redirect()->route('merchant.invoice.show', $transaction->id);
    } catch (\Exception $e) {
        DB::rollBack();
        Log::error("Transaction Store Error: " . $e->getMessage());
        return back()->with('error', 'Failed to record sale. Error: ' . $e->getMessage());
    }
}


    public function calculate(Request $request)
    {
        $items = $request->input('items', []);
        $discountCode = $request->input('discount_code');
        $amountPaid = $request->input('amount_paid', 0);
        $merchantId = auth()->user()->merchant_id ?? auth()->id();

        $totals = $this->computeTotals($items, $discountCode, $amountPaid, $merchantId);

        return response()->json($totals);
    }

    public function computeTotals(array $items, $discountCode, $amountPaid, $merchantId)
    {
        $subtotal = 0;
        $totalTax = 0;
        $totalDiscount = 0;
        $detailedItems = [];

        $discount = \App\Models\Discount::where('merchant_id', $merchantId)
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

        foreach ($items as $item) {
            $productId = Arr::get($item, 'product_id');
            $qty = Arr::get($item, 'quantity', 0);

            if (!$productId || $qty <= 0) continue;

            $product = Product::where('merchant_id', $merchantId)->find($productId);
            if (!$product) continue;

            $price = $product->price;
            $lineSubtotal = $price * $qty;
            $subtotal += $lineSubtotal;

            $isDiscounted = false;
            if ($discount) {
                if ($appliesTo === 'all') {
                    $isDiscounted = true;
                } elseif ($appliesTo === 'categories' && in_array($product->category_id, $targetIds)) {
                    $isDiscounted = true;
                } elseif ($appliesTo === 'products' && in_array($product->id, $targetIds)) {
                    $isDiscounted = true;
                }
            }

            // Initialize values
            $discountAmount = 0;
            $vat = 0;

            if ($isDiscounted) {
                if ($isGov) {
                    $discountAmount = $discountRate > 0
                        ? $lineSubtotal * $discountRate
                        : $discountValue * $qty;
                    // GOV has no tax
                } else {
                    $vat = $lineSubtotal * 0.12;
                    $gross = $lineSubtotal + $vat;

                    $discountAmount = $discountRate > 0
                        ? $gross * $discountRate
                        : $discountValue * $qty;

                    $totalTax += $vat; // ✅ Add tax here
                }

                $totalDiscount += $discountAmount; // ✅ Always add discount
            } else {
                // No discount, normal VAT
                $vat = $lineSubtotal * 0.12;
                $totalTax += $vat; // ✅ Add tax
            }

            // Add to cart breakdown
            $detailedItems[] = [
                'product_id' => $product->id,
                'quantity' => $qty,
                'tax' => round($vat, 2),
                'discount' => round($discountAmount, 2),
                'line_total' => round($lineSubtotal + $vat - $discountAmount, 2),
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

    public function showInvoice(Transaction $transaction)
    {
        $user = auth()->user();
        $merchantId = $user->merchant_id ?? $user->id;

        if ($transaction->merchant_id !== $merchantId) {
            abort(403);
        }

        $transaction->load('sales');

        return Inertia::render('Merchant/Invoice', [
            'transaction' => $transaction,
            'sales' => $transaction->sales,
             'merchant' => $transaction->merchant,
        ]);
    }

}
