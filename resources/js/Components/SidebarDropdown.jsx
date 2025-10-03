import { useState, useEffect } from "react";
import NavLink from "@/Components/NavLink";

export default function SidebarDropdown({ title, links }) {
    const [open, setOpen] = useState(false);

    // Keep dropdown open if one of its links is active
    useEffect(() => {
        if (links.some(link => route().current(link.route))) {
            setOpen(true);
        }
    }, []);

    return (
        <div className="flex flex-col w-full">
            {/* Dropdown Button */}
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className={`flex justify-between items-center w-full px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200
                    ${open ? "bg-indigo-200 text-indigo-800" : "text-gray-700 hover:bg-indigo-100 hover:text-indigo-700"}`}
            >
                <span>{title}</span>
                <svg
                    className={`h-4 w-4 transform transition-transform duration-200 ${open ? "rotate-90" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
            </button>

            {/* Dropdown Links */}
            {open && (
                <div className="flex flex-col mt-1 pl-4 space-y-1">
                    {links.map((link, idx) => (
                        <NavLink
                            key={idx}
                            href={route(link.route)}
                            active={route().current(link.route)}
                            className={`px-3 py-2 rounded-lg font-medium text-[1.13rem] w-full transition-all duration-200
                                ${
                                    route().current(link.route)
                                        ? "bg-indigo-600 text-white shadow-sm"
                                        : "text-gray-600 hover:bg-indigo-100 hover:text-indigo-800"
                                }`}
                        >
                            {link.name}
                        </NavLink>
                    ))}
                </div>
            )}
        </div>
    );
}
