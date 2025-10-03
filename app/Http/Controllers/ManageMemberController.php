<?php

namespace App\Http\Controllers;

use App\Mail\AccountApprovedMail;
use App\Models\User;
use App\Models\Title;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\ReferralCode;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rules;
use App\Models\package;
use Illuminate\Support\Facades\Hash;
use App\Models\Referral;
use Spatie\Permission\Models\Role;
use Illuminate\Auth\Events\Registered;

class ManageMemberController extends Controller
{
    public function index(Request $request)
    {
        $roleFilter = $request->input('role');

        $membersQuery = User::where('is_active', true)
            ->where('is_suspended', false)
            ->with(['roles', 'payments' => fn($q) => $q->latest()->take(1), 'package', 'title']);

        if ($roleFilter) {
            $membersQuery->whereHas('roles', fn($q) => $q->where('id', $roleFilter));
        }

        $members = $membersQuery->paginate(10);

        $members = $membersQuery
            ->paginate(10)
            ->through(fn ($member) => [
                'id' => $member->id,
                'name' => $member->name,
                'email' => $member->email,
                'phone' => $member->phone,
                'address' => $member->address,
                'is_active' => $member->is_active,
                'payment_status' => $member->payment_status,
                'roles' => $member->getRoleNames(),  
                'role_id' => $member->roles->pluck('id')->first(),  
                'title' => $member->title?->name,
                'title_id' => $member->title?->id, 
                'package' => $member->package?->name,
                'package_id' => $member->package?->id,
                'created_by' => optional($member->creator)->name,
                'created_at' => $member->created_at->toDateTimeString(),
            ]);

        // Fetch lahat ng roles para sa dropdown
        $roles = Role::all(['id', 'name']);

        // Fetch lahat ng titles
        $titles = Title::with('role:id,name')->get(['id', 'role_id', 'name']);

        // Fetch packages
        $packages = Package::with('role:id,name')->get(['id','role_id', 'name']);

        return Inertia::render('Admin/ApproveMember', [
            'members' => $members,
            'roles' => $roles,
            'titles' => $titles,
            'packages' => $packages,
            'selectedRole' => $roleFilter, // para malaman sa frontend kung ano ang na-select
        ]);
    }

