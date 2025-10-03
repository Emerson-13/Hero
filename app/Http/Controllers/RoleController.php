<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Inertia\Inertia;

class RoleController extends Controller
{
    /**
     * Display a listing of the roles with their permissions.
     */
    public function index()
    {
        $roles = Role::with('permissions')->get();
        $permissions = Permission::all();

        return Inertia::render('Admin/Role', [
            'roles' => $roles,
            'permissions' => $permissions,
        ]);
    }

    /**
     * Store a newly created role with permissions.
     */
public function store(Request $request)
{
    $request->validate([
        'name' => 'required|string|unique:roles,name',
        'permissions' => 'array',
    ]);

    // Create new role
    $role = Role::create(['name' => $request->name]);

    // Attach permissions
    if (!empty($request->permissions)) {
        $role->syncPermissions($request->permissions);
    }

    return redirect()->back()->with('success', 'Role created successfully.');
}
public function updatePermissions(Request $request)
{
    $request->validate([
        'role_id' => 'required|exists:roles,id',
        'permissions' => 'array',
    ]);

    $role = Role::findOrFail($request->role_id);

    // Update role permissions
    $role->syncPermissions($request->permissions);

    return redirect()->route('roles.index')->with('success', 'Role updated successfully.');
}

}
