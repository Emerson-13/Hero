<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\Sale;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class POSController extends Controller
{
    // app/Http/Controllers/POSController.php
    public function index(Request $request)
    {
        $merchantId = auth()->user()->merchant_id ?? auth()->id();

        // ✅ Define query
        $query = Product::where('merchant_id', $merchantId);

        // ✅ Now it's safe to apply filters
        if ($request->has('category') && $request->category !== 'all') {
            $query->where('category_id', $request->category);
        }

        $products = $query->paginate(6);
        $categories = Category::where('merchant_id', $merchantId)->get();

        return Inertia::render('Merchant/Pos', [
            'products' => $products,
            'categories' => $categories,
            'selectedCategory' => $request->category ?? 'all',
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

    $merchantId = auth()->user()->merchant_id ?? auth()->id();
    $staffId = auth()->user()->merchant_id ? auth()->id() : null;

    // ✅ Discount logic
    $discountRate = 0;
    $validCodes = [
        'DISCOUNT2025' => 0.20, // 20% discount
    ];

    if (!empty($validated['discount_code'])) {
        $enteredCode = strtoupper(trim($validated['discount_code']));
        if (array_key_exists($enteredCode, $validCodes)) {
            $discountRate = $validCodes[$enteredCode];
        }
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
            'total' => 0, // Will be updated after computing
            'reference_number' => null,
        ]);

        $grandTotal = 0;

        foreach ($validated['items'] as $item) {
            $product = Product::findOrFail($item['product_id']);
            $quantity = $item['quantity'];
            $price = $product->price;

            $subtotal = $price * $quantity;
            $discount = $subtotal * $discountRate;
            $tax = $subtotal * 0.12;
            $total = $subtotal + $tax - $discount;

            Sale::create([
                'transaction_id' => $transaction->id,
                'product_id' => $product->id,
                'product_name' => $product->name,
                'quantity' => $quantity,
                'price' => $price,
                'discount' => $discount,
                'tax' => $tax,
                'total' => $total,
            ]);

            $grandTotal += $total;
            $product->decrement('stock', $quantity);
        }

        $transaction->update([
            'total' => $grandTotal,
        ]);

        DB::commit();
        return redirect()->route('merchant.invoice.show', $transaction->id);
    } catch (\Exception $e) {
        DB::rollBack();
        return back()->with('error', 'Failed to record sale. Error: ' . $e->getMessage());
    }
}


    
    public function showInvoice(Transaction $transaction)
    {
        // Ensure the user can only see their merchant's invoices
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
