<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Setting;

class SettingController extends Controller
{
       public function index()
    {
        $merchantId = Auth::user()->merchant_id ?? Auth::id();

        $discountMode = Setting::where('merchant_id', $merchantId)
            ->where('key', 'discount_mode')
            ->value('value');

        return inertia('Merchant/Settings', [
            'discount_mode' => $discountMode ?? 'disabled',
        ]);
    }

    /**
     * Update discount setting (and other future settings).
     */
    public function update(Request $request)
    {
        $request->validate([
            'discount_mode' => 'required|in:disabled,single,all',
        ]);

        $merchantId = Auth::user()->merchant_id ?? Auth::id();

        Setting::updateOrCreate(
            ['merchant_id' => $merchantId, 'key' => 'discount_mode'],
            ['value' => $request->discount_mode]
        );

        return back()->with('success', 'Settings updated.');
    }
}

