<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class StaffController extends Controller
{

   public function index()
{
    $merchantId = Auth::id();

    // Only show staff associated with the current merchant
    $staff = User::role('staff')
        ->where('merchant_id', $merchantId)
        ->select('id', 'name', 'email', 'is_approved') // ✅ this is correct way to limit columns
        ->get();

    return Inertia::render('Merchant/Staff', [
    'staff' => $staff,
    ]);

}

    public function create()
    {
        return Inertia::render('Merchant/Staff/Create');
    }

    public function store(Request $request)
    {   
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $merchantId = Auth::id();

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'merchant_id' => $merchantId,
            'is_approved' => true,
        ]);

        $user->assignRole('staff');

        return redirect()->route('merchant.staff')->with('success', 'Staff created successfully.');
    }

    public function update(Request $request, User $staff)
    {

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'required', 'email',
                Rule::unique('users')->ignore($staff->id),
            ],
            'password' => 'nullable|string|min:8|confirmed',
        ]);

        $staff->name = $validated['name'];
        $staff->email = $validated['email'];
        if (!empty($validated['password'])) {
            $staff->password = Hash::make($validated['password']);
        }

        $staff->save();

        return redirect()->route('merchant.staff')->with('success', 'Staff updated successfully.');
    }

    public function destroy(User $staff)
    {
        $staff->delete();

        return redirect()->route('merchant.staff')->with('success', 'Staff deleted successfully.');
    }
}
