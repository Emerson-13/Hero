<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Ingredient;
use App\Models\Menu;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MenuController extends Controller
{
    public function index(Request $request)
    {
        $userId = auth()->id();

        $query = Menu::with(['category', 'ingredients'])
            ->where('user_id', $userId);

        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                  ->orWhere('description', 'like', "%$search%")
                  ->orWhere('barcode', 'like', "%$search%")
                  ->orWhere('price', 'like', "%$search%");
            })
            ->orWhereHas('category', function ($q) use ($search) {
                $q->where('name', 'like', "%$search%");
            });
        }

        // ✅ Simplified: no computed_stock logic here
        $menus = $query->orderBy('id', 'desc')
                       ->paginate(10);

        $categories = Category::where('user_id', $userId)->get();
        $ingredients = Ingredient::where('user_id', $userId)->get();

        return Inertia::render('User/Menu', [
            'menus' => $menus,
            'categories' => $categories,
            'ingredients' => $ingredients,
            'search' => $request->search ?? '',
        ]);
    }

    public function store(Request $request)
    {
        $userId = auth()->id();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'barcode' => 'nullable|string|max:100',
            'price' => 'required|numeric|min:0',
            'tax_type' => 'nullable|string',
            'category_id' => 'nullable|exists:categories,id',
            'ingredients' => 'array', // ex: [{id:1, quantity:2}, {id:2, quantity:5}]
            'ingredients.*.id' => 'required|exists:ingredients,id',
            'ingredients.*.quantity' => 'required|numeric|min:0.01',
        ]);

        // ✅ Create Menu
        $menu = Menu::create([
            'user_id' => $userId,
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'barcode' => $validated['barcode'] ?? null,
            'price' => $validated['price'],
            'tax_type' => $validated['tax_type'] ?? null,
            'category_id' => $validated['category_id'] ?? null,
        ]);

        // ✅ Attach ingredients with quantities
        if (!empty($validated['ingredients'])) {
            $syncData = [];
            foreach ($validated['ingredients'] as $ingredient) {
                $syncData[$ingredient['id']] = ['quantity' => $ingredient['quantity']];
            }
            $menu->ingredients()->sync($syncData);
        }

        return redirect()->route('menu.index')->with('success', 'Menu created with ingredients!');
    }
}
