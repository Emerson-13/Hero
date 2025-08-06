import { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import CategoryEdit from './CategoryEdit';

export default function Categories() {
    const { categories = [] } = usePage().props;
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        description: ''
    });
    const [search, setSearch] = useState('');
        
           const filteredCategory = useMemo(() => {
            return categories.filter((category) => {
                const Category = category?.name?.toLowerCase() ?? '';
                const Description = category?.description?.toLowerCase() ?? '';
                const query = search.toLowerCase();
        
                return Category.includes(query) || Description.includes(query);
            });
            }, [search, categories]);     
    

    const submit = (e) => {
        e.preventDefault();

        post(route('categories.store'), {
            onSuccess: () => {
                reset();
                setShowModal(false);
                router.reload();
                alert('Category created successfully!');
            },
            onError: () => {
                console.log(errors);
            },
        });
    };

    const handleDelete = (id) => {
        if (!confirm('Are you sure you want to delete this Category?')) return;

        router.delete(route('categories.destroy', id), {
            onSuccess: () => {
                router.reload();
                alert('Category deleted successfully.');
            }
        });
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">Category</h2>}>
            <Head title="Category" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-white p-6 shadow-sm rounded-lg">
                        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">📁 Categories List</h2>
                            <p className="text-center text-gray-600 mb-6">
                                Manage and organize products in your system.
                            </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    {/* Insert Category Panel */}
                                    <div className="bg-white border rounded-lg p-4 shadow-sm">
                                        <h3 className="text-lg font-semibold text-gray-700 mb-3">📥 Insert Category Data</h3>
                                            <p className="text-sm text-gray-600 mb-4">
                                                Add a new category with description.
                                            </p>
                                        <PrimaryButton
                                            onClick={() => setShowModal(true)}
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            + Add Category
                                        </PrimaryButton>
                                    </div>

                                    {/* Export Category Panel */}
                                    <div className="bg-white border rounded-lg p-4 shadow-sm">
                                        <h3 className="text-lg font-semibold text-gray-700 mb-3">📤 Export Category Data</h3>
                                         <p className="text-sm text-gray-500 mb-4">
                                                Export products as an Excel file.
                                            </p>
                                        <a
                                            href={route('export.categories.csv')}
                                            className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 transition inline-block"
                                        >
                                            Export All Categories (CSV)
                                        </a>
                                    </div>
                                </div>
                                {/* Search Panel */}
                            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">🔍 Search Category</h3>
                                <input
                                    type="text"
                                    placeholder="Customer name, invoice #, or date"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
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
                                    {filteredCategory.length > 0 ? (
                                        [...filteredCategory]
                                        .map((category, index) => (
                                            <tr key={category.id} className="hover:bg-gray-50 transition">
                                                <td className="border px-4 py-2">{index + 1}</td>
                                                <td className="border px-4 py-2 font-medium text-gray-800">{category.name}</td>
                                                <td className="border px-4 py-2 text-gray-700">{category.description}</td>
                                                <td className="border px-4 py-2 space-x-2">
                                                    <PrimaryButton
                                                        onClick={() => {
                                                            setEditingCategory(category);
                                                            setShowEditModal(true);
                                                        }}
                                                    >
                                                        Update
                                                    </PrimaryButton>
                                                    <DangerButton onClick={() => handleDelete(category.id)}>
                                                        Delete
                                                    </DangerButton>
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
            </div>

            {/* Add Category Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg relative">
                        <h3 className="text-xl font-semibold mb-4 text-gray-800">➕ Add New Category</h3>
                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <input
                                    type="text"
                                    placeholder="Category Name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-4 py-2 shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                                />
                                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                            </div>

                            <div>
                                <textarea
                                    placeholder="Description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-4 py-2 shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                                />
                                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                            </div>

                            <div className="flex justify-end space-x-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Save Category
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && editingCategory && (
                <CategoryEdit
                    category={editingCategory}
                    onClose={() => {
                        setEditingCategory(null);
                        setShowEditModal(false);
                    }}
                    onUpdated={() => router.reload()}
                />
            )}
        </AuthenticatedLayout>
    );
}
