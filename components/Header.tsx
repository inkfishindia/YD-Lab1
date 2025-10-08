
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SearchIcon, BellIcon, PlusIcon, ChevronDownIcon, GoogleIcon } from './Icons';
import { useAuth } from '../contexts/AuthContext';
import Button from './ui/Button';

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { currentUser, signOut, signIn, isSignedIn } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);


  const getTitle = () => {
    const path = location.pathname.split('/').filter(p => p);
    if (path.length === 0 || path[0] === 'dashboard') return 'Dashboard';
    const title = path[path.length - 1];
    return title.charAt(0).toUpperCase() + title.slice(1);
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

        <div className="relative">
          <button onClick={() => setDropdownOpen(!dropdownOpen)} disabled={!isSignedIn} className="flex items-center justify-center bg-blue-600 text-white px-3 py-2 text-sm font-medium rounded-md hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed">
            <PlusIcon className="w-5 h-5" />
            <span className="hidden md:inline ml-2">Create New</span>
            <ChevronDownIcon className="w-5 h-5 ml-1 hidden md:inline" />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg z-10 border border-gray-700">
              <button onClick={() => handleNavigation('/execution/projects')} className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">New Project</button>
              <button onClick={() => handleNavigation('/execution/tasks')} className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">New Task</button>
              <button onClick={() => handleNavigation('/execution/people')} className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">New Person</button>
            </div>
          )}
        </div>
        
        <button className="text-gray-400 hover:text-white">
            <BellIcon className="w-6 h-6"/>
        </button>

        {isSignedIn && currentUser ? (
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
                        <button onClick={signOut} className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">
                            Sign Out
                        </button>
                    </div>
                )}
            </div>
        ) : (
          <Button onClick={signIn} variant="secondary">
            <GoogleIcon className="w-5 h-5 mr-2" />
            Sign In
          </Button>
        )}
      </div>
    </header>
  );
};

export default Header;
