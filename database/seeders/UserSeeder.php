<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Admin User
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'is_approved' => true,
        ]);
        $admin->assignRole('admin');

        // Merchant User
        $merchant = User::create([
            'name' => 'Merchant User',
            'email' => 'merchant@example.com',
            'password' => Hash::make('password'),
            'is_approved' => true,
        ]);
        $merchant->assignRole('merchant');
    }
}
