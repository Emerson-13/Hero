import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import { useForm } from '@inertiajs/react';

export default function EditCategoryModal({ category, onClose, onUpdated }) {
    const { data, setData, put, processing, errors } = useForm({
        name: category?.name || '',
        description: category?.description || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        put(route('categories.update',{ category: category.id }), {
            preserveScroll: true,
            onSuccess: () => {
                onUpdated(); // refresh list
                onClose();   // close modal
                alert('Category updated successfully!');
            },
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg w-full max-w-xl relative">
                <h2 className="text-lg font-semibold mb-4">Edit Category</h2>

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
                        />
                        <InputError message={errors.description} className="mt-2" />
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
