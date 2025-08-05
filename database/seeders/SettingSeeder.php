<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Setting;

class SettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Setting::insert([
        [ 
            'merchant_id' => 1,
            'key' => 'discount_mode',
            'value' => 'single', // can be 'disabled', 'all', or 'single']
        ]
    ]);
    }
}
