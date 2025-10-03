<?php

namespace App\Http\Controllers;

use App\Models\Bank;
use Illuminate\Http\Request;

class BankController extends Controller
{
    // Show list of banks for admin
    public function index()
    {
        $banks = Bank::all();
        return inertia('Admin/Banks', ['banks' => $banks]);
    }

    // Show form to create new bank
    public function create()
    {
        return inertia('Admin/CreateBank');
    }

    // Save new bank
    public function store(Request $request)
    {
        $validated = $request->validate([
            'bank_name'      => 'required|string|max:255',
            'account_name'   => 'required|string|max:255',
            'account_number' => 'required|string|max:255',
            'instructions'   => 'nullable|string',
            'qr_code'        => 'nullable|image|max:2048',
        ]);

        $bank = new Bank($validated);

        if ($request->hasFile('qr_code')) {
            $path = $request->file('qr_code')->store('qr_codes', 'public');
            $bank->qr_code = $path;
        }

        $bank->save();

        return redirect()->route('admin.banks.index')->with('success', 'Bank added successfully!');
    }

    // Show form to edit bank
    public function edit($id)
    {
        $bank = Bank::findOrFail($id);
        return inertia('Admin/EditBank', ['bank' => $bank]);
    }

    // Update bank info
    public function update(Request $request, $id)
    {
        $bank = Bank::findOrFail($id);

        $validated = $request->validate([
            'bank_name'      => 'required|string|max:255',
            'account_name'   => 'required|string|max:255',
            'account_number' => 'required|string|max:255',
            'instructions'   => 'nullable|string',
            'qr_code'        => 'nullable|image|max:2048',
        ]);

        $bank->update($validated);

        if ($request->hasFile('qr_code')) {
            $path = $request->file('qr_code')->store('qr_codes', 'public');
            $bank->qr_code = $path;
            $bank->save();
        }

        return redirect()->route('admin.banks.index')->with('success', 'Bank updated successfully!');
    }

    // Delete bank
    public function destroy($id)
    {
        $bank = Bank::findOrFail($id);
        $bank->delete();

        return redirect()->route('admin.banks.index')->with('success', 'Bank deleted successfully!');
    }
}
