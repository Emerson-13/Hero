<?php

namespace App\Http\Controllers;

use App\Models\Discount;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class DiscountController extends Controller
{
    public function index()
    {
        $merchantId = auth()->user()->merchant_id ?? auth()->id();

        $discounts = Discount::where('merchant_id', $merchantId)->get()->map(function ($discount) {
            $discount->target_ids = $discount->target_ids ? json_decode($discount->target_ids) : [];
            return $discount;
        });

        $categories = Category::where('merchant_id', $merchantId)->get();
        $products = Product::where('merchant_id', $merchantId)->get();

        return Inertia::render('MerchantSetting/Discounts', [
            'discounts' => $discounts,
            'categories' => $categories,
            'products' => $products,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|unique:discounts,code',
            'type' => 'required|in:percentage,fixed',
            'value' => 'required|numeric|min:0.01',
            'discount_type' => 'required|in:gov,promo',
            'applies_to' => 'required|in:all,categories,products',
            'target_ids' => 'nullable|array',
            'target_ids.*' => 'integer',
        ]);

        Discount::create([
            'merchant_id' => Auth::id(),
            'code' => strtoupper($validated['code']),
            'type' => $validated['type'],
            'value' => $validated['value'],
            'discount_type' => $validated['discount_type'],
            'applies_to' => $validated['applies_to'],
            'target_ids' => $validated['applies_to'] !== 'all' ? json_encode($validated['target_ids'] ?? []) : null,
            'is_active' => true,
        ]);

        return redirect()->route('merchant.discounts')->with('success', 'Discount added!');
    }

    public function update(Request $request, Discount $discount)
    {
        $merchantId = auth()->user()->merchant_id ?? auth()->id();

        abort_if($discount->merchant_id !== $merchantId, 403);

        $validated = $request->validate([
            'code' => 'required|string|unique:discounts,code,' . $discount->id,
            'type' => 'required|in:percentage,fixed',
            'value' => 'required|numeric|min:0.01',
            'discount_type' => 'required|in:gov,promo',
            'applies_to' => 'required|in:all,categories,products',
            'target_ids' => 'nullable|array',
            'target_ids.*' => 'integer',
        ]);

        $discount->update([
            'code' => strtoupper($validated['code']),
            'type' => $validated['type'],
            'value' => $validated['value'],
            'discount_type' => $validated['discount_type'],
            'applies_to' => $validated['applies_to'],
            'target_ids' => $validated['applies_to'] !== 'all' ? json_encode($validated['target_ids'] ?? []) : null,
        ]);

        return redirect()->back()->with('success', 'Discount updated successfully.');
    }

    public function destroy(Discount $discount)
    {
        $merchantId = auth()->user()->merchant_id ?? auth()->id();

        abort_if($discount->merchant_id !== $merchantId, 403);

        $discount->delete();

        return redirect()->back()->with('success', 'Discount deleted successfully.');
    }

    public function toggle(Discount $discount)
    {
        $merchantId = auth()->user()->merchant_id ?? auth()->id();

        abort_if($discount->merchant_id !== $merchantId, 403);

        $discount->is_active = !$discount->is_active;
        $discount->save();

        return redirect()->back()->with('success', 'Discount status updated.');
    }
}
