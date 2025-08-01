import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const auth = usePage().props.auth || {};
    const user = auth.user || {};
    const permissions = auth.permissions || [];

    console.log("User:", user);
console.log("Permissions:", permissions);

    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="border-b border-gray-100 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex shrink-0 items-center">
                                <Link href="/">
                                    <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800" />
                                </Link>
                            </div>

                            <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">

                                {permissions.includes('view dashboard') && (
                                        <NavLink
                                            href={route('dashboard')}
                                            active={route().current('dashboard')}
                                        >
                                            Dashboard
                                        </NavLink>
                                    )}

                                {/* ADMIN LINKS */}
                                {permissions.includes('view manage-users') && (
                                    <NavLink href={route('admin.manage-users')} active={route().current('admin.manage-users')}>
                                        Manage Users
                                    </NavLink>
                                )}
                                
                                {permissions.includes('view business') && (
                                    <NavLink href={route('admin.business')} active={route().current('admin.business')}>
                                        Businesses
                                    </NavLink>
                                )}

                                {/* MERCHANT LINKS */}
                                {permissions.includes('view admin-dashboard') && (
                                    <NavLink href={route('merchant.dashboard')} active={route().current('merchant.dashboard')}>
                                        Merchant Dashboard
                                    </NavLink>
                                )}
                                {permissions.includes('view staff') && (
                                    <NavLink href={route('merchant.staff')} active={route().current('merchant.staff')}>
                                        Staff
                                    </NavLink>
                                )}
                                {permissions.includes('view products') && (
                                    <NavLink href={route('merchant.products')} active={route().current('merchant.products')}>
                                        Products
                                    </NavLink>
                                )}
                                {permissions.includes('view categories') && (
                                    <NavLink href={route('merchant.categories')} active={route().current('merchant.categories')}>
                                        Categories
                                    </NavLink>
                                )}
                                {permissions.includes('view sales') && (
                                    <NavLink href={route('merchant.sales')} active={route().current('merchant.sales')}>
                                        Sales
                                    </NavLink>
                                )}
                                {permissions.includes('view transactions') && (
                                    <NavLink href={route('merchant.transactions')} active={route().current('merchant.transactions')}>
                                        Transactions
                                    </NavLink>
                                )}
                                {permissions.includes('view pos') && (
                                    <NavLink href={route('merchant.pos')} active={route().current('merchant.pos')}>
                                        POS
                                    </NavLink>
                                )}

                                {/* STAFF DASHBOARD */}
                                {permissions.includes('view staff-dashboard') && (
                                    <NavLink href={route('staff.dashboard')} active={route().current('staff.dashboard')}>
                                        Staff Dashboard
                                    </NavLink>
                                )}
                            </div>
                        </div>

                        {/* RIGHT DROPDOWN */}
                        <div className="hidden sm:ms-6 sm:flex sm:items-center">
                            <div className="relative ms-3">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button type="button" className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
                                                {user.name}
                                                <svg className="ms-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
                                        <Dropdown.Link href={route('logout')} method="post" as="button">Log Out</Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        {/* MOBILE MENU TOGGLE */}
                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() => setShowingNavigationDropdown(!showingNavigationDropdown)}
                                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                            >
                                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                    <path className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                    <path className={showingNavigationDropdown ? 'inline-flex' : 'hidden'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* MOBILE NAVIGATION LINKS */}
                <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' sm:hidden'}>
                    <div className="space-y-1 pb-3 pt-2">
                    {/* admin nav */}
                        {permissions.includes('view dashboard') && (
                            <ResponsiveNavLink href={route('dashboard')} active={route().current('dashboard')}>
                                Admin Dashboard
                            </ResponsiveNavLink>
                        )}
                        {permissions.includes('view manage-users') && (
                            <ResponsiveNavLink href={route('admin.manage-users')} active={route().current('admin.manage-users')}>
                                Manage Users
                            </ResponsiveNavLink>
                        )}
                        {permissions.includes('view business') && (
                            <ResponsiveNavLink href={route('admin.business')} active={route().current('admin.business')}>
                                Businesses
                            </ResponsiveNavLink>
                        )}
                         {/* merchant nav */}
                        {permissions.includes('view merchant-dashboard') && (
                            <ResponsiveNavLink href={route('merchant.dashboard')} active={route().current('merchant.dashboard')}>
                                Merchant Dashboard
                            </ResponsiveNavLink>
                        )}
                        {permissions.includes('view staff') && (
                            <ResponsiveNavLink href={route('merchant.staff')} active={route().current('merchant.staff')}>
                                Staff
                            </ResponsiveNavLink>
                        )}
                        {permissions.includes('view products') && (
                            <ResponsiveNavLink href={route('merchant.products')} active={route().current('merchant.products')}>
                                Products
                            </ResponsiveNavLink>
                        )}
                        {permissions.includes('view categories') && (
                            <ResponsiveNavLink href={route('merchant.categories')} active={route().current('merchant.categories')}>
                                Categories
                            </ResponsiveNavLink>
                        )}
                        {permissions.includes('view sales') && (
                            <ResponsiveNavLink href={route('merchant.sales')} active={route().current('merchant.sales')}>
                                Sales
                            </ResponsiveNavLink>
                        )}
                        {permissions.includes('view transactions') && (
                            <ResponsiveNavLink href={route('merchant.transactions')} active={route().current('merchant.transactions')}>
                                Transactions
                            </ResponsiveNavLink>
                        )}

                    
                        {permissions.includes('view pos') && (
                            <ResponsiveNavLink href={route('merchant.products')} active={route().current('merchant.products')}>
                                POS
                            </ResponsiveNavLink>
                        )}
                        {permissions.includes('view staff-dashboard') && (
                            <ResponsiveNavLink href={route('staff.dashboard')} active={route().current('staff.dashboard')}>
                                Staff Dashboard
                            </ResponsiveNavLink>
                        )}
                         {permissions.includes('view pos') && (
                            <ResponsiveNavLink href={route('staff.pos')} active={route().current('staff.pos')}>
                                Staff Dashboard
                            </ResponsiveNavLink>
                        )}
                    </div>

                    <div className="border-t border-gray-200 pb-1 pt-4">
                        <div className="px-4">
                            <div className="text-base font-medium text-gray-800">{user.name}</div>
                            <div className="text-sm font-medium text-gray-500">{user.email}</div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>
                                Profile
                            </ResponsiveNavLink>
                            <ResponsiveNavLink method="post" href={route('logout')} as="button">
                                Log Out
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-white shadow">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main>{children}</main>
        </div>
    );
}
