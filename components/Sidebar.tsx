
import React from 'react';
import { NavLink } from 'react-router-dom';
import { HomeIcon, UsersIcon, FolderIcon, ClipboardCheckIcon, LightBulbIcon, ChevronDownIcon, BriefcaseIcon, IdentificationIcon, TrendingUpIcon, CollectionIcon, ChatBubbleOvalLeftEllipsisIcon, ChartBarIcon, ViewGridIcon } from './Icons';

const Sidebar: React.FC = () => {
  const [executionOpen, setExecutionOpen] = React.useState(true);
  const [partnersOpen, setPartnersOpen] = React.useState(true);

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
        <NavLink
          to="/dashboard"
          className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}
        >
          <HomeIcon className="w-5 h-5 mr-3" />
          Dashboard
        </NavLink>

        <NavLink
          to="/executive-dashboard"
          className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}
        >
          <ChartBarIcon className="w-5 h-5 mr-3" />
          Executive Dashboard
        </NavLink>

        <NavLink
          to="/workspace"
          className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}
        >
          <ViewGridIcon className="w-5 h-5 mr-3" />
          Workspace
        </NavLink>

        <div>
          <button 
            onClick={() => setExecutionOpen(!executionOpen)}
            className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white rounded-md"
          >
            <span className="flex items-center">
              <FolderIcon className="w-5 h-5 mr-3" />
              Execution
            </span>
            <ChevronDownIcon className={`w-5 h-5 transition-transform ${executionOpen ? 'rotate-180' : ''}`} />
          </button>
          {executionOpen && (
            <div className="mt-2 space-y-1 pl-5">
              <NavLink to="/execution/projects" className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}>
                <FolderIcon className="w-5 h-5 mr-3" /> Projects
              </NavLink>
              <NavLink to="/execution/tasks" className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}>
                <ClipboardCheckIcon className="w-5 h-5 mr-3" /> Tasks
              </NavLink>
              <NavLink to="/execution/people" className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}>
                <UsersIcon className="w-5 h-5 mr-3" /> People
              </NavLink>
              <NavLink to="/execution/braindump" className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}>
                <ChatBubbleOvalLeftEllipsisIcon className="w-5 h-5 mr-3" /> BrainDump
              </NavLink>
            </div>
          )}
        </div>
        
        <div>
          <button 
            onClick={() => setPartnersOpen(!partnersOpen)}
            className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white rounded-md"
          >
            <span className="flex items-center">
              <BriefcaseIcon className="w-5 h-5 mr-3" />
              Partners
            </span>
            <ChevronDownIcon className={`w-5 h-5 transition-transform ${partnersOpen ? 'rotate-180' : ''}`} />
          </button>
          {partnersOpen && (
            <div className="mt-2 space-y-1 pl-5">
              <NavLink to="/partners/leads" className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}>
                <IdentificationIcon className="w-5 h-5 mr-3" /> Leads
              </NavLink>
              <NavLink to="/partners/opportunities" className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}>
                <TrendingUpIcon className="w-5 h-5 mr-3" /> Opportunities
              </NavLink>
              <NavLink to="/partners/accounts" className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}>
                <CollectionIcon className="w-5 h-5 mr-3" /> Accounts
              </NavLink>
            </div>
          )}
        </div>

        <NavLink
          to="/strategy"
          className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}
        >
          <LightBulbIcon className="w-5 h-5 mr-3" />
          Strategy
        </NavLink>
      </nav>
    </div>
  );
};

export default Sidebar;
