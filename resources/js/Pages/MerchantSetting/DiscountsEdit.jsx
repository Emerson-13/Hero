import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { useForm } from '@inertiajs/react';
import Select from 'react-select';

export default function DiscountsEdit({ discount, categories, products, onClose, onUpdated }) {
    const categoryOptions = categories.map(cat => ({ value: cat.id, label: cat.name }));
    const productOptions = products.map(prod => ({ value: prod.id, label: prod.name }));

    const { data, setData, put, processing, errors } = useForm({
        code: discount.code,
        type: discount.type,
        value: discount.value,
        discount_type: discount.discount_type,
        applies_to: discount.applies_to,
        target_ids: discount.target_ids || [],
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('discount.update', discount.id), {
            preserveScroll: true,
            onSuccess: onUpdated,
        });
    };

    const renderTargetSelector = () => {
        if (data.applies_to === 'categories') {
            return (
                <Select
                    isMulti
                    options={categoryOptions}
                    value={categoryOptions.filter(opt => data.target_ids.includes(opt.value))}
                    onChange={(selected) => setData('target_ids', selected.map(opt => opt.value))}
                    className="mt-2"
                />
            );
        }

        if (data.applies_to === 'products') {
            return (
                <Select
                    isMulti
                    options={productOptions}
                    value={productOptions.filter(opt => data.target_ids.includes(opt.value))}
                    onChange={(selected) => setData('target_ids', selected.map(opt => opt.value))}
                    className="mt-2"
                />
            );
        }

        return null;
    };

    return (
        <Modal show onClose={onClose}>
            <div className="p-6">
                <h2 className="text-lg font-bold mb-4">Edit Discount</h2>

                <form onSubmit={handleSubmit} className="space-y-3">
                    <input
                        type="text"
                        value={data.code}
                        onChange={(e) => setData('code', e.target.value.toUpperCase())}
                        className="w-full border rounded p-2"
                        placeholder="Code"
                    />
                    <select
                        value={data.type}
                        onChange={(e) => setData('type', e.target.value)}
                        className="w-full border rounded p-2"
                    >
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed (₱)</option>
                    </select>

                    <input
                        type="number"
                        value={data.value}
                        onChange={(e) => setData('value', e.target.value)}
                        className="w-full border rounded p-2"
                        placeholder="Value"
                    />

                    <select
                        value={data.discount_type}
                        onChange={(e) => setData('discount_type', e.target.value)}
                        className="w-full border rounded p-2"
                    >
                        <option value="promo">Promo</option>
                        <option value="gov">Gov</option>
                    </select>

                    <select
                        value={data.applies_to}
                        onChange={(e) => {
                            setData('applies_to', e.target.value);
                            setData('target_ids', []);
                        }}
                        className="w-full border rounded p-2"
                    >
                        <option value="all">All Items</option>
                        <option value="categories">Categories</option>
                        <option value="products">Products</option>
                    </select>

                    {renderTargetSelector()}

                    <div className="flex justify-end space-x-2 pt-4">
                        <SecondaryButton onClick={onClose} type="button">Cancel</SecondaryButton>
                        <PrimaryButton disabled={processing} type="submit">Save Changes</PrimaryButton>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
