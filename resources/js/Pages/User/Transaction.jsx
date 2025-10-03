import { useState, useMemo} from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DangerButton from '@/Components/DangerButton';
import { Head, router, usePage } from '@inertiajs/react';

export default function Transaction() {
    const transactionProps = usePage().props.transaction || { data: [], current_page: 1, per_page: 10, last_page: 1 };
    const transaction = transactionProps.data || [];
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [search, setSearch] = useState('');
    
    const handleDelete = (id) => {
         if (!confirm('Are you sure you want to delete this Transaction?')) return;
 
         router.delete(route('transaction.destroy',  id), {
             onSuccess: () => {
                 router.reload();
                 alert('Transaction deleted successfully.')
             }
         });
     };
 
     return (
         <AuthenticatedLayout>
             <Head title="Transaction" />
                <div className="py-10 min-h-screen bg-slate-100">
                    <div className="max-w-6xl mx-auto space-y-10 px-6">
                            {/* Title & Description */}
                            <h2 className="text-5xl font-semibold text-gray-800">🧾 Transaction History</h2>

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
                                            className="border border-gray-300 rounded-md px-4 py-2 shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="border border-gray-300 rounded-md px-4 py-2 shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                                        />
                                    </div>
                                    <div className="pt-1">
                                        <a
                                            href={route('export.transactions.csv', { from: startDate, to: endDate })}
                                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                                        >
                                            Export CSV
                                        </a>
                                    </div>
                                </div>
                            </div>
                             {/* Search Panel */}
                             <div>
                             <input
                                    type="text"
                                    placeholder="Customer name, invoice #, or date"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                     onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                        router.get(route('user.transactions'), { search }, { preserveState: true, replace: true });
                                        }
                                    }}
                                    className="w-full border border-gray-300 rounded-md px-4 py-2 shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                                />
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto rounded-lg border shadow-sm mb-6">
                            <table className="min-w-full border border-gray-300 rounded-lg shadow-sm border">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="border px-4 py-2">#</th>
                                        <th className="border px-4 py-2">Invoice #</th>
                                        <th className="border px-4 py-2">Order ID</th>
                                        <th className="border px-4 py-2">Total Amount</th>
                                        <th className="border px-4 py-2">Payment Method</th>
                                        <th className="border px-4 py-2">Reference #</th>
                                        <th className="border px-4 py-2">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                     {transaction.length > 0 ? (
                                        transaction
                                            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                                            .map((txn, index) => (
                                                <tr key={txn.id}>
                                                <td className="border px-4 py-2">
                                                     {index + 1 + ((transactionProps.current_page - 1) * transactionProps.per_page)}
                                                </td>
                                                <td className="border px-4 py-2">{txn.invoice_number}</td>
                                                <td className="border px-4 py-2">{txn.order_id}</td>
                                                <td className="border px-4 py-2">₱{Number(txn.amount).toFixed(2)}</td>
                                                   <td className="border px-4 py-2 capitalize">{txn.payment_method}</td>
                                                <td className="border px-4 py-2">{txn.reference_number || 'cash payment'}</td>
                                                 <td className="border px-4 py-2">{txn.created_at}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="8" className="text-center px-4 py-2 border">
                                                No transactions found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table> 
                        </div>
                     </div>
                 </div>
         </AuthenticatedLayout>
     );
 }

