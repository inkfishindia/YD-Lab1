
import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const tabs = [
    { name: 'Lead Inbox', href: 'inbox' },
    { name: 'Lead Detail', href: 'detail' },
    { name: 'Lead Scoring', href: 'scoring' },
];

const LeadsTabs: React.FC = () => {
    const activeLinkStyle = "bg-gray-800 text-white";
    const inactiveLinkStyle = "text-gray-400 hover:bg-gray-700 hover:text-white";

    return (
        <div className="h-full flex flex-col">
            <div className="flex-shrink-0">
                <div className="bg-gray-900 p-1 rounded-lg flex space-x-1">
                    {tabs.map((tab) => (
                         <NavLink
                            key={tab.name}
                            to={tab.href}
                            className={({ isActive }) =>
                                `${isActive ? activeLinkStyle : inactiveLinkStyle} px-3 py-1.5 font-medium text-sm rounded-md transition-colors`
                            }
                        >
                            {tab.name}
                        </NavLink>
                    ))}
                </nav>
            </div>
            <div className="pt-4 flex-grow overflow-y-auto">
                <Outlet />
            </div>
        </div>
    );
};

export default LeadsTabs;
