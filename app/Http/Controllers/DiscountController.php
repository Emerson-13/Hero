<?php

namespace App\Http\Controllers;

use App\Models\Discount;
use App\Models\Category;
use App\Models\Item;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class DiscountController extends Controller
{
    public function index()
    {
        $userId = auth()->id();

        $discounts = Discount::where('user_id', $userId)->get()->map(function ($discount) {
            $discount->target_ids = $discount->target_ids ? json_decode($discount->target_ids) : [];
            return $discount;
        });

        $categories = Category::where('user_id', $userId)->get();
        $items = Item::where('user_id', $userId)->get();

        return Inertia::render('User/Discount', [
            'discounts' => $discounts,
            'categories' => $categories,
            'items' => $items,
        ]);
    }

    public function store(Request $request) 
    {
        $validated = $request->validate([
            'code' => 'required|string|unique:discounts,code',
            'type' => 'required|in:percentage,fixed',
            'value' => 'required|numeric|min:0',
            'discount_type' => 'required|in:gov,promo',
            'applies_to' => 'required|in:all,categories,items',
            'target_ids' => 'nullable|array',
            'target_ids.*' => 'integer',
            'tax_type' => 'nullable|in:vat,vat_exempt,zero_rated',
        ]);

        if (isset($validated['tax_type']) && $validated['tax_type'] === 'zero_rated') {
            $validated['value'] = 0;
        }

        $discount = Discount::create([
            'user_id' => Auth::id(),
            'code' => strtoupper($validated['code']),
            'type' => $validated['type'],
            'value' => $validated['value'],
            'discount_type' => $validated['discount_type'],
            'applies_to' => $validated['applies_to'],
            'target_ids' => $validated['applies_to'] !== 'all' ? json_encode($validated['target_ids'] ?? []) : null,
            'tax_type' => $validated['tax_type'] ?? null,
            'is_active' => true,
        ]);

        // If GOV discount, apply tax type to items
        if ($validated['discount_type'] === 'gov' && isset($validated['tax_type'])) {
            $query = Item::where('user_id', Auth::id());

            if ($validated['applies_to'] === 'categories' && !empty($validated['target_ids'])) {
                $query->whereIn('category_id', $validated['target_ids']);
            } elseif ($validated['applies_to'] === 'items' && !empty($validated['target_ids'])) {
                $query->whereIn('id', $validated['target_ids']);
            }

            $query->update(['tax_type' => $validated['tax_type']]);
        }

        return redirect()->route('merchant.discounts')->with('success', 'Discount added!');
    }

    public function update(Request $request, Discount $discount)
    {
        $userId = auth()->id();
        abort_if($discount->user_id !== $userId, 403);

        $validated = $request->validate([
            'code' => 'required|string|unique:discounts,code,' . $discount->id,
            'type' => 'required|in:percentage,fixed',
            'value' => 'required|numeric|min:0',
            'discount_type' => 'required|in:gov,promo',
            'applies_to' => 'required|in:all,categories,items',
            'target_ids' => 'nullable|array',
            'target_ids.*' => 'integer',
            'tax_type' => 'nullable|in:vat,vat_exempt,zero_rated',
        ]);

        if (isset($validated['tax_type']) && $validated['tax_type'] === 'zero_rated') {
            $validated['value'] = 0;
        }

        $discount->update([
            'code' => strtoupper($validated['code']),
            'type' => $validated['type'],
            'value' => $validated['value'],
            'discount_type' => $validated['discount_type'],
            'applies_to' => $validated['applies_to'],
            'target_ids' => $validated['applies_to'] !== 'all' ? json_encode($validated['target_ids'] ?? []) : null,
            'tax_type' => $validated['tax_type'] ?? $discount->tax_type,
        ]);

        return redirect()->back()->with('success', 'Discount updated successfully.');
    }

    public function destroy(Discount $discount)
    {
        $userId = auth()->id();
        abort_if($discount->user_id !== $userId, 403);

        $discount->delete();

        return redirect()->back()->with('success', 'Discount deleted successfully.');
    }

    public function toggle(Discount $discount)
    {
        $userId = auth()->id();
        abort_if($discount->user_id !== $userId, 403);

        $discount->is_active = !$discount->is_active;
        $discount->save();

        return redirect()->back()->with('success', 'Discount status updated.');
    }
}
