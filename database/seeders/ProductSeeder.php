<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Product;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Product::insert([
            [ 'merchant_id' => 2, 'name' => 'Electric Fan', 'description' => 'A fan for hot wheather', 'price'=>'90', 'stock'=>'78', 'category_id'=>'1'],
            [ 'merchant_id' => 2, 'name' => 'Red Dress', 'description' => 'Red long dress', 'price'=>'454', 'stock'=>'334', 'category_id'=>'3'],
            [ 'merchant_id' => 2, 'name' => 'BearBrand Milk', 'description' => 'Powdered Milk', 'price'=>'320', 'stock'=>'634', 'category_id'=>'2'],
            [ 'merchant_id' => 2, 'name' => 'Ariel', 'description' => 'Powdered Detergent', 'price'=>'320', 'stock'=>'634', 'category_id'=>'4'],
        ]);
    }
}
