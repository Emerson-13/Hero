import { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import UpdateButton from "@/Components/UpdateButton";
import DeleteButton from "@/Components/DeleteButton";
import PrimaryButton from "@/Components/PrimaryButton";
import { Select } from "@headlessui/react";

export default function Packages({
    packages = { data: [], links: [] },
    products = [],
    roles = [],
}) {
    const [showForm, setShowForm] = useState(false);
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [description, setDescription] = useState("");
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [editId, setEditId] = useState(null);
    const [selectedRole, setSelectedRole] = useState("");
    const [selectedIds, setSelectedIds] = useState([]);

    const resetForm = () => {
        setName("");
        setPrice("");
        setDescription("");
        setSelectedProducts([]);
        setSelectedRole("");
        setEditId(null);
        setShowForm(false);
    };

    const submitPackage = (e) => {
        e.preventDefault();
        const payload = {
            name,
            price,
            description,
            products: selectedProducts,
            role_id: selectedRole ? Number(selectedRole) : null,
        };

        if (editId) {
            router.put(route("packages.update", editId), payload);
        } else {
            router.post(route("packages.store"), payload);
        }
        resetForm();
    };

    const toggleProduct = (id) => {
        setSelectedProducts((prev) =>
            prev.includes(id)
                ? prev.filter((pid) => pid !== id)
                : [...prev, id]
        );
    };

    const editPackage = (pkg) => {
        setEditId(pkg.id);
        setName(pkg.name);
        setPrice(pkg.price);
        setDescription(pkg.description || "");
        setSelectedRole(pkg.role_id ? String(pkg.role_id) : "");
        setSelectedProducts(pkg.products ? pkg.products.map((p) => p.id) : []);
        setShowForm(true);
    };

    const deleteAllPackages = () => {
        if (selectedIds.length === 0) {
            alert("Please select at least one product to delete.");
            return;
        }

        if (confirm("⚠️ Are you sure you want to delete selected products?")) {
            router.delete(route("packages.destroyAll"), {
                data: { package_ids: selectedIds },
                onSuccess: () => {
                    setSelectedIds([]); // clear after delete
                },
            });
        }
    };

    const goToPage = (url) => {
        if (url) router.get(url);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Packages" />

            <div className="py-10 min-h-screen bg-slate-100">
                <div className="max-w-6xl mx-auto space-y-8 px-6">
                    {/* Header */}
                        <h2 className="text-5xl font-semibold text-gray-800">
                            Manage Packages
                        </h2>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div className="bg-white border rounded-lg p-4 shadow-sm flex flex-col justify-between h-full">
                                      <h3 className="text-lg font-semibold text-gray-700 mb-3">📥 Manage Package</h3>
                                      <p className="text-sm text-gray-600 mb-4">Create & Delete Package in your list.</p>
                                      <PrimaryButton onClick={() => setShowForm(true)} className="bg-green-600 hover:bg-green-700 mb-2 self-start">
                                        + Add Package
                                      </PrimaryButton>
                                         <PrimaryButton  onClick={deleteAllPackages} className="bg-blue-600 hover:bg-blue-700 self-start">
                                        Delete Selected
                                      </PrimaryButton>
                                    </div>
                                    <div className="bg-white border rounded-lg p-4 shadow-sm">
                                        <h3 className="text-lg font-semibold text-gray-700 mb-3">📤 Export Products</h3>
                                        <Select/>
                                        <a
                                        className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 transition mt-4 inline-block"
                                        >
                                        Export
                                        </a>
                                    </div>
                                </div>

                    {/* Table (Desktop) */}
                    <div className="hidden md:block overflow-x-auto bg-white rounded-lg shadow-sm">
                        <h4 className="text-lg font-bold text-indigo-950 p-4">
                            Packages List
                        </h4>
                        <table className="min-w-full border border-gray-300 bg-white shadow-sm">
                            <thead>
                                <tr className="bg-gray-100">
                                     <th className="px-4 py-3 border text-center">
                                            <input
                                                type="checkbox"
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedIds(packages.data.map(m => m.id));
                                                    } else {
                                                        setSelectedIds([]);
                                                }
                                            }}
                                        />
                                    </th>
                                    <th className="px-4 py-2 border">#</th>
                                    <th className="px-4 py-2 border">Name</th>
                                    <th className="px-4 py-2 border">Price</th>
                                    <th className="px-4 py-2 border">Description</th>
                                    <th className="px-4 py-2 border">Products</th>
                                    <th className="px-4 py-2 border">Role</th>
                                    <th className="px-4 py-2 border text-center">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {packages.data.length > 0 ? (
                                    packages.data.map((pkg, index) => (
                                        <tr
                                            key={pkg.id}
                                            className={
                                                index % 2 === 0
                                                    ? "bg-white hover:bg-gray-50"
                                                    : "bg-gray-50 hover:bg-gray-100"
                                            }
                                        >
                                             <td className="px-4 py-2 border text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIds.includes(pkg.id)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setSelectedIds([...selectedIds, pkg.id]);
                                                            } else {
                                                                setSelectedIds(selectedIds.filter(id => id !== pkg.id));
                                                            }
                                                        }}
                                                    />
                                                </td>
                                            <td className="px-4 py-2 border">
                                                {index + 1}
                                            </td>
                                            <td className="px-4 py-2 border font-medium">
                                                {pkg.name}
                                            </td>
                                            <td className="px-4 py-2 border">
                                                ${pkg.price}
                                            </td>
                                            <td className="px-4 py-2 border text-gray-600">
                                                {pkg.description}
                                            </td>
                                            <td className="px-4 py-2 border text-gray-600">
                                                {pkg.products?.length > 0
                                                    ? pkg.products
                                                          .map((p) => p.name)
                                                          .join(", ")
                                                    : "—"}
                                            </td>
                                            <td className="px-4 py-2 border">
                                                {pkg.role ? pkg.role.name : "—"}
                                            </td>
                                            <td className="px-4 py-2 border text-center space-x-2">
                                                <UpdateButton
                                                    onClick={() =>
                                                        editPackage(pkg)
                                                    }
                                                >
                                                    Edit
                                                </UpdateButton>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="7"
                                            className="text-center py-4 text-gray-500 border"
                                        >
                                            No packages found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Card Layout (Mobile) */}
                    <div className="md:hidden">
                        <div className="grid grid-cols-1 gap-4">
                            {packages.data.length > 0 ? (
                                packages.data.map((pkg, index) => (
                                    <div
                                        key={pkg.id}
                                        className={`rounded-lg shadow-sm p-4 border ${
                                            index % 2 === 0
                                                ? "bg-white"
                                                : "bg-gray-50"
                                        }`}
                                    >
                                        <div className="flex justify-between items-center mb-2">
                                            <h4 className="text-lg font-semibold text-indigo-900">
                                                {pkg.name}
                                            </h4>
                                            <span className="text-sm text-gray-500">
                                                #{index + 1}
                                            </span>
                                        </div>
                                        <p className="text-gray-700">
                                            <strong>💲 Price:</strong> $
                                            {pkg.price}
                                        </p>
                                        <p className="text-gray-700">
                                            <strong>📝 Description:</strong>{" "}
                                            {pkg.description}
                                        </p>
                                        <p className="text-gray-700">
                                            <strong>📦 Products:</strong>{" "}
                                            {pkg.products?.length > 0
                                                ? pkg.products
                                                      .map((p) => p.name)
                                                      .join(", ")
                                                : "—"}
                                        </p>
                                        <p className="text-gray-700">
                                            <strong>👤 Role:</strong>{" "}
                                            {pkg.role ? pkg.role.name : "—"}
                                        </p>
                                        <div className="flex gap-2 mt-4">
                                            <UpdateButton
                                                onClick={() => editPackage(pkg)}
                                                className="flex-1"
                                            >
                                                Edit
                                            </UpdateButton>
                                            <DeleteButton
                                                onClick={() =>
                                                    deletePackage(pkg.id)
                                                }
                                                className="flex-1"
                                            >
                                                Delete
                                            </DeleteButton>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-600">
                                    No packages found
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Pagination */}
                    <div className="mt-4 flex justify-center space-x-2">
                        {packages.links.map((link, idx) => (
                            <button
                                key={idx}
                                onClick={() => goToPage(link.url)}
                                className={`px-3 py-1 border rounded ${
                                    link.active
                                        ? "bg-blue-500 text-white"
                                        : "bg-gray-200"
                                }`}
                                disabled={!link.url}
                                dangerouslySetInnerHTML={{
                                    __html: link.label,
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Modal Form */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6">
                        <h3 className="text-xl font-bold mb-4">
                            {editId ? "Edit Package" : "Add Package"}
                        </h3>
                        <form onSubmit={submitPackage} className="space-y-4">
                            <input
                                type="text"
                                placeholder="Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="border p-2 rounded w-full"
                                required
                            />
                            <input
                                type="number"
                                placeholder="Price"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className="border p-2 rounded w-full"
                                required
                            />
                            <textarea
                                placeholder="Description"
                                value={description}
                                onChange={(e) =>
                                    setDescription(e.target.value)
                                }
                                className="border p-2 w-full rounded"
                            />

                            {/* Products */}
                            <div>
                                <label className="font-semibold">
                                    Select Products:
                                </label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {products.map((product) => (
                                        <label
                                            key={product.id}
                                            className="border px-3 py-1 rounded cursor-pointer flex items-center gap-1"
                                        >
                                            <input
                                                type="checkbox"
                                                value={product.id}
                                                checked={selectedProducts.includes(
                                                    product.id
                                                )}
                                                onChange={() =>
                                                    toggleProduct(product.id)
                                                }
                                            />
                                            {product.name}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Role */}
                            <div>
                                <label className="font-semibold">
                                    Assign Role:
                                </label>
                                <select
                                    value={selectedRole}
                                    onChange={(e) =>
                                        setSelectedRole(e.target.value)
                                    }
                                    className="border p-2 rounded w-full mt-1"
                                    required
                                >
                                    <option value="">Select Role</option>
                                    {roles.map((role) => (
                                        <option
                                            key={role.id}
                                            value={role.id}
                                        >
                                            {role.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    {editId ? "Update" : "Create"}
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
