// resources/js/Pages/Admin/ManageMembers.jsx
import { Head, router, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ApproveButton from "@/Components/ApproveButton";
import RejectButton from "@/Components/RejectButton";

export default function PendingMembers() {
    const { pendingMembers } = usePage().props;

    const approveMember = (id) => {
        if (confirm("Are you sure you want to approve this member?")) {
            router.post(route("members.approve", id));
        }
    };

    const rejectMember = (id) => {
        if (confirm("Are you sure you want to reject this member?")) {
            router.delete(route("members.reject", id));
        }
    };

    const goToPage = (url) => {
        if (url) router.get(url);
    };

    // 🔹 Shared Subheader
    const Subheader = () => (
        <div className="bg-indigo-50 px-4 py-3 flex flex-col sm:flex-row items-center rounded-t-lg gap-2">
            <h4 className="text-lg font-bold text-indigo-950 whitespace-nowrap">
                Pending Members List
            </h4>

            <p className="text-sm text-gray-600 whitespace-nowrap mt-2 sm:mt-0 sm:ml-auto">
                  Manage members waiting for approval
            </p>
        </div>
    );

    return (
        <AuthenticatedLayout>
            <Head title="Manage Members" />

            <div className="py-5 min-h-screen bg-slate-100">
                <div className="max-w-6xl mx-auto space-y-7">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4">
                    <h2 className="text-2xl mt-5 font-bold text-indigo-900">
                      Pending Members
                   </h2>
                   </div>
                    {/* Table view (desktop) */}
                    <div className="hidden md:block overflow-x-auto bg-white rounded-lg shadow-sm">
                        <table className="min-w-full border border-gray-300 bg-white rounded-lg shadow-sm">
                            <thead>
                                {/* 🔹 Column Headers */}
                                <tr className="bg-gray-100">
                                    <th className="px-4 py-2 border">#</th>
                                    <th className="px-4 py-2 border">Name</th>
                                    <th className="px-4 py-2 border">Email</th>
                                    <th className="px-4 py-2 border">Phone</th>
                                    <th className="px-4 py-2 border">Address</th>
                                    <th className="px-4 py-2 border">Date Registered</th>
                                    <th className="px-4 py-2 border text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingMembers.data.length > 0 ? (
                                    pendingMembers.data.map((member, index) => (
                                        <tr
                                            key={member.id}
                                            className={
                                                index % 2 === 0
                                                    ? "bg-white hover:bg-gray-50"
                                                    : "bg-gray-50 hover:bg-gray-100"
                                            }
                                        >
                                            <td className="px-4 py-2 border">{index + 1}</td>
                                            <td className="px-4 py-2 border">{member.name}</td>
                                            <td className="px-4 py-2 border">{member.email}</td>
                                            <td className="px-4 py-2 border">{member.phone ?? "-"}</td>
                                            <td className="px-4 py-2 border">{member.address ?? "-"}</td>
                                            <td className="px-4 py-2 border">
                                                {new Date(member.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-2 border text-center space-x-2">
                                                <ApproveButton onClick={() => approveMember(member.id)} />
                                                <RejectButton onClick={() => rejectMember(member.id)} />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="7"
                                            className="text-center py-4 text-gray-500 border"
                                        >
                                            No pending members found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Card view (mobile) */}
                    <div className="md:hidden">
                        <div className="grid grid-cols-1 gap-4">
                            {pendingMembers.data.length > 0 ? (
                                pendingMembers.data.map((member, index) => (
                                    <div
                                        key={member.id}
                                        className={`rounded-lg shadow-sm p-4 border ${
                                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                                        }`}
                                    >
                                        <p><strong>#:</strong> {index + 1}</p>
                                        <p><strong>Name:</strong> {member.name}</p>
                                        <p><strong>Email:</strong> {member.email}</p>
                                        <p><strong>Phone:</strong> {member.phone ?? "-"}</p>
                                        <p><strong>Address:</strong> {member.address ?? "-"}</p>
                                        <p>
                                            <strong>Date Registered:</strong>{" "}
                                            {new Date(member.created_at).toLocaleDateString()}
                                        </p>

                                        <div className="flex gap-2 mt-3">
                                            <ApproveButton
                                                onClick={() => approveMember(member.id)}
                                                className="flex-1"
                                            />
                                            <RejectButton
                                                onClick={() => rejectMember(member.id)}
                                                className="flex-1"
                                            />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-600">
                                    No pending members found
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Pagination */}
                    <div className="mt-4 flex justify-center space-x-2">
                        {pendingMembers.links.map((link, i) => (
                            <button
                                key={i}
                                disabled={!link.url}
                                onClick={() => goToPage(link.url)}
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
