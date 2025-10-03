<?php

namespace App\Http\Controllers;

use App\Mail\ActivationCodeMail;
use App\Mail\PaymentRejectedMail;
use App\Models\ActivationCode;
use App\Models\Payment;
use App\Models\Bank;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class PaymentController extends Controller
{   
    public function index()
    {
        $banks = Bank::all();

        // kunin yung package ng currently logged-in user
        $userPackage = Auth::user()->package;

        return Inertia::render('Auth/Payment', [
            'banks' => $banks,
            'userPackage' => $userPackage,
        ]);
    }

    public function adminIndex()
    {
        $payments = Payment::with(['user.package']) // eager load user and their package
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('Admin/Payment', [
            'payments' => $payments,
        ]);
    }

    // Handle form submission
    public function store(Request $request)
    {
        $request->validate([
            'amount'            => 'nullable|numeric|min:1',
            'payment_method'    => 'nullable|string',
            'bank_name'         => 'nullable|string|max:100',
            'account_number'    => 'nullable|string|max:50',
            'transaction_number'=> 'nullable|string|max:100',
            'proof_image' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',

        ]);

        // Upload proof image
        $path = null;
        if ($request->hasFile('proof_image')) {
            $path = $request->file('proof_image')->store('payments', 'public');
        }

        // Save payment
        Payment::create([
            'user_id'           => Auth::id(),
            'amount'            => $request->amount,
            'payment_method'    => $request->payment_method,
            'bank_name'         => $request->bank_name,
            'account_number'    => $request->account_number,
            'transaction_number'=> $request->transaction_number,
            'proof_image'       => $path,
            'status'            => 'pending',
        ]);

        // ✅ Logout user after submitting payment
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect()->route('login')->with('success', 'Payment submitted! Please wait for admin verification.');
    }
    //For admin to update status to paid
    public function updateStatus(Request $request, Payment $payment)
    {
        $request->validate([
            'status' => 'required|in:pending,paid,rejected',
        ]);

        // Update the selected payment
        $payment->update([
            'status' => $request->status,
            'verified_by' => auth()->id(),
            'verified_at' => now(),
        ]);

        // If approved/paid
        if ($request->status === 'paid') {
            // ✅ Mark user as paid
            $payment->user->update([
                'payment_status' => 'paid',
            ]);

            // Reject all other pending payments of the same user
            Payment::where('user_id', $payment->user_id)
                ->where('id', '!=', $payment->id)
                ->where('status', 'pending')
                ->update([
                    'status' => 'rejected',
                    'verified_by' => auth()->id(),
                    'verified_at' => now(),
                ]);

            // ✅ Generate activation code
            do {
                $activationCodeValue = Str::upper(Str::random(8));
            } while (ActivationCode::where('code', $activationCodeValue)->exists());

            $activationCode = ActivationCode::create([
                'code'       => $activationCodeValue,
                'used_by'    => $payment->user->id,
                'package_id' => $payment->user->package_id,
            ]);

            // ✅ Send email with the activation code
            Mail::to($payment->user->email)->send(new ActivationCodeMail($activationCode->code));
        }

        return redirect()->back()->with('success', 'Payment status updated! Related duplicates handled.');
    }
    public function rejectPayment(Request $request, Payment $payment)
    {
        // Mark payment as rejected
        $payment->update([
            'status' => 'rejected',
            'verified_by' => auth()->id(),
            'verified_at' => now(),
        ]);

        // ✅ Send rejection email
        Mail::to($payment->user->email)->send(new PaymentRejectedMail($payment));

        return redirect()->back()->with('success', 'Payment rejected and user notified!');
    }

}
