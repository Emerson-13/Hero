// VoidTransactionButton.jsx

import { useState } from 'react';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import { useForm } from '@inertiajs/react';

export default function VoidTransactionButton({ transactionId }) {
    const [showModal, setShowModal] = useState(false);

    const { data, setData, post, processing, reset, errors } = useForm({
        void_pin: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        post(route('settings.voidTransaction', transactionId), {
            preserveScroll: true,
            onSuccess: () => {
                alert('✅ Transaction voided successfully.');
                reset();
                setShowModal(false);
            },
            onError: (err) => {
                console.error(err);
            }
        });
    };

    return (
        <>
            <PrimaryButton onClick={() => setShowModal(true)} className="mt-2">
                Void Transaction
            </PrimaryButton>

            <Modal show={showModal} onClose={() => setShowModal(false)}>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <h2 className="text-lg font-semibold text-gray-800">Enter Void PIN</h2>

                    <input
                        type="password"
                        value={data.void_pin}
                        onChange={(e) => setData('void_pin', e.target.value)}
                        placeholder="Enter your void PIN"
                        className="w-full border rounded px-4 py-2"
                        required
                    />
                    {errors.void_pin && (
                        <p className="text-red-600 text-sm">{errors.void_pin}</p>
                    )}

                    <div className="flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => {
                                reset();
                                setShowModal(false);
                            }}
                            className="text-gray-600 hover:text-gray-800"
                        >
                            Cancel
                        </button>
                        <PrimaryButton disabled={processing}>Confirm Void</PrimaryButton>
                    </div>
                </form>
            </Modal>
        </>
    );
}
