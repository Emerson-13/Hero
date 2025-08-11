<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\MerchantDashboardController;
use App\Http\Controllers\StaffController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\POSController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\SalesController;
use App\Http\Controllers\StaffProductController;
use App\Http\Controllers\StaffPOSController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\DiscountController;
use App\Http\Controllers\HeldTransactionController;
use App\Http\Controllers\PosPinController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\PrinterController;

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

 
    /*
    |--------------------------------------------------------------------------
    | Admin Routes
    |--------------------------------------------------------------------------
    */
    // Common Dashboard
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard')->middleware('can:view dashboard');
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
    Route::middleware(['auth','can:view merchant-dashboard'])->group(function () {
        Route::get('/merchant/dashboard', [MerchantDashboardController::class, 'index'])->name('merchant.dashboard');
    });
    Route::middleware(['auth','can:view staff'])->group(function () {
        Route::get('/merchant/staff', [StaffController::class, 'index'])->name('merchant.staff');
        Route::get('/staff/create', [StaffController::class, 'create'])->name('staff.create');
        Route::post('/staff', [StaffController::class, 'store'])->name('staff.store');
        Route::get('/staff/{staff}/edit', [StaffController::class, 'edit'])->name('staff.edit');
        Route::put('/staff/{staff}', [StaffController::class, 'update'])->name('staff.update');
        Route::delete('/staff/{staff}', [StaffController::class, 'destroy'])->name('staff.destroy');
    });
    Route::middleware(['auth', 'can:view products'])->group(function () {
        Route::get('/products', [ProductController::class, 'index'])->name('merchant.products');
        Route::get('/staff/products', [StaffProductController::class, 'index'])->name('staff.products');//Staff Page
        Route::post('/products', [ProductController::class, 'store'])->name('products.store');
        Route::put('/products/{product}', [ProductController::class, 'update'])->name('products.update');
        Route::delete('/products/{product}', [ProductController::class, 'destroy'])->name('products.destroy');
        Route::get('/products/export', [ProductController::class, 'exportProductsCsv'])->name('export.products.csv');
        Route::post('/products/upload', [ProductController::class, 'upload'])->name('products.upload');
    });
    Route::middleware(['auth', 'can:view categories'])->group(function () {
        Route::get('/categories', [CategoryController::class, 'index'])->name('merchant.categories');
        Route::post('/categories', [CategoryController::class, 'store'])->name('categories.store');
        Route::put('/categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
        Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');
        Route::get('/categories/export', [CategoryController::class, 'exportCsv'])->name('export.categories.csv');
    });
    Route::middleware(['auth','can:view sales'])->group(function () {
        Route::get('/merchant/sales', [SalesController::class, 'index'])->name('merchant.sales');
        Route::get('/export/sales-csv', [SalesController::class, 'exportSalesExcel'])->name('export.sales.csv');
    });

    Route::middleware(['auth','can:view transactions'])->group(function () {
        Route::get('/merchant/transactions', [TransactionController::class, 'index'])->name('merchant.transactions');
        Route::get('/export/transactions-csv', [TransactionController::class, 'exportTransactionsExcel'])->name('export.transactions.csv');
    });
    Route::middleware(['auth', 'can:view pos'])->group(function () {
        Route::get('/merchant/pos', [POSController::class, 'index'])->name('merchant.pos');
        Route::get('/staff/pos', [StaffPOSController::class, 'index'])->name('staff.pos');
        Route::post('/merchant/pos/sale', [POSController::class, 'store'])->name('pos.store');
        Route::get('/merchant/invoice/{transaction}', [POSController::class, 'showInvoice'])->name('merchant.invoice.show');
        Route::post('/pos/calculate', [POSController::class, 'calculate'])->name('pos.calculate');
        Route::post('/verify-pospin', [POSController::class, 'verifyPosPin'])->name('pos.verifyPosPin');;
        Route::post('/print-receipt/{transaction}', [POSController::class, 'printReceipt'])->name('invoice.print');
    });
    Route::middleware(['auth', 'can:view settings'])->group(function () {
        Route::get('/settings', [SettingsController::class, 'index'])->name('settings.index');
        Route::get('/settings/about', [SettingsController::class, 'about'])->name('settings.about');
        Route::get('/settings/fax', [SettingsController::class, 'fax'])->name('settings.fax');
        Route::post('/set-void-pin', [SettingsController::class, 'setVoidPin'])->middleware('settings.setVoidPin');
        Route::post('/void-transaction', [SettingsController::class, 'voidTransaction'])->middleware('settings.voidTransaction');

        Route::get('/printer-settings', [PrinterController::class, 'index'])->name('printer.index');
        Route::post('/printer-settings', [PrinterController::class, 'store'])->name('printer.store');
        Route::put('/printer-settings/{id}', [PrinterController::class, 'update'])->name('printer.update');
        Route::post('/printer-settings/set-active/{id}', [PrinterController::class, 'setActivePrinter'])->name('printer.setActive');
        Route::delete('/printer/{id}', [PrinterController::class, 'destroy'])->name('printer.destroy');

        Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
        Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

        Route::get('/set-pos-pin', [PosPinController ::class, 'index'])->name('setPosPin.index');
        Route::post('/storePosPin', [PosPinController ::class, 'storePosPin'])->name('settings.storePosPin');
        Route::post('/pos/unlock', [POSPinController::class, 'unlock'])->name('pos.unlock');
    });
    Route::middleware(['auth', 'can:view discounts'])->group(function () {
        Route::get('/discounts', [DiscountController::class, 'index'])->name('merchant.discounts');
        Route::post('/discounts', [DiscountController::class, 'store'])->name('discount.store');
        Route::patch('/discounts/{discount}/toggle', [DiscountController::class, 'toggle'])->name('discount.toggle');
        Route::put('/discounts/{discount}', [DiscountController::class, 'update'])->name('discount.update');
        Route::delete('/discounts/{discount}', [DiscountController::class, 'destroy'])->name('discount.destroy');
    });
    /*
    |--------------------------------------------------------------------------
    | Staff Routes
    |--------------------------------------------------------------------------
    */
    Route::middleware('can:view staff-dashboard')->group(function () {
        Route::get('/staff/dashboard', fn () => Inertia::render('Staff/Dashboard'))->name('staff.dashboard');
    });

    Route::post('/pos/payment/create', [PaymentController::class, 'create'])->name('pos.payment.create');
    Route::get('/pos/payment/success', [PaymentController::class, 'success'])->name('pos.payment.success');
    Route::get('/pos/payment/cancel', [PaymentController::class, 'cancel'])->name('pos.cancel');
});
/*
|--------------------------------------------------------------------------
| Auth Routes
|--------------------------------------------------------------------------
*/
require __DIR__ . '/auth.php';
