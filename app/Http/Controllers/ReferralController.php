<?php

namespace App\Http\Controllers;

use App\Models\User;
use Inertia\Inertia;

class ReferralController extends Controller
{
    public function index()
{
    $users = User::with('referralCode:id,user_id,code', 'referral.referrer', 'creator')
        ->select('id', 'name', 'email','created_by')
        ->orderByDesc('id')
        ->paginate(10)
        ->through(fn ($u) => [
            'id'    => $u->id,
            'name'  => $u->name,
            'email' => $u->email,
            'code'  => optional($u->referralCode)->code, // from referral_codes.code
            'created_by' =>optional($u->creator)->name,
            'creator_id' => $u->created_by,
           'referred_by_name' => $u->referral ? optional($u->referral->referrer)->name : null,
           'referred_by_id'   => optional(optional($u->referral)->referrer)->id,
        ]);

    return Inertia::render('Admin/ReferralIndex', [
        'users' => $users,
    ]);
}

    /**
     * Show genealogy tree of a member (referrals downline).
     */
    public function genealogy($id)
    {
        $user = User::with(['referrals.referred'])->findOrFail($id);

        // Recursively build the tree
        $buildTree = function ($user) use (&$buildTree) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'children' => $user->referrals->map(function ($referral) use ($buildTree) {
                    return $buildTree($referral->referred);
                }),
            ];
        };

        $tree = $buildTree($user);

        return Inertia::render('Admin/Genealogy', [
            'tree' => $tree,
        ]);
    }
}
