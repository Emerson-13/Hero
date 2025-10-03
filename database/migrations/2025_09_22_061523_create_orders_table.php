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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->enum('status', ['pending', 'cancelled', 'completed'])->default('pending');
            $table->enum('payment_status', ['unpaid', 'paid', 'refunded'])->default('unpaid'); 
            $table->text('shipping_address')->nullable();

            $table->decimal('subtotal', 10, 2);          // sum ng lahat ng (price * qty)
            $table->decimal('total_discount', 10, 2);    // sum ng lahat ng discount
            $table->decimal('total_tax', 10, 2);         // sum ng lahat ng tax
            $table->decimal('total_price', 10, 2);       // subtotal - total_discount + total_tax

            $table->decimal('amount_paid', 10, 2)->default(0);
            $table->decimal('change', 10, 2)->default(0);

            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
