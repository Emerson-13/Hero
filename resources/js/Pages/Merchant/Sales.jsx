import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, router } from '@inertiajs/react';
import DangerButton from '@/Components/DangerButton';
import { useState, useMemo } from 'react';

export default function Sales() {
    const { sales = [] } = usePage().props;
    const [startDate, setStartDate] = useState('');
const [endDate, setEndDate] = useState('');

    const [search, setSearch] = useState('');

    const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
        const invoice = sale.transaction?.invoice_number?.toLowerCase() ?? '';
        const product = sale.product_name?.toLowerCase() ?? '';
        const date = sale.created_at?.toLowerCase() ?? '';
        const query = search.toLowerCase();

        return invoice.includes(query) || product.includes(query) || date.includes(query);
    });
    }, [search, sales]);

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Sales</h2>}
        >
            <Head title="Sales" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                   <div className="bg-white p-6 shadow-sm sm:rounded-lg">
                        {/* Header Panel */}
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">💰 Sales Records</h2>
                            <p className="text-center text-gray-500 mb-6">
                                Search sales by invoice number, product name, or date. You can also export filtered sales to Excel.
                            </p>

                          {/* Search Panel */}
                            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">🔍 Search Sales</h3>
                                        <input
                                            type="text"
                                            placeholder="Invoice, product name or date"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        />
                            </div>

                           {/* Export Panel */}
                            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">📤 Export Transactions to CSV</h3>
                            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
   
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="border border-gray-300 rounded-md px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="border border-gray-300 rounded-md px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        />
                                    </div>
                                    <div>
                                        <a
                                            href={route('export.sales.csv', { from: startDate, to: endDate })}
                                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                                            >
                                            Export CSV
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto rounded-lg shadow-sm border">
                            <table className="min-w-full border border-gray-300">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="border px-4 py-2">#</th>
                                        <th className="border px-4 py-2">Invoice #</th>
                                        <th className="border px-4 py-2">Product Name</th>
                                        <th className="border px-4 py-2">Quantity</th>
                                        <th className="border px-4 py-2">Price</th>
                                        <th className="border px-4 py-2">Discount</th>
                                        <th className="border px-4 py-2">Tax</th>
                                        <th className="border px-4 py-2">Total</th>
                                        <th className="border px-4 py-2">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                     {filteredSales.length > 0 ? (
                                        [...filteredSales]
                                            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                                            .map((sale, index) => (
                                                <tr key={sale.id}>
                                                <td className="border px-4 py-2">{index + 1}</td>
                                                <td className="border px-4 py-2">{sale.transaction?.invoice_number ?? 'N/A'}</td>
                                                <td className="border px-4 py-2">{sale.product_name}</td>
                                                <td className="border px-4 py-2">{sale.quantity}</td>
                                                <td className="border px-4 py-2">₱{Number(sale.price).toFixed(2)}</td>
                                                <td className="border px-4 py-2 font-semibold text-green-700">₱{Number(sale.discount).toFixed(2)}</td>
                                                <td className="border px-4 py-2 font-semibold text-red-700">₱{Number(sale.tax).toFixed(2)}</td>
                                                <td className="border px-4 py-2 font-semibold">₱{Number(sale.total).toFixed(2)}</td>
                                                <td className="border px-4 py-2">{sale.created_at}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="9" className="text-center px-4 py-2 border">
                                                 No sales match your search.
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
