import { useForm, router } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import DangerButton from '@/Components/DangerButton';

export default function Activation() {
    const { data, setData, post, processing, errors } = useForm({
        code: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('activation.verify'));
    };

    const handleLogout = () => {
        router.post(route('logout')); // Laravel logout route
    };

    return (
        <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Enter Activation Code</h2>
            <form onSubmit={submit}>
                <TextInput
                    value={data.code}
                    onChange={e => setData('code', e.target.value)}
                    placeholder="Activation Code"
                    required
                />
                <InputError message={errors.code} className="mt-2" />
                <PrimaryButton className="mt-4 w-full" disabled={processing}>
                    Activate
                </PrimaryButton>
            </form>

            <div className="mt-6 text-center">
                <DangerButton
                    onClick={handleLogout}
                    className="text-sm text-red-600 hover:underline"
                >
                    Logout
                </DangerButton>
            </div>
        </div>
    );
}
