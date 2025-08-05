<?php

namespace App\Http\Controllers;

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

class POSController extends Controller
{
    public function index(Request $request)
    {
        $merchantId = auth()->user()->merchant_id ?? auth()->id();

        $query = Product::where('merchant_id', $merchantId);
        if ($request->has('category') && $request->category !== 'all') {
            $query->where('category_id', $request->category);
        }

        $products = $query->paginate(6);
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
            'totals' => $totals,
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
    $discount = \App\Models\Discount::where('merchant_id', $merchantId)
        ->where('code', $enteredCode)
        ->where('is_active', true)
        ->first();

    $discountRate = $discount && $discount->type === 'percentage' ? ($discount->value / 100) : 0;
    $appliesTo = $discount->applies_to ?? 'none';
    $targetIds = is_array($discount->target_ids)
        ? $discount->target_ids
        : json_decode($discount->target_ids, true) ?? [];

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

            if ($discountRate > 0) {
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
                // No tax for discounted item
                $discountAmount = $lineSubtotal * $discountRate;
            } else {
                // 12% VAT for non-discounted item
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

        return redirect()->route('merchant.invoice.show', $transaction->id);
    } catch (\Exception $e) {
        DB::rollBack();
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

    private function computeTotals(array $items, $discountCode, $amountPaid, $merchantId)
    {
        $subtotal = 0;           // total price before any VAT or discount
        $totalTax = 0;           // VAT only from non-discounted items
        $totalDiscount = 0;      // discount amount from discounted items

        $discount = \App\Models\Discount::where('merchant_id', $merchantId)
            ->where('code', strtoupper(trim($discountCode)))
            ->where('is_active', true)
            ->first();

        $discountRate = 0;
        $appliesTo = 'none';
        $targetIds = [];

        if ($discount) {
            $discountRate = $discount->type === 'percentage' ? ($discount->value / 100) : 0;
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

            $price = $product->price; // standard price (no VAT)
            $lineSubtotal = $price * $qty;
            $subtotal += $lineSubtotal;

            $isDiscounted = false;

            if ($discountRate > 0) {
                if ($appliesTo === 'all') {
                    $isDiscounted = true;
                } elseif ($appliesTo === 'categories' && in_array($product->category_id, $targetIds)) {
                    $isDiscounted = true;
                } elseif ($appliesTo === 'products' && in_array($product->id, $targetIds)) {
                    $isDiscounted = true;
                }
            }

            if ($isDiscounted) {
                // Discounted items are VAT-exempt
                $discountAmount = $lineSubtotal * $discountRate;
                $totalDiscount += $discountAmount;
                // No tax added
            } else {
                // Apply 12% VAT to non-discounted items
                $vat = $lineSubtotal * 0.12;
                $totalTax += $vat;
            }
        }

        $total = $subtotal + $totalTax - $totalDiscount;
        $change = max($amountPaid - $total, 0);

        return [
            'subtotal' => round($subtotal, 2),
            'discount' => round($totalDiscount, 2),
            'tax' => round($totalTax, 2),
            'total' => round($total, 2),
            'change' => round($change, 2),
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
        ]);
    }
}
