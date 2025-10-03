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
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone')->nullable()->after('email');
            $table->string('address')->nullable()->after('phone');
            $table->foreignId('title_id')->nullable()->constrained('titles')->nullOnDelete();
            $table->boolean('is_active')->default(false)->after('address');
            $table->enum('payment_status', ['unpaid', 'paid', 'expired', 'exempted']);
            $table->foreignId('package_id')->nullable()->constrained('packages')->nullOnDelete();
            $table->boolean('is_suspended')->default(false);
            $table->timestamp('suspended_until')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->after('is_paid');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['package_id']);

            $table->dropColumn([
                'phone',
                'address',
                'is_active',
                'package_id',
            ]);
        });
    }
};
