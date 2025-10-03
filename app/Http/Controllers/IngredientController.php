<?php

namespace App\Http\Controllers;

use App\Models\Ingredient;
use Illuminate\Http\Request;
use Inertia\Inertia;

class IngredientController extends Controller
{
    public function index(Request $request) {
        $userId = auth()->id();

        $query = Ingredient::where('user_id', $userId);

        // Search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                  ->orWhere('description', 'like', "%$search%")
                  ->orWhere('barcode', 'like', "%$search%");
            });
        }

        $ingredients = $query->orderBy('id', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('User/Ingredient', [
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
            'stock' => 'required|numeric|min:0',
        ]);

        Ingredient::create([
            'user_id' => $userId,
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'barcode' => $validated['barcode'] ?? null,
            'stock' => $validated['stock'],
        ]);

        return redirect()->back()->with('success', 'Ingredient created successfully!');
    }
}
