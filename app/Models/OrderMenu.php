<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class OrderMenu extends Model
{
     use HasFactory;

    protected $fillable = [
        'order_id',
        'menu_id',
        'quantity',
        'discount',
        'tax',
        'price',
        'subtotal',
    ];
    
    // 🔗 Relationships
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function menu()
    {
        return $this->belongsTo(Menu::class);
    }
}
