// resources/js/Pages/Admin/PaymentIndex.jsx
import React from "react";
import { Head, router, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ApproveButton from "@/Components/ApproveButton";
import RejectButton from "@/Components/RejectButton";

export default function PaymentIndex() {
    const { payments } = usePage().props;

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

    const updateStatus = (id, status) => {
        router.put(route("admin.payments.updateStatus", id), { status });
    };

    const goToPage = (url) => {
        if (url) router.get(url);
    };

  
    return (
        <AuthenticatedLayout>
            <Head title="Payments" />

            <div className="py-10 min-h-screen bg-slate-100">
                <div className="max-w-6xl mx-auto space-y-8 px-6">
                    <h2 className="text-5xl font-semibold text-gray-800">
                        Payments
                    </h2>

                    {/* ✅ Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto bg-white rounded-lg shadow-sm">
                        <h4 className="text-lg font-bold text-indigo-950 p-4">
                            Payment List
                        </h4>
                        <table className="w-full border border-gray-300 bg-white rounded-lg shadow-sm text-sm">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="p-2 border">ID</th>
                                    <th className="p-2 border">User</th>
                                    <th className="p-2 border">Package</th>
                                    <th className="p-2 border">Price</th>
                                    <th className="p-2 border">Amount</th>
                                    <th className="p-2 border">Method</th>
                                    <th className="p-2 border">Bank</th>
                                    <th className="p-2 border">Transaction #</th>
                                    <th className="p-2 border">Proof</th>
                                    <th className="p-2 border">Status</th>
                                    <th className="p-2 border">Date</th>
                                    <th className="p-2 border text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.data.length > 0 ? (
                                    payments.data.map((payment, index) => (
                                        <tr
                                            key={payment.id}
                                            className={
                                                index % 2 === 0
                                                    ? "bg-white hover:bg-gray-50"
                                                    : "bg-gray-50 hover:bg-gray-100"
                                            }
                                        >
                                            <td className="p-2 border">{payment.id}</td>
                                            <td className="p-2 border">{payment.user?.name}</td>
                                            <td className="p-2 border">
                                                {payment.user.package?.name || "N/A"}
                                            </td>
                                            <td className="p-2 border">
                                                {payment.user?.package?.price
                                                    ? "₱" + payment.user.package.price
                                                    : "N/A"}
                                            </td>
                                            <td className="p-2 border">{payment.amount}</td>
                                            <td className="p-2 border">{payment.payment_method}</td>
                                            <td className="p-2 border">{payment.bank_name || "N/A"}</td>
                                            <td className="p-2 border">{payment.transaction_number || "N/A"}</td>
                                            <td className="p-2 border">
                                                {payment.proof_image && (
                                                    <a
                                                        href={`/storage/${payment.proof_image}`}
                                                        target="_blank"
                                                        className="text-blue-600 underline"
                                                    >
                                                        View
                                                    </a>
                                                )}
                                            </td>
                                            <td className="p-2 border capitalize">{payment.status}</td>
                                            <td className="p-2 border">{formatDate(payment.created_at)}</td>
                                            <td className="p-2 border text-center space-x-2">
                                              {payment.status === "pending" && (
                                                    <>
                                                        <ApproveButton
                                                            onClick={() => updateStatus(payment.id, "paid")}
                                                            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-xs"
                                                        >
                                                            Approve
                                                        </ApproveButton>
                                                        <RejectButton
                                                            onClick={() => updateStatus(payment.id, "rejected")}
                                                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-xs"
                                                        >
                                                            Reject
                                                        </RejectButton>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="12" className="text-center py-4 text-gray-500 border">
                                            No payments found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* ✅ Mobile Card View */}
                    <div className="md:hidden">
                        <div className="grid grid-cols-1 gap-4">
                            {payments.data.length > 0 ? (
                                payments.data.map((payment, index) => (
                                    <div
                                        key={payment.id}
                                        className={`rounded-lg shadow-sm p-4 border ${
                                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                                        }`}
                                    >
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-bold">
                                                {payment.user?.name || "Unknown User"}
                                            </span>
                                            <span
                                                className={`px-2 py-1 text-xs rounded capitalize ${
                                                    payment.status === "paid"
                                                        ? "bg-green-200 text-green-800"
                                                        : payment.status === "rejected"
                                                        ? "bg-red-200 text-red-800"
                                                        : "bg-yellow-200 text-yellow-800"
                                                }`}
                                            >
                                                {payment.status}
                                            </span>
                                        </div>
                                        <p><strong>Package:</strong> {payment.user.package?.name || "N/A"}</p>
                                        <p>{payment.user?.package?.price ? "₱" + payment.user.package.price : "N/A"}</p>
                                        <p><strong>Amount:</strong> {payment.amount}</p>
                                        <p><strong>Method:</strong> {payment.payment_method}</p>
                                        <p><strong>Bank:</strong> {payment.bank_name || "N/A"}</p>
                                        <p><strong>Transaction #:</strong> {payment.transaction_number || "N/A"}</p>
                                        {payment.proof_image && (
                                            <p>
                                                <a
                                                    href={`/storage/${payment.proof_image}`}
                                                    target="_blank"
                                                    className="text-blue-600 underline"
                                                >
                                                    View Proof
                                                </a>
                                            </p>
                                        )}
                                        <p><strong>Date:</strong> {formatDate(payment.created_at)}</p>

                                        <div className="flex gap-2 mt-3">
                                           {payment.status === "pending" && (
                                                <div className="flex gap-2 mt-3">
                                                    <ApproveButton
                                                        onClick={() => updateStatus(payment.id, "paid")}
                                                        className="flex-1 bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 text-sm"
                                                    >
                                                        Approve
                                                    </ApproveButton>
                                                    <RejectButton
                                                        onClick={() => updateStatus(payment.id, "rejected")}
                                                        className="flex-1 bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 text-sm"
                                                    >
                                                        Reject
                                                    </RejectButton>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-600">No payments found</p>
                            )}
                        </div>
                    </div>

                    {/* ✅ Pagination */}
                    <div className="mt-4 flex justify-center space-x-2">
                        {payments.links.map((link, i) => (
                            <button
                                key={i}
                                disabled={!link.url}
                                onClick={() => goToPage(link.url)}
                                className={`px-3 py-1 border rounded ${
                                    link.active ? "bg-blue-500 text-white" : "bg-gray-200"
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
