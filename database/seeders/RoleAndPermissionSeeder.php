<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleAndPermissionSeeder extends Seeder
{
    public function run(): void
    {
      

        // Create Permissions for Page Views
        $permissions = [
            'view dashboard',
            'view merchant-dashboard',
            'view staff-dashboard',
            'view manage-users',
            'view business',
            'view products',
            'view categories',
            'view sales',
            'view transactions',
            'view pos',
            'view staff',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Admin Role
        $admin = Role::firstOrCreate(['name' => 'admin']);
        $admin->givePermissionTo([
            'view dashboard',
            'view manage-users',
            'view business',
        ]);

        // Merchant Role
        $merchant = Role::firstOrCreate(['name' => 'merchant']);
        $merchant->givePermissionTo([
            'view merchant-dashboard',
            'view products',
            'view categories',
            'view sales',
            'view transactions',
            'view pos',
            'view staff',
        ]);

        // Staff Role
        $staff = Role::firstOrCreate(['name' => 'staff']);
        $staff->givePermissionTo([
            'view staff-dashboard',
            'view pos',
            'view products',
        ]);
    }
}
