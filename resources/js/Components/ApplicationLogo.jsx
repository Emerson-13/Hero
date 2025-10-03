import { useState } from "react";

export default function ApplicationLogo(props) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Logo Button */}
            <img
                {...props}
                src="/logo.png"
                alt="Company Logo"
                className="w-16 h-16 rounded-full object-cover cursor-pointer hover:scale-105 transition"
                onClick={() => setIsOpen(true)}
            />

            {/* Modal */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    onClick={() => setIsOpen(false)} // Close when background is clicked
                >
                    <div className="bg-white p-4 rounded-2xl shadow-lg relative">
                        <button
                            className="absolute top-2 right-2 text-gray-600 hover:text-black"
                            onClick={() => setIsOpen(false)}
                        >
                            ✕
                        </button>
                        <img
                            src="/logo.png"
                            alt="Company Logo"
                            className="w-48 h-48 rounded-full object-cover"
                        />
                    </div>
                </div>
            )}
        </>
    );
}
