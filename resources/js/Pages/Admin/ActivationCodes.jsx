// resources/js/Pages/Admin/ActivationCodes.jsx
import { Head, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import DeleteButton from "@/Components/DeleteButton";

export default function ActivationCodes({ codes = { data: [] } }) {
    const deleteCode = (id) => {
        if (!confirm("Are you sure you want to delete this code?")) return;
        router.delete(route("activation-codes.destroy", id));
    };

    const deleteAllCodes = () => {
        if (!confirm("⚠️ Are you sure you want to delete ALL activation codes?")) return;
        router.delete(route("activation-codes.destroyAll")); // ensure backend route exists
    };

    const goToPage = (url) => {
        if (url) router.get(url);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Activation Codes" />

            <div className="py-10 min-h-screen bg-slate-100">
                <div className="max-w-6xl mx-auto space-y-8 px-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 gap-3">
                    <h2 className="text-5xl font-semibold text-gray-800">
                        Activation Codes
                    </h2>
                    <button
                        onClick={deleteAllCodes}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow-sm text-sm font-medium"
                    >
                        Delete All
                    </button>
                    </div>
                    {/* Table (Desktop) */}
                    <div className="hidden md:block overflow-x-auto bg-white rounded-lg shadow-sm">
                        <h4 className="text-lg font-bold text-indigo-950 p-4">
                            All Activation Code
                        </h4>
                        <table className="min-w-full border border-gray-300 bg-white rounded-lg shadow-sm">
                            <thead>
                                {/* 🔹 Column Headers */}
                                <tr className="bg-gray-100">
                                    <th className="px-4 py-2 border">#</th>
                                    <th className="px-4 py-2 border">Code</th>
                                    <th className="px-4 py-2 border">Package</th>
                                    <th className="px-4 py-2 border">Used By</th>
                                    <th className="px-4 py-2 border">Status</th>
                                    <th className="px-4 py-2 border">Created At</th>
                                    <th className="px-4 py-2 border text-center">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {codes.data.length > 0 ? (
                                    codes.data.map((c, i) => (
                                        <tr
                                            key={c.id}
                                            className={
                                                i % 2 === 0
                                                    ? "bg-white hover:bg-gray-50"
                                                    : "bg-gray-50 hover:bg-gray-100"
                                            }
                                        >
                                            <td className="px-4 py-2 border">{i + 1}</td>
                                            <td className="px-4 py-2 border font-mono">{c.code}</td>
                                            <td className="px-4 py-2 border">{c.package?.name || "-"}</td>
                                            <td className="px-4 py-2 border">{c.user?.name || "-"}</td>
                                            <td className="px-4 py-2 border">
                                                {c.is_used ? "Used" : "Unused"}
                                            </td>
                                            <td className="px-4 py-2 border">
                                                {new Date(c.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-2 border text-center">
                                                <DeleteButton onClick={() => deleteCode(c.id)} />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="7"
                                            className="text-center py-4 text-gray-500 border"
                                        >
                                            No activation codes found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Card Layout (Mobile) */}
                    <div className="md:hidden">
                        <div className="grid grid-cols-1 gap-4">
                            {codes.data.length > 0 ? (
                                codes.data.map((c, i) => (
                                    <div
                                        key={c.id}
                                        className={`rounded-lg shadow-sm p-4 border ${
                                            i % 2 === 0 ? "bg-white" : "bg-gray-50"
                                        }`}
                                    >
                                        <p><strong>#:</strong> {i + 1}</p>
                                        <p>
                                            <strong>Code:</strong>{" "}
                                            <span className="font-mono">{c.code}</span>
                                        </p>
                                        <p><strong>Package:</strong> {c.package?.name || "-"}</p>
                                        <p><strong>Used By:</strong> {c.user?.name || "-"}</p>
                                        <p><strong>Status:</strong> {c.is_used ? "Used" : "Unused"}</p>
                                        <p>
                                            <strong>Created At:</strong>{" "}
                                            {new Date(c.created_at).toLocaleDateString()}
                                        </p>

                                        <div className="flex gap-2 mt-3">
                                            <DeleteButton
                                                onClick={() => deleteCode(c.id)}
                                                className="flex-1"
                                            />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-600">
                                    No activation codes found
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Pagination */}
                    <div className="mt-4 flex justify-center space-x-2">
                        {codes.links &&
                            codes.links.map((link, index) => (
                                <button
                                    key={index}
                                    onClick={() => goToPage(link.url)}
                                    disabled={!link.url}
                                    className={`px-3 py-1 border rounded ${
                                        link.active
                                            ? "bg-blue-500 text-white"
                                            : "bg-gray-200"
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
