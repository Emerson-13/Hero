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

class StaffPOSController extends Controller
{
     public function index(Request $request)
    {
        $merchantId = auth()->user()->merchant_id;

        $query = Product::where('merchant_id', $merchantId);

        if ($request->has('category') && $request->category !== 'all') {
            $query->where('category_id', $request->category);
        }

        $products = $query->paginate(6);
        $categories = Category::where('merchant_id', $merchantId)->get();

        return Inertia::render('Staff/Pos', [
            'products' => $products,
            'categories' => $categories,
            'selectedCategory' => $request->category ?? 'all',
        ]);
    }
}
