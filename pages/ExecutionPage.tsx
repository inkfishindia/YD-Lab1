
import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { usePermissions } from '../contexts/PermissionsContext';
// FIX: Removed comment and will ensure ClockIcon exists.
import { FolderIcon, ClipboardCheckIcon, UsersIcon, ClockIcon } from '../components/Icons';

const executionTabs = [
    { name: 'Projects', href: 'projects', icon: FolderIcon, permission: 'projects:read' },
    { name: 'Tasks', href: 'tasks', icon: ClipboardCheckIcon, permission: 'tasks:read' },
    { name: 'People & Capacity', href: 'people', icon: UsersIcon, permission: 'people:read' },
    // FIX: Changed icon to ClockIcon for semantic accuracy.
    { name: 'Time Tracking', href: 'time-tracking', icon: ClockIcon, permission: 'timetracking:read' }, // Placeholder permission
];


const ExecutionPage: React.FC = () => {
    // For now, show all tabs as per the request. Permissions can be re-enabled later.
    // const { hasPermission } = usePermissions();
    // const availableTabs = executionTabs.filter(tab => hasPermission(tab.permission));
    const availableTabs = executionTabs;
    
    const activeLinkStyle = "border-blue-500 text-blue-400";
    const inactiveLinkStyle = "border-transparent text-gray-400 hover:border-gray-500 hover:text-gray-200";

    return (
        <div className="h-full flex flex-col">
            <div className="border-b border-gray-800">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    {availableTabs.map((tab) => (
                        <NavLink
                            key={tab.name}
                            to={tab.href}
                            className={({ isActive }) =>
                                `${isActive ? activeLinkStyle : inactiveLinkStyle} flex items-center whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`
                            }
                        >
                            <tab.icon className="w-5 h-5 mr-2" />
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

export default ExecutionPage;