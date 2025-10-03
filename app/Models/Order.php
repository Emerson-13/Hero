<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'status',
        'payment_status',
        'shipping_address',
        'subtotal',
        'total_discount',
        'total_tax',
        'total_price',
        'amount_paid',
        'change',
    ];

    // 🔗 Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function menus()
    {
        return $this->hasMany(OrderMenu::class);
    }

    // ✅ Relationship to transaction (optional pero useful)
    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }
}
