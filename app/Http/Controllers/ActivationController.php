<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\ActivationCode;
use App\Models\Package;

class ActivationController extends Controller
{
     public function index()
    {
        $codes = ActivationCode::with('user', 'package')
            ->orderBy('created_at', 'desc')
            ->paginate(10); // 10 per page

        $packages = Package::all(); // Needed for dropdown to generate codes

        return Inertia::render('Admin/ActivationCodes', [
            'codes' => $codes,
            'packages' => $packages
        ]);
    }
    public function show()
    {
         return Inertia::render('Auth/Activation');
    }
  // Handle activation code submission
    public function verify(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
        ]);

        $user = Auth::user();

        $activation = ActivationCode::where('code', $request->code)
            ->where('used_by', $user->id)
            ->where('is_used', false)
            ->first();

        if (!$activation) {
            return back()->withErrors(['code' => 'Invalid activation code.']);
        }

        // Mark activation code as used
        $activation->update(['is_used' => true]);

        // ✅ Activate user and verify email at the same time
        $user->update([
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        return redirect()->route('dashboard')->with('success', 'Activation successful! You can now access your account.');
    }


        public function destroy($id)
    {
        $code = ActivationCode::findOrFail($id);
        $code->delete();

        return redirect()->back()->with('success', 'Activation code deleted successfully!');
    }
}
