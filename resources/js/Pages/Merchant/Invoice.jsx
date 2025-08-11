import React, { useState } from 'react';
import { Head, usePage, router } from '@inertiajs/react';

export default function Invoice() {
    const { transaction, sales, merchant } = usePage().props;

    const subtotal = Number(transaction.subtotal || 0);
    const discount = Number(transaction.discount || 0);
    const tax = Number(transaction.tax || 0);
    const total = Number(transaction.total || 0);
    const amountPaid = Number(transaction.amount_paid || 0);
    const change = Number(transaction.change || 0);

    const [isPrinting, setIsPrinting] = useState(false);
    const [printError, setPrintError] = useState(null);
    const handlePrint = () => {
  setIsPrinting(true);
  window.print();
  // window.print() is synchronous but may not guarantee print dialog finished,
  // so resetting immediately here:
  setIsPrinting(false);
};


    return (
        <div className="print-receipt mx-auto p-4 text-sm">
            <Head title="Invoice" />

            {/* Header */}
            <div className="text-center mb-4">
                <h1 className="text-xl font-bold">HERO STORE</h1>
                <h2 className="text-lg font-bold">{merchant.company_name ?? user.name}</h2>
                <p className="text-gray-600">{merchant.address}</p>
                <p className="text-gray-600">Official Receipt</p>
                <p className="text-xs">#{transaction.invoice_number}</p>
                <p>{new Date(transaction.created_at).toLocaleString()}</p>
            </div>

            <hr className="border-t border-dashed border-gray-400 mb-2" />

            {/* Customer + Payment Info */}
            <div className="mb-2">
                <p>Customer: {transaction.customer_name || 'N/A'}</p>
                <p>Payment: {transaction.payment_method}</p>
            </div>

            <hr className="border-t border-dashed border-gray-400 mb-2" />

            {/* Line Items */}
            <div>
                {sales.map((item) => (
                    <div key={item.id || item.product_id} className="mb-1">
                        <div className="flex justify-between font-medium">
                            <span>{item.product_name}</span>
                            <span>₱{Number(item.total).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>{item.quantity} x ₱{Number(item.price).toFixed(2)}</span>
                            <div className="text-right space-x-2">
                                {Number(item.discount) > 0 && (
                                    <span className="text-green-600">Disc: ₱{Number(item.discount).toFixed(2)}</span>
                                )}
                                <span>Tax: ₱{Number(item.tax).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <hr className="border-t border-dashed border-gray-400 my-2" />

            {/* Totals Section */}
            <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₱{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span>Total Discount</span>
                    <span className="text-green-600">-₱{discount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span>Total Tax</span>
                    <span>₱{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₱{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span>Amount Paid</span>
                    <span>₱{amountPaid.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                    <span>Change</span>
                    <span>₱{change.toFixed(2)}</span>
                </div>
            </div>

            <hr className="border-t border-dashed border-gray-400 my-2" />

            {/* Footer */}
            <div className="text-center text-xs mt-4">
                <p>Thank you for your purchase!</p>
                <p>Visit us again :)</p>
            </div>

            {/* Buttons (hidden when printing) */}
            <div className="mt-4 text-center print:hidden space-x-2">
                <button
                    type="button"
                    onClick={() => window.history.back()}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    disabled={isPrinting}
                >
                    Cancel
                </button>

                <button
                    type="button"
                    onClick={handlePrint}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    disabled={isPrinting}
                >
                    {isPrinting ? 'Printing...' : 'Print Receipt'}
                </button>
            </div>

            {printError && (
                <p className="text-center text-red-600 mt-2">{printError}</p>
            )}
        </div>
    );
}
