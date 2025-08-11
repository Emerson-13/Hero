<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PrinterDevice extends Model
{
    protected $table = 'printers';

    protected $fillable = ['name'];
    
}
