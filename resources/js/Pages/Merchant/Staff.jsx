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
    const [search, setSearch] = useState('');

    const filteredStaff = staff.filter(st =>
        st.name.toLowerCase().includes(search.toLowerCase()) ||
        st.email.toLowerCase().includes(search.toLowerCase())
    );

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
                router.reload();
                alert('Staff added successfully!');
            },
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this staff?')) {
            router.delete(route('staff.destroy', { staff: id }), {
                onSuccess: () => router.reload(),
            });
        }
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">Staff</h2>}>
            <Head title="Staff" />

            <div className='py-12'>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white shadow-lg rounded-xl p-6 overflow-x-auto">
                        {/* Title */}
                        <div className="text-center mb-6">
                            <h2 className="text-3xl font-bold text-gray-800">👥 Staff Management</h2>
                            <p className="text-gray-600 mt-1">
                                Manage staff records, edit or remove users, and search for specific personnel.
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                            <PrimaryButton
                                onClick={() => setShowModal(true)}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                + Add Staff
                            </PrimaryButton>

                            <TextInput
                                type="text"
                                placeholder="🔍 Search staff..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full md:w-64"
                            />
                        </div>

                        {/* Staff Table */}
                        <table className="w-full border border-gray-300 table-auto text-sm">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="border p-2 text-left">Name</th>
                                    <th className="border p-2 text-left">Email</th>
                                    <th className="border p-2 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStaff.length > 0 ? (
                                    filteredStaff.map((st) => (
                                        <tr key={st.id}>
                                            <td className="border p-2">{st.name}</td>
                                            <td className="border p-2">{st.email}</td>
                                            <td className="border p-2 space-x-2">
                                                <PrimaryButton onClick={() => {
                                                    setEditingStaff(st);
                                                    setShowEditModal(true);
                                                }}>
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

            {/* Add Staff Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg relative">
                        <h2 className="text-xl font-semibold mb-4">Add New Staff</h2>
                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <InputLabel htmlFor="name" value="Name" />
                                <TextInput
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                    className="block w-full mt-1"
                                />
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="email" value="Email" />
                                <TextInput
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                    className="block w-full mt-1"
                                />
                                <InputError message={errors.email} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="password" value="Password" />
                                <TextInput
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    required
                                    className="block w-full mt-1"
                                />
                                <InputError message={errors.password} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="password_confirmation" value="Confirm Password" />
                                <TextInput
                                    id="password_confirmation"
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    required
                                    className="block w-full mt-1"
                                />
                                <InputError message={errors.password_confirmation} className="mt-2" />
                            </div>

                            <div className="flex justify-end space-x-2 mt-4">
                                <DangerButton onClick={() => setShowModal(false)}>
                                    Cancel
                                </DangerButton>
                                <PrimaryButton type="submit" disabled={processing}>
                                    Register
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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
