import React, { useState, useEffect } from 'react';
import PrimaryButton from './PrimaryButton';

export default function HeldTransactionsButton({
    cart,
    customerName,
    paymentMethod,
    amountPaid,
    onRecall
}) {
    const [modalOpen, setModalOpen] = useState(false);
    const [heldTransactions, setHeldTransactions] = useState([]);

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('heldTransactions') || '[]');
        setHeldTransactions(stored);
    }, [modalOpen]);

    const handleHold = () => {
        if (!cart.length) return alert('Cart is empty. Cannot hold.');

        const stored = JSON.parse(localStorage.getItem('heldTransactions') || '[]');

        const newHeld = [
            ...stored,
            {
                id: Date.now(),
                cart,
                customerName: customerName || '',
                paymentMethod: paymentMethod || 'cash',
                amountPaid: amountPaid || 0
            }
        ];

        localStorage.setItem('heldTransactions', JSON.stringify(newHeld));
        alert('✅ Transaction held!');
    };

    const handleRecall = (held) => {
        onRecall({
            cart: held.cart,
            customerName: held.customerName || '',
            paymentMethod: held.paymentMethod || 'cash',
            amountPaid: held.amountPaid || 0
        });
        setModalOpen(false);
    };

    const handleDelete = (id) => {
        const updated = heldTransactions.filter(h => h.id !== id);
        localStorage.setItem('heldTransactions', JSON.stringify(updated));
        setHeldTransactions(updated);
    };

    return (
        <>
            <PrimaryButton
                className="test-center  bg-yellow-500 hover:bg-yellow-600"
                onClick={() => {
                    if (cart.length) {
                        handleHold();
                    } else {
                        setModalOpen(true);
                    }
                }}
            >
                Held
            </PrimaryButton>

            {modalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-4 rounded-lg w-full max-w-md">
                        <h2 className="text-lg font-bold mb-4">📦 Held Transactions</h2>

                        {heldTransactions.length === 0 ? (
                            <p className="text-gray-500">No held transactions.</p>
                        ) : (
                            <ul className="space-y-3 max-h-[300px] overflow-y-auto">
                                {heldTransactions.map((ht) => (
                                    <li key={ht.id} className="border p-2 rounded space-y-1">
                                        <div className="text-sm">
                                            🧾 {ht.cart.length} item(s)
                                        </div>
                                        {ht.customerName && (
                                            <div className="text-sm">👤 {ht.customerName}</div>
                                        )}
                                        <div className="text-sm">💳 {ht.paymentMethod}</div>
                                        <div className="text-sm">💵 ₱{Number(ht.amountPaid).toFixed(2)}</div>
                                        <div className="space-x-2 mt-2">
                                            <button
                                                className="text-sm bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                                                onClick={() => handleRecall(ht)}
                                            >
                                                Recall
                                            </button>
                                            <button
                                                className="text-sm bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                                                onClick={() => handleDelete(ht.id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}

                        <div className="mt-4 text-right">
                            <PrimaryButton
                                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                                onClick={() => setModalOpen(false)}
                            >
                                Close
                            </PrimaryButton>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
