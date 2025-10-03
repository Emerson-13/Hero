import { useForm, usePage, router, Head } from '@inertiajs/react';
import { useState,useEffect  } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton';
import Select from 'react-select';
import SecondaryButton from '@/Components/SecondaryButton';

export default function Discounts() {
    const { discounts = [], categories = [], items = [] } = usePage().props;
    const categoryOptions = categories.map(cat => ({ value: cat.id, label: cat.name }));
    const itemOptions = items.map(item => ({ value: item.id, label: item.name }));

    const { data, setData, reset, post } = useForm({
        code: '',
        type: 'percentage',
        value: '',
        discount_type: 'promo',
        applies_to: 'all',
        target_ids: [],
        tax_type: 'vat',
    });

    useEffect(() => {
    if (data.tax_type === 'zero_rated') {
        setData('value', 0);
        setData('type', 'fixed'); // or null if backend allows
    }
}, [data.tax_type]);


    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(data);  
        post(route('discount.store'), {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    const toggleStatus = (id) => {
        router.patch(route('discount.toggle', id));
    };

    const deleteDiscount = (id) => {
        if (confirm('Are you sure you want to delete this discount?')) {
            router.delete(route('discount.destroy', id));
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

        if (data.applies_to === 'items') {
            return (
                <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Items</label>
                    <Select
                        isMulti
                        options={itemOptions}
                        value={itemOptions.filter(option => data.target_ids.includes(option.value))}
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
                <div className="py-10">
                    <div className="max-w-5xl mx-auto bg-white p-6 rounded-lg shadow-md space-y-10">
                        <h3 className="text-3xl font-bold text-center text-gray-800 mb-2">📃 Discounts Panel</h3>
                            <p className="text-center text-gray-600 mb-6">
                                Manage and organize discounts and deals in your system.
                            </p>
                            {/* Create Discount Form */}
                            <div className="bg-gray-50 p-6 rounded-lg shadow-sm border mb-6">
                                <h3 className="text-2xl font-semibold text-gray-800 mb-4">➕ Add Discount</h3>
                                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="col-span-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. SAVE10"
                                            className="w-full border rounded p-2"
                                            value={data.code}
                                            onChange={(e) => setData('code', e.target.value.toUpperCase())}
                                            required
                                        />
                                    </div>
                                      <div className="col-span-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
                                        <select
                                            className="w-full border rounded p-2"
                                            value={data.discount_type}
                                            onChange={(e) => setData('discount_type', e.target.value)}
                                        >
                                            <option value="promo">Promo</option>
                                            <option value="gov">Gov (PWD/Senior)</option>
                                        </select>
                                    </div>
                                    {data.discount_type === 'gov' && (
                                        <div className="col-span-1">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Tax Type</label>
                                            <select
                                                className="w-full border rounded p-2"
                                                value={data.tax_type}
                                                onChange={(e) => setData('tax_type', e.target.value)}
                                            >
                                                <option value="vat_exempt">VAT Exempt</option>
                                                <option value="zero_rated">Zero-Rated</option>
                                            </select>
                                        </div>
                                    )}

                                    <div className="col-span-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                        <select
                                            className="w-full border rounded p-2"
                                            value={data.type}
                                            onChange={(e) => setData('type', e.target.value)}
                                            disabled={data.tax_type === 'zero_rated'} 
                                        >
                                            <option value="percentage">Percentage (%)</option>
                                            <option value="fixed">Fixed (₱)</option>
                                        </select>
                                    </div>

                                    <div className="col-span-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                                        <input
                                            type="number"
                                            placeholder="e.g. 10"
                                            className="w-full border rounded p-2"
                                            value={data.value}
                                            onChange={(e) => setData('value', e.target.value)}
                                            required
                                            disabled={data.tax_type === 'zero_rated'} 
                                        />
                                    </div>

                                    <div className="col-span-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Applies To</label>
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
                                            <option value="items">Specific Items</option>
                                        </select>
                                    </div>

                                    {/* Conditionally Render Category/Items Select */}
                                    <div className="col-span-2">{renderTargetSelector()}</div>

                                    <div className="col-span-2 flex justify-end pt-4">
                                        <PrimaryButton type="submit">Create Discount</PrimaryButton>
                                    </div>
                                </form>
                            </div>           
                            <div className="overflow-x-auto shadow-sm rounded-lg">
                                <table className="w-full text-sm border border-gray-300">
                                    <thead className="bg-gray-100 text-left">
                                        <tr>
                                            <th className="border px-3 py-2">Code</th>
                                            <th className="border px-3 py-2">Type</th>
                                            <th className="border px-3 py-2">Discount Type</th>
                                            <th className="border px-3 py-2">Value</th>
                                            <th className="border px-3 py-2">Scope</th>
                                            <th className="border px-3 py-2">Status</th>
                                            <th className="border px-3 py-2 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {discounts.length ? (
                                            discounts.map((discount) => (
                                                <tr key={discount.id} className="hover:bg-gray-50 transition">
                                                    <td className="border px-3 py-2">{discount.code}</td>
                                                    <td className="border px-3 py-2 capitalize">{discount.type}</td>
                                                    <td className="border px-3 py-2 capitalize">{discount.discount_type}</td>
                                                    <td className="border px-3 py-2">
                                                        {discount.type === 'percentage' ? `${discount.value}%` : `₱${discount.value}`}
                                                    </td>
                                                    <td className="border px-3 py-2 capitalize">{discount.applies_to}</td>
                                                    <td className="border px-3 py-2">
                                                        <span className={discount.is_active ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                                                            {discount.is_active ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                    <td className="border px-3 py-2 flex flex-wrap gap-2 justify-center">
                                                        <SecondaryButton onClick={() => toggleStatus(discount.id)}>
                                                            {discount.is_active ? 'Deactivate' : 'Activate'}
                                                        </SecondaryButton>
                                                        <PrimaryButton onClick={() => {
                                                            setEditingDiscount(discount);
                                                            setShowEditModal(true);
                                                        }}>
                                                            Edit
                                                        </PrimaryButton>
                                                        <DangerButton onClick={() => deleteDiscount(discount.id)}>
                                                            Delete
                                                        </DangerButton>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="7" className="text-center py-4 text-gray-500">
                                                    No discounts found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
        </AuthenticatedLayout>
    );
}
