<?php

namespace App\Http\Controllers;

use App\Models\PrinterDevice;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Mike42\Escpos\Printer as EscposPrinter; // alias Escpos printer class
use Mike42\Escpos\PrintConnectors\WindowsPrintConnector;
use Illuminate\Support\Facades\Log;

class PrinterController extends Controller
{
    // Show current active printer and all printers
    public function index()
    {
        $printer = PrinterDevice::first();  // active printer (first record)
        $printers = PrinterDevice::all();   // all printers

        return Inertia::render('MerchantSetting/PrinterSettings', [
            'printer' => $printer,
            'printers' => $printers,
        ]);
    }

    // Create a new printer
    // In PrinterController.php

public function store(Request $request)
{
    $request->validate([
        'name' => 'required|string|max:255|unique:printers,name',
    ]);

    $printer = new PrinterDevice();
    $printer->name = $request->name;
    $printer->save();

    return redirect()->back()->with('success', 'Printer added successfully.');
}

public function update(Request $request, $id)
{
    $request->validate([
        'name' => 'required|string|max:255|unique:printers,name,' . $id,
    ]);

    $printer = PrinterDevice::findOrFail($id);
    $printer->name = $request->name;
    $printer->save();

    return redirect()->back()->with('success', 'Printer updated successfully.');
}


    // Set active printer by ID
    public function setActivePrinter($id)
    {
        $printerToSet = PrinterDevice::findOrFail($id);

        $activePrinter = PrinterDevice::first();

        if (!$activePrinter) {
            $activePrinter = new PrinterDevice();
        }

        $activePrinter->name = $printerToSet->name;
        $activePrinter->save();

        return redirect()->back()->with('success', 'Active printer set to ' . $printerToSet->name);
    }
    public function destroy($id)
{
    $printer = PrinterDevice::findOrFail($id);
    $printer->delete();

    return redirect()->back()->with('success', 'Printer deleted successfully.');
}
}
