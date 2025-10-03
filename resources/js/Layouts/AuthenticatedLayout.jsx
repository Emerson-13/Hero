import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import SidebarDropdown from '@/Components/SidebarDropdown';
import { usePage } from '@inertiajs/react';
import { useState,useEffect } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const { auth } = usePage().props;
    const user = auth?.user || {};
    const permissions = user.permissions || [];
    const roles = user?.roles || [];

    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    const companyName = user?.merchant?.company_name || user?.company_name || 'Company';
    const companyAddress = user?.merchant?.address || user?.address || 'Address';

     useEffect(() => {
        console.log("🔑 User:", user);
        console.log("🎭 Roles:", roles);
        console.log("✅ Permissions:", permissions);
    }, [user, roles, permissions]);

    // 🔑 Helper to check permission
    const can = (perm) => permissions.includes(perm);

    return (
        <div className="min-h-screen bg-gray-100">
            {/* MOBILE BACKDROP */}
            {showingNavigationDropdown && (
                <div
                    className="fixed inset-0 z-30 bg-black/40 lg:hidden"
                    onClick={() => setShowingNavigationDropdown(false)}
                />
            )}

            {/* SIDEBAR */}
            <aside
                className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r shadow-md
                            transform transition-transform duration-200 ease-in-out
                            ${showingNavigationDropdown ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
            >
                {/* Logo + Brand */}
                <div className="h-18 flex items-center px-6 border-b bg-gradient-to-r from-indigo-500 to-indigo-600">
                    <ApplicationLogo className="block h-14 w-auto fill-current text-white" />
                    <p className="ml-4 text-lg font-bold text-white tracking-wide">HERO POS</p>
                </div>

                <div className="border-b border-gray-300"></div>

                {/* NAV LINKS */}
                <nav className="mt-4 flex flex-col px-4 space-y-3">
                    {/* Dashboard */}
                    <NavLink
                        href={route('admin.dashboard')}
                        active={route().current('admin.dashboard')}
                        className={`flex justify-between items-center w-full px-3 py-2 rounded-lg font-medium text-[1.12rem] transition-all duration-200
                            ${route().current('admin.dashboard') 
                                ? "bg-indigo-600 text-white shadow-sm"
                                : "text-gray-600 hover:bg-indigo-100 hover:text-indigo-800"
                            }`}
                    >
                        Dashboard
                    </NavLink>

                    {/* User & Role */}
                    {(can('manage member') || can('manage role')) && (
                        <SidebarDropdown 
                            title="User & Role" 
                            links={[
                                can('manage member') && { name: 'Manage User', route: 'admin.members.allMembers' },
                                can('manage role') && { name: 'Role', route: 'roles.index' },
                                can('manage role') && { name: 'Title', route: 'titles.index' },
                            ].filter(Boolean)}
                        />
                    )}

                    {/* Codes */}
                    {(can('manage activation-code') || can('manage referral')) && (
                        <SidebarDropdown 
                            title="Codes" 
                            links={[
                                can('manage activation-code') && { name: 'Activation Codes', route: 'activation-codes.index' },
                                can('manage activation-code') && { name: 'Referral Code', route: 'admin.referral' },
                            ].filter(Boolean)}
                        />
                    )}

                    {/* Products & Packages */}
                    {(can('manage packages') || can('manage product')) && (
                        <SidebarDropdown 
                            title="Products & Packages" 
                            links={[
                                can('manage packages') && { name: 'Packages', route: 'packages.index' },
                                can('manage packages') && { name: 'Products', route: 'products.index' },
                            ].filter(Boolean)}
                        />
                    )}
                     {/* category & items */}
                    {(can('manage category') || can('manage items') || can('manage menus') || can('manage ingredients')) && (
                        <SidebarDropdown 
                            title="Inventory" 
                            links={[
                                can('manage category') && { name: 'Category', route: 'user.categories' },
                                can('manage items') && { name: 'Items', route: 'user.items' },
                                can('manage ingredients') && { name: 'Ingredients', route: 'user.ingredient' },
                                can('manage menus') && { name: 'Menus', route: 'user.menu' },
                            ].filter(Boolean)}
                        />
                    )}
                    {can('manage order') && (
                        <NavLink
                            href={route('orders.index')}
                            active={route().current('orders.index')}
                            className={`flex justify-between items-center w-full px-3 py-2 rounded-lg font-medium text-[1.13rem] transition-all duration-200
                                ${route().current('orders.index') 
                                    ? "bg-indigo-600 text-white shadow-sm"
                                    : "text-gray-600 hover:bg-indigo-100 hover:text-indigo-800"
                                }`}
                        >
                            Orders
                        </NavLink>
                    )}
                    {can('manage transaction') && (
                        <NavLink
                            href={route('user.transactions')}
                            active={route().current('user.transactions')}
                            className={`flex justify-between items-center w-full px-3 py-2 rounded-lg font-medium text-[1.13rem] transition-all duration-200
                                ${route().current('user.transactions') 
                                    ? "bg-indigo-600 text-white shadow-sm"
                                    : "text-gray-600 hover:bg-indigo-100 hover:text-indigo-800"
                                }`}
                        >
                            Transaction
                        </NavLink>
                    )}
                    {can('manage transaction') && (
                        <NavLink
                            href={route('user.discounts')}
                            active={route().current('user.discounts')}
                            className={`flex justify-between items-center w-full px-3 py-2 rounded-lg font-medium text-[1.13rem] transition-all duration-200
                                ${route().current('user.discounts') 
                                    ? "bg-indigo-600 text-white shadow-sm"
                                    : "text-gray-600 hover:bg-indigo-100 hover:text-indigo-800"
                                }`}
                        >
                            Discount
                        </NavLink>
                    )}
                    {/* Payment */}
                    {can('manage payment') && (
                        <NavLink
                            href={route('admin.payments.index')}
                            active={route().current('admin.payments.index')}
                            className={`flex justify-between items-center w-full px-3 py-2 rounded-lg font-medium text-[1.13rem] transition-all duration-200
                                ${route().current('admin.payments.index') 
                                    ? "bg-indigo-600 text-white shadow-sm"
                                    : "text-gray-600 hover:bg-indigo-100 hover:text-indigo-800"
                                }`}
                        >
                            Payment
                        </NavLink>
                    )}
                    {can('manage payment') && (
                        <NavLink
                            href={route('retail.pos')}
                            active={route().current('retail.pos')}
                            className={`flex justify-between items-center w-full px-3 py-2 rounded-lg font-medium text-[1.13rem] transition-all duration-200
                                ${route().current('retail.pos') 
                                    ? "bg-indigo-600 text-white shadow-sm"
                                    : "text-gray-600 hover:bg-indigo-100 hover:text-indigo-800"
                                }`}
                        >
                            POS
                        </NavLink>
                    )}
                    {can('manage payment') && (
                        <NavLink
                            href={route('food.pos')}
                            active={route().current('food.pos')}
                            className={`flex justify-between items-center w-full px-3 py-2 rounded-lg font-medium text-[1.13rem] transition-all duration-200
                                ${route().current('food.pos') 
                                    ? "bg-indigo-600 text-white shadow-sm"
                                    : "text-gray-600 hover:bg-indigo-100 hover:text-indigo-800"
                                }`}
                        >
                            Food & Beverages POS 
                        </NavLink>
                    )}
                    {/* Bank */}
                    {can('manage bank') && (
                        <NavLink
                            href={route('admin.banks.index')}
                            active={route().current('admin.banks.index')}
                            className={`flex justify-between items-center w-full px-3 py-2 rounded-lg font-medium text-[1.13rem] transition-all duration-200
                                ${route().current('admin.banks.index') 
                                    ? "bg-indigo-600 text-white shadow-sm"
                                    : "text-gray-600 hover:bg-indigo-100 hover:text-indigo-800"
                                }`}
                        >
                            Bank
                        </NavLink>
                    )}

                    {/* Announcement */}
                    {can('manage announcements') && (
                        <NavLink
                            href={route('announcements.index')}
                            active={route().current('announcements.index')}
                            className={`flex justify-between items-center w-full px-3 py-2 rounded-lg font-medium text-[1.13rem] transition-all duration-200
                                ${route().current('announcements.index')
                                    ? "bg-indigo-600 text-white shadow-sm"
                                    : "text-gray-600 hover:bg-indigo-100 hover:text-indigo-800"
                                }`}
                        >
                            Create Announcement
                        </NavLink>
                    )}
                </nav>

                {/* Footer */}
                <div className="absolute bottom-0 w-full border-t px-4 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600">
                    <p className="text-lg font-bold text-white truncate">{companyName}</p>
                    <p className="text-sm text-white truncate">{companyAddress}</p>
                </div>
            </aside>

            {/* TOP BAR */}
            <nav className="fixed top-0 z-20 h-16 border-b border-gray-100 bg-white inset-x-0 lg:inset-x-auto lg:left-64 lg:right-0">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ">
                    <div className="flex h-16 items-center justify-between">
                        {/* LEFT: Mobile toggle + Company Name */}
                        <div className="flex items-center gap-3">
                            <div className="lg:hidden">
                                <button
                                    onClick={() => setShowingNavigationDropdown(!showingNavigationDropdown)}
                                    className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                                >
                                    <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                        {!showingNavigationDropdown ? (
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                        ) : (
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        )}
                                    </svg>
                                </button>
                            </div>
                            <div className="flex flex-col truncate">
                                <div className="text-[28px] font-bold text-gray-800 leading-tight truncate max-w-[200px] sm:max-w-xs lg:max-w-sm">
                                    {companyName}
                                </div>
                                <div className="text-sm text-gray-600 truncate max-w-[200px] sm:max-w-xs lg:max-w-sm">
                                    {companyAddress}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: Dropdown */}
                        <div className="hidden sm:flex sm:items-center">
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <span className="inline-flex rounded-md">
                                        <button
                                            type="button"
                                            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
                                        >
                                            {user.name}
                                            <svg
                                                className="ms-2 h-4 w-4"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </button>
                                    </span>
                                </Dropdown.Trigger>
                                <Dropdown.Content>
                                    <Dropdown.Link href={route('logout')} method="post" as="button">
                                        Log Out
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>
                    </div>
                </div>
            </nav>

            {/* PAGE CONTENT */}
            <div className="pt-16 lg:pl-64">
                <div className="border-b border-gray-300"></div>
                {header && (
                    <header className="bg-white shadow">
                        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                            {header}
                        </div>
                    </header>
                )}
                <main>{children}</main>
            </div>
        </div>
    );
}
