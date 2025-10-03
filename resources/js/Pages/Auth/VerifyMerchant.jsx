import { useState } from "react";
import { router, usePage, Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function VerifyMerchant({ verification }) {
  const { flash } = usePage().props;
  const [form, setForm] = useState({
    company_name: "",
    address: "",
    contact_number: "",
    email: "",
    owner_id: null, // upload ID of the owner
    accreditation_proof: null, // PTU, BIR 2303, or SEC/DTI cert
    tin: "",
    license_id: "",
  });

  const handleChange = (e) => {
    const { name, type, files, value } = e.target;
    setForm({
      ...form,
      [name]: type === "file" ? files[0] : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    router.post(route("merchant.verify.store"), form, {
      forceFormData: true, // important for file uploads
    });
  };

  if (verification) {
    return (
      <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">Verification</h2>}>
        <Head title="Verify" />
        <div className="p-6 bg-gray-100 rounded-lg shadow">
          <h2 className="text-lg font-bold mb-2">Verification Status</h2>
          <p>
            Your verification is currently:{" "}
            <span className="font-semibold capitalize">
              {verification.status}
            </span>
          </p>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">Verification</h2>}>
      <Head title="Verify" />
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-4">Merchant Verification</h1>

        {flash?.success && (
          <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">
            {flash.success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Company Info */}
          <input
            name="company_name"
            value={form.company_name}
            onChange={handleChange}
            placeholder="Company Name"
            className="w-full border rounded p-2"
            required
          />
          <input
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Address"
            className="w-full border rounded p-2"
            required
          />
          <input
            name="contact_number"
            value={form.contact_number}
            onChange={handleChange}
            placeholder="Contact Number"
            className="w-full border rounded p-2"
            required
          />
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full border rounded p-2"
            required
          />

          {/* Owner ID */}
          <label className="block">
            <span className="font-medium">Owner Valid ID</span>
            <input
              type="file"
              name="owner_id"
              onChange={handleChange}
              className="mt-1 block w-full"
              required
            />
          </label>

          {/* Accreditation Proof */}
          <label className="block">
            <span className="font-medium">Proof of Accreditation</span>
            <input
              type="file"
              name="accreditation_proof"
              onChange={handleChange}
              className="mt-1 block w-full"
              required
            />
            <small className="text-gray-500">
              Upload PTU, BIR 2303, or SEC/DTI Certificate
            </small>
          </label>

          {/* Optional TIN */}
          <input
            name="tin"
            value={form.tin}
            onChange={handleChange}
            placeholder="BIR TIN (Optional)"
            className="w-full border rounded p-2"
          />

          {/* License Key ID (Optional) */}
          <input
            name="license_id"
            value={form.license_id}
            onChange={handleChange}
            placeholder="License ID (Optional)"
            className="w-full border rounded p-2"
          />

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Submit Verification
          </button>
        </form>
      </div>
    </AuthenticatedLayout>
  );
}
