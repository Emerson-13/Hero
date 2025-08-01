<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\StaffController;
use App\Http\Controllers\ProductController;


/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

/*
|--------------------------------------------------------------------------
| Authenticated Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'verified'])->group(function () {

    // Common Dashboard
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard')->middleware('can:view dashboard');

    /*
    |--------------------------------------------------------------------------
    | Admin Routes
    |--------------------------------------------------------------------------
    */
    Route::middleware('can:view manage-users')->group(function () {
        Route::get('/admin/manage-users', fn () => Inertia::render('Admin/ManageUsers'))->name('admin.manage-users');
    });

    Route::middleware('can:view business')->group(function () {
        Route::get('/admin/business', fn () => Inertia::render('Admin/Business'))->name('admin.business');
    });

    /*
    |--------------------------------------------------------------------------
    | Merchant Routes
    |--------------------------------------------------------------------------
    */
    Route::middleware('can:view merchant-dashboard')->group(function () {
        Route::get('/merchant/dashboard', fn () => Inertia::render('Merchant/Dashboard'))->name('merchant.dashboard');
    });

    Route::middleware('can:view staff')->group(function () {
        Route::get('/merchant/staff', function (){
            return Inertia::render('Merchant/Staff');
    })->name('merchant.staff');
        Route::get('/staff', [StaffController::class, 'index'])->name('staff.index');
        Route::get('/staff/create', [StaffController::class, 'create'])->name('staff.create');
        Route::post('/staff', [StaffController::class, 'store'])->name('staff.store');
        Route::get('/staff/{staff}/edit', [StaffController::class, 'edit'])->name('staff.edit');
        Route::put('/staff/{staff}', [StaffController::class, 'update'])->name('staff.update');
        Route::delete('/staff/{staff}', [StaffController::class, 'destroy'])->name('staff.destroy');
    });

    Route::middleware(['auth', 'can:view products'])->group(function () {
        // Render the Inertia page
        Route::get('/merchant/products', function () {
            return Inertia::render('Merchant/Products');
        })->name('merchant.products');

        // API routes for product operations
        Route::get('/products', [ProductController::class, 'index'])->name('products.index');
        Route::post('/products', [ProductController::class, 'store'])->name('products.store');
        Route::put('/products/{product}', [ProductController::class, 'update'])->name('products.update');
        Route::delete('/products/{product}', [ProductController::class, 'destroy'])->name('products.destroy');
    });


    Route::middleware('can:view categories')->group(function () {
        Route::get('/merchant/categories', fn () => Inertia::render('Merchant/Categories'))->name('merchant.categories');
    });

    Route::middleware('can:view sales')->group(function () {
        Route::get('/merchant/sales', fn () => Inertia::render('Merchant/Sales'))->name('merchant.sales');
    });

    Route::middleware('can:view transactions')->group(function () {
        Route::get('/merchant/transactions', fn () => Inertia::render('Merchant/Transactions'))->name('merchant.transactions');
    });

    Route::middleware('can:view pos')->group(function () {
        Route::get('/merchant/pos', fn () => Inertia::render('Merchant/Pos'))->name('merchant.pos');
    });

    /*
    |--------------------------------------------------------------------------
    | Staff Routes
    |--------------------------------------------------------------------------
    */
    Route::middleware('can:view staff-dashboard')->group(function () {
        Route::get('/staff/dashboard', fn () => Inertia::render('Staff/Dashboard'))->name('staff.dashboard');
    });

    Route::middleware('can:view products')->group(function () {
        Route::get('/staff/products', fn () => Inertia::render('Staff/Products'))->name('staff.products');
    });

    Route::middleware('can:view pos')->group(function () {
        Route::get('/staff/pos', fn () => Inertia::render('Staff/Pos'))->name('staff.pos');
    });

    /*
    |--------------------------------------------------------------------------
    | Profile (Shared)
    |--------------------------------------------------------------------------
    */
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

/*
|--------------------------------------------------------------------------
| Auth Routes
|--------------------------------------------------------------------------
*/
require __DIR__ . '/auth.php';
