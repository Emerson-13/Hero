<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;

class TransactionController extends Controller
{
    public function index( )
    {
        $transaction = Transaction::where('merchant_id', Auth::id())->get();

        return Inertia::render('Merchant/Transactions', [
        'transaction' => $transaction,
        ]);
    }
}
