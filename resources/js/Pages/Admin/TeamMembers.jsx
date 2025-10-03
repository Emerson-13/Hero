import { useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ViewButton from "@/Components/ViewButton";
import UpdateButton from "@/Components/UpdateButton";

export default function TeamMembers() {
    const { teamMembers, roles } = usePage().props;

    const [showForm, setShowForm] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null); // ✅ Slide panel state

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [selectedRole, setSelectedRole] = useState("");
    const [editId, setEditId] = useState(null);
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");

    const resetForm = () => {
        setName("");
        setEmail("");
        setPhone("");
        setAddress("");
        setSelectedRole("");
        setEditId(null);
        setShowForm(false);
        setPassword("");
        setPasswordConfirmation("");
    };

    const submitUser = (e) => {
        e.preventDefault();
        const payload = {
            name,
            email,
            phone,
            address,
            role: selectedRole,
            password,
            password_confirmation: passwordConfirmation,
        };
        if (editId) {
            router.put(route("admin.team-members.update", editId), payload);
        } else {
            router.post(route("admin.TeamStore.Members"), payload);
        }
        resetForm();
    };

    const editMember = (member) => {
        setEditId(member.id);
        setName(member.name);
        setEmail(member.email);
        setPhone(member.phone ?? "");
        setAddress(member.address ?? "");
        setSelectedRole(member.roles?.[0] ?? "");
        setShowForm(true);
    };

    const goToPage = (url) => {
        if (url) router.get(url);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Team Members" />

            <div className=" min-h-screen bg-slate-100">
                <div className="max-w-6xl mx-auto space-y-8 px-6 flex gap-4">
                    {/* Main Content (Table + Cards) */}
                    <div className={`flex-1 transition-all ${selectedMember ? "md:w-2/3" : "w-full"}`}>
                        {/* Page header */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-8 gap-3">
                            <h2 className="text-5xl font-semibold text-gray-800">
                                Team Members
                            </h2>
                            <div className="flex gap-3">
                                <button
                                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg shadow text-sm"
                                    onClick={() => setShowForm(true)}
                                >
                                    + Add Team Member
                                </button>
                            </div>
                        </div>

                        {/* Desktop Table */}
                       <div className="hidden md:block overflow-x-auto bg-white rounded-lg shadow-sm">
                        <h4 className="text-lg font-bold text-indigo-950 p-4">
                            Team List
                        </h4>
                            <table className="w-full border-collapse">
                                <thead className="bg-gray-100 text-gray-700 text-xs uppercase tracking-wider">
                                    <tr>
                                        <th className="px-4 py-3 border">#</th>
                                        <th className="px-4 py-3 border text-left">Name</th>
                                        <th className="px-4 py-3 border text-left">Email</th>
                                        <th className="px-4 py-3 border text-left">Phone</th>
                                        <th className="px-4 py-3 border text-left">Address</th>
                                        <th className="px-4 py-3 border text-left">Role</th>
                                        <th className="px-4 py-3 border text-left">Date Added</th>
                                        <th className="px-4 py-3 border text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(teamMembers?.data || []).length > 0 ? (
                                        teamMembers.data.map((member, index) => (
                                            <tr key={member.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-2 border text-center">{index + 1}</td>
                                                <td className="px-4 py-2 border">{member.name}</td>
                                                <td className="px-4 py-2 border">{member.email}</td>
                                                <td className="px-4 py-2 border">{member.phone ?? "-"}</td>
                                                <td className="px-4 py-2 border">{member.address ?? "-"}</td>
                                                <td className="px-4 py-2 border">{member.roles?.[0] ?? "-"}</td>
                                                <td className="px-4 py-2 border">
                                                    {new Date(member.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-2 border text-center space-x-2">
                                                    <ViewButton onClick={() => setSelectedMember(member)}>
                                                        View
                                                    </ViewButton>
                                                    <UpdateButton onClick={() => editMember(member)}>
                                                        Edit
                                                    </UpdateButton>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="8" className="text-center py-6 text-gray-500 border">
                                                No team members found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden grid grid-cols-1 gap-4 mt-4">
                            {(teamMembers?.data || []).length > 0 ? (
                                teamMembers.data.map((member, index) => (
                                    <div key={member.id} className="rounded-lg shadow p-4 border bg-white">
                                        <p><strong>#:</strong> {index + 1}</p>
                                        <p><strong>Name:</strong> {member.name}</p>
                                        <p><strong>Email:</strong> {member.email}</p>
                                        <p><strong>Phone:</strong> {member.phone ?? "-"}</p>
                                        <p><strong>Address:</strong> {member.address ?? "-"}</p>
                                        <p><strong>Role:</strong> {member.roles?.[0] ?? "-"}</p>
                                        <p><strong>Date Added:</strong> {new Date(member.created_at).toLocaleDateString()}</p>
                                        <div className="flex gap-2 mt-3">
                                            <ViewButton onClick={() => setSelectedMember(member)} className="flex-1">
                                                View
                                            </ViewButton>
                                            <UpdateButton onClick={() => editMember(member)} className="flex-1">
                                                Edit
                                            </UpdateButton>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-600">No team members found</p>
                            )}
                        </div>

                        {/* Pagination */}
                        <div className="mt-6 flex justify-center gap-2">
                            {(teamMembers?.links || []).map((link, i) => (
                                <button
                                    key={i}
                                    disabled={!link.url}
                                    onClick={() => goToPage(link.url)}
                                    className={`px-3 py-1 text-sm rounded border transition ${
                                        link.active
                                            ? "bg-indigo-600 text-white"
                                            : "bg-white hover:bg-gray-100"
                                    } ${!link.url ? "opacity-50 cursor-not-allowed" : ""}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Slide Panel (View Member) */}
                    {selectedMember && (
                        <div className="w-full md:w-1/3 bg-white rounded-xl shadow p-4 animate-slideIn">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-indigo-800">Member Info</h3>
                                <button
                                    className="text-gray-500 hover:text-red-500"
                                    onClick={() => setSelectedMember(null)}
                                >
                                    ✖
                                </button>
                            </div>
                            <div className="space-y-2 text-sm">
                                <p><strong>Name:</strong> {selectedMember.name}</p>
                                <p><strong>Email:</strong> {selectedMember.email}</p>
                                <p><strong>Phone:</strong> {selectedMember.phone ?? "-"}</p>
                                <p><strong>Address:</strong> {selectedMember.address ?? "-"}</p>
                                <p><strong>Role:</strong> {selectedMember.roles?.[0] ?? "-"}</p>
                                <p><strong>Date Added:</strong> {new Date(selectedMember.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Form */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
                        <h3 className="text-lg font-semibold mb-4">
                            {editId ? "Edit Team Member" : "Add Team Member"}
                        </h3>
                        <form onSubmit={submitUser} className="space-y-4">
                            <input
                                type="text"
                                placeholder="Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="border p-2 rounded w-full"
                                required
                            />
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="border p-2 rounded w-full"
                                required
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="border p-2 rounded w-full"
                                required={!editId}
                            />
                            <input
                                type="password"
                                placeholder="Confirm Password"
                                value={passwordConfirmation}
                                onChange={(e) => setPasswordConfirmation(e.target.value)}
                                className="border p-2 rounded w-full"
                                required={!editId}
                            />
                            <input
                                type="text"
                                placeholder="Phone"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="border p-2 rounded w-full"
                            />
                            <input
                                type="text"
                                placeholder="Address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="border p-2 rounded w-full"
                            />

                            <div>
                                <label className="block text-sm font-semibold mb-1">Role</label>
                                <select
                                    value={selectedRole}
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                    className="border p-2 rounded w-full"
                                    required
                                >
                                    <option value="">Select Role</option>
                                    {(roles || []).map((role) => (
                                        <option key={role.id} value={role.name}>
                                            {role.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white"
                                >
                                    {editId ? "Update" : "Add"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
