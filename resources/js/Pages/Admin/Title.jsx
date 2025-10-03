import React, { useState } from "react";
import { useForm, Head } from "@inertiajs/react";
import DeleteButton from "@/Components/DeleteButton";
import UpdateButton from "@/Components/UpdateButton";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function Title({ titles, roles }) {
  const { data, setData, post, put, delete: destroy, processing, reset, errors } = useForm({
    id: "",
    name: "",
    role_id: "",
  });

  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (data.id) {
      put(route("titles.update", data.id), {
        onSuccess: () => {
          reset();
          setShowForm(false);
        },
      });
    } else {
      post(route("titles.store"), {
        onSuccess: () => {
          reset();
          setShowForm(false);
        },
      });
    }
  };

  const handleEdit = (title) => {
    setData({ id: title.id, name: title.name, role_id: title.role_id });
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this title?")) {
      destroy(route("titles.destroy", id));
    }
  };

  return (
    <AuthenticatedLayout>
      <Head title="Title Management" />

      <div className="py-10 min-h-screen bg-gray-100">
        <div className="max-w-6xl mx-auto space-y-8 px-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-5xl font-semibold text-gray-800">Title Management</h1>
            <button
              onClick={() => {
                reset();
                setShowForm(!showForm);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg shadow-sm transition"
            >
              {showForm ? "Cancel" : "Add Title"}
            </button>
          </div>

          {/* Titles Table */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Title</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Role</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {titles.map((title, idx) => (
                  <tr
                    key={title.id}
                    className={`border-t hover:bg-gray-50 ${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="p-3 font-medium text-gray-800">{title.name}</td>
                    <td className="p-3">{title.role?.name || "No role"}</td>
                    <td className="p-3 space-x-3">
                      <UpdateButton
                        onClick={() => handleEdit(title)}
                        className="text-indigo-600 hover:underline"
                      >
                        Edit
                      </UpdateButton>
                      <DeleteButton
                        onClick={() => handleDelete(title.id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </DeleteButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Manage Title Form */}
          {showForm && (
            <div className="bg-white shadow rounded-lg p-6 border">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                {data.id ? "Edit Title" : "Add Title"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title Name
                  </label>
                  <input
                    type="text"
                    value={data.name}
                    onChange={(e) => setData("name", e.target.value)}
                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  {errors.name && (
                    <p className="text-red-600 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                {/* Select Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Role
                  </label>
                  <select
                    value={data.role_id || ""}
                    onChange={(e) => setData("role_id", e.target.value)}
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

                {/* Submit Button */}
                <div>
                  <button
                    type="submit"
                    disabled={processing}
                    className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg shadow-sm transition disabled:opacity-50"
                  >
                    {processing ? "Saving..." : data.id ? "Update Title" : "Create Title"}
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
