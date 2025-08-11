import React, { useEffect, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';
import axios from 'axios';

export default function HeldTransactionsModal({ open, onClose }) {
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        if (open) {
            axios.get('/held-transactions')
                .then(res => setTransactions(res.data.props.heldTransactions)) // because Inertia passes props
                .catch(err => console.error(err));
        }
    }, [open]);

    return (
        <Dialog open={open} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 z-10">
                    <div className="flex justify-between items-center mb-4">
                        <Dialog.Title className="text-lg font-semibold">Held Transactions</Dialog.Title>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="space-y-2">
                        {transactions.length === 0 ? (
                            <div className="text-center text-gray-500">No held transactions.</div>
                        ) : (
                            transactions.map((tx) => (
                                <div
                                    key={tx.id}
                                    className="border p-3 rounded hover:bg-gray-50 cursor-pointer"
                                >
                                    <div className="text-sm font-medium">
                                        ID: {tx.id}
                                    </div>
                                    <div className="text-xs text-gray-500">Subtotal: ₱{tx.subtotal}</div>
                                    <div className="text-xs text-gray-500">Held on: {new Date(tx.created_at).toLocaleString()}</div>
                                </div>
                            ))
                        )}
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
}
