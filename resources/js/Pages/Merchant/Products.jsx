import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import ProductEdit from './ProductEdit'

export default function Products() {
    const { products = [],  categories = []} = usePage().props;
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        description: '',
        price: '',
        stock: '',
        category_id: '',
    });
    console.log('Categories:', categories);


    const submit = (e) => {
        e.preventDefault();

        post(route('products.store'), {
            onSuccess: () => {
                reset();
                setShowModal(false);
                router.reload();
                alert('Product created successfully!');
            },
            onError: () => {
                console.log(errors);
            },
        });
    };

    const handleDelete = (id) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        router.delete(route('products.destroy', id), {
            onSuccess: () => {
                router.reload();
                alert('Product deleted successfully.')
            }
        });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Products</h2>}
        >
            <Head title="Products" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-white p-6 shadow-sm sm:rounded-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font0-semibold">Product List</h3>
                            <PrimaryButton onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700">
                                + Add Product
                            </PrimaryButton>
                        </div>

                        {/* Modal */}
                        {showModal && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                <div className="bg-white p-6 rounded shadow-lg w-full max-w-xl relative">
                                    <h2 className="text-lg font-semibold mb-4">Add Product</h2>
                                    <form onSubmit={submit} className="space-y-4">
                                        <div className="mt-4">
                                            <InputLabel htmlFor="name" value="Name" />
                                                <TextInput
                                                    id="name"
                                                    name="name"
                                                    value={data.name}
                                                    className="mt-1 block w-full"
                                                    onChange={(e) => setData('name', e.target.value)}
                                                    required
                                                />
                                            <InputError message={errors.name} className="mt-2" />
                                        </div>
                                        
                                        <div className="mt-4">
                                            <InputLabel htmlFor="description" value="Description" />
                                                <TextInput
                                                    id="description"
                                                    type="text"
                                                    name="description"
                                                    value={data.description}
                                                    className="mt-1 block w-full"
                                                    onChange={(e) => setData('description', e.target.value)}
                                                    required
                                                />
                                            <InputError message={errors.description} className="mt-2" />
                                        </div>
                                        
                                        <div className="mt-4">
                                            <InputLabel htmlFor="stock" value="Stock" />
                                                <TextInput
                                                    id="stock"
                                                    type="number"
                                                    name="stock"
                                                    value={data.stock}
                                                    className="mt-1 block w-full"
                                                    autoComplete="stock"
                                                    onChange={(e) => setData('stock', e.target.value)}
                                                />
                                            <InputError message={errors.stock} className="mt-2" />
                                        </div>
                                        
                                        <div className="mt-4">
                                            <InputLabel htmlFor="price" value="Price" />
                                                <TextInput
                                                    id="price"
                                                    type="number"
                                                    name="price"
                                                    value={data.price}
                                                    className="mt-1 block w-full"
                                                    autoComplete="price"
                                                    onChange={(e) => setData('price', e.target.value)}
                                                />
                                            <InputError message={errors.price} className="mt-2" />
                                        </div>

                                        <div className="mt-4">
                                            <InputLabel htmlFor="category_id" value="Category" />
                                            <select
                                                id="category_id"
                                                name="category_id"
                                                value={data.category_id}
                                                onChange={(e) => setData('category_id', e.target.value)}
                                                className="mt-1 block w-full border rounded p-2"
                                                required
                                            >
                                                <option value="">-- Select Category --</option>
                                                {categories.map((category) => (
                                                    <option key={category.id} value={category.id}>
                                                        {category.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <InputError message={errors.category_id} className="mt-2" />
                                        </div>

                                        <div className="flex justify-end space-x-2 mt-4">
                                            <button
                                                type="button"
                                                onClick={() => setShowModal(false)}
                                                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                            >
                                                Save Product
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full border border-gray-300">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="border px-4 py-2">#</th>
                                        <th className="border px-4 py-2">Category Name</th>
                                        <th className="border px-4 py-2">Name</th>
                                        <th className="border px-4 py-2">description</th>
                                        <th className="border px-4 py-2">Price</th>
                                        <th className="border px-4 py-2">stock</th>
                                        <th className="border px-4 py-2">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.length > 0 ? (
                                        products.map((product, index) => (
                                            <tr key={product.id}>
                                                <td className="border px-4 py-2">{index + 1}</td>
                                                <td className="border px-4 py-2">{product.category?.name || 'Uncategorized'}</td>
                                                <td className="border px-4 py-2">{product.name}</td>
                                                <td className="border px-4 py-2">{product.description}</td>
                                                <td className="border px-4 py-2">₱{Number(product.price).toFixed(2)}</td>
                                                <td className="border px-4 py-2">{Number(product.stock).toFixed(2)}</td>
                                                <td className="border px-4 py-2 space-x-2">
                                                    <PrimaryButton
                                                        //onClick={() =>
                                                            //router.visit(route('products.edit', product.id))
                                                      onClick={() => {
                                                        setEditingProduct(product);
                                                        setShowEditModal(true);
                                                    }}
                                                >
                                                    Update
                                                    </PrimaryButton>
                                                    <DangerButton onClick={() => handleDelete(product.id)}>
                                                        Delete
                                                    </DangerButton>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="text-center px-4 py-2 border">
                                                No products found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
              {/* Edit Modal */}
            {showEditModal && editingProduct && (
                <ProductEdit
                    product={editingProduct}
                    categories={categories}
                    onClose={() => {
                        setEditingProduct(null);
                        setShowEditModal(false);
                    }}
                    onUpdated={() => router.reload()}
                />
            )}
        </AuthenticatedLayout>
    );
}
