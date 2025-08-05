import { useForm } from '@inertiajs/react';

export default function Settings({ discount_mode }) {
    const { data, setData, post } = useForm({
        discount_mode: discount_mode || 'disabled',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('merchant.settings.update'));
    };

    return (
        <div className="max-w-md mx-auto p-4 bg-white rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Discount Settings</h2>

            <form onSubmit={handleSubmit}>
                <label className="block font-medium mb-2">Discount Mode:</label>
                <select
                    className="w-full border rounded p-2 mb-4"
                    value={data.discount_mode}
                    onChange={(e) => setData('discount_mode', e.target.value)}
                >
                    <option value="disabled">Disable Discount</option>
                    <option value="single">Apply to Most Expensive (1 unit)</option>
                    <option value="all">Apply to All Items</option>
                </select>

                <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                    Save Settings
                </button>
            </form>
        </div>
    );
}
