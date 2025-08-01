import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton';
import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function Products() {
  const { products = [] } = usePage().props;


    const handleDelete = (id) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        router.delete(route('products.destroy', id), {
            onSuccess: () => console.log('Product deleted.'),
            fetchProduct
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
                            <h3 className="text-lg font-semibold">Product List</h3>
                            <PrimaryButton onClick={() => router.visit(route('products.store'))}>
                                + Add Product
                            </PrimaryButton>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full border border-gray-300">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="border px-4 py-2">#</th>
                                        <th className="border px-4 py-2">Name</th>
                                        <th className="border px-4 py-2">Price</th>
                                        <th className="border px-4 py-2">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.length > 0 ? (
                                        products.map((product, index) => (
                                            <tr key={product.id}>
                                                <td className="border px-4 py-2">{index + 1}</td>
                                                <td className="border px-4 py-2">{product.name}</td>
                                                <td className="border px-4 py-2">₱{product.price.toFixed(2)}</td>
                                                <td className="border px-4 py-2 space-x-2">
                                                    <PrimaryButton
                                                        onClick={() =>
                                                            router.visit(route('products.update', product.id))
                                                        }
                                                    >
                                                        Edit
                                                    </PrimaryButton>
                                                    <DangerButton onClick={() => handleDelete(product.id)}>
                                                        Delete
                                                    </DangerButton>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td className="border px-4 py-2 text-center" colSpan="4">
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
        </AuthenticatedLayout>
    );
}
