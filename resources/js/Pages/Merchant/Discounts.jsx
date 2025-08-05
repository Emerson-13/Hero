import { useForm, usePage, router, Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton';
import Select from 'react-select';

export default function Discounts() {
    const { discounts = [], categories = [], products = [] } = usePage().props;
    const categoryOptions = categories.map(cat => ({ value: cat.id, label: cat.name }));
const productOptions = products.map(prod => ({ value: prod.id, label: prod.name }));


    const { data, setData, reset, post } = useForm({
        code: '',
        type: 'percentage',
        value: '',
        discount_type: 'promo',
        applies_to: 'all',
        target_ids: [],
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('merchant.store'), {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    const toggleStatus = (id) => {
        router.patch(route('toggle', id));
    };

    const deleteDiscount = (id) => {
        if (confirm('Are you sure you want to delete this discount?')) {
            router.delete(route('destroy', id));
        }
    };

    const renderTargetSelector = () => {
        if (data.applies_to === 'categories') {
            return (
                <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Categories</label>
                    <Select
                        isMulti
                        options={categoryOptions}
                        value={categoryOptions.filter(option => data.target_ids.includes(option.value))}
                        onChange={(selected) =>
                            setData('target_ids', selected.map(opt => opt.value))
                        }
                        className="react-select-container"
                        classNamePrefix="react-select"
                    />
                </div>
            );
        }

        if (data.applies_to === 'products') {
            return (
                <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Products</label>
                    <Select
                        isMulti
                        options={productOptions}
                        value={productOptions.filter(option => data.target_ids.includes(option.value))}
                        onChange={(selected) =>
                            setData('target_ids', selected.map(opt => opt.value))
                        }
                        className="react-select-container"
                        classNamePrefix="react-select"
                    />
                </div>
            );
        }

        return null;
    };


    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold">Manage Discounts</h2>}>
            <Head title="Discounts" />

            <div className="p-6">
                {/* Create Discount Form */}
                <div className="bg-white p-4 rounded shadow-sm max-w-md mb-6">
                    <h3 className="font-bold mb-3">Add Discount</h3>
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <input
                            type="text"
                            placeholder="Code (e.g. SAVE10)"
                            className="w-full border rounded p-2"
                            value={data.code}
                            onChange={(e) => setData('code', e.target.value.toUpperCase())}
                            required
                        />

                        <select
                            className="w-full border rounded p-2"
                            value={data.type}
                            onChange={(e) => setData('type', e.target.value)}
                        >
                            <option value="percentage">Percentage (%)</option>
                            <option value="fixed">Fixed (₱)</option>
                        </select>

                        <input
                            type="number"
                            placeholder="Value (e.g. 10)"
                            className="w-full border rounded p-2"
                            value={data.value}
                            onChange={(e) => setData('value', e.target.value)}
                            required
                        />

                        <select
                            className="w-full border rounded p-2"
                            value={data.discount_type}
                            onChange={(e) => setData('discount_type', e.target.value)}
                        >
                            <option value="promo">Promo</option>
                            <option value="gov">Gov (PWD/Senior)</option>
                        </select>

                        <select
                            className="w-full border rounded p-2"
                            value={data.applies_to}
                            onChange={(e) => {
                                setData('applies_to', e.target.value);
                                setData('target_ids', []);
                            }}
                        >
                            <option value="all">All Items</option>
                            <option value="categories">Specific Categories</option>
                            <option value="products">Specific Products</option>
                        </select>

                        {/* Render Target Selector */}
                        {renderTargetSelector()}

                        <PrimaryButton type="submit">Create Discount</PrimaryButton>
                    </form>
                </div>

                {/* Discount List Table */}
                <div className="bg-white p-4 rounded shadow-sm">
                    <h3 className="font-bold mb-3">Existing Discounts</h3>
                    <table className="w-full text-sm border border-gray-300">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border px-3 py-2">Code</th>
                                <th className="border px-3 py-2">Type</th>
                                <th className="border px-3 py-2">Value</th>
                                <th className="border px-3 py-2">Scope</th>
                                <th className="border px-3 py-2">Status</th>
                                <th className="border px-3 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {discounts.length ? (
                                discounts.map((d) => (
                                    <tr key={d.id}>
                                        <td className="border px-3 py-2">{d.code}</td>
                                        <td className="border px-3 py-2">{d.type}</td>
                                        <td className="border px-3 py-2">
                                            {d.type === 'percentage' ? `${d.value}%` : `₱${d.value}`}
                                        </td>
                                        <td className="border px-3 py-2 capitalize">{d.applies_to}</td>
                                        <td className="border px-3 py-2">
                                            <span className={d.is_active ? 'text-green-600' : 'text-red-600'}>
                                                {d.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="border px-3 py-2 space-x-2">
                                            <PrimaryButton onClick={() => toggleStatus(d.id)}>
                                                {d.is_active ? 'Deactivate' : 'Activate'}
                                            </PrimaryButton>
                                            <DangerButton onClick={() => deleteDiscount(d.id)}>
                                                Delete
                                            </DangerButton>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-3 text-gray-500">
                                        No discounts found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
