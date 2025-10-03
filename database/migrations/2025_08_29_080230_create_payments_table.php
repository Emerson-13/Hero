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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // who made the payment
            $table->decimal('amount', 12, 2);
            $table->string('payment_method')->default('gcash'); // e.g. manual, gcash, paypal
            $table->string('bank_name')->nullable(); // where the money was sent
            $table->string('account_number')->nullable(); // account number you provided
            $table->string('transaction_number')->nullable(); // user’s provided reference no
            $table->string('proof_image')->nullable(); // path to uploaded proof pic
            $table->enum('status', ['pending', 'paid', 'rejected'])->default('pending'); // for verification
            $table->foreignId('verified_by')->nullable()->constrained('users')->onDelete('set null'); // admin who verified
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
