<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'merchant_id',
        'staff_id',
        'customer_name',
        'invoice_number',
        'payment_method',
        'amount_paid',
        'total',
        'reference_number',
        'subtotal',      
        'discount',
        'tax',   
        'change'  
    ];

    public function merchant()
    {
        return $this->belongsTo(User::class, 'merchant_id');
    }

    public function staff()
    {
        return $this->belongsTo(User::class, 'staff_id');
    }

    public function sales()
    {
        return $this->hasMany(Sale::class);
    }
}
