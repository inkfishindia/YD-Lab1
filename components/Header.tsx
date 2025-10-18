import React, { useState } from 'react';
import { useLocation, useNavigate, Link, NavLink } from 'react-router-dom';
import { 
    SearchIcon, BellIcon, PlusIcon, ChevronDownIcon,
    HomeIcon, ChartBarIcon,
    FolderIcon, ClipboardCheckIcon, UsersIcon, ClockIcon,
    MegaphoneIcon,
    IdentificationIcon, TrendingUpIcon, CollectionIcon, BriefcaseIcon,
    PresentationChartLineIcon,
    WrenchScrewdriverIcon, ChatBubbleOvalLeftEllipsisIcon, LightBulbIcon, EnvelopeIcon, CalendarIcon, DocumentTextIcon,
    Cog6ToothIcon,
    UserCircleIcon,
    SwatchIcon,
    ScaleIcon,
    PencilIcon,
    BuildingStorefrontIcon,
    QueueListIcon
} from './Icons';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../contexts/PermissionsContext';
import { useData } from '../contexts/DataContext';
import Button from './ui/Button';

interface HeaderProps {
  onSearchClick: () => void;
}

const navigationTabs: Record<string, { name: string, href: string, icon: React.ElementType }[]> = {
  '/command-center': [
    { name: "Dashboard", href: 'dashboard', icon: HomeIcon },
    { name: "Executive Dashboard", href: 'executive-dashboard', icon: ChartBarIcon },
  ],
  '/execution': [
    { name: 'Programs', href: '', icon: FolderIcon },
  ],
   '/marketing': [
    { name: 'Campaigns', href: 'campaigns', icon: MegaphoneIcon },
    { name: 'Content Pipeline', href: 'content', icon: MegaphoneIcon },
    { name: 'Interfaces', href: 'interfaces', icon: MegaphoneIcon },
  ],
  '/creative': [
    { name: 'YDC Map', href: 'ydc-map', icon: SwatchIcon },
    { name: 'Competitor Analysis', href: 'competitor-analysis', icon: ScaleIcon },
    { name: 'Visual Mood', href: 'visual-mood', icon: PencilIcon },
    { name: 'Experience Store', href: 'experience-store', icon: BuildingStorefrontIcon },
    { name: 'Customer Journey', href: 'customer-journey', icon: QueueListIcon },
  ],
  '/revenue': [
    { name: 'Leads', href: 'leads', icon: IdentificationIcon },
    { name: 'Opportunities', href: 'opportunities', icon: TrendingUpIcon },
    { name: 'Accounts', href: 'accounts', icon: CollectionIcon },
    { name: 'Products', href: 'products', icon: BriefcaseIcon },
  ],
  '/strategy': [
    { name: 'System Map', href: 'dashboard', icon: PresentationChartLineIcon },
    { name: 'Positioning', href: 'positioning', icon: LightBulbIcon },
    { name: 'Business Units', href: 'business-units', icon: PresentationChartLineIcon },
    { name: 'Metrics & KPIs', href: 'metrics', icon: PresentationChartLineIcon },
    { name: 'Strategic Briefs', href: 'briefs', icon: PresentationChartLineIcon },
  ],
  '/system': [
      { name: 'System Map', href: 'map', icon: BriefcaseIcon },
  ],
  '/tools': [
    { name: 'BrainDump', href: 'braindump', icon: ChatBubbleOvalLeftEllipsisIcon },
    { name: 'AI Assistant', href: 'ai-assistant', icon: LightBulbIcon },
    { name: 'Inbox', href: 'inbox', icon: EnvelopeIcon },
    { name: 'Calendar', href: 'calendar', icon: CalendarIcon },
    { name: 'Notes & Docs', href: 'notes', icon: DocumentTextIcon },
  ],
  '/admin': [
    { name: 'Platforms & Integrations', href: 'integrations', icon: Cog6ToothIcon },
    { name: 'Sheet Health Check', href: 'health-check', icon: Cog6ToothIcon },
    { name: 'Hubs & Functions', href: 'hubs', icon: Cog6ToothIcon },
    { name: 'Financial Tracking', href: 'financials', icon: Cog6ToothIcon },
    { name: 'Delegation Workflows', href: 'workflows', icon: Cog6ToothIcon },
  ],
   '/profile': [
    { name: 'My Settings', href: 'settings', icon: UserCircleIcon },
    { name: 'Notifications', href: 'notifications', icon: UserCircleIcon },
    { name: 'Preferences', href: 'preferences', icon: UserCircleIcon },
    { name: 'Role Management', href: 'roles', icon: UsersIcon },
  ],
};


