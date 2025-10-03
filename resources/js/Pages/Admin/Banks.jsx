// resources/js/Pages/Admin/Banks.jsx
import { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import UpdateButton from "@/Components/UpdateButton";
import DeleteButton from "@/Components/DeleteButton";

export default function Banks({ banks = [] }) {
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [bankName, setBankName] = useState("");
    const [accountName, setAccountName] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [instructions, setInstructions] = useState("");
    const [qrCode, setQrCode] = useState(null);

    const resetForm = () => {
        setEditId(null);
        setBankName("");
        setAccountName("");
        setAccountNumber("");
        setInstructions("");
        setQrCode(null);
        setShowForm(false);
    };

    const submitBank = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("bank_name", bankName);
        formData.append("account_name", accountName);
        formData.append("account_number", accountNumber);
        formData.append("instructions", instructions);
        if (qrCode) formData.append("qr_code", qrCode);

        if (editId) {
            router.post(route("admin.banks.update", editId), formData, {
                forceFormData: true,
                _method: "PUT",
                onSuccess: () => resetForm(),
            });
        } else {
            router.post(route("admin.banks.store"), formData, {
                forceFormData: true,
                onSuccess: () => resetForm(),
            });
        }
    };

    const editBank = (bank) => {
        setEditId(bank.id);
        setBankName(bank.bank_name);
        setAccountName(bank.account_name);
        setAccountNumber(bank.account_number);
        setInstructions(bank.instructions || "");
        setQrCode(null);
        setShowForm(true);
    };

    const deleteBank = (id) => {
        if (confirm("Are you sure you want to delete this bank?")) {
            router.delete(route("admin.banks.destroy", id));
        }
    };


    return (
        <AuthenticatedLayout>
            <Head title="Banks" />

            <div className="py-10 min-h-screen bg-slate-100">
                <div className="max-w-6xl mx-auto space-y-8 px-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <h2 className="text-5xl font-semibold text-gray-800">
                            Manage Banks
                        </h2>
                    <div className="flex gap-3">
                        <button
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow text-sm"
                            onClick={() => setShowForm(true)}
                        >
                            + Create Bank
                        </button>
                    </div>
                    </div>
                    {/* Table (Desktop) */}
                    <div className="hidden md:block overflow-x-auto bg-white rounded-lg shadow-sm">
                        <h4 className="text-lg font-bold text-indigo-950 p-4">
                            Bank Accounts
                        </h4>
                        <table className="min-w-full border border-gray-300 bg-white rounded-lg shadow-sm">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="px-4 py-2 border">#</th>
                                    <th className="px-4 py-2 border">Bank</th>
                                    <th className="px-4 py-2 border">
                                        Account Name
                                    </th>
                                    <th className="px-4 py-2 border">
                                        Account Number
                                    </th>
                                    <th className="px-4 py-2 border">QR</th>
                                    <th className="px-4 py-2 border text-center">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {banks.length > 0 ? (
                                    banks.map((bank, index) => (
                                        <tr
                                            key={bank.id}
                                            className={
                                                index % 2 === 0
                                                    ? "bg-white hover:bg-gray-50"
                                                    : "bg-gray-50 hover:bg-gray-100"
                                            }
                                        >
                                            <td className="px-4 py-2 border">
                                                {index + 1}
                                            </td>
                                            <td className="px-4 py-2 border font-medium">
                                                {bank.bank_name}
                                            </td>
                                            <td className="px-4 py-2 border">
                                                {bank.account_name}
                                            </td>
                                            <td className="px-4 py-2 border">
                                                {bank.account_number}
                                            </td>
                                            <td className="px-4 py-2 border">
                                                {bank.qr_code && (
                                                    <img
                                                        src={`/storage/${bank.qr_code}`}
                                                        alt="QR"
                                                        className="w-16 h-16 mx-auto object-contain"
                                                    />
                                                )}
                                            </td>
                                            <td className="px-4 py-2 border text-center space-x-2">
                                                <UpdateButton
                                                    onClick={() => editBank(bank)}
                                                >
                                                    Edit
                                                </UpdateButton>
                                                <DeleteButton
                                                    onClick={() =>
                                                        deleteBank(bank.id)
                                                    }
                                                >
                                                    Delete
                                                </DeleteButton>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="6"
                                            className="text-center py-4 text-gray-500 border"
                                        >
                                            No banks found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Card Layout (Mobile) */}
                    <div className="md:hidden">
                        <div className="grid grid-cols-1 gap-4">
                            {banks.length > 0 ? (
                                banks.map((bank, index) => (
                                    <div
                                        key={bank.id}
                                        className={`rounded-lg shadow-sm p-4 border ${
                                            index % 2 === 0
                                                ? "bg-white"
                                                : "bg-gray-50"
                                        }`}
                                    >
                                        <div className="flex justify-between items-center mb-2">
                                            <h4 className="text-lg font-semibold text-indigo-900">
                                                {bank.bank_name}
                                            </h4>
                                            <span className="text-sm text-gray-500">
                                                #{index + 1}
                                            </span>
                                        </div>
                                        <p className="text-gray-700">
                                            <strong>👤 Account Name:</strong>{" "}
                                            {bank.account_name}
                                        </p>
                                        <p className="text-gray-700">
                                            <strong>🏦 Account Number:</strong>{" "}
                                            {bank.account_number}
                                        </p>
                                        {bank.qr_code && (
                                            <img
                                                src={`/storage/${bank.qr_code}`}
                                                alt="QR"
                                                className="w-24 h-24 mt-2 border rounded object-contain"
                                            />
                                        )}
                                        <div className="flex gap-2 mt-4">
                                            <UpdateButton
                                                onClick={() => editBank(bank)}
                                                className="flex-1"
                                            >
                                                Edit
                                            </UpdateButton>
                                            <DeleteButton
                                                onClick={() =>
                                                    deleteBank(bank.id)
                                                }
                                                className="flex-1"
                                            >
                                                Delete
                                            </DeleteButton>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-600">
                                    No banks found
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Form */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6">
                        <h3 className="text-xl font-bold mb-4">
                            {editId ? "Edit Bank" : "Add Bank"}
                        </h3>
                        <form
                            onSubmit={submitBank}
                            className="space-y-4"
                            encType="multipart/form-data"
                        >
                            <input
                                type="text"
                                placeholder="Bank Name"
                                value={bankName}
                                onChange={(e) => setBankName(e.target.value)}
                                className="border p-2 rounded w-full"
                                required
                            />
                            <input
                                type="text"
                                placeholder="Account Name"
                                value={accountName}
                                onChange={(e) =>
                                    setAccountName(e.target.value)
                                }
                                className="border p-2 rounded w-full"
                                required
                            />
                            <input
                                type="text"
                                placeholder="Account Number"
                                value={accountNumber}
                                onChange={(e) =>
                                    setAccountNumber(e.target.value)
                                }
                                className="border p-2 rounded w-full"
                                required
                            />
                            <textarea
                                placeholder="Instructions"
                                value={instructions}
                                onChange={(e) =>
                                    setInstructions(e.target.value)
                                }
                                className="border p-2 w-full rounded"
                            />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setQrCode(e.target.files[0])}
                                className="w-full"
                            />

                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    {editId ? "Update" : "Create"}
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
