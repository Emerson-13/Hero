import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, router } from '@inertiajs/react';
import DangerButton from '@/Components/DangerButton';

export default function Sales() {
    const { sales = [] } = usePage().props;

    const handleDelete = (id) => {
        if (!confirm('Are you sure you want to delete this sale record?')) return;

        router.delete(route('sales.destroy', id), {
            onSuccess: () => {
                router.reload();
                alert('Sale deleted successfully.');
            }
        });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Sales</h2>}
        >
            <Head title="Sales" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-white p-6 shadow-sm sm:rounded-lg">
                        <h3 className="text-lg font-semibold mb-4">Sales List</h3>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full border border-gray-300">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="border px-4 py-2">#</th>
                                        <th className="border px-4 py-2">Transaction ID</th>
                                        <th className="border px-4 py-2">Product Name</th>
                                        <th className="border px-4 py-2">Quantity</th>
                                        <th className="border px-4 py-2">Price</th>
                                        <th className="border px-4 py-2">Discount</th>
                                        <th className="border px-4 py-2">Tax</th>
                                        <th className="border px-4 py-2">Total</th>
                                        <th className="border px-4 py-2">Date</th>
                                        <th className="border px-4 py-2">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                     {sales.length > 0 ? (
                                        [...sales]
                                            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) // Sort by newest first
                                            .map((sale, index) => (
                                                <tr key={sale.id}>
                                                <td className="border px-4 py-2">{index + 1}</td>
                                                <td className="border px-4 py-2">{sale.transaction_id}</td>
                                                <td className="border px-4 py-2">{sale.product_name}</td>
                                                <td className="border px-4 py-2">{sale.quantity}</td>
                                                <td className="border px-4 py-2">₱{Number(sale.price).toFixed(2)}</td>
                                                <td className="border px-4 py-2">₱{Number(sale.discount).toFixed(2)}</td>
                                                <td className="border px-4 py-2">₱{Number(sale.tax).toFixed(2)}</td>
                                                <td className="border px-4 py-2 font-semibold text-green-700">₱{Number(sale.total).toFixed(2)}</td>
                                                <td className="border px-4 py-2">{sale.created_at}</td>
                                                <td className="border px-4 py-2">
                                                    <DangerButton onClick={() => handleDelete(sale.id)}>
                                                        Delete
                                                    </DangerButton>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="9" className="text-center px-4 py-2 border">
                                                No sales found.
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
