import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import StaffEdit from './StaffEdit';


export default function Staff() {
    const { staff = [] } = usePage().props;
    const [showModal, setShowModal] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    
    const submit = (e) => {
        e.preventDefault();
        post(route('staff.store'), {
            onSuccess: () => {
                reset();
                setShowModal(false);
                router.reload(); // Reload the page to get updated staff from controller
                alert('Staff added successfully!');
            },
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    const handleDelete = (id) => {
        if (!confirm('Are you sure you want to delete this staff?')) return;

        router.delete(route('staff.destroy', { staff: id }), {
            onSuccess: () => {
                router.reload(); // Reload to reflect deletion
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Staff</h2>}
        >
            <Head title="Staff" />

            <div className='py-12'>
                <div className="max-w-7xl mx-auto p-6 lg:px-8">
                    <div className="bg-white shadow-lg rounded-xl p-4 overflow-x-auto">
                        <h1 className="text-2xl font-bold mb-4">Staff List</h1>
                        <PrimaryButton
                            onClick={() => setShowModal(true)}
                            className="mb-4 bg-blue-600 hover:bg-blue-700"
                        >
                            + Add Staff
                        </PrimaryButton>

                        {/* Add Staff Modal */}
                        {showModal && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                <div className="bg-white p-6 rounded shadow-lg w-full max-w-xl relative">
                                    <h2 className="text-lg font-semibold mb-4">Add Staff</h2>
                                    <form onSubmit={submit}>
                                        <div>
                                            <InputLabel htmlFor="name" value="Name" />
                                            <TextInput
                                                id="name"
                                                name="name"
                                                value={data.name}
                                                className="mt-1 block w-full"
                                                autoComplete="name"
                                                isFocused={true}
                                                onChange={(e) => setData('name', e.target.value)}
                                                required
                                            />
                                            <InputError message={errors.name} className="mt-2" />
                                        </div>

                                        <div className="mt-4">
                                            <InputLabel htmlFor="email" value="Email" />
                                            <TextInput
                                                id="email"
                                                type="email"
                                                name="email"
                                                value={data.email}
                                                className="mt-1 block w-full"
                                                autoComplete="username"
                                                onChange={(e) => setData('email', e.target.value)}
                                                required
                                            />
                                            <InputError message={errors.email} className="mt-2" />
                                        </div>

                                        <div className="mt-4">
                                            <InputLabel htmlFor="password" value="Password" />
                                            <TextInput
                                                id="password"
                                                type="password"
                                                name="password"
                                                value={data.password}
                                                className="mt-1 block w-full"
                                                autoComplete="new-password"
                                                onChange={(e) => setData('password', e.target.value)}
                                                required
                                            />
                                            <InputError message={errors.password} className="mt-2" />
                                        </div>

                                        <div className="mt-4">
                                            <InputLabel htmlFor="password_confirmation" value="Confirm Password" />
                                            <TextInput
                                                id="password_confirmation"
                                                type="password"
                                                name="password_confirmation"
                                                value={data.password_confirmation}
                                                className="mt-1 block w-full"
                                                autoComplete="new-password"
                                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                                required
                                            />
                                            <InputError message={errors.password_confirmation} className="mt-2" />
                                        </div>

                                        <div className="mt-4 flex items-center justify-end">
                                            <DangerButton
                                                type="button"
                                                onClick={() => setShowModal(false)}
                                                className="ms-4"
                                            >
                                                Cancel
                                            </DangerButton>
                                            <PrimaryButton className="ms-4" disabled={processing}>
                                                Register
                                            </PrimaryButton>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* Staff Table */}
                        <table className="w-full border border-gray-300 table-auto">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="border p-2">Name</th>
                                    <th className="border p-2">Email</th>
                                    <th className="border p-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {staff.length > 0 ? (
                                    staff.map((st) => (
                                        <tr key={st.id}>
                                            <td className="border p-2">{st.name}</td>
                                            <td className="border p-2">{st.email}</td>
                                            <td className="border p-2 space-x-2">
                                                <PrimaryButton
                                                    onClick={() => {
                                                        setEditingStaff(st);
                                                        setShowEditModal(true);
                                                    }}
                                                >
                                                    Edit
                                                </PrimaryButton>
                                                <DangerButton onClick={() => handleDelete(st.id)}>
                                                    Delete
                                                </DangerButton>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td className="border p-2 text-center" colSpan="3">No staff found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {showEditModal && editingStaff && (
                <StaffEdit
                    staff={editingStaff}
                    onClose={() => {
                        setEditingStaff(null);
                        setShowEditModal(false);
                    }}
                    onUpdated={() => router.reload()}
                />
            )}
        </AuthenticatedLayout>

    );
}