const Header: React.FC<HeaderProps> = ({ onSearchClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { isSignedIn, currentUser, signIn, signOut } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { hasPermission } = usePermissions();
  const { loading: dataLoading, dataError } = useData();
  
  const canCreateSomething = hasPermission('people:write');
  const canManageRoles = hasPermission('roles:write');

  const getTitle = () => {
    const pathParts = location.pathname.split('/').filter(p => p);
    if (pathParts.length === 0) return 'Dashboard';
    
    // Use the top-level section for the main title
    const section = pathParts[0]
        .replace(/-/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
        
    return section;
  };
  
  const sectionPrefix = '/' + location.pathname.split('/')[1];
  let currentTabs = navigationTabs[sectionPrefix];

  if (sectionPrefix === '/profile' && currentTabs) {
      currentTabs = currentTabs.filter(tab => {
          if (tab.href === 'roles') return canManageRoles;
          return true;
      });
  }


  const handleNavigation = (path: string) => {
    navigate(path);
    setDropdownOpen(false);
  };
  
  return (
    <header className="flex-shrink-0 bg-gray-950 border-b border-gray-800 flex flex-col">
      {/* --- Top Row --- */}
      <div className="flex items-center justify-between h-16 px-6">
        <div className="flex items-center">
            <h1 className="text-xl font-semibold text-white">{getTitle()}</h1>
        </div>
        
        <div className="flex items-center space-x-4">
            <button 
                onClick={onSearchClick}
                className="flex items-center bg-gray-800 border border-gray-700 text-gray-400 rounded-lg py-2 px-4 w-64 hover:bg-gray-700 hover:text-white transition-colors"
            >
                <SearchIcon className="w-5 h-5 text-gray-500 mr-3" />
                Search...
                <kbd className="ml-auto text-xs font-mono bg-gray-700/50 rounded px-1.5 py-0.5 border border-gray-600">⌘K</kbd>
            </button>

            {canCreateSomething && (
            <div className="relative">
                <Button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center justify-center">
                <PlusIcon className="w-5 h-5" />
                <span className="hidden md:inline ml-2">Create New</span>
                <ChevronDownIcon className="w-5 h-5 ml-1 hidden md:inline" />
                </Button>
                {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg z-10 border border-gray-700">
                    {hasPermission('people:write') && <button onClick={() => handleNavigation('/execution/people')} className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">New Person</button>}
                </div>
                )}
            </div>
            )}
            
            <div className="relative">
                <button className="text-gray-400 hover:text-white">
                    <BellIcon className="w-6 h-6"/>
                </button>
                <span
                    className={`absolute top-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-gray-950 ${
                        dataLoading
                            ? 'bg-yellow-500 animate-pulse'
                            : dataError
                            ? 'bg-red-500'
                            : 'bg-green-500'
                    }`}
                    title={
                        dataLoading
                            ? 'Loading data from Google Sheets...'
                            : dataError
                            ? `Data Error: ${dataError.message}`
                            : 'Data connection is healthy'
                    }
                />
            </div>

            {isSignedIn && currentUser ? (
                <div className="relative">
                    <button onClick={() => setUserDropdownOpen(!userDropdownOpen)} className="flex items-center space-x-2 focus:outline-none">
                        <img src={currentUser.imageUrl} alt={currentUser.name} className="w-8 h-8 rounded-full" />
                        <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                    </button>
                    {userDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-lg shadow-lg z-20 border border-gray-700">
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
            ) : (
            <Button onClick={signIn}>Sign In</Button>
            )}
        </div>
      </div>
      {/* --- Bottom Row (Contextual Tabs) --- */}
      {currentTabs && (
        <nav className="px-6 -mb-px">
            <div className="flex space-x-6" aria-label="Tabs">
                {currentTabs.map((tab) => (
                    <NavLink
                        key={tab.name}
                        to={`${sectionPrefix}/${tab.href}`}
                        end={tab.href === ''} // Use `end` prop for index-like routes
                        className={({ isActive }) =>
                            `${
                            isActive
                                ? 'border-blue-500 text-blue-400'
                                : 'border-transparent text-gray-400 hover:border-gray-500 hover:text-gray-200'
                            } flex items-center whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`
                        }
                    >
                        <tab.icon className="w-5 h-5 mr-2" />
                        {tab.name}
                    </NavLink>
                ))}
            </div>
        </nav>
      )}
    </header>
  );
};

export default Header;