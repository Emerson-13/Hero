<?php

namespace App\Http\Controllers;

use App\Models\Title;
use Spatie\Permission\Models\Role;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TitleController extends Controller
{
    // Show all titles with roles
    public function index()
    {
        $titles = Title::with('role')->get();
        $roles = Role::all();

        return Inertia::render('Admin/Title', [
            'titles' => $titles,
            'roles' => $roles,
        ]);
    }

    // Store new title
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'role_id' => 'required|exists:roles,id',
        ]);

        Title::create($request->only('name', 'role_id'));

        return redirect()->back()->with('success', 'Title created successfully.');
    }

    // Update title
    public function update(Request $request, Title $title)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'role_id' => 'required|exists:roles,id',
        ]);

        $title->update($request->only('name', 'role_id'));

        return redirect()->back()->with('success', 'Title updated successfully.');
    }

    // Delete title
    public function destroy(Title $title)
    {
        $title->delete();

        return redirect()->back()->with('success', 'Title deleted successfully.');
    }
}
