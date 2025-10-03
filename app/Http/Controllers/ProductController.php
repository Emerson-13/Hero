<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    /**
     * Display a paginated list of products.
     */
    public function index()
    {
        $products = Product::orderBy('created_at', 'desc')->paginate(10);

        return Inertia::render('Admin/Products', [
            'products' => $products
        ]);
    }

    /**
     * Store a new product.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'nullable|numeric|min:0',
            'description' => 'nullable|string',
        ]);

        Product::create($data);

        return redirect()->back()->with('success', 'Product created successfully!');
    }

    /**
     * Update an existing product.
     */
    public function update(Request $request, Product $product)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'nullable|numeric|min:0',
            'description' => 'nullable|string',
        ]);

        $product->update($data);

        return redirect()->back()->with('success', 'Product updated successfully!');
    }

    /**
     * Delete a product.
     */
    public function destroy(Product $product)
    {
        $product->delete();

        return redirect()->back()->with('success', 'Product deleted successfully!');
    }
    public function destroyAll(Request $request)
    {
        $productIds = $request->input('product_ids', []);

        if (empty($productIds)) {
            return redirect()->back()->with('error', 'No products selected for deletion.');
        }

        Product::whereIn('id', $productIds)->delete();

        return redirect()->back()->with('success', 'Selected products deleted successfully!');
    }

}
