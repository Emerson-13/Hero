<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Transaction;
use Mike42\Escpos\Printer;
use Mike42\Escpos\PrintConnectors\WindowsPrintConnector;

class InvoiceController extends Controller
{
    public function printReceipt($transactionId)
    {
        $transaction = Transaction::with(['sales', 'user'])->findOrFail($transactionId);

        try {
            // Change "EPSON" to your printer's name in Windows Printers
            $connector = new WindowsPrintConnector("EPSON");
            $printer = new Printer($connector);

            $printer->setJustification(Printer::JUSTIFY_CENTER);
            $printer->text("HERO STORE\n");
            $printer->text($transaction->user->company_name . "\n");
            $printer->text($transaction->user->address . "\n");
            $printer->text("Official Receipt\n");
            $printer->text("#" . $transaction->invoice_number . "\n");
            $printer->text(date('Y-m-d H:i:s', strtotime($transaction->created_at)) . "\n");
            $printer->feed();

            $printer->setJustification(Printer::JUSTIFY_LEFT);
            foreach ($transaction->sales as $item) {
                $printer->text($item->product_name . "\n");
                $printer->text($item->quantity . " x ₱" . number_format($item->price, 2) . 
                    "   ₱" . number_format($item->total, 2) . "\n");
            }

            $printer->feed();
            $printer->text("Total: ₱" . number_format($transaction->total, 2) . "\n");
            $printer->text("Paid: ₱" . number_format($transaction->amount_paid, 2) . "\n");
            $printer->text("Change: ₱" . number_format($transaction->change, 2) . "\n");
            $printer->feed();

            $printer->setJustification(Printer::JUSTIFY_CENTER);
            $printer->text("Thank you for your purchase!\n");
            $printer->text("Visit us again :)\n");

            // 🟢 Open Cash Drawer
            $printer->pulse();

            $printer->cut();
            $printer->close();

           return response()->json(['status' => 'success']);
        } catch (\Exception $e) {
            // Log detailed error info
            Log::error('PrintReceipt Error: ' . $e->getMessage(), [
                'transaction_id' => $transactionId,
                'stack_trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'status' => 'printer_unavailable',
                'error' => 'Printer not connected or unavailable',
            ], 200);
        }
    }
}
