import { useState, useMemo  } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';



export default function Products() {
    const { products = [],  categories = []} = usePage().props;
    console.log('Categories:', categories);
    const [search, setSearch] = useState('');
    
       const filteredProduct = useMemo(() => {
        return products.filter((product) => {
            const Product = products?.name?.toLowerCase() ?? '';
            const Description = product?.description?.toLowerCase() ?? '';
            const Price = product?.price?.toLowerCase() ?? '';
            const query = search.toLowerCase();
    
            return Product.includes(query) || Description.includes(query) || Price.includes(query);
        });
        }, [search, products]);     

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Products</h2>}
        >
            <Head title="Products" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-white p-6 shadow-sm sm:rounded-lg">
                         <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">📦 Product List</h2>
                            <p className="text-center text-gray-600 mb-6">
                                Manage and organize product categories in your system.
                            </p>
                              {/* Search Panel */}
                            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">🔍 Search Products</h3>
                                <input
                                    type="text"
                                    placeholder="Customer name, invoice #, or date"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-4 py-2 shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                                />
                            </div>
                          
                            {/* Table */}
                            <div className="overflow-x-auto shadow-sm sm:rounded-lg">
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
                                        {filteredProduct.length > 0 ? (
                                           [...filteredProduct]
                                            .map((product, index) => (
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
