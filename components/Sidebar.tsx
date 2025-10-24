import React, { useCallback, useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';
import {
  BeakerIcon,
  BriefcaseIcon,
  ChartBarIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  Cog6ToothIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  FolderIcon,
  GoogleAdsIcon,
  HomeIcon,
  InteraktIcon,
  LightBulbIcon,
  MegaphoneIcon,
  MetaIcon,
  PinIcon,
  PinOffIcon,
  PresentationChartLineIcon,
  SlackIcon,
  ViewGridIcon,
  WhatsAppIcon,
  WrenchScrewdriverIcon,
} from './Icons';

interface SidebarProps {
  width: number;
  setWidth: (width: number) => void;
  isCollapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  isPinned: boolean;
  setPinned: (pinned: boolean) => void;
  collapsedWidth: number;
}

const MIN_WIDTH = 200;
const MAX_WIDTH = 500;

const Sidebar: React.FC<SidebarProps> = ({
  width,
  setWidth,
  isCollapsed,
  setCollapsed,
  isPinned,
  setPinned,
  collapsedWidth,
}) => {
  const { isSignedIn } = useAuth();
  const isResizing = useRef(false);
  const [isAppMenuOpen, setAppMenuOpen] = useState(false);
  const appMenuRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    isResizing.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing.current) return;
      let newWidth = e.clientX;
      if (newWidth < MIN_WIDTH) newWidth = MIN_WIDTH;
      if (newWidth > MAX_WIDTH) newWidth = MAX_WIDTH;
      setWidth(newWidth);
    },
    [setWidth],
  );

  const handleMouseUp = useCallback(() => {
    isResizing.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  const handleOverlayClick = () => {
    if (!isPinned) {
      setCollapsed(true);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        appMenuRef.current &&
        !appMenuRef.current.contains(event.target as Node)
      ) {
        setAppMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const finalWidth = isCollapsed ? collapsedWidth : width;

  const linkStyle =
    'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors group';
  const activeLinkStyle = 'bg-gray-800 text-white';
  const inactiveLinkStyle = 'text-gray-400 hover:bg-gray-800 hover:text-white';

  const sidebarClasses = `
    bg-gray-950 border-r border-gray-800 flex flex-col
    transition-all duration-200 ease-out
    fixed top-0 left-0 h-full z-40
  `;

  const navItems = [
    { to: '/command-center', icon: HomeIcon, label: 'COMMAND CENTER' },
    { to: '/strategy', icon: PresentationChartLineIcon, label: 'STRATEGY' },
    { to: '/brand-creative', icon: BeakerIcon, label: 'BRAND & CREATIVE' },
    { to: '/management', icon: FolderIcon, label: 'MANAGEMENT' },
    { to: '/analytics', icon: ChartBarIcon, label: 'ANALYTICS' },
    { to: '/marketing', icon: MegaphoneIcon, label: 'MARKETING' },
    { to: '/system', icon: BriefcaseIcon, label: 'SYSTEM' },
    { to: '/revenue', icon: CurrencyDollarIcon, label: 'REVENUE' },
    { to: '/tools', icon: WrenchScrewdriverIcon, label: 'TOOLS' },
    { to: '/admin', icon: Cog6ToothIcon, label: 'ADMIN', requiresAuth: true },
  ];

  const filteredNavItems = navItems.filter(
    (item) => !item.requiresAuth || isSignedIn,
  );

  return (
    <>
      <div
        style={{ width: `${finalWidth}px` }}
        className={sidebarClasses}
        onMouseLeave={() =>
          !isPinned && !isResizing.current && setCollapsed(true)
        }
        onMouseEnter={() => !isPinned && setCollapsed(false)}
      >
        <div className="flex items-center h-16 border-b border-gray-800 px-4 flex-shrink-0">
          <LightBulbIcon className="w-7 h-7 text-blue-500" />
          {!isCollapsed && (
            <span className="ml-2 text-lg font-bold text-white whitespace-nowrap">
              YDS LABS
            </span>
          )}
        </div>

        <nav
          className="flex-1 px-4 py-4 space-y-2 overflow-y-auto overflow-x-hidden"
          onClick={handleOverlayClick}
        >
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`
              }
            >
              <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
              {!isCollapsed && (
                <span className="whitespace-nowrap">{item.label}</span>
              )}
              {isCollapsed && (
                <span className="absolute left-12 bg-gray-800 text-white px-2 py-1 text-xs rounded-md scale-0 group-hover:scale-100 transition-transform origin-left">
                  {item.label}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-3 border-t border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPinned(!isPinned)}
              title={isPinned ? 'Unpin Sidebar' : 'Pin Sidebar'}
              className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-gray-800"
            >
              {isPinned ? (
                <PinIcon className="w-5 h-5" />
              ) : (
                <PinOffIcon className="w-5 h-5" />
              )}
            </button>

            <div className="relative" ref={appMenuRef}>
              <button
                onClick={() => setAppMenuOpen((o) => !o)}
                title="App Launcher"
                className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-gray-800"
              >
                <ViewGridIcon className="w-5 h-5" />
              </button>
              {isAppMenuOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-lg p-2">
                  <div className="grid grid-cols-2 gap-1">
                    {[
                      {
                        icon: EnvelopeIcon,
                        label: 'Gmail',
                        href: 'https://gmail.com',
                      },
                      { icon: SlackIcon, label: 'Slack', href: 'https://slack.com' },
                      {
                        icon: WhatsAppIcon,
                        label: 'WhatsApp',
                        href: 'https://web.whatsapp.com',
                      },
                      { icon: InteraktIcon, label: 'Interakt', href: '#' },
                      {
                        icon: MetaIcon,
                        label: 'Meta Ads',
                        href: 'https://www.facebook.com/adsmanager',
                      },
                      {
                        icon: GoogleAdsIcon,
                        label: 'Google Ads',
                        href: 'https://ads.google.com',
                      },
                      {
                        icon: ChartBarIcon,
                        label: 'Looker Studio',
                        href: 'https://lookerstudio.google.com',
                      },
                      { icon: DocumentTextIcon, label: 'Report', href: '#' },
                    ].map((item) => (
                      <a
                        key={item.label}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center text-center p-2 rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        <item.icon className="w-6 h-6 mb-1 text-gray-300" />
                        <span className="text-xs text-gray-400">{item.label}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          {!isCollapsed && (
            <button
              onClick={() => setCollapsed(true)}
              title="Collapse Sidebar"
              className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-gray-800"
            >
              <ChevronDoubleLeftIcon className="w-5 h-5" />
            </button>
          )}
          {isCollapsed && (
            <button
              onClick={() => setCollapsed(false)}
              title="Expand Sidebar"
              className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-gray-800"
            >
              <ChevronDoubleRightIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        {!isCollapsed && (
          <div
            onMouseDown={handleMouseDown}
            className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize bg-gray-800/20 hover:bg-blue-500/50 transition-colors"
          />
        )}
      </div>
      {!isPinned && !isCollapsed && (
        <div
          onClick={() => setCollapsed(true)}
          className="fixed inset-0 bg-black/50 z-30"
        ></div>
      )}
    </>
  );
};

export default Sidebar;