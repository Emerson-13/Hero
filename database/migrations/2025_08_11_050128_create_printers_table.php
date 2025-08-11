<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('printers', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable(); // Printer name, nullable for no printer set
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('printers');
    }
};
