<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Item extends Model
{
     protected $fillable = [
        'name',
        'barcode',
        'description',
        'stock',
        'price',
        'user_id',
        'category_id',
        'tax_type'
     ];
         public function users()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
   
    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

}
