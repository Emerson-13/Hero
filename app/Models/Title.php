<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Title extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'user_id', 'role_id'];

    // Each Title belongs to a Role
    public function role()
    {
        return $this->belongsTo(\Spatie\Permission\Models\Role::class);
    }
        public function users()
    {
        return $this->hasMany(User::class);
    }
}
