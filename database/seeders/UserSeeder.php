<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\ReferralCode;
use App\Models\Referral;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // 1️⃣ Create Admin User
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'is_active' => true,
            'payment_status' => 'exempted',
        ]);
        $admin->assignRole('admin');

        // Generate referral code for Admin
        $adminCode = Str::upper(Str::random(8));
        ReferralCode::create([
            'user_id' => $admin->id,
            'code' => $adminCode,
            'is_active' => true,
        ]);

         // 2 Create Admin User
        $moderator = User::create([
            'name' => 'Moderator User',
            'email' => 'moderator@example.com',
            'password' => Hash::make('password'),
            'is_active' => true,
            'payment_status' => 'exempted',
        ]);
        $moderator->assignRole('moderator');

        // Generate referral code for Admin
        $moderatorCode = Str::upper(Str::random(8));
        ReferralCode::create([
            'user_id' => $moderator->id,
            'code' => $moderatorCode,
            'is_active' => true,
        ]);

        // 3 Create Member User
        $member = User::create([
            'name' => 'Merchant User',
            'email' => 'merchant@example.com',
            'password' => Hash::make('password'),
            'phone' => '09934567398',
            'address' => 'Tondo Manila',
            'is_active' => true, 
            'payment_status' => 'paid',
        ]);
        $member->assignRole('premium member');

        // Generate referral code for Member
        $memberCode = Str::upper(Str::random(8));
        ReferralCode::create([
            'user_id' => $member->id,
            'code' => $memberCode,
            'is_active' => true,
        ]);

        // 3️⃣ Link member to admin via referrals table
        Referral::create([
            'referrer_id' => $admin->id,
            'referred_user_id' => $member->id,
            'code_used' => $adminCode, // Admin's code used by member
            'is_created' => true,
        ]);
    }
}
