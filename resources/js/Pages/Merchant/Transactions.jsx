import { useState, useMemo} from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DangerButton from '@/Components/DangerButton';
import { Head, router, usePage } from '@inertiajs/react';

export default function Transaction() {
   const { transaction = []} = usePage().props;
   const [startDate, setStartDate] = useState('');
const [endDate, setEndDate] = useState('');

     const [search, setSearch] = useState('');

   const filteredtransaction = useMemo(() => {
    return transaction.filter((txn) => {
        const invoice = txn?.invoice_number?.toLowerCase() ?? '';
       const customer = txn?.customer_name?.toLowerCase() ?? '';
        const date = txn.created_at?.toLowerCase() ?? '';
        const query = search.toLowerCase();

        return invoice.includes(query) || customer.includes(query) || date.includes(query);
    });
    }, [search, transaction]);     
    
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
         <AuthenticatedLayout
             header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Transaction</h2>}
         >
             <Head title="Transaction" />
                <div className="py-12">
                    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                        <div className="bg-white p-6 shadow-sm sm:rounded-lg">
                            {/* Title & Description */}
                            <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">🧾 Transaction History</h2>
                            <p className="text-center text-gray-600 mb-6">
                                    View and manage all recorded customer transactions. You can filter by date or search using invoice numbers or names.
                            </p>

                            {/* Search Panel */}
                            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">🔍 Search Transactions</h3>
                                <input
                                    type="text"
                                    placeholder="Customer name, invoice #, or date"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-4 py-2 shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
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


                            {/* Table */}
                            <div className="overflow-x-auto rounded-lg border shadow-sm mb-6">
                            <table className="min-w-full border border-gray-300 rounded-lg shadow-sm border">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="border px-4 py-2">#</th>
                                        <th className="border px-4 py-2">Customer Name</th>
                                        <th className="border px-4 py-2">Invoice #</th>
                                        <th className="border px-4 py-2">Amount Paid</th>
                                        <th className="border px-4 py-2">Total</th>
                                        <th className="border px-4 py-2">Change</th>
                                        <th className="border px-4 py-2">Payment Method</th>
                                        <th className="border px-4 py-2">Reference #</th>
                                        <th className="border px-4 py-2">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                     {filteredtransaction.length > 0 ? (
                                        [...filteredtransaction]
                                            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                                            .map((txn, index) => (
                                                <tr key={txn.id}>
                                                <td className="border px-4 py-2">{index + 1}</td>
                                                <td className="border px-4 py-2">{txn.customer_name || '-'}</td>
                                                <td className="border px-4 py-2">{txn.invoice_number}</td>
                                               
                                                <td className="border px-4 py-2">₱{Number(txn.amount_paid).toFixed(2)}</td>
                                                <td className="border px-4 py-2">₱{Number(txn.total).toFixed(2)}</td>
                                               
                                                  <td className="border px-4 py-2">{txn.change}</td>
                                                   <td className="border px-4 py-2 capitalize">{txn.payment_method}</td>
                                                <td className="border px-4 py-2">{txn.reference_number || '-'}</td>
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
             </div>
            
         </AuthenticatedLayout>
     );
 }
 
