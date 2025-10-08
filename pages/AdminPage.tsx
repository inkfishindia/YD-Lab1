
import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Cog6ToothIcon } from '../components/Icons';

const adminTabs = [
    { name: 'Platforms & Integrations', href: 'integrations' },
    { name: 'Hubs & Functions', href: 'hubs' },
    { name: 'Financial Tracking', href: 'financials' },
    { name: 'Delegation Workflows', href: 'workflows' },
];

const AdminPage: React.FC = () => {
    const activeLinkStyle = "border-blue-500 text-blue-400";
    const inactiveLinkStyle = "border-transparent text-gray-400 hover:border-gray-500 hover:text-gray-200";

    return (
        <div className="h-full flex flex-col">
            <div className="border-b border-gray-800">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    {adminTabs.map((tab) => (
                        <NavLink
                            key={tab.name}
                            to={tab.href}
                            className={({ isActive }) =>
                                `${isActive ? activeLinkStyle : inactiveLinkStyle} flex items-center whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`
                            }
                        >
                            <Cog6ToothIcon className="w-5 h-5 mr-2" />
                            {tab.name}
                        </NavLink>
                    ))}
                </nav>
            </div>
            <div className="pt-6 flex-grow overflow-y-auto">
                <Outlet />
            </div>
        </div>
    );
};

export default AdminPage;
