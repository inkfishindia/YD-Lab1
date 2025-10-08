
import React from 'react';
import { NavLink } from 'react-router-dom';
import { HomeIcon, FolderIcon, LightBulbIcon, BriefcaseIcon, PresentationChartLineIcon, MegaphoneIcon, CurrencyDollarIcon, WrenchScrewdriverIcon, Cog6ToothIcon } from './Icons';
import { usePermissions } from '../contexts/PermissionsContext';

const Sidebar: React.FC = () => {
  const { hasPermission } = usePermissions();

  const linkStyle = "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors";
  const activeLinkStyle = "bg-gray-800 text-white";
  const inactiveLinkStyle = "text-gray-400 hover:bg-gray-800 hover:text-white";

  return (
    <div className="w-60 bg-gray-950 border-r border-gray-800 flex flex-col">
      <div className="flex items-center justify-center h-16 border-b border-gray-800">
        <LightBulbIcon className="w-7 h-7 text-blue-500" />
        <span className="ml-2 text-lg font-bold text-white">YDS LABS</span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-2">
        <NavLink to="/command-center" className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}>
            <HomeIcon className="w-5 h-5 mr-3" />
            COMMAND CENTER
        </NavLink>
        <NavLink to="/execution" className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}>
            <FolderIcon className="w-5 h-5 mr-3" />
            EXECUTION
        </NavLink>
        <NavLink to="/marketing" className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}>
            <MegaphoneIcon className="w-5 h-5 mr-3" />
            MARKETING
        </NavLink>
        <NavLink to="/revenue" className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}>
            <CurrencyDollarIcon className="w-5 h-5 mr-3" />
            REVENUE
        </NavLink>
        <NavLink to="/strategy" className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}>
            <PresentationChartLineIcon className="w-5 h-5 mr-3" />
            STRATEGY
        </NavLink>
        <NavLink to="/tools" className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}>
            <WrenchScrewdriverIcon className="w-5 h-5 mr-3" />
            TOOLS
        </NavLink>
        <NavLink to="/admin" className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}>
            <Cog6ToothIcon className="w-5 h-5 mr-3" />
            ADMIN
        </NavLink>
      </nav>
    </div>
  );
};

export default Sidebar;
