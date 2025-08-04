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
            $table->boolean('is_approved')->default(false);
                $table->unsignedBigInteger('merchant_id')->nullable()->after('id');
            $table->foreign('merchant_id')->references('id')->on('users')->onDelete('cascade');
            $table->enum('merchant_type', ['restaurant', 'supermarket'])->default('supermarket');
        });
    }

                    
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            //
        });
    }
};
