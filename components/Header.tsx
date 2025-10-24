import React, { useState } from 'react';
import { useLocation, useNavigate, Link, NavLink } from 'react-router-dom';

import Button from './ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { usePermissions } from '../contexts/PermissionsContext';
import {
  SearchIcon,
  BellIcon,
  PlusIcon,
  ChevronDownIcon,
  HomeIcon,
  ChartBarIcon,
  FolderIcon,
  MegaphoneIcon,
  IdentificationIcon,
  TrendingUpIcon,
  CollectionIcon,
  BriefcaseIcon,
  PresentationChartLineIcon,
  WrenchScrewdriverIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  LightBulbIcon,
  EnvelopeIcon,
  CalendarIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  UsersIcon,
  SwatchIcon,
  ScaleIcon,
  PencilIcon,
  BuildingStorefrontIcon,
  QueueListIcon,
  RefreshIcon,
  SparklesIcon,
  TargetIcon,
} from './Icons';

interface HeaderProps {
  onSearchClick: () => void;
}

const navigationTabs: Record<
  string,
  { name: string; href: string; icon: React.ElementType }[]
> = {
  '/command-center': [
    { name: 'Dashboard', href: 'dashboard', icon: HomeIcon },
    {
      name: 'Executive Dashboard',
      href: 'executive-dashboard',
      icon: ChartBarIcon,
    },
  ],
  '/management': [{ name: 'Programs', href: '', icon: FolderIcon }],
  '/marketing': [
    { name: 'Campaigns', href: 'campaigns', icon: MegaphoneIcon },
    { name: 'Content Pipeline', href: 'content', icon: MegaphoneIcon },
    { name: 'Interfaces', href: 'interfaces', icon: MegaphoneIcon },
  ],
  '/brand-creative': [
    { name: 'YDC Map', href: 'ydc-map', icon: SwatchIcon },
    { name: 'Competitor Analysis', href: 'competitor-analysis', icon: ScaleIcon },
    { name: 'Visual Mood', href: 'visual-mood', icon: PencilIcon },
    {
      name: 'Experience Store',
      href: 'experience-store',
      icon: BuildingStorefrontIcon,
    },
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
    { name: 'Business Model Canvas', href: 'business-model-canvas', icon: DocumentTextIcon },
    { name: 'Positioning', href: 'positioning', icon: TargetIcon },
    {
      name: 'Business Units',
      href: 'business-units',
      icon: PresentationChartLineIcon,
    },
    { name: 'Metrics & KPIs', href: 'metrics', icon: PresentationChartLineIcon },
    {
      name: 'Strategic Briefs',
      href: 'briefs',
      icon: PresentationChartLineIcon,
    },
  ],
  '/analytics': [
    { name: 'KPI & Imports', href: 'kpi-imports', icon: ChartBarIcon },
  ],
  '/system': [{ name: 'System Map', href: 'map', icon: BriefcaseIcon }],
  '/tools': [
    { name: 'BrainDump', href: 'braindump', icon: ChatBubbleOvalLeftEllipsisIcon },
    { name: 'AI Assistant', href: 'ai-assistant', icon: LightBulbIcon },
    { name: 'Notebook LLM', href: 'notebook-llm', icon: SparklesIcon },
    { name: 'Inbox', href: 'inbox', icon: EnvelopeIcon },
    { name: 'Calendar', href: 'calendar', icon: CalendarIcon },
    { name: 'Notes & Docs', href: 'notes', icon: DocumentTextIcon },
  ],
  '/admin': [
    {
      name: 'Platforms & Integrations',
      href: 'integrations',
      icon: Cog6ToothIcon,
    },
    { name: 'Sheet Health Check', href: 'health-check', icon: Cog6ToothIcon },
    { name: 'Hubs & Functions', href: 'hubs', icon: Cog6ToothIcon },
    { name: 'Financial Tracking', href: 'financials', icon: Cog6ToothIcon },
    { name: 'Delegation Workflows', href: 'workflows', icon: Cog6ToothIcon },
  ],
  '/profile': [
    { name: 'My Settings', href: 'settings', icon: UserCircleIcon },
    { name: 'Notifications', href: 'notifications', icon: BellIcon },
    { name: 'Preferences', href: 'preferences', icon: Cog6ToothIcon },
    { name: 'Role Management', href: 'roles', icon: UsersIcon },
  ],
};

export const Header: React.FC<HeaderProps> = ({ onSearchClick }) => {
  const { isSignedIn, signOut, currentUser } = useAuth();
  const { refreshData, loading: dataLoading } = useData();
  const location = useLocation();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const currentPath = `/${location.pathname.split('/')[1]}`;
  const tabs = navigationTabs[currentPath] || [];

  const handleSignOut = () => {
    signOut();
    navigate('/login');
  };

  return (
    <header className="flex-shrink-0 h-16 bg-gray-950 border-b border-gray-800 flex items-center justify-between px-6 z-10">
      <div className="flex items-center">
        <nav className="flex space-x-4">
          {tabs.map((tab) => (
            <NavLink
              key={tab.href}
              to={`${currentPath}/${tab.href}`}
              className={({ isActive }) =>
                `px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <div className="flex items-center gap-2">
                {<tab.icon className="w-4 h-4" />}
                <span>{tab.name}</span>
              </div>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={onSearchClick}
          className="p-2 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
          title="Search (Ctrl+K)"
        >
          <SearchIcon className="w-5 h-5" />
        </button>
        <button
          className="p-2 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
          title="Notifications"
        >
          <BellIcon className="w-5 h-5" />
        </button>

        <Button
          onClick={refreshData}
          disabled={dataLoading}
          variant="secondary"
          className="!p-2"
          title="Refresh Data"
        >
          <RefreshIcon className={`w-5 h-5 ${dataLoading ? 'animate-spin' : ''}`} />
        </Button>

        {isSignedIn ? (
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
            >
              <img
                src={
                  currentUser?.imageUrl ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser?.name || 'User'}`
                }
                alt="User Avatar"
                className="w-8 h-8 rounded-full"
              />
              <span className="text-sm font-medium hidden md:inline">
                {currentUser?.name || 'User'}
              </span>
              <ChevronDownIcon className="w-4 h-4 ml-1" />
            </button>
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-md shadow-lg py-1 z-20">
                <Link
                  to="/profile/settings"
                  className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                  onClick={() => setUserMenuOpen(false)}
                >
                  My Settings
                </Link>
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login">
            <Button>Sign In</Button>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;