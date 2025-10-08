
import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { SearchIcon, BellIcon, PlusIcon, ChevronDownIcon } from './Icons';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../contexts/PermissionsContext';

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { currentUser, signOut } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { hasPermission } = usePermissions();
  
  const canCreateSomething = hasPermission('projects:write') || hasPermission('tasks:write') || hasPermission('people:write');

  const getTitle = () => {
    const pathParts = location.pathname.split('/').filter(p => p);
    if (pathParts.length === 0) return 'Dashboard';
    
    // Replace hyphens with spaces and capitalize words for a cleaner title
    const title = pathParts[pathParts.length - 1]
        .replace(/-/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
        
    return title;
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setDropdownOpen(false);
  };
  
  return (
    <header className="flex-shrink-0 bg-gray-950 border-b border-gray-800 flex items-center justify-between h-16 px-6">
      <div className="flex items-center">
        <h1 className="text-xl font-semibold text-white">{getTitle()}</h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
                type="text" 
                placeholder="Search..."
                className="bg-gray-800 border border-gray-700 text-white rounded-md py-2 pl-10 pr-4 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>

        {canCreateSomething && (
          <div className="relative">
            <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center justify-center bg-blue-600 text-white px-3 py-2 text-sm font-medium rounded-md hover:bg-blue-700">
              <PlusIcon className="w-5 h-5" />
              <span className="hidden md:inline ml-2">Create New</span>
              <ChevronDownIcon className="w-5 h-5 ml-1 hidden md:inline" />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg z-10 border border-gray-700">
                {hasPermission('projects:write') && <button onClick={() => handleNavigation('/execution/projects')} className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">New Project</button>}
                {hasPermission('tasks:write') && <button onClick={() => handleNavigation('/execution/tasks')} className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">New Task</button>}
                {hasPermission('people:write') && <button onClick={() => handleNavigation('/execution/people')} className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">New Person</button>}
              </div>
            )}
          </div>
        )}
        
        <button className="text-gray-400 hover:text-white">
            <BellIcon className="w-6 h-6"/>
        </button>

        {currentUser && (
            <div className="relative">
                <button onClick={() => setUserDropdownOpen(!userDropdownOpen)} className="flex items-center space-x-2 focus:outline-none">
                    <img src={currentUser.imageUrl} alt={currentUser.name} className="w-8 h-8 rounded-full" />
                    <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                </button>
                {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-md shadow-lg z-20 border border-gray-700">
                        <div className="px-4 py-3 border-b border-gray-700">
                            <p className="text-sm text-white font-medium truncate">{currentUser.name}</p>
                            <p className="text-sm text-gray-400 truncate">{currentUser.email}</p>
                        </div>
                         <div className="py-1">
                            <Link to="/profile/settings" onClick={() => setUserDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">My Settings</Link>
                            <Link to="/profile/notifications" onClick={() => setUserDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">Notifications</Link>
                             <Link to="/profile/preferences" onClick={() => setUserDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">Preferences</Link>
                        </div>
                        <div className="border-t border-gray-700">
                          <button onClick={() => { signOut(); setUserDropdownOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">
                              Sign Out
                          </button>
                        </div>
                    </div>
                )}
            </div>
        )}
      </div>
    </header>
  );
};

export default Header;
