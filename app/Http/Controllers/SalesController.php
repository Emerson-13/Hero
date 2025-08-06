<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SalesController extends Controller
{
  public function index()
{
    $sales = Sale::with(['transaction'])->latest()->get();

    return inertia('Merchant/Sales', [
        'sales' => $sales,
    ]);
}
public function exportSalesExcel()
{
    $sales = Sale::with('transaction')->latest()->get();

    $spreadsheet = new Spreadsheet();
    $sheet = $spreadsheet->getActiveSheet();

    // Set headings
    $sheet->fromArray([
        ['Invoice #', 'Product Name', 'Quantity', 'Price', 'Discount', 'Tax', 'Total', 'Date']
    ], null, 'A1');

    // Fill rows
    $row = 2;
    foreach ($sales as $sale) {
        $sheet->fromArray([
            $sale->transaction->invoice_number ?? 'N/A',
            $sale->product_name,
            $sale->quantity,
            $sale->price,
            $sale->discount,
            $sale->tax,
            $sale->total,
            $sale->created_at,
        ], null, 'A' . $row++);
    }

    $filename = 'sales_' . now()->format('Ymd_His') . '.xlsx';

    return new StreamedResponse(function () use ($spreadsheet) {
        $writer = new Xlsx($spreadsheet);
        $writer->save('php://output');
    }, 200, [
        'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition' => "attachment; filename=\"$filename\"",
        'Cache-Control' => 'max-age=0',
    ]);
}

 
}
