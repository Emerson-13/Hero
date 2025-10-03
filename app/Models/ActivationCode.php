<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ActivationCode extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'is_used',
        'used_by',
        'package_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'used_by');
    }

    public function package()
    {
        return $this->belongsTo(Package::class);
    }
}
