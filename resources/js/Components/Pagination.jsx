import React from 'react';
import { router } from '@inertiajs/react';

export default function Pagination({ links, data = {}, preserveScroll = false, preserveState = true }) {
    if (!links || links.length <= 1) return null;

    const handleClick = (link) => {
        if (!link.url || link.active) return;
        router.visit(link.url, {
            data,
            preserveScroll,
            preserveState,
        });
    };

    return (
        <div className="flex space-x-1 mt-4">
            {links.map((link, index) => (
                <button
                    key={index}
                    onClick={() => handleClick(link)}
                    disabled={!link.url || link.active}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                    className={`px-3 py-1 border rounded ${
                        link.active ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'
                    } ${!link.url ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-100'}`}
                />
            ))}
        </div>
    );
}
