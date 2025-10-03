// resources/js/Pages/Admin/ReferralIndex.jsx
import { Head, router, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ViewButton from "@/Components/ViewButton";

export default function ReferralIndex() {
    const { users } = usePage().props;

    const goToPage = (url) => {
        if (url) router.get(url);
    }
    return (
        <AuthenticatedLayout>
            <Head title="Users & Referral Codes" />

            <div className="py-10 min-h-screen bg-slate-100">
              <div className="max-w-6xl mx-auto space-y-8 px-6">
                    <h2 className="text-5xl font-semibold text-gray-800">
                         Referral Codes
                    </h2>
                    {/* Table (Desktop) */}
                    <div className="hidden md:block overflow-x-auto bg-white rounded-lg shadow-sm">
                         <h4 className="text-lg font-bold text-indigo-950 p-4">
                            Referral List
                        </h4>
                        <table className="min-w-full border border-gray-300 bg-white rounded-lg shadow-sm">
                            <thead>
                                {/* 🔹 Column Headers */}
                                <tr className="bg-gray-100">
                                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700">#</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700">Name</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700">Email</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700">Referral Code</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700">Referred By</th>
                                    <th className="border border-gray-300 px-4 py-2 text-center text-sm font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.data.length > 0 ? (
                                    users.data.map((u, i) => (
                                        <tr
                                            key={u.id}
                                            className={i % 2 === 0 ? "bg-white hover:bg-gray-50" : "bg-gray-50 hover:bg-gray-100"}
                                        >
                                            <td className="border border-gray-300 px-4 py-2">
                                                {i + 1 + (users.current_page - 1) * users.per_page}
                                            </td>
                                            <td className="border border-gray-300 px-4 py-2 font-medium">
                                                {u.name}
                                            </td>
                                            <td className="border border-gray-300 px-4 py-2">
                                                {u.email}
                                            </td>
                                            <td className="border border-gray-300 px-4 py-2 text-gray-600">
                                                {u.code ?? "-"}
                                            </td>
                                          <td className="border border-gray-300 px-4 py-2 text-gray-600">
                                            {u.referred_by_name ? (
                                                <button
                                                onClick={() => router.get(route("admin.genealogy", u.referred_by_id))}
                                                className="text-blue-600 hover:underline"
                                                >
                                                {u.referred_by_name}
                                                </button>
                                            ) : (
                                                "-"
                                            )}
                                            </td>

                                            <td className="border border-gray-300 px-4 py-2 text-center">
                                                <ViewButton
                                                    onClick={() => router.get(route("admin.genealogy", u.id))}
                                                >
                                                    View Genealogy
                                                </ViewButton>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-4 text-gray-500 border border-gray-300">
                                            No users found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Card Layout (Mobile) */}
                    <div className="md:hidden">
                        <div className="grid grid-cols-1 gap-4">
                            {users.data.length > 0 ? (
                                users.data.map((u, i) => (
                                    <div
                                        key={u.id}
                                        className={`rounded-lg shadow-sm p-4 border ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                                    >
                                        <p><strong>#:</strong> {i + 1 + (users.current_page - 1) * users.per_page}</p>
                                        <p><strong>Name:</strong> {u.name}</p>
                                        <p><strong>Email:</strong> {u.email}</p>
                                        <p><strong>Referral Code:</strong> {u.code ?? "-"}</p>
                                        <div className="flex gap-2 mt-3">
                                            <ViewButton
                                                onClick={() => router.get(route("admin.genealogy", u.id))}
                                                className="flex-1"
                                             >
                                                View Genealogy
                                            </ViewButton>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-600">No users found</p>
                            )}
                        </div>
                    </div>

                    {/* Pagination */}
                    <div className="mt-4 flex justify-center space-x-2">
                        {users.links.map((link, idx) => (
                            <button
                                key={idx}
                                onClick={() => goToPage(link.url)}
                                className={`px-3 py-1 border rounded ${link.active ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                                disabled={!link.url}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
