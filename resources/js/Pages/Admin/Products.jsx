import { Head, router } from "@inertiajs/react";
import { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import DeleteButton from "@/Components/DeleteButton";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import UpdateButton from "@/Components/UpdateButton";
import { Select } from "@headlessui/react";

export default function Products({ products = { data: [], links: [] } }) {
    const [showForm, setShowForm] = useState(false);
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [description, setDescription] = useState("");
    const [editId, setEditId] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);

    const resetForm = () => {
        setName("");
        setPrice("");
        setDescription("");
        setEditId(null);
        setShowForm(false);
    };

    const submitProduct = (e) => {
        e.preventDefault();
        const payload = { name, price, description };
        if (editId) {
            router.put(route("products.update", editId), payload);
        } else {
            router.post(route("products.store"), payload);
        }
        resetForm();
    };

    const editProduct = (product) => {
        setEditId(product.id);
        setName(product.name);
        setPrice(product.price);
        setDescription(product.description);
        setShowForm(true);
    };

    const deleteAllProducts = () => {
        if (selectedIds.length === 0) {
            alert("Please select at least one product to delete.");
            return;
        }

        if (confirm("⚠️ Are you sure you want to delete selected products?")) {
            router.delete(route("products.destroyAll"), {
                data: { product_ids: selectedIds },
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
            <Head title="Products" />
                <div className="py-10 min-h-screen bg-slate-100">
                    <div className="max-w-6xl mx-auto space-y-8 px-6">
                        <h2 className="text-5xl font-semibold text-gray-800">
                            Products
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="bg-white border rounded-lg p-4 shadow-sm flex flex-col justify-between h-full">
                                <h3 className="text-lg font-semibold text-gray-700 mb-3">📥 Manage Products</h3>
                                <p className="text-sm text-gray-600 mb-4">Create & Delete Products in your list.</p>
                                <PrimaryButton onClick={() => setShowForm(true)} className="bg-green-600 hover:bg-green-700 mb-2 self-start">
                                    + Add Package
                                </PrimaryButton>
                                <PrimaryButton  onClick={deleteAllProducts} className="bg-blue-600 hover:bg-blue-700 self-start">
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
                            Product List
                        </h4>
                        <table className="min-w-full border border-gray-300 bg-white rounded-lg shadow-sm">
                            <thead>
                                {/* Column Headers */}
                                <tr className="bg-gray-100">
                                    <th className="px-4 py-3 border text-center">
                                            <input
                                                type="checkbox"
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedIds(products.data.map(m => m.id));
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
                                    <th className="px-4 py-2 border text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.data.length > 0 ? (
                                    products.data.map((product, i) => (
                                        <tr
                                            key={product.id}
                                            className={i % 2 === 0 ? "bg-white hover:bg-gray-50" : "bg-gray-50 hover:bg-gray-100"}
                                        >
                                             <td className="px-4 py-2 border text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIds.includes(product.id)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setSelectedIds([...selectedIds, product.id]);
                                                            } else {
                                                                setSelectedIds(selectedIds.filter(id => id !== products.id));
                                                            }
                                                        }}
                                                    />
                                                </td>
                                            <td className="px-4 py-2 border">{i + 1}</td>
                                            <td className="px-4 py-2 border font-medium">{product.name}</td>
                                            <td className="px-4 py-2 border">₱{product.price}</td>
                                            <td className="px-4 py-2 border text-gray-600">{product.description}</td>
                                            <td className="px-4 py-2 border text-center space-x-2">
                                                <UpdateButton onClick={() => editProduct(product)}/>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-4 text-gray-500 border">
                                            No products found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Card Layout (Mobile) */}
                    <div className="md:hidden">
                        <div className="grid grid-cols-1 gap-4">
                            {products.data.length > 0 ? (
                                products.data.map((product, i) => (
                                    <div
                                        key={product.id}
                                        className={`rounded-lg shadow-sm p-4 border ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                                    >
                                        <p><strong>#:</strong> {i + 1}</p>
                                        <p><strong>Name:</strong> {product.name}</p>
                                        <p><strong>Price:</strong> ₱{product.price}</p>
                                        <p><strong>Description:</strong> {product.description}</p>
                                        <div className="flex gap-2 mt-3">
                                            <UpdateButton onClick={() => editProduct(product)} className="flex-1" />
                                            <DeleteButton onClick={() => deleteProduct(product.id)} className="flex-1" />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-600">No products found</p>
                            )}
                        </div>
                    </div>

                    {/* Pagination */}
                    <div className="mt-4 flex justify-center space-x-2">
                        {products.links.map((link, idx) => (
                            <button
                                key={idx}
                                onClick={() => goToPage(link.url)}
                                className={`px-3 py-1 border rounded ${link.active ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                                disabled={!link.url}
                                dangerouslySetInnerHTML={{ __html: link.label }}
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
                            {editId ? "Edit Product" : "Add Product"}
                        </h3>
                        <form onSubmit={submitProduct} className="space-y-4">
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
                                onChange={(e) => setDescription(e.target.value)}
                                className="border p-2 w-full rounded"
                            />

                            <div className="flex gap-2">
                                <PrimaryButton type="submit">{editId ? "Update" : "Create"}</PrimaryButton>
                                <SecondaryButton type="button" onClick={resetForm}>Cancel</SecondaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
