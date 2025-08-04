<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\StaffController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\POSController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\SalesController;
use App\Http\Controllers\StaffProductController;
use App\Http\Controllers\StaffPOSController;
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

    Route::middleware('auth','can:view staff')->group(function () {
        // ✅ This now returns the Inertia view WITH staff data
        Route::get('/merchant/staff', [StaffController::class, 'index'])->name('merchant.staff');

        Route::get('/staff/create', [StaffController::class, 'create'])->name('staff.create');
        Route::post('/staff', [StaffController::class, 'store'])->name('staff.store');
        Route::get('/staff/{staff}/edit', [StaffController::class, 'edit'])->name('staff.edit');
        Route::put('/staff/{staff}', [StaffController::class, 'update'])->name('staff.update');
        Route::delete('/staff/{staff}', [StaffController::class, 'destroy'])->name('staff.destroy');
    });


    Route::middleware(['auth', 'can:view products'])->group(function () {
       // API routes for product operations
        Route::get('/products', [ProductController::class, 'index'])->name('merchant.products');
         Route::get('/staff/products', [StaffProductController::class, 'index'])->name('staff.products');//Staff Page
        Route::post('/products', [ProductController::class, 'store'])->name('products.store');
        Route::put('/products/{product}', [ProductController::class, 'update'])->name('products.update');
        Route::delete('/products/{product}', [ProductController::class, 'destroy'])->name('products.destroy');
    });


    Route::middleware('auth', 'can:view categories')->group(function () {
        Route::get('/categories', [CategoryController::class, 'index'])->name('merchant.categories');
        Route::post('/categories', [CategoryController::class, 'store'])->name('categories.store');
        Route::put('/categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
        Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');
    });

    Route::middleware('auth','can:view sales')->group(function () {
        Route::get('/merchant/sales', [SalesController::class, 'index'])->name('merchant.sales');
    });

    Route::middleware('auth','can:view transactions')->group(function () {
         Route::get('/merchant/transactions', [TransactionController::class, 'index'])->name('merchant.transactions');
    });

    Route::middleware('auth', 'can:view pos')->group(function () {
        Route::get('/merchant/pos', [POSController::class, 'index'])->name('merchant.pos');
        Route::get('/staff/pos', [StaffPOSController::class, 'index'])->name('staff.pos');//Staff Page
        Route::post('/merchant/pos/sale', [POSController::class, 'store'])->name('pos.store');
        Route::get('/merchant/invoice/{transaction}', [POSController::class, 'showInvoice'])->name('merchant.invoice.show');
    });

    /*
    |--------------------------------------------------------------------------
    | Staff Routes
    |--------------------------------------------------------------------------
    */
    Route::middleware('can:view staff-dashboard')->group(function () {
        Route::get('/staff/dashboard', fn () => Inertia::render('Staff/Dashboard'))->name('staff.dashboard');
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
