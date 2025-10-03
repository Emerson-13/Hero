import React, { useState } from "react";
import { useForm, Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function RoleIndex({ roles, permissions }) {
  const { data, setData, post, processing, reset, errors } = useForm({
    role_id: "",
    permissions: [],
  });

  const [showForm, setShowForm] = useState(false);

  // 🔹 When selecting a role, preload its permissions
  const handleRoleChange = (roleId) => {
    setData("role_id", roleId);

    if (roleId) {
      const selectedRole = roles.find((r) => r.id == roleId);
      if (selectedRole) {
        setData("permissions", selectedRole.permissions.map((p) => p.name));
      }
    } else {
      setData("permissions", []); // reset if no role selected
    }
  };

  const handleCheckboxChange = (perm) => {
    if (data.permissions.includes(perm)) {
      setData(
        "permissions",
        data.permissions.filter((p) => p !== perm)
      );
    } else {
      setData("permissions", [...data.permissions, perm]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route("roles.updatePermissions"), {
      onSuccess: () => {
        reset();
        setShowForm(false);
      },
    });
  };

  return (
    <AuthenticatedLayout>
      <Head title="Role Management" />

      <div className="py-10 min-h-screen bg-gray-100">
        <div className="max-w-6xl mx-auto space-y-8 px-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-5xl font-semibold text-gray-800">
              Role Management
            </h1>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg shadow-sm transition"
            >
              {showForm ? "Cancel" : "Manage Permission"}
            </button>
          </div>

          {/* Roles Table */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">
                    Role
                  </th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">
                    Permissions
                  </th>
                </tr>
              </thead>
              <tbody>
                {roles.map((role, idx) => (
                  <tr
                    key={role.id}
                    className={`border-t hover:bg-gray-50 ${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="p-3 font-medium text-gray-800">
                      {role.name}
                    </td>
                    <td className="p-3">
                      {role.permissions.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {role.permissions.map((perm) => (
                            <span
                              key={perm.id}
                              className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium"
                            >
                              {perm.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">
                          No permissions
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Manage Permissions Form */}
          {showForm && (
            <div className="bg-white shadow rounded-lg p-6 border">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                Manage Role Permissions
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Select Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Role
                  </label>
                  <select
                    value={data.role_id || ""}
                    onChange={(e) => handleRoleChange(e.target.value)}
                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">-- Select a Role --</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                  {errors.role_id && (
                    <p className="text-red-600 text-sm mt-1">{errors.role_id}</p>
                  )}
                </div>

                {/* Permissions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assign Permissions
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {permissions.map((perm) => (
                      <label
                        key={perm.id}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="checkbox"
                          checked={data.permissions.includes(perm.name)}
                          onChange={() => handleCheckboxChange(perm.name)}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-gray-700">{perm.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <div>
                  <button
                    type="submit"
                    disabled={processing}
                    className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg shadow-sm transition disabled:opacity-50"
                  >
                    {processing ? "Saving..." : "Update Permissions"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
