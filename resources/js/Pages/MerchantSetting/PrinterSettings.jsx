import React, { useState, useEffect } from 'react';
import { router, Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton';

export default function PrinterSettings({ printer, printers, flash, errors: serverErrors }) {
  const [name, setName] = useState('');
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [printerToUpdate, setPrinterToUpdate] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setErrors(serverErrors || {});
  }, [serverErrors]);

  // Handle new printer submit
  function handleSubmit(e) {
    e.preventDefault();
    setErrors({});
    router.post(route('printer.store'), { name }, {
      onError: (errs) => setErrors(errs),
      onSuccess: () => setName(''),
    });
  }

  // Open update modal and set printer data
  function openUpdateModal(p) {
    setPrinterToUpdate(p);
    setName(p.name);
    setErrors({});
    setUpdateModalOpen(true);
  }

  // Handle update printer submit
  function handleUpdateSubmit(e) {
    e.preventDefault();
    if (!printerToUpdate) return;
    setErrors({});
    router.put(route('printer.update', printerToUpdate.id), { name }, {
      onError: (errs) => setErrors(errs),
      onSuccess: () => setUpdateModalOpen(false),
    });
  }

  return (
    <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Printer Settings</h2>}>
      <Head title="Printer Settings" />

      <div className="max-w-3xl mx-auto p-6 space-y-10">
        {/* Add New Printer Section */}
        <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h1 className="text-2xl font-bold mb-6 text-gray-900">Add New Printer</h1>

          {flash?.success && (
            <div className="mb-4 px-4 py-3 rounded bg-green-100 text-green-800 border border-green-300">
              {flash.success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700">
              Printer Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter your printer name"
              required
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name}</p>
            )}
            <button
              type="submit"
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-semibold transition"
            >
              Save
            </button>
          </form>
        </section>

        {/* Printers Table Section */}
        <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-6 text-gray-900">All Printers</h2>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['ID', 'Printer Name', 'Created At', 'Updated At', 'Active', 'Actions'].map((header) => (
                    <th
                      key={header}
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {printers.length > 0 ? (
                  printers.map((p) => {
                    const isActive = printer?.id === p.id;
                    return (
                      <tr
                        key={p.id}
                        className={isActive ? 'bg-green-50' : ''}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{p.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap flex items-center space-x-2 text-sm text-gray-900">
                          {isActive && (
                            <span
                              className="w-3 h-3 bg-green-600 rounded-full"
                              title="Active Printer"
                              aria-label="Active Printer"
                            />
                          )}
                          <span>{p.name}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(p.created_at).toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(p.updated_at).toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-700">{isActive ? 'Yes' : 'No'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                          <PrimaryButton
                            onClick={() => {
                              if (confirm(`Set printer "${p.name}" as active printer?`)) {
                                router.post(route('printer.setActive', p.id));
                              }
                            }}
                            className="inline-flex items-center px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
                          >
                            Set as Active
                          </PrimaryButton>
                          <DangerButton
                            onClick={() => {
                                if (confirm(`Are you sure you want to delete printer "${p.name}"? This action cannot be undone.`)) {
                                router.delete(route('printer.destroy', p.id));
                                }
                            }}
                            >
                            Delete
                            </DangerButton>
                          <PrimaryButton
                            onClick={() => openUpdateModal(p)}
                     
                          >
                            Edit
                          </PrimaryButton>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-400 italic">
                      No printers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Update Modal */}
      {updateModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="update-printer-title"
        >
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
            <h3 id="update-printer-title" className="text-xl font-semibold mb-5 text-gray-900">
              Update Printer Name
            </h3>
            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                autoFocus
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name}</p>
              )}
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setUpdateModalOpen(false)}
                  className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  Update
                </button>
                
              </div>
            </form>
          </div>
        </div>
      )}
    </AuthenticatedLayout>
  );
}
