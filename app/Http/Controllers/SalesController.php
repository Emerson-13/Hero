<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;

class SalesController extends Controller
{
  public function index()
{
    $sales = Sale::with(['transaction'])->latest()->get();

    return inertia('Merchant/Sales', [
        'sales' => $sales,
    ]);
}
}
