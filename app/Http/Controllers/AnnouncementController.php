<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AnnouncementController extends Controller
{
    public function index()
    {
        // Use paginate or latest
        $announcement = Announcement::with('user')->latest()->paginate(10);

        return Inertia::render('Admin/Announcements', [
            'announcements' => $announcement,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
        ]);

        Announcement::create([
            'title' => $request->input('title'),
            'content' => $request->input('content'), // <-- use input()
            'user_id' => auth()->id(),
        ]);

        return redirect()->back()->with('success', 'Announcement posted!');
    }

    public function destroy(Announcement $announcement)
    {
        $announcement->delete();
        return redirect()->back()->with('success', 'Announcement deleted!');
    }
}
