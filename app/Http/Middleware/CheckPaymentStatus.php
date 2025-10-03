<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Payment;
use Carbon\Carbon;

class CheckPaymentStatus
{
    public function handle(Request $request, Closure $next)
    {
        $user = Auth::user();

        // If user is not logged in → redirect to login
        if (!$user) {
            return redirect()->route('login')->withErrors('Please login first.');
        }

        // ✅ Skip check if user is an admin (Spatie role check)
        if ($user->hasRole(['admin','moderator','customer support'])) {
            return $next($request);
        }

        // ✅ Check latest paid payment
        $payment = Payment::where('user_id', $user->id)
            ->where('status', 'paid')
            ->latest()
            ->first();

        // No valid payment at all
        if (!$payment) {
            return redirect()->route('payment.index')
                ->withErrors('Your payment is not approved yet.');
        }

        // ✅ Check if payment is expired (1 month validity)
        $expiryDate = Carbon::parse($payment->created_at)->addMonth();

        if (Carbon::now()->greaterThanOrEqualTo($expiryDate)) {
            return redirect()->route('payment.index')
                ->withErrors('Your subscription has expired. Please renew.');
        }

        return $next($request);
    }
}
