<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
        $table->decimal('subtotal', 10, 2)->default(0)->after('customer_name');
        $table->decimal('discount', 10, 2)->default(0)->after('subtotal');
        $table->decimal('tax', 10, 2)->default(0)->after('discount');
        $table->decimal('change', 10, 2)->default(0)->after('amount_paid');
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            //
        });
    }
};