    public function show(Request $request)
    {
        $pendingMembers = User::where('is_active', false)
            ->get(['id', 'name', 'email', 'phone', 'address', 'created_at']);

        return response()->json($pendingMembers);
    }
    public function showSuspended(Request $request)
    {
        $pendingMembers = User::where('is_suspended', true)
            ->get(['id', 'name', 'email', 'phone', 'address', 'suspended_until']);

        return response()->json($pendingMembers);
    }
    /**
     * Approve a member registration.
     */
    public function approve($id)
    {
        $member = User::findOrFail($id);

        // ✅ Approve user
        $member->is_active = true;
        $member->save();

        // ✅ Generate referral code
        do {
            $referralCode = Str::upper(Str::random(8));
        } while (ReferralCode::where('code', $referralCode)->exists());

        ReferralCode::create([
            'user_id'   => $member->id,
            'code'      => $referralCode,
            'is_active' => true,
        ]);

        // ✅ Send account approval via email
        Mail::to($member->email)->send(new AccountApprovedMail($member));

        return redirect()->back()->with('success', 'Member approved, referral and activation codes generated! The user will verify their email using the activation code.');
    }
    /**
     * Reject (destroy) pending member
     */
    public function rejectPendingMember($id)
    {
        $member = User::where('is_active', false)->findOrFail($id);

        // Optionally, you can notify the user about rejection here

        $member->delete();

        return redirect()->back()->with('success', 'Pending member rejected and deleted successfully!');
    }
     /**
     * Team Member
     */
    public function Store(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'phone'    => 'required|string|max:255',
            'address'  => 'nullable|string|max:255',
            'role_id'    => 'required|integer|exists:roles,id',
            'title_id'   => 'nullable|integer|exists:titles,id',
            'package_id' => 'nullable|integer|exists:packages,id',
            'payment_status' => 'nullable|string|in:paid,unpaid,not_required',

        ]);
        // Hanapin ang role
        $role = Role::findOrFail($request->role_id); // find by ID

            $packageId = null;
        if (!empty($request->package_id)) {
            $package = Package::where('id', $request->package_id)
                        ->where('role_id', $role->id)
                        ->first();
            $packageId = $package ? $package->id : null;
        }

        $titleId = null;
        if (!empty($request->title_id)) {
            $title = Title::where('id', $request->title_id)
                        ->where('role_id', $role->id)
                        ->first();
            $titleId = $title ? $title->id : null;
        }
        // Default payment status
        $paymentStatus = $request->payment_status ?? 'unpaid';

        // Kung admin o moderator, automatic not_required
        if (in_array($role->name, ['admin', 'moderator', 'costumer support'])) {
            $paymentStatus = 'exempted';
        }

        // Create active user
        $user = User::create([
            'name'       => $request->name,
            'email'      => $request->email,
            'password'   => Hash::make($request->password),
            'address'    => $request->address,
            'phone'      => $request->phone,
            'payment_status'  => $paymentStatus,
            'is_active'  => true,
            'package_id' => $packageId, // kung meron, insert; kung wala, null
            'title_id'   => $titleId,
            'created_by' => auth()->id(), 
        ]);
        // ✅ Generate referral code
            do {
                $referralCode = Str::upper(Str::random(8));
            } while (ReferralCode::where('code', $referralCode)->exists());

        $referral = ReferralCode::create([
            'user_id'   => $user->id,
            'code'      => $referralCode,
            'is_active' => true,
        ]);
            
        // ✅ Insert into referrals (track who created who)
        Referral::create([
            'referrer_id'      => auth()->id(), // yung admin na nag create
            'referred_user_id' => $user->id,    // yung bagong user
            'code_used'        => $referral->code, // code ng bagong user
            'is_created'       => true,
        ]);

        // Assign role
        $user->assignRole($role->name);

        return redirect()->back()->with('success', 'New team member created successfully!');
    }


   
     /**
     * Update user information.
     */
    public function update(Request $request, User $member)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $member->id,
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:255',
            'role_id'    => 'required|integer|exists:roles,id',
            'title_id'   => 'nullable|integer|exists:titles,id',
            'package_id' => 'nullable|integer|exists:packages,id',
        ]);

        // Hanapin role
        $role = Role::findOrFail($request->role_id);

        // Validate package belongs to role
        $packageId = null;
        if (!empty($request->package_id)) {
            $package = Package::where('id', $request->package_id)
                        ->where('role_id', $role->id)
                        ->first();
            $packageId = $package ? $package->id : null;
        }

        // Validate title belongs to role
        $titleId = null;
        if (!empty($request->title_id)) {
            $title = Title::where('id', $request->title_id)
                        ->where('role_id', $role->id)
                        ->first();
            $titleId = $title ? $title->id : null;
        }

        // Update editable fields only
        $member->update([
            'name'       => $request->name,
            'email'      => $request->email,
            'phone'      => $request->phone,
            'address'    => $request->address,
            'package_id' => $packageId,
            'title_id'   => $titleId,
        ]);

        // Sync role (by name, not ID)
        $member->syncRoles([$role->name]);

        return redirect()->back()->with('success', 'Member updated successfully!');
    }
    public function suspendSelectedMembers(Request $request)
{
    $request->validate([
        'member_ids' => 'required|array',
        'duration' => 'required|in:1hour,1day,1week,1month,3months,6months,permanent'
    ]);

    $memberIds = $request->input('member_ids', []);

    if (empty($memberIds)) {
        return redirect()->back()->with('error', 'No members selected for suspension.');
    }

    // Duration mapping
    $durationMap = [
        '1hour'   => fn() => now()->addHour(),
        '1day'    => fn() => now()->addDay(),
        '1week'   => fn() => now()->addWeek(),
        '1month'  => fn() => now()->addMonth(),
        '3months' => fn() => now()->addMonths(3),
        '6months' => fn() => now()->addMonths(6),
    ];

    foreach ($memberIds as $id) {
        $member = User::find($id);

        if ($member) {
            $member->is_suspended = true; // suspend

            if ($request->duration === 'permanent') {
                $member->suspended_until = null;
            } else {
                $member->suspended_until = $durationMap[$request->duration]();
            }

            $member->save();
        }
    }

    return redirect()->back()->with(
        'success',
        $request->duration === 'permanent'
            ? 'Selected members suspended permanently.'
            : "Selected members suspended for {$request->duration}."
    );
}

public function upliftMember($id)
{
    $member = User::findOrFail($id);

    if ($member->is_suspended) {
        $member->is_suspended = false;
        $member->suspended_until = null;
        $member->save();

        return redirect()->back()->with('success', 'Member suspension lifted successfully.');
    }

    return redirect()->back()->with('info', 'Member is not suspended.');
}



}