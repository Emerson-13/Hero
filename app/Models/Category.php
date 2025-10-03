<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{

     protected $fillable = [
        'user_id',
        'name',
        'description',
        'is_discountable'
     ];
    public function products()
    {
        return $this->hasMany(Product::class);
    }
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
