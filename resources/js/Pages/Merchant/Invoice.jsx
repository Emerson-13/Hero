import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';

export default function Invoice() {
    const { transaction, sales } = usePage().props;

    const totalTax = sales.reduce((acc, item) => acc + Number(item.tax), 0);
    const totalDiscount = sales.reduce((acc, item) => acc + Number(item.discount), 0);

    return (
        
           <div className="print-receipt mx-auto p-4">
                <div className="text-center mb-4">
                    <h1 className="text-xl font-bold">HERO STORE</h1>
                    <p className="text-gray-600">Official Receipt</p>
                    <p className="text-xs">#{transaction.invoice_number}</p>
                    <p>{new Date(transaction.created_at).toLocaleString()}</p>
                </div>

                <hr className="border-t border-dashed border-gray-400 mb-2" />

                <div className="mb-2">
                    <p>Customer: {transaction.customer_name || 'N/A'}</p>
                    <p>Payment: {transaction.payment_method}</p>
                </div>

                <hr className="border-t border-dashed border-gray-400 mb-2" />

                <div>
                    {sales.map((item, idx) => (
                        <div key={idx} className="mb-1">
                            <div className="flex justify-between">
                                <span>{item.product_name}</span>
                                <span>₱{Number(item.total).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-500 text-xs">
                                <span>{item.quantity} x ₱{Number(item.price).toFixed(2)}</span>
                                <span>Tax: ₱{Number(item.tax).toFixed(2)}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <hr className="border-t border-dashed border-gray-400 my-2" />

                <div className="space-y-1">
                    <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>₱{Number(transaction.total).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Total Discount</span>
                        <span>₱{totalDiscount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Total Tax</span>
                        <span>₱{totalTax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                        <span>Amount Paid</span>
                        <span>₱{Number(transaction.amount_paid).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                        <span>Change</span>
                        <span>₱{Number(transaction.amount_paid - transaction.total).toFixed(2)}</span>
                    </div>
                </div>

                <hr className="border-t border-dashed border-gray-400 my-2" />

                <div className="text-center text-xs mt-4">
                    <p>Thank you for your purchase!</p>
                    <p>Visit us again :)</p>
                </div>

                <div className="mt-4 text-center print:hidden">
                    <button
                        onClick={() => window.history.back()}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                        Cancel
                    </button>
                    
                    <button
                        onClick={() => window.print()}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Print Receipt
                    </button>
                </div>
            </div>
    );
}
