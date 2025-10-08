
import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const projectTabs = [
    { name: 'All Projects', href: 'all' },
    { name: 'Project Detail', href: 'detail' },
    { name: 'Project Analytics', href: 'analytics' },
];

const ProjectsTabs: React.FC = () => {
    const activeLinkStyle = "bg-gray-800 text-white";
    const inactiveLinkStyle = "text-gray-400 hover:bg-gray-700 hover:text-white";

    return (
        <div className="h-full flex flex-col">
            <div className="flex-shrink-0">
                <div className="bg-gray-900 p-1 rounded-lg flex space-x-1">
                    {projectTabs.map((tab) => (
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

export default ProjectsTabs;
