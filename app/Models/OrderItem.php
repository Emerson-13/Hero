<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'item_id',
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
    

    public function item()
    {
        return $this->belongsTo(Item::class);
    }
}
