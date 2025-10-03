<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Inertia\Inertia;
use Illuminate\Http\Request;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;


class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $userId = auth()->id();
        $query = Transaction::where('user_id', $userId);

         if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('invoice_number', 'like', "%$search%")
                ->orWhere('payment_method', 'like', "%$search%")
                ->orWhere('reference_number', 'like', "%$search%");
            });
        }

        $transaction = $query->orderBy('id', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('User/Transaction', [
        'transaction' => $transaction,
        'search' => $request->search ?? '',
        ]);
    }
    
    public function exportTransactionsExcel()
    {
        $transactions = Transaction::latest()->get();

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // Set headings
        $sheet->fromArray([
            ['Invoice #', 'Amount Paid', 'Change', 'Payment Method', 'Reference #', 'Date']
        ]);

        // Populate rows
        $rowIndex = 2;
        foreach ($transactions as $txn) {
            $sheet->fromArray([
                [
                    $txn->invoice_number,
                    $txn->amount_paid,
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
