
import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { PresentationChartLineIcon } from '../components/Icons'; // Using a generic icon, replace if specific ones are needed

const strategyTabs = [
    { name: 'Strategic Foundation', href: 'foundation' },
    { name: 'Business Units', href: 'business-units' },
    { name: 'Metrics & KPIs', href: 'metrics' },
    { name: 'Strategic Briefs', href: 'briefs' },
];

const TabbedPageLayout: React.FC<{ tabs: { name: string, href: string }[] }> = ({ tabs }) => {
    const activeLinkStyle = "border-blue-500 text-blue-400";
    const inactiveLinkStyle = "border-transparent text-gray-400 hover:border-gray-500 hover:text-gray-200";

    return (
        <div className="h-full flex flex-col">
            <div className="border-b border-gray-800">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    {tabs.map((tab) => (
                        <NavLink
                            key={tab.name}
                            to={tab.href}
                            end
                            className={({ isActive }) =>
                                `${isActive ? activeLinkStyle : inactiveLinkStyle} flex items-center whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`
                            }
                        >
                            <PresentationChartLineIcon className="w-5 h-5 mr-2" />
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

const StrategyPage: React.FC = () => {
    return <TabbedPageLayout tabs={strategyTabs} />;
};

export default StrategyPage;
