<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Discount extends Model
{
    protected $fillable = [
        'merchant_id',
        'code',
        'type',
        'value',
        'discount_type',
        'applies_to',
        'target_ids',
        'is_active',
    ];

    protected $casts = [
        'target_ids' => 'array',
        'is_active' => 'boolean',
    ];
}
