<?php

namespace App\Http\Controllers;

use App\Models\PrinterDevice;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PrinterController extends Controller
{
    // Show current active printer and all printers
    public function index()
    {
        $userId = auth()->id();

        $printers = PrinterDevice::where('user_id', $userId)->get();
        $printer = PrinterDevice::where('user_id', $userId)->where('is_active', true)->first();

        return Inertia::render('MerchantSetting/PrinterSettings', [
            'printer' => $printer,
            'printers' => $printers,
        ]);
    }

    // Create a new printer
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:printers,name',
        ]);

        $printer = new PrinterDevice();
        $printer->user_id = auth()->id();
        $printer->name = $request->name;
        $printer->is_active = false;
        $printer->save();

        return redirect()->back()->with('success', 'Printer added successfully.');
    }

    // Update existing printer
    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:printers,name,' . $id,
        ]);

        $userId = auth()->id();

        $printer = PrinterDevice::where('user_id', $userId)->findOrFail($id);
        $printer->name = $request->name;
        $printer->save();

        return redirect()->back()->with('success', 'Printer updated successfully.');
    }

    // Set active printer by ID
    public function setActivePrinter($id)
    {
        $userId = auth()->id();

        $printerToSet = PrinterDevice::where('user_id', $userId)->findOrFail($id);

        // Mark only one as active
        PrinterDevice::where('user_id', $userId)->update(['is_active' => false]);
        $printerToSet->is_active = true;
        $printerToSet->save();

        return redirect()->back()->with('success', 'Active printer set to ' . $printerToSet->name);
    }

    public function destroy($id)
    {
        $userId = auth()->id();

        $printer = PrinterDevice::where('user_id', $userId)->findOrFail($id);
        $printer->delete();

        return redirect()->back()->with('success', 'Printer deleted successfully.');
    }
}
