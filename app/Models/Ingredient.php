<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ingredient extends Model
{
      protected $fillable = [
        'name',
        'barcode',
        'description',
        'stock',
        'user_id',
        'category_id',
     ];
        public function menus()
    {
        return $this->belongsToMany(Menu::class, 'ingredient_menu')
                    ->withPivot('quantity')
                    ->withTimestamps();
    }
         public function users()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
        public function category()
      {
         return $this->belongsTo(Category::class);
      }

}
