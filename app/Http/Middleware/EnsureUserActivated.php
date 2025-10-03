<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureUserActivated
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        if (!$user->is_active) {
            // User is not approved by admin
            auth()->logout();
            return redirect()->route('login')->withErrors([
                'email' => 'Your account is not yet approved by the admin.',
            ]);
        }

       if ($user->activationCode()->where('is_used', false)->exists()) {
            return redirect()->route('activation.show');
        }


        return $next($request);
    }
}
