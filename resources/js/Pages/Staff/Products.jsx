import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';


export default function Products() {
    const { products = []} = usePage().props;

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Products</h2>}
        >
            <Head title="Products" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-white p-6 shadow-sm sm:rounded-lg">
                         <h3 className="text-lg font-bold mb-4">Product List</h3>
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
        </AuthenticatedLayout>
    );
}
