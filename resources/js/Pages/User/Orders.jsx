// resources/js/Pages/Admin/OrderIndex.jsx
import React, { useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function Orders() {
    const { orders } = usePage().props;

    const [showModal, setShowModal] = useState(false);
    const [showAllModal, setShowAllModal] = useState(false);
    const [modalData, setModalData] = useState(null);

    // ✅ Search and Export states
    const [search, setSearch] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

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

    const goToPage = (url) => {
        if (url) router.get(url);
    };

    // Fetch Items Modal
    const fetchOrderDetails = async (orderId) => {
        try {
            const res = await fetch(route("orders.showDetails", orderId));
            const data = await res.json();
            setModalData(data);
            setShowModal(true);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Orders" />

            <div className="py-10 min-h-screen bg-slate-100">
                <div className="max-w-6xl mx-auto space-y-8 px-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <h2 className="text-5xl font-semibold text-gray-800">
                            Orders
                        </h2>
                    </div>

                    {/* Export Panel */}
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            📤 Export Transactions to CSV
                        </h3>
                        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    From
                                </label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="border border-gray-300 rounded-md px-4 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    To
                                </label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="border border-gray-300 rounded-md px-4 py-2"
                                />
                            </div>
                            <div className="pt-1">
                                <a
                                    href={route("orders.export.csv", {
                                        ...(startDate ? { from: startDate } : {}),
                                        ...(endDate ? { to: endDate } : {}),
                                    })}
                                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                                >
                                    Export CSV
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Search Panel */}
                    <div>
                        <input
                            type="text"
                            placeholder="Search orders"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    router.get(route("orders.index.item"), { search }, { preserveState: true });
                                }
                            }}
                            className="w-full border border-gray-300 rounded-md px-4 py-2"
                        />
                    </div>

                    {/* Orders Table */}
                    <div className="overflow-x-auto rounded-lg border shadow-sm mb-6">
                        <table className="min-w-full border border-gray-300 rounded-lg shadow-sm">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="p-2 border">ID</th>
                                    <th className="p-2 border">Items</th>
                                    <th className="p-2 border">Total</th>
                                    <th className="p-2 border">Status</th>
                                    <th className="p-2 border">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.data.length > 0 ? (
                                    orders.data.map((order, index) => (
                                        <tr
                                            key={order.id}
                                            className={
                                                index % 2 === 0
                                                    ? "bg-white hover:bg-gray-50"
                                                    : "bg-gray-50 hover:bg-gray-100"
                                            }
                                        >
                                            <td className="p-2 border">{order.id}</td>
                                            <td
                                                className="p-2 border text-blue-600 underline cursor-pointer"
                                                onClick={() => fetchOrderDetails(order.id)}
                                                >
                                                View Order ({order.items_count > 0 ? order.items_count + " items" : order.menus_count + " menus"})
                                            </td>
                                            <td className="p-2 border">₱{order.total_price}</td>
                                            <td className="p-2 border capitalize">{order.status}</td>
                                            <td className="p-2 border">
                                                {formatDate(order.created_at)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center py-4 text-gray-500 border">
                                            No orders found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="mt-4 flex justify-center space-x-2">
                        {orders.links.map((link, i) => (
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

            {/* Show Items Modal */}
            {showModal && modalData && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6">
                        <h3 className="text-xl font-bold mb-4">Order Items</h3>
                        <ul className="space-y-2">
                            {modalData.items?.length > 0 && (
                            <div>
                                <h3 className="font-bold">Items</h3>
                                <ul>
                                {modalData.items.map(i => (
                                    <li key={i.id}>{i.item?.name} - Qty: {i.quantity}</li>
                                ))}
                                </ul>
                            </div>
                            )}

                            {modalData.menus?.length > 0 && (
                            <div>
                                <h3 className="font-bold">Menus</h3>
                                <ul>
                                {modalData.menus.map(m => (
                                    <li key={m.id}>
                                    {m.menu?.name} - Qty: {m.quantity}
                                    <ul className="ml-4">
                                        {m.menu?.ingredients?.map(ing => (
                                        <li key={ing.id}>
                                            {ing.name} ({ing.pivot.quantity})
                                        </li>
                                        ))}
                                    </ul>
                                    </li>
                                ))}
                                </ul>
                            </div>
                            )}
                        </ul>
                        <button
                            onClick={() => setShowModal(false)}
                            className="mt-4 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
