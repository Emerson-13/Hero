<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class PosPinController extends Controller
{
    /**
     * Show the form to set the POS pin.
     */
    public function index()
    {
        $merchantId = Auth::user()->merchant_id ?? Auth::id();

        // Find the merchant user (owner of the account)
        $merchantUser = User::find($merchantId);

        return Inertia::render('MerchantSetting/SetPosPin', [
            'hasPin' => !empty($merchantUser?->pospin),
            'merchant_id' => $merchantId,
        ]);
    }

    /**
     * Store or update the authenticated merchant's POS pin.
     */
    public function storePosPin(Request $request)
    {
        $merchantId = Auth::user()->merchant_id ?? Auth::id();
        $merchantUser = User::findOrFail($merchantId);

        $request->validate([
            'pospin' => ['required', 'string', 'confirmed', 'min:4'],
            'current_pospin' => [!empty($merchantUser->pospin) ? 'required' : 'nullable', 'string'],
        ]);

        // If merchant already has a PIN, validate the current one
        if (!empty($merchantUser->pospin)) {
            if (!Hash::check($request->current_pospin, $merchantUser->pospin)) {
                return redirect()->back()->withErrors(['current_pospin' => 'The current POS PIN is incorrect.']);
            }
        }

        // Save new PIN for the merchant
        $merchantUser->pospin = Hash::make($request->pospin);
        $merchantUser->save();

        return redirect()->back()->with('success', 'POS PIN set successfully.');
    }

    /**
     * Unlock POS by verifying the merchant's POS pin.
     */
    public function unlock(Request $request)
    {
        $request->validate([
            'pospin' => 'required',
            'user_id' => 'required|exists:users,id',
        ]);

        $user = User::find($request->user_id);

        if (!$user) {
            return response()->json(['valid' => false], 404);
        }

        if (Hash::check($request->pospin, $user->pospin)) {
            return response()->json(['valid' => true]);
        }

        return response()->json(['valid' => false], 403);
    }
    
}
