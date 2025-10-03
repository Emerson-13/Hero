<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
         
       Inertia::share('auth', function () {
        $user = auth()->user();
        return [
            'user' => $user ? $user->only('id', 'name', 'email') + [
                'permissions' => $user->getPermissionNames()
            ] : null,
        ];
    });
}
}
