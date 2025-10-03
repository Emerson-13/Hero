<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Menu extends Model
{
     protected $fillable = [
        'name',
        'barcode',
        'description',
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
         return $this->belongsTo(Category::class);
      }
       public function ingredients()
    {
        return $this->belongsToMany(Ingredient::class, 'ingredient_menu')
                    ->withPivot('quantity')
                    ->withTimestamps();
    }
}
