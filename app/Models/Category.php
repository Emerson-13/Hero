<?php

namespace App\Models;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    
     protected $fillable = [
        'name',
        'description',
        'merchant_id'
     ];
    
    
    
    public function products()
    {
        return $this->hasMany(Product::class);
    }
    public function merchant()
    {
        return $this->belongsTo(User::class, 'merchant_id');
    }
}
