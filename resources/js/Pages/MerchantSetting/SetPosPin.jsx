import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import InputError from '@/Components/InputError';

export default function PosPinForm({ auth, hasPin }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        current_pospin: '',
        pospin: '',
        pospin_confirmation: '',
    });

    const [message, setMessage] = useState(null);

   const handleSubmit = (e) => {
    e.preventDefault();

    // ✅ validate before sending to server
    if (!/^\d{6}$/.test(data.pospin)) {
        setMessage('❌ Please enter a valid 6-digit PIN.');
        setTimeout(() => setMessage(null), 3000);
        return;
    }

    post(route('settings.storePosPin'), {
        onSuccess: () => {
            setMessage('✅ PIN successfully set!');
            reset();
            setTimeout(() => setMessage(null), 3000);
        },
        onError: () => {
            setMessage('❌ Failed to set PIN. Please check the fields.');
            setTimeout(() => setMessage(null), 3000);
        },
    });
};

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Set POS Pin" />

            <div className="max-w-xl mx-auto mt-10 p-4 bg-white shadow rounded">
                <h2 className="text-lg font-semibold mb-4">Create or Update POS Pin</h2>
                <p>Create or update your POS pin</p>

                <form onSubmit={handleSubmit}>
                    {message && <div className="mb-2 text-sm">{message}</div>}

                    {hasPin && (
                        <div className="mb-4">
                            <InputLabel htmlFor="current_pospin" value="Current POS Pin" />
                            <TextInput
                                id="current_pospin"
                                type="password"
                                value={data.current_pospin}
                                onChange={(e) => setData('current_pospin', e.target.value.replace(/\D/g, '').slice(0, 6))}
                                className="mt-1 block w-full"
                                required={hasPin}
                                autoComplete="current-password"
                            />
                            <InputError message={errors.current_pospin} className="mt-2" />
                        </div>
                    )}

                    <div className="mb-4">
                        <InputLabel htmlFor="pospin" value="New POS Pin" />
                        <TextInput
                            id="pospin"
                            type="password"
                            value={data.pospin}
                            onChange={(e) => setData('pospin',  e.target.value.replace(/\D/g, '').slice(0, 6))}
                            className="mt-1 block w-full"
                            required
                            autoComplete="new-password"
                        />
                        <InputError message={errors.pospin} className="mt-2" />
                    </div>

                    <div className="mb-4">
                        <InputLabel htmlFor="pospin_confirmation" value="Confirm New POS Pin" />
                        <TextInput
                            id="pospin_confirmation"
                            type="password"
                            value={data.pospin_confirmation}
                            onChange={(e) => setData('pospin_confirmation', e.target.value.replace(/\D/g, '').slice(0, 6))}
                            className="mt-1 block w-full"
                            required
                            autoComplete="new-password"
                        />
                        <InputError message={errors.pospin_confirmation} className="mt-2" />
                    </div>

                    <div className="flex justify-end">
                        <PrimaryButton disabled={processing}>Save</PrimaryButton>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}

