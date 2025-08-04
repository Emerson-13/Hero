import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import { useForm } from '@inertiajs/react';

export default function EdittransactionModal({ transaction, onClose, onUpdated  }) {
     const { data, setData, post, processing, errors, reset } = useForm({
        customer_name: '',
        payment_method: 'cash',
        amount_paid: '',
        total: '',
        reference_number: '',
    });


    const handleSubmit = (e) => {
        e.preventDefault();

        put(route('transactions.update', { transaction: transaction.id }), {
            preserveScroll: true,
            onSuccess: () => {
                onUpdated(); // refresh staff list
                onClose();   // close modal
                alert('transaction updated successfully!');
            },
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg w-full max-w-xl relative">
                <h2 className="text-lg font-semibold mb-4">Edit transaction</h2>

                   <form onSubmit={submit} className="space-y-4">
    <input
        type="text"
        placeholder="Customer Name"
        value={data.customer_name}
        onChange={(e) => setData('customer_name', e.target.value)}
        className="w-full border p-2 rounded"
    />
    {errors.customer_name && <p className="text-red-500 text-sm">{errors.customer_name}</p>}

    <select
        value={data.payment_method}
        onChange={(e) => setData('payment_method', e.target.value)}
        className="w-full border p-2 rounded"
    >
        <option value="cash">Cash</option>
        <option value="gcash">GCash</option>
        <option value="card">Card</option>
    </select>
    {errors.payment_method && <p className="text-red-500 text-sm">{errors.payment_method}</p>}

    <input
        type="number"
        placeholder="Amount Paid"
        value={data.amount_paid}
        onChange={(e) => setData('amount_paid', parseFloat(e.target.value))}
        className="w-full border p-2 rounded"
    />
    {errors.amount_paid && <p className="text-red-500 text-sm">{errors.amount_paid}</p>}

    <input
        type="number"
        placeholder="Total"
        value={data.total}
        onChange={(e) => setData('total', parseFloat(e.target.value))}
        className="w-full border p-2 rounded"
    />
    {errors.total && <p className="text-red-500 text-sm">{errors.total}</p>}

    <input
        type="text"
        placeholder="Reference Number (GCash/Card)"
        value={data.reference_number}
        onChange={(e) => setData('reference_number', e.target.value)}
        className="w-full border p-2 rounded"
    />
    {errors.reference_number && <p className="text-red-500 text-sm">{errors.reference_number}</p>}

    <div className="flex justify-end space-x-2 mt-4">
        <button
            type="button"
            onClick={() => setShowModal(false)}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
            Cancel
        </button>
        <button
            type="submit"
            disabled={processing}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
            Save Transaction
        </button>
    </div>
</form>
            </div>
        </div>
    );
}
