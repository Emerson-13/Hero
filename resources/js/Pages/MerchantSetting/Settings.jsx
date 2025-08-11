import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    Settings,
    Percent,
    User,
    Info,
    Printer,
    LockKeyhole
} from 'lucide-react'; // Lucide icons

export default function SettingsIndex() {
    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Settings</h2>}
        >
            <Head title="Settings" />

            <div className="py-12">
                <div className="mx-auto max-w-5xl sm:px-6 lg:px-8">
                    <div className="bg-white p-6 shadow-sm sm:rounded-lg">
                        <div className="mb-6 text-center">
                            <Settings className="mx-auto h-10 w-10 text-gray-600" />
                            <h1 className="text-2xl font-bold mt-2">Settings</h1>
                            <p className="text-sm text-gray-500">Manage your application preferences</p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <SettingCard
                                icon={<Percent className="w-6 h-6 text-blue-500" />}
                                title="Discount Settings"
                                description="Manage available discounts and offers"
                                href={route('merchant.discounts')}  
                            />
                            <SettingCard
                                icon={<User className="w-6 h-6 text-green-600" />}
                                title="Profile Settings"
                                description="Update your account and business profile"
                                href={route('profile.edit')}
                            />
                            <SettingCard
                                icon={<Info className="w-6 h-6 text-purple-600" />}
                                title="About Me"
                                description="Write about yourself or your company"
                                href={route('settings.about')}
                            />
                            <SettingCard
                                icon={<Printer className="w-6 h-6 text-red-600" />}
                                title="Printer Settings"
                                description="Configure your fax and printer preferences"
                                href={route('printer.index')}
                            />
                            <SettingCard
                                icon={<LockKeyhole className="w-6 h-6 text-blue-900" />}
                                title="Void Pin Settings"
                                description="Configure your Pin for voiding transaction"
                                href={route('setPosPin.index')}
                            />
                            
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

// Reusable card component
function SettingCard({ icon, title, description, href }) {
    return (
        <Link
            href={href}
            className="flex items-center p-4 border rounded-lg hover:shadow transition duration-200 bg-gray-50 hover:bg-white"
        >
            <div className="mr-4">{icon}</div>
            <div>
                <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                <p className="text-sm text-gray-500">{description}</p>
            </div>
        </Link>
    );
}
