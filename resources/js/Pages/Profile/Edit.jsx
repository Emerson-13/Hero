import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Profile
                </h2>
            }
        >
            <Head title="Profile" />

            <div className="py-12">
                <div className="mx-auto space-y-6 sm:px-6 lg:px-8">
                     <div className="max-w-5xl mx-auto bg-white p-6 rounded-lg shadow-md space-y-10">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-xl"
                        />
                    </div>

                     <div className="max-w-5xl mx-auto bg-white p-6 rounded-lg space-y-10">
                        <UpdatePasswordForm className="max-w-xl" />
                    </div>

                     <div className="max-w-5xl mx-auto bg-white p-6 rounded-lg shadow-md space-y-10">
                        <DeleteUserForm className="max-w-xl" />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
