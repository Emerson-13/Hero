<?php

use App\Http\Controllers\DiscountController;
use App\Http\Controllers\FoodPosController;
use App\Http\Controllers\IngredientController;
use App\Http\Controllers\ItemController;
use App\Http\Controllers\ManageMemberController;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RetailPosController;
use App\Http\Controllers\TransactionController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\ActivationController;
use App\Http\Controllers\PackageController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ReferralController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\BankController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\TitleController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\OrderController;


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

Route::middleware(['auth', 'verified'])->group(function () {
    /*
    |--------------------------------------------------------------------------
    | Admin Routes
    |--------------------------------------------------------------------------
    */
    // Common Dashboard
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard')->middleware(['auth','paid.member','activated']);

    Route::get('/Admin/dashboard', function () {
        return Inertia::render('Admin/Dashboard');
    })->name('admin.dashboard')->middleware('auth','role:admin','paid.member','activated');

    Route::middleware(['auth','can:manage member'])->group(function () {
        Route::get('/admin/manage-users/show',[ManageMemberController::class, 'show'])->name('admin.member.show');
        Route::get('/admin/manage-users/show/suspended',[ManageMemberController::class, 'showSuspended'])->name('admin.member.showSuspended');
        Route::post('/admin/members/store', action: [ManageMemberController::class, 'store'])->name('admin.members.store');
        Route::put('/admin/members/update/{member}', [ManageMemberController::class, 'update'])->name('admin.members.update');
        Route::get('/admin/members/all', [ManageMemberController::class, 'index'])->name('admin.members.allMembers');
        Route::post('/admin/manage-users/{id}',[ManageMemberController::class, 'approve'])->name('members.approve');
        Route::delete('/admin/manage-users/{id}',[ManageMemberController::class, 'reject'])->name('members.reject');
        Route::post('/admin/members/suspend', [ManageMemberController::class, 'suspendSelectedMembers'])->name('members.suspend');
         Route::post('/admin/members/uplift/{id}', [ManageMemberController::class, 'upliftMember'])->name('members.uplift');
    });

    Route::middleware(['auth','permission:manage activation-code'])->group(function() {
        Route::get('/activation-codes', [ActivationController::class, 'index'])->name('activation-codes.index');
        Route::post('/activation-codes/generate', [ActivationController::class, 'generate'])->name('activation-codes.generate');
    });
    Route::middleware(['auth', 'permission:manage packages'])->group(function () {
        Route::get('/packages', [PackageController::class, 'index'])->name('packages.index');
        Route::post('/packages', [PackageController::class, 'store'])->name('packages.store');
        Route::put('/packages/{package}', [PackageController::class, 'update'])->name('packages.update');
        Route::delete('/packages/{package}', [PackageController::class, 'destroy'])->name('packages.destroy');
        Route::delete('/packages', [PackageController::class, 'destroyAll'])->name('packages.destroyAll');
    });
    Route::middleware(['auth', 'permission:manage genealogy'])->group(function () {
        Route::get('/admin/genealogy/{id}', [ReferralController::class, 'genealogy'])->name('admin.genealogy');
        Route::get('/admin/referral-index', [ReferralController::class, 'index'])->name('admin.referral');
    });
    Route::middleware(['auth','permission:manage products'])->group(function () {
        Route::get('/products', [ProductController::class, 'index'])->name('products.index');
        Route::post('/products', [ProductController::class, 'store'])->name('products.store');
        Route::put('/products/{product}', [ProductController::class, 'update'])->name('products.update');
        Route::delete('/products/{product}', [ProductController::class, 'destroy'])->name('products.destroy');
        Route::delete('/products', [ProductController::class, 'destroyAll'])->name('products.destroyAll');
    });
    Route::middleware(['auth', 'permission:manage payment'])->group(function () {
        Route::get('/admin/payments', [PaymentController::class, 'adminIndex'])->name('admin.payments.index');
        Route::put('/admin/payments/{payment}/status', [PaymentController::class, 'updateStatus'])->name('admin.payments.updateStatus');
    });
    Route::middleware(['auth', 'permission:manage announcements'])->group(function () {
        Route::get('/announcements', [AnnouncementController::class, 'index'])->name('announcements.index');
        Route::post('/announcements', [AnnouncementController::class, 'store'])->name('announcements.store');
        Route::delete('/announcements/{announcement}', [AnnouncementController::class, 'destroy'])->name('announcements.destroy');
    });
   // ✅ Admin Routes (for managing banks)
    Route::middleware(['auth', 'permission:manage bank'])->group(function () {
        Route::get('/banks', [BankController::class, 'index'])->name('admin.banks.index');         // List banks
        Route::get('/banks/create', [BankController::class, 'create'])->name('admin.banks.create'); // Show create form
        Route::post('/banks', [BankController::class, 'store'])->name('admin.banks.store');         // Save new bank
        Route::get('/banks/{id}/edit', [BankController::class, 'edit'])->name('admin.banks.edit');  // Show edit form
        Route::put('/banks/{id}', [BankController::class, 'update'])->name('admin.banks.update');   // Update bank
        Route::delete('/banks/{id}', [BankController::class, 'destroy'])->name('admin.banks.destroy'); // Delete bank
    });
    Route::middleware(['auth', 'permission:manage role'])->group(function () {
        Route::get('/admin/roles', [RoleController::class, 'index'])->name('roles.index');
        Route::post('/admin/roles', [RoleController::class, 'store'])->name('roles.store');
        Route::post('/admin/roles', [RoleController::class, 'updatePermissions'])->name('roles.updatePermissions');
    });
    Route::middleware(['auth', 'permission:manage category'])->group(function () {
         Route::get('/categories', [CategoryController::class, 'index'])->name('user.categories');
        Route::post('/categories', [CategoryController::class, 'store'])->name('categories.store');
        Route::put('/categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
        Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');
        Route::get('/categories/export', [CategoryController::class, 'exportCsv'])->name('export.categories.csv');
    });
    Route::middleware(['auth','can:manage items'])->group(function () {
        Route::get('/items', [ItemController::class, 'index'])->name('user.items');
        Route::post('/items', [ItemController::class, 'store'])->name('items.store');
        Route::put('/items/{items}', [ItemController::class, 'update'])->name('items.update');
        Route::delete('/items/{items}', [ItemController::class, 'destroy'])->name('items.destroy');
        Route::get('/items/export', [ItemController::class, 'exportItemsCsv'])->name('export.items.csv');
        Route::post('/items/upload', [ItemController::class, 'upload'])->name('items.upload');
    });
     Route::middleware(['auth', 'can:manage menus'])->group(function () {
        Route::get('/Menu', [MenuController::class, 'index'])->name('user.menu');
        Route::post('/Menu', [MenuController::class, 'store'])->name('menus.store');
    });
     Route::middleware(['auth', 'can:manage ingredients'])->group(function () {
        Route::get('/ingredients', [IngredientController::class, 'index'])->name('user.ingredient');
        Route::post('/ingredients', [IngredientController::class, 'store'])->name('ingredients.store');
    });
    Route::middleware(['auth', 'can:manage order'])->group(function () {
        Route::get('/orders/export-csv', [OrderController::class, 'exportCsv'])->name('orders.export.csv');
        Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');
        Route::get('/orders/{order}', [OrderController::class, 'showDetails'])->name('orders.showDetails');
        Route::get('/orders/{order}/details', [OrderController::class, 'showAll'])->name('orders.showAll');
        Route::post('/orders', [OrderController::class, 'store'])->name('orders.store');
        Route::put('/orders/{order}', [OrderController::class, 'update'])->name('orders.update');
        Route::delete('/orders/{order}', [OrderController::class, 'destroy'])->name('orders.destroy');
    });
    Route::middleware(['auth'])->group(function () { //VerifyMerchant::class
        Route::get('/retail/pos', [RetailPosController::class, 'index'])->name('retail.pos');
        Route::post('/retail/pos/sale', [RetailPosController::class, 'store'])->name('pos.store');
        Route::post('/retail/calculate', [RetailPosController::class, 'calculate'])->name('pos.calculate');
        Route::post('/verify-pospin', [RetailPosController::class, 'verifyPosPin'])->name('pos.verifyPosPin');;
        Route::post('/print-receipt/{order}', [RetailPosController::class, 'printReceipt'])->name('invoice.print');
    });
        Route::middleware(['auth'])->group(function () { //VerifyMerchant::class
        Route::get('/food/pos', [FoodPosController::class, 'index'])->name('food.pos');
        Route::post('/food/pos/sale', [FoodPosController::class, 'store'])->name('food.store');
        Route::post('/food/calculate', [FoodPosController::class, 'calculate'])->name('food.calculate');
        Route::post('/verify-pospin', [FoodPosController::class, 'verifyPosPin'])->name('food.verifyPosPin');;
        Route::post('/print-receipt/{order}', [FoodPosController::class, 'printReceipt'])->name('invoice.print');
    });
    Route::middleware(['auth','can:manage transaction'])->group(function () {
        Route::get('/merchant/transactions', [TransactionController::class, 'index'])->name('user.transactions');
        Route::get('/export/transactions-csv', [TransactionController::class, 'exportTransactionsExcel'])->name('export.transactions.csv');
    });
    Route::middleware(['auth','can:manage transaction'])->group(function () {
        Route::get('/discounts', [DiscountController::class, 'index'])->name('user.discounts');
        Route::post('/discounts', [DiscountController::class, 'store'])->name('discount.store');
        Route::patch('/discounts/{discount}/toggle', [DiscountController::class, 'toggle'])->name('discount.toggle');
        Route::put('/discounts/{discount}', [DiscountController::class, 'update'])->name('discount.update');
        Route::delete('/discounts/{discount}', [DiscountController::class, 'destroy'])->name('discount.destroy');
    });

    Route::middleware(['auth'])->group(function () {
    // Title Management Routes
    Route::get('/titles', [TitleController::class, 'index'])->name('titles.index');
    Route::post('/titles', [TitleController::class, 'store'])->name('titles.store');
    Route::put('/titles/{title}', [TitleController::class, 'update'])->name('titles.update');
    Route::delete('/titles/{title}', [TitleController::class, 'destroy'])->name('titles.destroy');
});

        Route::middleware(['auth'])->group(function () {
            Route::get('/payment', [PaymentController::class, 'index'])->name('payment.index');
            Route::post('/payment', [PaymentController::class, 'store'])->name('payment.store');
        });

        Route::get('/activation', [ActivationController::class, 'show'])->name('activation.show');
        Route::post('/activation', [ActivationController::class, 'verify'])->name('activation.verify');
       
        Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
        Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
        
   });

require __DIR__ . '/auth.php';
