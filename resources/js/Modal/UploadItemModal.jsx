import React, { useState, useEffect } from 'react';
import { useForm, usePage } from '@inertiajs/react';

export default function UploadItemModal({ show, onClose }) {
    const { data, setData, post, processing, reset } = useForm({ file: null });
    const { props } = usePage();
    const uploadErrors = props?.upload_errors || [];
    const flash = props?.flash || {};

    const [serverMessage, setServerMessage] = useState(null);

    useEffect(() => {
        if (flash?.success) {
            setServerMessage({ type: 'success', text: flash.success });
            reset();
            onClose(); // ✅ only close when backend really succeeded
        } else if (props?.error || uploadErrors.length > 0) {
            setServerMessage({ type: 'error', text: props.error || 'Upload failed. Please check your Excel file.' });
        }
    }, [flash, props, uploadErrors]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setServerMessage(null);

        post(route('items.upload'), {
            preserveScroll: true,
        });
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
                <h2 className="text-lg font-bold mb-4">Upload Items (Excel)</h2>

                <div className="p-3 mb-4 bg-gray-100 rounded text-sm">
                    <p className="font-semibold mb-1">Excel Format (exact order):</p>
                    <ul className="list-disc ml-5 space-y-1">
                        <li>Name (text, required)</li>
                        <li>Barcode (text, required)</li>
                        <li>Description (optional)</li>
                        <li>Category (ID or name)</li>
                        <li>Stock (numeric, required)</li>
                        <li>Price (numeric, required)</li>
                    </ul>
                </div>

                {uploadErrors.length > 0 && (
                    <div className="mb-4 p-2 bg-red-50 text-red-700 rounded text-sm">
                        <p className="font-semibold mb-1">Upload issues:</p>
                        <ul className="list-disc ml-5 space-y-1">
                            {uploadErrors.map((err, idx) => <li key={idx}>{err}</li>)}
                        </ul>
                    </div>
                )}

                {serverMessage && (
                    <div className={`mb-4 p-2 rounded text-sm ${serverMessage.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {serverMessage.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} encType="multipart/form-data">
                    <input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={(e) => setData('file', e.target.files[0])}
                        className="block w-full mb-4 border border-gray-300 p-2 rounded"
                        required
                    />
                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={() => {
                                reset();        // ✅ clear useForm data
                                setServerMessage(null); // ✅ clear messages
                                onClose();      // ✅ close modal
                            }}
                            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                        <button type="submit" disabled={processing} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                            {processing ? 'Uploading...' : 'Upload'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
