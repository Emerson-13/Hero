<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\package;
use App\Models\Referral;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {  
        $packages = Package::all(); // fetch all packages

        return Inertia::render('Auth/Register', [
            'packages' => $packages, // pass to frontend
        ]);
    }

    /**
     * Handle an incoming registration request.
     */
    public function store(Request $request): RedirectResponse
    {
    
        // Validate input
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'phone' => 'required|string|max:255',
            'address' => 'nullable|string|max:255',
            'package_id' => 'required|exists:packages,id',
            'referrer_code' => 'nullable|string|exists:referral_codes,code',
        ]);

        // Get package
        $package = Package::findOrFail($request->package_id);

        // Create inactive user
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'address' => $request->address,
            'phone' => $request->phone,
            'package_id' => $request->package_id,
            'is_active' => false, // user not active yet
        ]);

          // ✅ Assign role from package
        if ($package->role_id) {
            $roleName = \Spatie\Permission\Models\Role::find($package->role_id)->name ?? null;
            if ($roleName) {
                $user->assignRole($roleName);
            }
        }
        
        // If a referrer code was provided, link it
        if ($request->referrer_code) {
            $referrer = $request->referrer_code;
            Referral::create([
                'referrer_id' => \App\Models\ReferralCode::where('code', $referrer)->value('user_id'),
                'referred_user_id' => $user->id,
                'code_used' => $referrer,
            ]);
        }

        // Fire registered event
        event(new Registered($user));

        // Redirect with pending message
        return redirect()->route('login')->with('status', 'Your account is pending admin approval.');
    }
}
