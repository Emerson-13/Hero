<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleAndPermissionSeeder extends Seeder
{
    public function run(): void
    {
        // --- Step 1: Define Permissions ---
        $permissions = [
            'view dashboard',
            'manage member',
            'manage packages',
            'manage products',
            'manage payment',
            'manage bank',
            'manage announcements',
            'manage genealogy',
            'manage activation-code',
            'manage role',
            'manage category',
            'manage items',
            'manage menus',
            'manage ingredients',
            'manage order',
            'manage order-view',
            'manage transaction'
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // --- Step 2: Admin Role ---
        $admin = Role::firstOrCreate(['name' => 'admin']);
        $admin->givePermissionTo([
            'view dashboard',
            'manage member',
            'manage packages',
            'manage products',
            'manage payment',
            'manage bank',
            'manage announcements',
            'manage genealogy',
            'manage activation-code',
            'manage role',
            'manage category',
            'manage items',
            'manage menus',
            'manage ingredients',
            'manage order',
            'manage order-view',
            'manage transaction'
        ]);
        $moderator = Role::firstOrCreate(['name' => 'moderator']);
        $moderator->givePermissionTo([
            'view dashboard',
            'manage member',
            'manage packages',
            'manage products',
            'manage payment',
            'manage bank',
            'manage announcements',
            'manage genealogy',
            'manage activation-code',
            'manage category',
            'manage items',
            'manage menus',
            'manage ingredients',
            'manage order',
            'manage order-view',
            'manage transaction'
        ]);

        $CustomerSupport = Role::firstOrCreate(['name' => 'customer support']);
        $CustomerSupport->givePermissionTo([
            'view dashboard',
            'manage member',
            'manage packages',
            'manage products',
            'manage category',
            'manage items',
            'manage menus',
            'manage ingredients',
        ]);

        // --- Step 3: Member Roles ---
        $PremiumMember = Role::firstOrCreate(['name' => 'premium member']);
        $PremiumMember->givePermissionTo([
            'view dashboard',
            'manage category',
            'manage items',
            'manage menus',
            'manage ingredients',
            'manage order',
            'manage order-view',
            'manage transaction'
        ]);

        $StandardMember = Role::firstOrCreate(['name' => 'standard member']);
        $StandardMember->givePermissionTo([
            'view dashboard',
            'manage category',
            'manage items',
            'manage menus',
            'manage ingredients',
            'manage order',
            'manage order-view',
            'manage transaction'
        ]);
    }
}
