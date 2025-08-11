import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';

export default function UploadProductModal({ show, onClose }) {
    const { data, setData, post, processing, reset } = useForm({
        file: null,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('products.upload'), {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
                <h2 className="text-lg font-bold mb-4">Upload Products (Excel)</h2>
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
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            {processing ? 'Uploading...' : 'Upload'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
