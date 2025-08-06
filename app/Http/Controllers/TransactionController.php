<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;


class TransactionController extends Controller
{
    public function index( )
    {
        $transaction = Transaction::where('merchant_id', Auth::id())->get();

        return Inertia::render('Merchant/Transactions', [
        'transaction' => $transaction,
        ]);
    }
       public function exportTransactionsExcel()
    {
        $transactions = Transaction::latest()->get();

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // Set headings
        $sheet->fromArray([
            ['Customer Name', 'Invoice #', 'Amount Paid', 'Total', 'Change', 'Payment Method', 'Reference #', 'Date']
        ]);

        // Populate rows
        $rowIndex = 2;
        foreach ($transactions as $txn) {
            $sheet->fromArray([
                [
                    $txn->customer_name,
                    $txn->invoice_number,
                    $txn->amount_paid,
                    $txn->total,
                    $txn->change,
                    $txn->payment_method,
                    $txn->reference_number,
                    $txn->created_at,
                ]
            ], null, 'A' . $rowIndex++);
        }

        $filename = 'transactions_' . now()->format('Ymd_His') . '.xlsx';

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
