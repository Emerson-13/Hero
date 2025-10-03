<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Validation\ValidationException;


class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (!Auth::attempt($request->only('email', 'password'), $request->boolean('remember'))) {
            return back()->withErrors([
                'email' => 'The provided credentials do not match our records.',
            ])->onlyInput('email');
        }

        $user = Auth::user();

        // ✅ Check approval only for member roles
        if ($user->hasAnyRole(['premium member', 'standard member']) && !$user->is_active) {
            Auth::logout();

            throw ValidationException::withMessages([
                'email' => 'Your account is not approved yet. Please wait for admin approval.',
            ]);
        }
        if ($user->is_suspended) {
            Auth::logout();

            throw ValidationException::withMessages([
                'email' => 'Your account is suspended. Please wait for your suspension to be lifted.',
            ]);
        }

        // ✅ Regenerate session only after validation passes
        $request->session()->regenerate();

        // Redirect logic based on role
        if ($user->hasRole('admin')) {
            return redirect()->route('admin.dashboard');
        } elseif ($user->hasAnyRole(['premium member', 'standard member'])) {
            return redirect()->route('dashboard');
        }

        // fallback
        return redirect()->route('dashboard');
    }


    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
