<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class PaymentController extends Controller
{
    // Payment method is still not integrated
    public function create(Request $request)
{
    $amount = $request->amount * 100; // PayMongo expects cents
    $response = Http::withToken(config('services.paymongo.secret'))
        ->post('https://api.paymongo.com/v1/checkout_sessions', [
            'data' => [
                'attributes' => [
                    'send_email_receipt' => false,
                    'show_description' => false,
                    'show_line_items' => false,
                    'cancel_url' => route('pos.cancel'),
                    'description' => 'POS Order',
                    'line_items' => [
                        [
                            'amount' => $amount,
                            'currency' => 'PHP',
                            'name' => 'POS Transaction',
                            'quantity' => 1,
                        ],
                    ],
                    'payment_method_types' => ['gcash', 'card'],
                    'success_url' => route('pos.payment.success'),
                ]
            ]
        ]);

    if ($response->successful()) {
        $checkoutUrl = $response['data']['attributes']['checkout_url'];
        return redirect()->away($checkoutUrl);
    } else {
        return back()->with('error', 'Failed to initiate payment.');
    }
}
}
