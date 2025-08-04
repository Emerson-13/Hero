import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import TransactionEdit from './TransactionEdit'

export default function Transaction() {
   const { transaction = []} = usePage().props;
   
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
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Transaction List</h3>
                        </div>
                            {/* Table */}
                            <div className="overflow-x-auto">
                            <table className="min-w-full border border-gray-300">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="border px-4 py-2">#</th>
                                        <th className="border px-4 py-2">Customer Name</th>
                                        <th className="border px-4 py-2">Invoice #</th>
                                        <th className="border px-4 py-2">Payment Method</th>
                                        <th className="border px-4 py-2">Amount Paid</th>
                                        <th className="border px-4 py-2">Total</th>
                                        <th className="border px-4 py-2">Reference #</th>
                                        <th className="border px-4 py-2">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transaction.length > 0 ? (
                                        transaction.map((txn, index) => (
                                            <tr key={txn.id}>
                                                <td className="border px-4 py-2">{index + 1}</td>
                                                <td className="border px-4 py-2">{txn.customer_name || '-'}</td>
                                                <td className="border px-4 py-2">{txn.invoice_number}</td>
                                                <td className="border px-4 py-2 capitalize">{txn.payment_method}</td>
                                                <td className="border px-4 py-2">₱{Number(txn.amount_paid).toFixed(2)}</td>
                                                <td className="border px-4 py-2">₱{Number(txn.total).toFixed(2)}</td>
                                                <td className="border px-4 py-2">{txn.reference_number || '-'}</td>
                                                <td className="border px-4 py-2 space-x-2">
                                                    <DangerButton onClick={() => handleDelete(txn.id)}>
                                                        Delete
                                                    </DangerButton>
                                                </td>
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
 
