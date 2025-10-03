import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import UpdateButton from '@/Components/UpdateButton';
import DeleteButton from '@/Components/DeleteButton';
import { Head, useForm, router, usePage } from '@inertiajs/react';

export default function Categories() {
    const categoriesProps = usePage().props.categories || { data: [], current_page: 1, per_page: 10, last_page: 1 };
    const categories = categoriesProps.data;

    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [search, setSearch] = useState(usePage().props.search || '');

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        description: ''
    });

    // Open modal for Add
    const openAddModal = () => {
        reset();
        setEditingCategory(null);
        setShowModal(true);
    };

    // Open modal for Edit
    const openEditModal = (category) => {
        setData({
            name: category.name || '',
            description: category.description || ''
        });
        setEditingCategory(category);
        setShowModal(true);
    };

    // Save (Add or Update)
    const submit = (e) => {
        e.preventDefault();

        if (editingCategory) {
            // Update
            put(route('categories.update', editingCategory.id), {
                onSuccess: () => {
                    reset();
                    setShowModal(false);
                    setEditingCategory(null);
                    router.reload();
                    alert('Category updated successfully!');
                }
            });
        } else {
            // Add
            post(route('categories.store'), {
                onSuccess: () => {
                    reset();
                    setShowModal(false);
                    router.reload();
                    alert('Category created successfully!');
                }
            });
        }
    };

    // Delete Category
    const handleDelete = (id) => {
        if (!confirm('Are you sure you want to delete this Category?')) return;

        router.delete(route('categories.destroy', id), {
            onSuccess: () => {
                router.reload();
                alert('Category deleted successfully.');
            }
        });
    };

    // Search
    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            router.get(route('user.categories'), { search }, { preserveState: true, replace: true });
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Category" />
              <div className="py-10 min-h-screen bg-slate-100">
                <div className="max-w-6xl mx-auto space-y-10 px-6">
                    <h2 className="text-5xl font-semibold text-gray-800">📁 Categories List</h2>
                    {/* Panels */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* Insert Category Panel */}
                        <div className="bg-white border rounded-lg p-4 shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-700 mb-3">📥 Insert Category Data</h3>
                            <p className="text-sm text-gray-600 mb-4">Add a new category with description.</p>
                            <PrimaryButton
                                onClick={openAddModal}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                + Add Category
                            </PrimaryButton>
                        </div>

                        {/* Export Panel */}
                        <div className="bg-white border rounded-lg p-4 shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-700 mb-3">📤 Export Category Data</h3>
                            <p className="text-sm text-gray-500 mb-4">Export categories as a CSV file.</p>
                            <a
                                href={route('export.categories.csv')}
                                className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 transition inline-block"
                            >
                                Export All Categories (CSV)
                            </a>
                        </div>
                    </div>

                    {/* Search */}
                    <div>
                        <input
                            type="text"
                            placeholder="Search category..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={handleSearch}
                            className="w-full border border-gray-300 rounded-md px-4 py-2 shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                        />
                    </div>
                    {/* Table */}
                    <div className="overflow-x-auto shadow-sm rounded-lg">
                        <table className="min-w-full border border-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="border px-4 py-2">#</th>
                                    <th className="border px-4 py-2">Name</th>
                                    <th className="border px-4 py-2">Description</th>
                                    <th className="border px-4 py-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.length > 0 ? (
                                    categories.map((category, index) => (
                                        <tr key={category.id} className="hover:bg-gray-50 transition">
                                            <td className="border px-4 py-2">
                                                {index + 1 + (categoriesProps.current_page - 1) * categoriesProps.per_page}
                                            </td>
                                            <td className="border px-4 py-2 font-medium text-gray-800">{category.name}</td>
                                            <td className="border px-4 py-2 text-gray-700">{category.description}</td>
                                            <td className="border px-4 py-2 space-x-2">
                                                <UpdateButton onClick={() => openEditModal(category)} />
                                                <DeleteButton onClick={() => handleDelete(category.id)} />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="text-center px-4 py-6 text-gray-500">
                                            No categories found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Pagination */}
            {categoriesProps.last_page > 1 && (
                <div className="flex justify-center mt-6 space-x-2">
                    {Array.from({ length: categoriesProps.last_page }, (_, i) => (
                        <button
                            key={i}
                            onClick={() =>
                                router.get(route('user.categories'), { page: i + 1, search }, { preserveState: true })
                            }
                            className={`px-3 py-1 rounded ${
                                categoriesProps.current_page === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'
                            }`}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg relative">
                        <h3 className="text-xl font-semibold mb-4 text-gray-800">
                            {editingCategory ? '✏️ Edit Category' : '➕ Add New Category'}
                        </h3>
                        <form onSubmit={submit} className="space-y-4">
                            <input
                                type="text"
                                placeholder="Category Name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-4 py-2 shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                            />
                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}

                            <textarea
                                placeholder="Description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-4 py-2 shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                            />
                            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}

                            <div className="flex justify-end space-x-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingCategory(null);
                                    }}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    {editingCategory ? 'Update Category' : 'Save Category'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
