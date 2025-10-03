
import { useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ViewButton from "@/Components/ViewButton";
import UpdateButton from "@/Components/UpdateButton";
import ApproveButton from "@/Components/ApproveButton";
import RejectButton from "@/Components/RejectButton";
import axios from "axios";

export default function ApprovedMember() {
    const { members, roles, titles, packages } = usePage().props;

    const [showForm, setShowForm] = useState(false);
    const [showPending, setShowPending] = useState(false);
    const [showSuspended, setShowSuspended] = useState(false);
    const [showModalSuspension, setShowModalSuspension] = useState(false)
    const [selectedMember, setSelectedMember] = useState(null);
    const [duration, setDuration] = useState("1week");

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [selectedRole, setSelectedRole] = useState(""); // form dropdown
    const [selectedTitle, setSelectedTitle] = useState("");
    const [selectedPackage, setSelectedPackage] = useState("");
    const [editId, setEditId] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);

    const [roleFilter, setRoleFilter] = useState(""); // table filter
    const [pendingMembers, setPendingMembers] = useState([]);
    const [suspendedMembers, setSuspendedMembers] = useState([]);
    const [showActions, setShowActions] = useState(false);

    // Filtered titles & packages based on selectedRole in form
    const filteredTitles = titles.filter(
        (title) => title.role_id === Number(selectedRole)
    );

    const filteredPackages = packages.filter(
        (pkg) => pkg.role_id === Number(selectedRole)
    );

    const fetchMembers = (pageUrl = null, roleId = roleFilter) => {
        const url = pageUrl || route("admin.members.allMembers");
        const params = roleId ? { role: roleId } : {};

        router.get(url, params, {
            preserveState: false,
            preserveScroll: true,
        });
    };

    const handleRoleFilter = (e) => {
        const selected = e.target.value;
        const roleParam = selected === "" ? null : selected;

        setRoleFilter(selected);

        router.get(route("admin.members.allMembers"), { role: roleParam }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const fetchPendingMembers = async () => {
        try {
            const response = await axios.get(route("admin.member.show"));
            setPendingMembers(response.data);
            setShowPending(true);
        } catch (error) {
            console.error("Error fetching pending members", error);
        }
    };

    const approveMember = (id) => {
        if (confirm("Are you sure you want to approve this member?")) {
            router.post(route("members.approve", id), {}, {
                onSuccess: () => setShowPending(false),
            });
        }
    };

    const rejectMember = (id) => {
        if (confirm("Are you sure you want to reject this member?")) {
            router.delete(route("members.reject", id), {
                onSuccess: () => setShowPending(false),
            });
        }
    };
     const fetchSuspendedMembers = async () => {
        try {
            const response = await axios.get(route("admin.member.showSuspended"));
            setSuspendedMembers(response.data);
            setShowSuspended(true);
        } catch (error) {
            console.error("Error fetching pending members", error);
        }
    };
     const openSuspendModal = () => {
        if (selectedIds.length === 0) {
            alert("Please select at least one member to suspend.");
            return;
        }
        setDuration("1week");
        setShowModalSuspension(true);
    };

      const suspendedMember = () => {
        if (selectedIds.length === 0) return;

        router.post(
            route("members.suspend"), // backend should accept multiple IDs
            { member_ids: selectedIds, duration },
            {
                onSuccess: () => {
                    setShowModalSuspension(false);
                    setSelectedIds([]);
                    fetchMembers(); // refresh
                },
            }
        );
    };

      const upliftMember = (id) => {
        if (confirm("Are you sure you want to uplift this member?")) {
            router.post(
                route("members.uplift", id),
                {},
                {
                    onSuccess: () => {
                        fetchSuspendedMembers(); // refresh suspended list
                    },
                }
            );
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const payload = {
            name,
            email,
            password,
            password_confirmation: passwordConfirmation,
            phone,
            address,
            role_id: Number(selectedRole),
            title_id: selectedTitle ? Number(selectedTitle) : null,
            package_id: selectedPackage ? Number(selectedPackage) : null,
        };
          // only include password if user typed one (for update)
        if (!editId || password) {
            payload.password = password;
            payload.password_confirmation = passwordConfirmation;
        }

        if (editId) {
            router.put(route("admin.members.update", editId), payload, {
                preserveScroll: true,
                onSuccess: () => {
                    resetForm();
                    fetchMembers(); // refresh table after update
                },
            });
        } else {
            router.post(route("admin.members.store"), payload, {
                onSuccess: () => resetForm(),
            });
        }
    };

    const resetForm = () => {
        setName("");
        setEmail("");
        setPassword("");
        setPasswordConfirmation("");
        setPhone("");
        setAddress("");
        setSelectedRole("");
        setSelectedTitle("");
        setSelectedPackage("");
        setEditId(null);
        setShowForm(false);
        setShowPending(false);
    };

    const editMember = (member) => {
        setEditId(member.id);
        setName(member.name);
        setEmail(member.email);
        setPhone(member.phone ?? "");
        setAddress(member.address ?? "");
        setSelectedRole(member.role_id ? String(member.role_id) : "");
        setSelectedTitle(member.title_id ? String(member.title_id) : "");
        setSelectedPackage(member.package_id ? String(member.package_id) : "");
        setPassword(""); // clear password
        setPasswordConfirmation(""); // clear password confirmation
        setShowForm(true);
    };

    const goToPage = (url) => {
        if (url) fetchMembers(url);
    };

    const Badge = ({ condition, trueText, falseText }) => (
        <span
            className={`px-2 py-1 text-xs rounded font-medium ${
                condition
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-600"
            }`}
        >
            {condition ? trueText : falseText}
        </span>
    );

    return (
        <AuthenticatedLayout>
            <Head title="Approved Members" />

            <div className="min-h-screen bg-slate-100">
                <div className="max-w-6xl mx-auto space-y-8 px-6 flex gap-4">
                    <div className={`flex-1 transition-all ${selectedMember ? "md:w-2/3" : "w-full"}`}>
                        {/* Page header */}
                       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-8 gap-3">
    <h2 className="text-5xl font-semibold text-gray-800">Approved Members</h2>
    <div className="flex gap-3">
        {/* Role Filter */}
        <div className="mb-4 flex items-center gap-4">
            <label className="font-medium">Filter by Role:</label>
            <select
                value={roleFilter}
                onChange={handleRoleFilter}
                className="border p-2 rounded"
            >
                <option value="">All Roles</option>
                {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                        {role.name}
                    </option>
                ))}
            </select>
        </div>

        {/* Dropdown Menu */}
        <div className="relative inline-block text-left">
            <div>
                <button
                    type="button"
                    className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none"
                    id="menu-button"
                    aria-expanded="true"
                    aria-haspopup="true"
                    onClick={() => setShowActions(!showActions)}
                >
                    Actions
                    <svg
                        className="-mr-1 ml-2 h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                    >
                        <path
                            fillRule="evenodd"
                            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.25 8.29a.75.75 0 01-.02-1.08z"
                            clipRule="evenodd"
                        />
                    </svg>
                </button>
            </div>

            {/* Dropdown Items */}
            {showActions && (
                <div
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="menu-button"
                >
                    <div className="py-1" role="none">
                        <button
                            disabled={selectedIds.length === 0}
                            onClick={openSuspendModal}
                            className="text-red-600 block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 disabled:opacity-50"
                            role="menuitem"
                        >
                            Suspend Selected
                        </button>
                        <button
                            onClick={fetchPendingMembers}
                            className="text-yellow-600 block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                            role="menuitem"
                        >
                            Pending List
                        </button>
                        <button
                            onClick={fetchSuspendedMembers}
                            className="text-yellow-600 block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                            role="menuitem"
                        >
                            Suspended List
                        </button>
                        <button
                            onClick={() => setShowForm(true)}
                            className="text-indigo-600 block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                            role="menuitem"
                        >
                            + Create Member
                        </button>
                    </div>
                </div>
            )}
        </div>
    </div>
</div>


                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto bg-white rounded-lg shadow-sm">
                            <h4 className="text-lg font-bold text-indigo-950 p-4">User List</h4>
                            <table className="w-full border-collapse">
                                <thead className="bg-gray-100 text-gray-700 text-xs uppercase tracking-wider">
                                    <tr>
                                        <th className="px-4 py-3 border text-center">
                                            <input
                                                type="checkbox"
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedIds(members.data.map(m => m.id));
                                                    } else {
                                                        setSelectedIds([]);
                                                    }
                                                }}
                                            />
                                        </th>
                                        <th className="px-4 py-3 border text-left">Name</th>
                                        <th className="px-4 py-3 border text-left">Email</th>
                                        <th className="px-4 py-3 border text-center">Role</th>
                                        <th className="px-4 py-3 border text-center">Title</th>
                                        <th className="px-4 py-3 border text-center">Status</th>
                                        <th className="px-4 py-3 border text-center">Payment</th>
                                        <th className="px-4 py-3 border text-left">Created By</th>
                                        <th className="px-4 py-3 border text-left">Date</th>
                                        <th className="px-4 py-3 border text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {members.data.length > 0 ? (
                                        members.data.map((member, index) => (
                                            <tr key={member.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-2 border text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIds.includes(member.id)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setSelectedIds([...selectedIds, member.id]);
                                                            } else {
                                                                setSelectedIds(selectedIds.filter(id => id !== member.id));
                                                            }
                                                        }}
                                                    />
                                                </td>
                                                <td className="px-4 py-2 border font-medium">{member.name}</td>
                                                <td className="px-4 py-2 border">{member.email}</td>
                                                <td className="px-4 py-2 border text-center">{member.roles?.join(", ") || "-"}</td>
                                                <td className="px-4 py-2 border text-center">{member.title || "-"}</td>
                                                <td className="px-4 py-2 border text-center">
                                                    <Badge condition={member.is_active} trueText="Approved" falseText="Pending" />
                                                </td>
               <                                td className="px-4 py-2 border text-center">{member.payment_status || "-"}</td>
                                                <td className="px-4 py-2 border text-center">{member.created_by ?? "registered"}</td>
                                                <td className="px-4 py-2 border text-center">{new Date(member.created_at).toLocaleDateString()}</td>
                                                <td className="px-4 py-2 border text-center space-x-2">
                                                    <ViewButton onClick={() => setSelectedMember(member)}>View</ViewButton>
                                                    <UpdateButton onClick={() => editMember(member)}>Edit</UpdateButton>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="10" className="text-center py-6 text-gray-500 border">No members found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="mt-6 flex justify-center gap-2">
                            {(members?.links || []).map((link, i) => (
                                <button
                                    key={i}
                                    disabled={!link.url}
                                    onClick={() => goToPage(link.url)}
                                    className={`px-3 py-1 text-sm rounded border transition ${link.active ? "bg-indigo-600 text-white" : "bg-white hover:bg-gray-100"} ${!link.url ? "opacity-50 cursor-not-allowed" : ""}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Slide Panel */}
                    {selectedMember && (
                        <div className="w-full md:w-1/3 bg-white rounded-xl shadow p-4 animate-slideIn">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-indigo-800">Member Info</h3>
                                <button className="text-gray-500 hover:text-red-500" onClick={() => setSelectedMember(null)}>✖</button>
                            </div>
                            <div className="space-y-2 text-sm">
                                <p><strong>Name:</strong> {selectedMember.name}</p>
                                <p><strong>Title:</strong> {selectedMember.title ?? "-"}</p>
                                <p><strong>Email:</strong> {selectedMember.email}</p>
                                <p><strong>Phone:</strong> {selectedMember.phone ?? "-"}</p>
                                <p><strong>Package:</strong> {selectedMember.package ?? "-"}</p>
                                <p><strong>Status:</strong> {selectedMember.is_active ? "Active" : "Inactive"}</p>
                                <p><strong>Payment:</strong> {selectedMember.payment_status ? "Paid" : "Unpaid"}</p>
                                <p><strong>Role:</strong> {selectedMember.roles?.join(", ") ?? "-"}</p>
                                <p><strong>Created By:</strong> {selectedMember.created_by ?? "registered"}</p>
                                <p><strong>Date:</strong> {new Date(selectedMember.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Pending Members Modal */}
            {showPending && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl p-6">
                        <h3 className="text-lg font-semibold mb-4">Pending Members</h3>
                        <table className="min-w-full text-sm border rounded">
                            <thead className="bg-gray-100 text-gray-700 text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="px-4 py-2 border">#</th>
                                    <th className="px-4 py-2 border">Name</th>
                                    <th className="px-4 py-2 border">Email</th>
                                    <th className="px-4 py-2 border">Status</th>
                                    <th className="px-4 py-2 border">Registered</th>
                                    <th className="px-4 py-2 border">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingMembers.length > 0 ? (
                                    pendingMembers.map((member, i) => (
                                        <tr key={member.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-2 border text-center">{i + 1}</td>
                                            <td className="px-4 py-2 border">{member.name}</td>
                                            <td className="px-4 py-2 border">{member.email}</td>
                                            <td className="px-4 py-2 border text-red-600 font-medium">Pending</td>
                                            <td className="px-4 py-2 border">{member.created_at}</td>
                                            <td className="px-4 py-2 border text-center space-x-2">
                                                <ApproveButton onClick={() => approveMember(member.id)} />
                                                <RejectButton onClick={() => rejectMember(member.id)} />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-6 text-gray-500 border">No pending members found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        <div className="flex justify-end mt-4">
                            <button onClick={() => setShowPending(false)} className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200">Close</button>
                        </div>
                    </div>
                </div>
            )}
            {showSuspended && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl p-6">
                        <h3 className="text-lg font-semibold mb-4">Supended Members</h3>
                        <table className="min-w-full text-sm border rounded">
                            <thead className="bg-gray-100 text-gray-700 text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="px-4 py-2 border">#</th>
                                    <th className="px-4 py-2 border">Name</th>
                                    <th className="px-4 py-2 border">Email</th>
                                    <th className="px-4 py-2 border">Status</th>
                                    <th className="px-4 py-2 border">Until</th>
                                    <th className="px-4 py-2 border">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {suspendedMembers.length > 0 ? (
                                    suspendedMembers.map((member, i) => (
                                        <tr key={member.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-2 border text-center">{i + 1}</td>
                                            <td className="px-4 py-2 border">{member.name}</td>
                                            <td className="px-4 py-2 border">{member.email}</td>
                                            <td className="px-4 py-2 border text-red-600 font-medium">Suspended</td>
                                            <td className="px-4 py-2 border">{member.suspended_until}</td>
                                            <td className="px-4 py-2 border text-center space-x-2">
                                                <ApproveButton onClick={() => upliftMember(member.id)} />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-6 text-gray-500 border">No Suspended members found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        <div className="flex justify-end mt-4">
                            <button onClick={() => setShowSuspended(false)} className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200">Close</button>
                        </div>
                    </div>
                </div>
            )}
            
            {showModalSuspension && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-96">
                        <h3 className="text-lg font-semibold mb-4">Suspend {selectedMember?.name}</h3>
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                            Suspension Duration
                        </label>
                        <select
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
                        >
                            <option value="1hour">1 Hour</option>
                            <option value="1day">1 Day</option>
                            <option value="1week">1 Week</option>
                            <option value="1month">1 Month</option>
                            <option value="3months">3 Months</option>
                            <option value="6months">6 Months</option>
                            <option value="permanent">Permanent</option>
                        </select>
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => setShowModalSuspension(false)}
                                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={suspendedMember}
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Add/Edit Form */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
                        <h3 className="text-lg font-semibold mb-4">{editId ? "Edit Member" : "Add Member"}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="border p-2 rounded w-full" required />
                            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="border p-2 rounded w-full" required />
                            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="border p-2 rounded w-full" required={!editId} />
                            <input type="password" placeholder="Confirm Password" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} className="border p-2 rounded w-full" required={!editId} />
                            <input type="text" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="border p-2 rounded w-full" />
                            <input type="text" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} className="border p-2 rounded w-full" />

                            <div>
                                <label className="block text-sm font-semibold mb-1">Role</label>
                                <select
                                    value={selectedRole}
                                    onChange={(e) => { setSelectedRole(e.target.value); setSelectedTitle(""); setSelectedPackage(""); }}
                                    className="border p-2 rounded w-full"
                                    required
                                >
                                    <option value="">Select Role</option>
                                    {roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
                                </select>
                            </div>

                            {filteredTitles.length > 0 && (
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Title</label>
                                    <select
                                        value={selectedTitle}
                                        onChange={(e) => setSelectedTitle(e.target.value)}
                                        className="border p-2 rounded w-full"
                                        required
                                        disabled={!selectedRole}
                                    >
                                        <option value="">Select Title</option>
                                        {filteredTitles.map((title) => <option key={title.id} value={title.id}>{title.name}</option>)}
                                    </select>
                                </div>
                            )}

                            {filteredPackages.length > 0 && (
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Package</label>
                                    <select
                                        value={selectedPackage}
                                        onChange={(e) => setSelectedPackage(e.target.value)}
                                        className="border p-2 rounded w-full"
                                        disabled={!selectedRole}
                                    >
                                        <option value="">Select Package</option>
                                        {filteredPackages.map((pkg) => <option key={pkg.id} value={pkg.id}>{pkg.name}</option>)}
                                    </select>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={resetForm} className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200">Cancel</button>
                                <button type="submit" className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white">{editId ? "Update" : "Add"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
