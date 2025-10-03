import React, { useEffect, useMemo, useState } from "react";
import { useForm, router } from "@inertiajs/react";
import DangerButton from "@/Components/DangerButton";

export default function Payment({ banks = [], userPackage = null }) {
  const { data, setData, post, processing, errors, reset } = useForm({
    amount: "",
    payment_method: "manual",
    bank_id: banks.length > 0 ? String(banks[0].id) : "",
    sender_account_number: "",
    transaction_number: "",
    proof_image: null,
  });

  const [selectedBankId, setSelectedBankId] = useState(
    banks.length > 0 ? String(banks[0].id) : ""
  );

  useEffect(() => {
    if (banks.length > 0 && !data.bank_id) {
      setData("bank_id", String(banks[0].id));
      setSelectedBankId(String(banks[0].id));
    }
  }, [banks]);

  const selectedBank = useMemo(() => {
    if (!selectedBankId) return null;
    return banks.find((b) => String(b.id) === String(selectedBankId)) || null;
  }, [banks, selectedBankId]);

  const handleBankChange = (e) => {
    const id = e.target.value;
    setSelectedBankId(id);
    setData("bank_id", id);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!banks.length) return;
    if (!data.bank_id) {
      alert("Please select a payment method/bank.");
      return;
    }

    post("/payment", {
      forceFormData: true,
      onSuccess: () => {
        reset(
          "amount",
          "transaction_number",
          "proof_image",
          "sender_account_number"
        );
      },
    });
  };

  const handleLogout = () => {
    router.post(route("logout"));
  };

  const bankUnavailable = !banks || banks.length === 0;

  return (
    <div className="max-w-3xl mx-auto bg-white shadow p-6 rounded-lg space-y-6">
      <h1 className="text-2xl font-bold">Payment</h1>

      {/* ✅ Package Info */}
      {userPackage ? (
        <div className="p-4 border rounded bg-green-50">
          <p className="text-sm">
            <span className="font-semibold">Your Package:</span>{" "}
            {userPackage.name}
          </p>
          <p className="text-sm">
            <span className="font-semibold">Amount to Pay:</span> ₱
            {userPackage.price}
          </p>
        </div>
      ) : (
        <div className="p-4 border rounded bg-yellow-50 text-sm">
          No package found for your account.
        </div>
      )}

      {/* Bank selector */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Choose Payment Method
        </label>
        <select
          value={selectedBankId || ""}
          onChange={handleBankChange}
          className="w-full border rounded px-3 py-2"
          disabled={bankUnavailable || processing}
        >
          {bankUnavailable ? (
            <option value="">No payment methods available</option>
          ) : (
            banks.map((bank) => (
              <option key={bank.id} value={String(bank.id)}>
                {bank.bank_name}
              </option>
            ))
          )}
        </select>
        {errors.bank_id && (
          <p className="text-red-500 text-sm mt-1">{errors.bank_id}</p>
        )}
      </div>

      {/* Selected bank details */}
      <div className="border p-4 rounded-lg bg-blue-50">
        {bankUnavailable ? (
          <div className="text-sm text-blue-900">
            Walang naka-setup na payment method. Paki-inform si Admin.
          </div>
        ) : selectedBank ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-semibold">Bank/Channel:</span>{" "}
                {selectedBank.bank_name}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Receiver Account Name:</span>{" "}
                {selectedBank.account_name}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Receiver Account Number:</span>{" "}
                {selectedBank.account_number}
              </p>
              {selectedBank.instructions && (
                <p className="text-sm whitespace-pre-wrap">
                  <span className="font-semibold">Instructions:</span>{" "}
                  {selectedBank.instructions}
                </p>
              )}
            </div>

            {selectedBank.qr_code && (
              <div>
                <p className="text-sm font-medium">Scan QR to Pay:</p>
                <img
                  src={`/storage/${selectedBank.qr_code}`}
                  alt="QR Code"
                  className="w-44 h-44 mt-2 border rounded object-contain"
                />
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm text-blue-900">
            Please select a payment method.
          </div>
        )}
      </div>

      {/* Payment Form */}
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        {/* Amount */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Amount</label>
          <input
            type="number"
            step="0.01"
            value={data.amount || ""}
            onChange={(e) => setData("amount", e.target.value)}
            className="w-full border rounded px-3 py-2"
            disabled={bankUnavailable || processing}
          />
          {errors.amount && (
            <p className="text-red-500 text-sm">{errors.amount}</p>
          )}
        </div>

        {/* Sender Account Number */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Your Account Number (Sender)
          </label>
          <input
            type="text"
            value={data.sender_account_number || ""}
            onChange={(e) =>
              setData("sender_account_number", e.target.value)
            }
            className="w-full border rounded px-3 py-2"
            disabled={bankUnavailable || processing}
          />
          {errors.sender_account_number && (
            <p className="text-red-500 text-sm">
              {errors.sender_account_number}
            </p>
          )}
        </div>

        {/* Transaction Number */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Transaction / Reference Number
          </label>
          <input
            type="text"
            value={data.transaction_number || ""}
            onChange={(e) =>
              setData("transaction_number", e.target.value)
            }
            className="w-full border rounded px-3 py-2"
            disabled={bankUnavailable || processing}
          />
          {errors.transaction_number && (
            <p className="text-red-500 text-sm">
              {errors.transaction_number}
            </p>
          )}
        </div>

        {/* Proof Image */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Proof of Payment (Image)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setData("proof_image", e.target.files?.[0] || null)
            }
            className="w-full"
            disabled={bankUnavailable || processing}
          />
          {errors.proof_image && (
            <p className="text-red-500 text-sm">{errors.proof_image}</p>
          )}
        </div>

        <input type="hidden" name="payment_method" value={data.payment_method} />
        <input type="hidden" name="bank_id" value={data.bank_id || ""} />

        <div className="mt-6">
          <button
            type="submit"
            disabled={bankUnavailable || processing}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {processing ? "Submitting..." : "Submit Payment"}
          </button>
        </div>

        <div className="mt-6 text-center">
          <DangerButton
            onClick={handleLogout}
            className="text-sm text-red-600 hover:underline"
          >
            Logout
          </DangerButton>
        </div>
      </form>
    </div>
  );
}
