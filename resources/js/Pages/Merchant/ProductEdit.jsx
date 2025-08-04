import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import { useForm } from '@inertiajs/react';

export default function EditProductModal({ product, categories, onClose, onUpdated  }) {
    const { data, setData, put, processing, errors, reset } = useForm({
        name: product?.name || '',
        description: product?.description || '',
        stock: product?.stock || '',
        price: product?.price || '',
        category_id: product?.category_id || '', // ✅ fix
    });


    const handleSubmit = (e) => {
        e.preventDefault();

        put(route('products.update', { product: product.id }), {
            preserveScroll: true,
            onSuccess: () => {
                onUpdated(); // refresh staff list
                onClose();   // close modal
                alert('Product updated successfully!');
            },
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg w-full max-w-xl relative">
                <h2 className="text-lg font-semibold mb-4">Edit Product</h2>

                <form onSubmit={handleSubmit}>
                    <div>
                        <InputLabel htmlFor="name" value="Name" />
                        <TextInput
                            id="name"
                            name="name"
                            value={data.name}
                            className="mt-1 block w-full"
                            onChange={(e) => setData('name', e.target.value)}
                            required
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="description" value="Description" />
                        <TextInput
                            id="description"
                            type="text"
                            name="description"
                            value={data.description}
                            className="mt-1 block w-full"
                            onChange={(e) => setData('description', e.target.value)}
                            required
                        />
                        <InputError message={errors.description} className="mt-2" />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="stock" value="Stock" />
                        <TextInput
                            id="stock"
                            type="number"
                            name="stock"
                            value={data.stock}
                            className="mt-1 block w-full"
                            autoComplete="stock"
                            onChange={(e) => setData('stock', e.target.value)}
                        />
                        <InputError message={errors.stock} className="mt-2" />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="price" value="Price" />
                        <TextInput
                            id="price"
                            type="number"
                            name="price"
                            value={data.price}
                            className="mt-1 block w-full"
                            autoComplete="price"
                            onChange={(e) => setData('price', e.target.value)}
                        />
                        <InputError message={errors.price} className="mt-2" />
                        </div>
                     
                        <div className="mt-4">
                        <InputLabel htmlFor="category_id" value="Category" />
                            <select
                                id="category_id"
                                name="category_id"
                                value={data.category_id}
                                onChange={(e) => setData('category_id', e.target.value)}
                                className="mt-1 block w-full border rounded p-2"
                                required
                            >
                            <option value="">-- Select Category --</option>
                                    {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                    ))}
                        </select>
                    <InputError message={errors.category_id} className="mt-2" />
                    </div>
                    <div className="mt-4 flex items-center justify-end">
                        <DangerButton type="button" onClick={onClose} className="ms-4">
                            Cancel
                        </DangerButton>
                        <PrimaryButton className="ms-4" disabled={processing}>
                            Update
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </div>
    );
}
