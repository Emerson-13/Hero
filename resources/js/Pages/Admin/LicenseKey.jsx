import { useState } from "react";
import { usePage, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function LicenseKey({ initialLicenses }) {
    const { flash } = usePage().props;
    const [licenseKey, setLicenseKey] = useState("");
    const [licenses, setLicenses] = useState(initialLicenses || []);

    // Helper to format date nicely
    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        router.post(
            route("license.store"),
            { key: licenseKey },
            {
                preserveScroll: true,
                onSuccess: (page) => {
                    // Always use fresh data from backend
                    setLicenses(page.props.licenses || []);
                    setLicenseKey("");
                },
            }
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    License Key Management
                </h2>
            }
        >
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Manage License Keys</h1>

                {flash.success && (
                    <div className="bg-green-100 text-green-800 p-2 rounded mb-4">
                        {flash.success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="mb-6">
                    <div className="mb-4">
                        <label className="block mb-1 font-medium">License Key</label>
                        <input
                            type="text"
                            value={licenseKey}
                            onChange={(e) => setLicenseKey(e.target.value)}
                            className="border rounded px-3 py-2 w-full"
                            placeholder="Enter license key"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Add License Key
                    </button>
                </form>

                <table className="w-full border-collapse border border-gray-300">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="border p-2">ID</th>
                            <th className="border p-2">License Key</th>
                            <th className="border p-2">Status</th>
                            <th className="border p-2">Merchant</th>
                            <th className="border p-2">Created At</th>
                        </tr>
                    </thead>
                    <tbody>
                        {licenses.length > 0 ? (
                            licenses.map((license) => (
                                <tr key={license.id}>
                                    <td className="border p-2">{license.id}</td>
                                    <td className="border p-2">{license.key}</td>
                                    <td className="border p-2 capitalize">{license.status}</td>
                                    <td className="border p-2">
                                        {license.merchant_id || "Unassigned"}
                                    </td>
                                    <td className="border p-2">
                                        {formatDate(license.created_at)}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="border p-2 text-center">
                                    No license keys found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </AuthenticatedLayout>
    );
}
