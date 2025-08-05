<?php

namespace App\Http\Controllers;

use App\Models\Discount;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class DiscountController extends Controller
{
    public function index()
    {
        $merchantId = auth()->user()->merchant_id ?? auth()->id();
        $discounts = Discount::where('merchant_id', $merchantId)->get();

        return Inertia::render('Merchant/Discounts', [
            'discounts' => $discounts,
            'categories' => Category::where('merchant_id', $merchantId)->get(),
            'products' => Product::where('merchant_id', $merchantId)->get(),
        ]);
    }

    public function store(Request $request)
    {
        $merchantId = auth()->user()->merchant_id ?? auth()->id();

        $validator = Validator::make($request->all(), [
            'code' => 'required|string|unique:discounts,code',
            'type' => 'required|in:percentage,fixed',
            'value' => 'required|numeric|min:0.01',
            'discount_type' => 'required|in:gov,promo',
            'applies_to' => 'required|in:all,categories,products',
            'target_ids' => 'nullable|array',
            'target_ids.*' => 'integer',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        Discount::create([
            'merchant_id' => $merchantId,
            'code' => strtoupper($request->code),
            'type' => $request->type,
            'value' => $request->value,
            'discount_type' => $request->discount_type,
            'applies_to' => $request->applies_to,
            'target_ids' => $request->applies_to !== 'all' ? json_encode($request->target_ids ?? []) : null,
            'is_active' => true,
        ]);

        return back()->with('success', 'Discount created.');
    }

    public function toggle($id)
    {
        $merchantId = auth()->user()->merchant_id ?? auth()->id();

        $discount = Discount::where('merchant_id', $merchantId)->findOrFail($id);
        $discount->is_active = !$discount->is_active;
        $discount->save();

        return back()->with('success', 'Discount status updated.');
    }

    public function destroy($id)
    {
        $merchantId = auth()->user()->merchant_id ?? auth()->id();

        $discount = Discount::where('merchant_id', $merchantId)->findOrFail($id);
        $discount->delete();

        return back()->with('success', 'Discount deleted.');
    }
}
