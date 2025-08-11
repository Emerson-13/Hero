// resources/js/Components/Modals/PosPinModal.jsx
import React, { useState } from 'react';

export default function PosPinModal({ show, onClose, onSubmit }) {
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = () => {
        if (!/^\d{6}$/.test(pin)) {
            setError('Please enter a valid 6-digit PIN.');
            return;
        }
        setError('');
        onSubmit(pin);
        setPin('');
    };

    const handleClose = () => {
        setPin('');
        setError('');
        onClose();
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-sm">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">🔐 Enter POS PIN</h2>
                <input
                    type="password"
                    maxLength={6}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
                    placeholder="6-digit PIN"
                    autoFocus
                />
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                <div className="flex justify-end gap-2 mt-4">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 text-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
}
