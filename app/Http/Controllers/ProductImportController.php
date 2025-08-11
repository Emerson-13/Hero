<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\Category;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Illuminate\Support\Str;

class ProductImportController extends Controller
{
    public function showImportForm()
    {
        return view('products.import');
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls',
        ]);

        $file = $request->file('file');
        $spreadsheet = IOFactory::load($file);
        $sheet = $spreadsheet->getActiveSheet();
        $rows = $sheet->toArray();

        $header = array_map('strtolower', $rows[0]);

        foreach (array_slice($rows, 1) as $row) {
            $data = array_combine($header, $row);

            if (empty($data['name']) || empty($data['category'])) {
                continue; // Skip if required fields missing
            }

            $category = Category::firstOrCreate(['name' => $data['category']]);

            $barcode = $data['barcode'] ?? 'BC-' . strtoupper(Str::random(8));

            Product::create([
                'name' => $data['name'],
                'price' => $data['price'] ?? 0,
                'barcode' => $barcode,
                'description' => $data['description'] ?? null,
                'stock' => $data['stock'] ?? 0,
                'category_id' => $category->id,
            ]);
        }

        return redirect()->back()->with('success', 'Products imported successfully.');
    }
}

