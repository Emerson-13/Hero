<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class StaffProductController extends Controller
{
    public function index()
    {
        $merchantId = auth()->user()->merchant_id;

        $products = Product::with('category')
            ->where('merchant_id', $merchantId)
            ->get();

        $categories = Category::where('merchant_id', $merchantId)->get();

        return Inertia::render('Staff/Products', [
            'products' => $products,
            'categories' => $categories,
        ]);
    }
}

