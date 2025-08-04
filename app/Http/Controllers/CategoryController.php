<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;

class CategoryController extends Controller
{
    // Display all categories
    public function index( )
    {
        $categories = Category::where('merchant_id', Auth::id())->get();

        return Inertia::render('Merchant/Categories', [
            'categories' => $categories,
        ]);
    }

    // Show create form (optional, if using a modal just skip this)
    public function create()
    {
        return Inertia::render('Merchant/Categories/Create');
    }

    // Store a new category
    public function store(Request $request)
    {
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        Category::create([
            'name' => $request->name,
            'description' => $request->description,
            'merchant_id' => Auth::id(),
        ]);


        return redirect()->route('merchant.categories')->with('success', 'Category created.');
    }

    // Edit page (optional — or use modal)
    public function edit(Category $category)
    {
        return Inertia::render('Merchant/Categories/Edit', [
            'category' => $category,
        ]);
    }

    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $category->update($validated);

        return redirect()->back()->with('success', 'Category updated.');
    }


    // Delete a category
    public function destroy(Category $category)
    {
        $category->delete();

         return redirect()->back()->with('success', 'Category deleted.');
    }
}
