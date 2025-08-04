<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Category::insert([
            ['name' => 'Electronics', 'description' => 'Electronic devices and gadgets', 'merchant_id' => 2],
            ['name' => 'Groceries', 'description' => 'Everyday grocery items', 'merchant_id' => 2],
            ['name' => 'Clothing', 'description' => 'Apparel and fashion', 'merchant_id' => 2],
            ['name' => 'Detergents', 'description' => 'Laundry products', 'merchant_id' => 2],
        ]);
    }
}
