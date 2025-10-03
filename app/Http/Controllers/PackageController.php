<?php

namespace App\Http\Controllers;

use App\Models\Package;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class PackageController extends Controller
{
    // List all packages with products (paginated)
    public function index()
    {
        $packages = Package::with('products', 'role')->paginate(10);
        $products = Product::all();
        $roles = Role::all(); // fetch all roles

        return Inertia::render('Admin/Packages', [
            'packages' => $packages,
            'products' => $products,
            'roles' => $roles, 
        ]);
    }


    // Store new package and attach selected products
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric',
            'description' => 'nullable|string',
            'products' => 'nullable|array', // new
            'products.*' => 'exists:products,id', // each product must exist
            'role_id' => 'required|exists:roles,id',
        ]);

        $package = Package::create($data);

        if (!empty($data['products'])) {
            $package->products()->attach($data['products']);
        }

        return redirect()->back()->with('success', 'Package created successfully!');
    }

    // Update package and sync products
    public function update(Request $request, Package $package)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric',
            'description' => 'nullable|string',
            'products' => 'nullable|array', // array of product IDs
            'role_id' => 'required|exists:roles,id',  
        ]);

        $package->update($data);

        if (isset($data['products'])) {
            $package->products()->sync($data['products']);
        }

        return redirect()->back()->with('success', 'Package updated successfully!');
    }

    // Delete package
    public function destroy(Package $package)
    {
        $package->products()->detach(); // remove relations in pivot table
        $package->delete();

        return redirect()->back()->with('success', 'Package deleted successfully!');
    }
    
    public function destroyAll(Request $request)
    {
        $packageIds = $request->input('package_ids', []);

        if (empty($packageIds)) {
            return redirect()->back()->with('error', 'No packages selected for deletion.');
        }

        Package::whereIn('id', $packageIds)->delete();

        return redirect()->back()->with('success', 'Selected packages deleted successfully!');
    }


}
