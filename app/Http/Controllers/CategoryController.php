<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class CategoryController extends Controller
{
    // Display all categories
    public function index(Request $request)
{
    $UserId = auth()->id();

    $query = Category::where('user_id', $UserId);

    // Filter by search keyword
    if ($request->has('search') && $request->search !== '') {
        $search = $request->search;
        $query->where('name', 'like', "%$search%");
    }

    $categories = $query->orderBy('id', 'desc')
        ->paginate(10)
        ->withQueryString();

    return Inertia::render('User/Category', [
        'categories' => $categories,
        'search' => $request->search ?? '',
    ]);
}


    // Store a new category
    public function store(Request $request)
    {
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        Category::create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'user_id' => Auth::id(),
        ]);

        return redirect()->route('user.categories')->with('success', 'Category created.');
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


    public function exportCsv()
    {
        $categories = Category::latest()->get();

        $filename = 'categories_' . now()->format('Ymd_His') . '.csv';

        $headers = [
            "Content-type" => "text/csv",
            "Content-Disposition" => "attachment; filename=$filename",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0"
        ];

        $callback = function () use ($categories) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['Name', 'Description']);

            foreach ($categories as $category) {
                fputcsv($handle, [
                    $category->name,
                    $category->description,
                ]);
            }

            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
    }

}
