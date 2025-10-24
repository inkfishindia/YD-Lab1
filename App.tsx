import React, { Suspense, useCallback, useEffect, useState } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';

import CommandPalette from './components/CommandPalette';
import ConfigurationNeeded from './components/ConfigurationNeeded';
import { Header } from './components/Header';
import Sidebar from './components/Sidebar';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { PermissionsProvider } from './contexts/PermissionsContext';
import {
  SpreadsheetConfigProvider,
  useSpreadsheetConfig,
} from './contexts/SpreadsheetConfigContext';

// Lazy-loaded page components
const AdminPage = React.lazy(() => import('./pages/AdminPage'));
const DelegationWorkflowsPage = React.lazy(
  () => import('./pages/admin/DelegationWorkflowsPage'),
);
const FinancialTrackingPage = React.lazy(
  () => import('./pages/admin/FinancialTrackingPage'),
);
const HubsFunctionsPage = React.lazy(
  () => import('./pages/admin/HubsFunctionsPage'),
);
const PlatformsIntegrationsPage = React.lazy(
  () => import('./pages/admin/PlatformsIntegrationsPage'),
);
const RoleManagementPage = React.lazy(
  () => import('./pages/admin/RoleManagementPage'),
);
const SheetHealthCheckPage = React.lazy(
  () => import('./pages/admin/SheetHealthCheckPage'),
);
const CommandCenterPage = React.lazy(() => import('./pages/CommandCenterPage'));
const DashboardPage = React.lazy(
  () => import('./pages/command-center/DashboardPage'),
);
const ExecutiveDashboardPage = React.lazy(
  () => import('./pages/command-center/ExecutiveDashboardPage'),
);
const BrandCreativePage = React.lazy(() => import('./pages/BrandCreativePage'));
const CompetitorAnalysisPage = React.lazy(
  () => import('./pages/creative/CompetitorAnalysisPage'),
);
const CustomerJourneyPage = React.lazy(
  () => import('./pages/creative/CustomerJourneyPage'),
);
const DesignSystemPage = React.lazy(
  () => import('./pages/creative/DesignSystemPage'),
);
const ExperienceStorePage = React.lazy(
  () => import('./pages/creative/ExperienceStorePage'),
);
const VisualMoodPage = React.lazy(
  () => import('./pages/creative/VisualMoodPage'),
);
const ManagementPage = React.lazy(() => import('./pages/ManagementPage'));
// FIX: ProgramsViewPage does not appear to have a 'default' export. Accessing the named export directly.
const ProgramsViewPage = React.lazy(() => import('./pages/execution/ProgramsViewPage').then(module => ({ default: module.ProgramsViewPage })));
const MarketingPage = React.lazy(() => import('./pages/MarketingPage'));
const CampaignsTabs = React.lazy(
  () => import('./pages/marketing/CampaignsTabs'),
);
const CampaignCalendarPage = React.lazy(
  () => import('./pages/marketing/campaigns/CampaignCalendarPage'),
);
const CampaignDetailPage = React.lazy(
  () => import('./pages/marketing/campaigns/CampaignDetailPage'),
);
const PerformanceDashboardPage = React.lazy(
  () => import('./pages/marketing/campaigns/PerformanceDashboardPage'),
);
const AllInterfacesPage = React.lazy(
  () => import('./pages/marketing/channels/AllInterfacesPage'),
);
const BudgetAllocationPage = React.lazy(
  () => import('./pages/marketing/channels/BudgetAllocationPage'),
);
const ChannelsListPage = React.lazy(
  () => import('./pages/marketing/channels/ChannelsListPage'),
);
const InterfacePerformancePage = React.lazy(
  () => import('./pages/marketing/channels/InterfacePerformancePage'),
);
const ContentPipelineTabs = React.lazy(
  () => import('./pages/marketing/ContentPipelineTabs'),
);
const AssetDetailPage = React.lazy(
  () => import('./pages/marketing/content/AssetDetailPage'),
);
const ContentKanbanPage = React.lazy(
  () => import('./pages/marketing/content/ContentKanbanPage'),
);
const ContentLibraryPage = React.lazy(
  () => import('./pages/marketing/content/ContentLibraryPage'),
);
const InterfacesTabs = React.lazy(
  () => import('./pages/marketing/InterfacesTabs'),
);
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const MySettingsPage = React.lazy(
  () => import('./pages/profile/MySettingsPage'),
);
const NotificationsPage = React.lazy(
  () => import('./pages/profile/NotificationsPage'),
);
const PreferencesPage = React.lazy(
  () => import('./pages/profile/PreferencesPage'),
);
const RevenuePage = React.lazy(() => import('./pages/RevenuePage'));
const AccountsTabs = React.lazy(() => import('./pages/revenue/AccountsTabs'));
const Account360ViewPage = React.lazy(
  () => import('./pages/revenue/accounts/Account360ViewPage'),
);
const AccountHealthPage = React.lazy(
  () => import('./pages/revenue/accounts/AccountHealthPage'),
);
const AllAccountsPage = React.lazy(
  () => import('./pages/revenue/accounts/AllAccountsPage'),
);
const LeadsTabs = React.lazy(() => import('./pages/revenue/LeadsTabs'));
// FIX: LeadInboxPage does not appear to have a 'default' export. Accessing the named export directly.
const LeadInboxPage = React.lazy(() => import('./pages/revenue/leads/LeadInboxPage').then(module => ({ default: module.LeadInboxPage })));
const LeadDetailPage = React.lazy(
  () => import('./pages/revenue/leads/LeadDetailPage'),
);
const LeadScoringPage = React.lazy(
  () => import('./pages/revenue/leads/LeadScoringPage'),
);
const OpportunitiesTabs = React.lazy(
  () => import('./pages/revenue/OpportunitiesTabs'),
);
const DealForecastPage = React.lazy(
  () => import('./pages/revenue/opportunities/DealForecastPage'),
);
const OpportunityDetailPage = React.lazy(
  () => import('./pages/revenue/opportunities/OpportunityDetailPage'),
);
// FIX: PipelineViewPage does not appear to have a 'default' export. Accessing the named export directly.
const PipelineViewPage = React.lazy(
  () => import('./pages/revenue/opportunities/PipelineViewPage').then(module => ({ default: module.PipelineViewPage })),
);
const ProductsTabs = React.lazy(() => import('./pages/revenue/ProductsTabs'));
const InventoryStatusPage = React.lazy(
  () => import('./pages/revenue/products/InventoryStatusPage'),
);
const ProductCatalogPage = React.lazy(
  () => import('./pages/revenue/products/ProductCatalogPage'),
);
const ProductDetailPage = React.lazy(
  () => import('./pages/revenue/products/Product/ProductDetailPage'),
);
const StrategyPage = React.lazy(() => import('./pages/StrategyPage'));
const BusinessModelCanvasPage = React.lazy(
  () => import('./pages/strategy/BusinessModelCanvasPage'),
);
const BriefsTabs = React.lazy(() => import('./pages/strategy/BriefsTabs'));
const ActiveDecisionsPage = React.lazy(
  () => import('./pages/strategy/briefs/ActiveDecisionsPage'),
);
const DecisionArchivePage = React.lazy(
  () => import('./pages/strategy/briefs/DecisionArchivePage'),
);
const DecisionDetailPage = React.lazy(
  () => import('./pages/strategy/briefs/DecisionDetailPage'),
);
const BusinessUnitsTabs = React.lazy(
  () => import('./pages/strategy/BusinessUnitsTabs'),
);
const BUDetailPage = React.lazy(
  () => import('./pages/strategy/business-units/BUDetailPage'),
);
const BUMaturityTrackerPage = React.lazy(
  () => import('./pages/strategy/business-units/BUMaturityTrackerPage'),
);
const BUPerformancePage = React.lazy(
  () => import('./pages/strategy/business-units/BUPerformancePage'),
);
const FlywheelsMapPage = React.lazy(
  () => import('./pages/strategy/foundation/FlywheelsMapPage'),
);
const MetricsTabs = React.lazy(() => import('./pages/strategy/MetricsTabs'));
const ExecutiveScorecardPage = React.lazy(
  () => import('./pages/strategy/metrics/ExecutiveScorecardPage'),
);
const MetricTargetsPage = React.lazy(
  () => import('./pages/strategy/metrics/MetricTargetsPage'),
);
const WeeklyBusinessReviewPage = React.lazy(
  () => import('./pages/strategy/metrics/WeeklyBusinessReviewPage'),
);
const PositioningPage = React.lazy(
  () => import('./pages/strategy/PositioningPage'),
);
const SystemPage = React.lazy(() => import('./pages/SystemPage'));
const SystemMapPage = React.lazy(() => import('./pages/system/SystemMapPage'));
const ToolsPage = React.lazy(() => import('./pages/ToolsPage'));
const AIAssistantPage = React.lazy(
  () => import('./pages/tools/AIAssistantPage'),
);
const BrainDumpPage = React.lazy(() => import('./pages/tools/BrainDumpPage'));
const CalendarPage = React.lazy(() => import('./pages/tools/CalendarPage'));
const InboxPage = React.lazy(() => import('./pages/tools/InboxPage'));
const NotesDocsPage = React.lazy(() => import('./pages/tools/NotesDocsPage'));
const NotebookLLMPage = React.lazy(() => import('./pages/tools/NotebookLLMPage'));
const AnalyticsPage = React.lazy(() => import('./pages/AnalyticsPage'));
const KPIImportsPage = React.lazy(
  () => import('./pages/analytics/KPIImportsPage'),
);

const App: React.FC = () => {
  return (
    <AuthProvider>
      <SpreadsheetConfigProvider>
        <DataProvider>
          <PermissionsProvider>
            <AppContent />
          </PermissionsProvider>
        </DataProvider>
      </SpreadsheetConfigProvider>
    </AuthProvider>
  );
};

const AppContent: React.FC = () => {
  const { isSignedIn, isLoading, initError } = useAuth();
  const { isConfigured, isConfigLoading } = useSpreadsheetConfig();
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setCommandPaletteOpen((k) => !k);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (initError) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950 text-white p-4">
        <div className="max-w-2xl w-full text-center p-8 bg-gray-900 rounded-lg shadow-xl border border-red-500/50">
          <h2 className="text-2xl font-bold text-red-400 mb-4">
            Application Configuration Error
          </h2>
          <p className="text-gray-300 text-left whitespace-pre-wrap">
            {initError}
          </p>
          <a
            href="https://console.cloud.google.com/apis/library/sheets.googleapis.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-6 px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
          >
            Enable APIs in Google Cloud
          </a>
        </div>
      </div>
    );
  }

  if (isLoading || isConfigLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950">
        <div className="text-white text-xl animate-pulse">Loading...</div>
      </div>
    );
  }

  const needsConfiguration = isSignedIn && !isConfigured;

  return (
    <HashRouter>
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
      <Routes>
        <Route
          path="/*"
          element={
            <MainLayout
              unconfigured={needsConfiguration}
              openCommandPalette={() => setCommandPaletteOpen(true)}
            />
          }
        />
      </Routes>
    </HashRouter>
  );
};

const MainLayout: React.FC<{
  unconfigured?: boolean;
  openCommandPalette: () => void;
}> = ({ unconfigured = false, openCommandPalette }) => {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const savedWidth = localStorage.getItem('sidebarWidth');
    return savedWidth ? parseInt(savedWidth, 10) : 256; // 256px = w-64
  });
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('sidebarCollapsed') === 'true';
  });
  const [isSidebarPinned, setSidebarPinned] = useState(() => {
    return localStorage.getItem('sidebarPinned') !== 'false'; // Default to pinned
  });
  const COLLAPSED_SIDEBAR_WIDTH = 72; // px

  useEffect(() => {
    localStorage.setItem('sidebarWidth', sidebarWidth.toString());
  }, [sidebarWidth]);

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', isSidebarCollapsed.toString());
  }, [isSidebarCollapsed]);

  useEffect(() => {
    localStorage.setItem('sidebarPinned', isSidebarPinned.toString());
  }, [isSidebarPinned]);

  const mainContentStyle = {
    paddingLeft:
      isSidebarPinned && !isSidebarCollapsed
        ? `${sidebarWidth}px`
        : `${COLLAPSED_SIDEBAR_WIDTH}px`,
    transition: 'padding-left 200ms ease-out',
  };

  const handleContentClick = () => {
    if (!isSidebarPinned && !isSidebarCollapsed) {
      setSidebarCollapsed(true);
    }
  };

  return (
    <div className="bg-gray-950 text-gray-200 font-sans min-h-screen">
      <Sidebar
        width={sidebarWidth}
        setWidth={setSidebarWidth}
        isCollapsed={isSidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        isPinned={isSidebarPinned}
        setPinned={setSidebarPinned}
        collapsedWidth={COLLAPSED_SIDEBAR_WIDTH}
      />
      <div
        className="flex flex-col h-screen"
        style={mainContentStyle}
        onClick={handleContentClick}
      >
        <Header onSearchClick={openCommandPalette} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-900 p-4 md:p-6 lg:p-8">
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-full">
                <div className="text-white text-xl animate-pulse">
                  Loading Page...
                </div>
              </div>
            }
          >
            {unconfigured ? (
              <Routes>
                <Route
                  path="/admin/integrations"
                  element={<PlatformsIntegrationsPage />}
                />
                <Route path="*" element={<ConfigurationNeeded />} />
              </Routes>
            ) : (
              <Routes>
                <Route
                  path="/"
                  element={<Navigate to="/command-center/dashboard" replace />}
                />

                {/* COMMAND CENTER */}
                <Route path="/command-center" element={<CommandCenterPage />}>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route
                    path="executive-dashboard"
                    element={<ExecutiveDashboardPage />}
                  />
                </Route>

                {/* MANAGEMENT (formerly EXECUTION) */}
                <Route path="/management" element={<ManagementPage />}>
                  <Route index element={<Navigate to="programs" replace />} />
                  <Route path="programs" element={<ProgramsViewPage />} />
                  <Route path="*" element={<Navigate to="programs" replace />} />
                </Route>

                {/* MARKETING */}
                <Route path="/marketing" element={<MarketingPage />}>
                  <Route index element={<Navigate to="campaigns" replace />} />
                  <Route path="campaigns" element={<CampaignsTabs />}>
                    <Route
                      index
                      element={<Navigate to="calendar" replace />}
                    />
                    <Route
                      path="calendar"
                      element={<CampaignCalendarPage />}
                    />
                    <Route path="detail" element={<CampaignDetailPage />} />
                    <Route
                      path="performance"
                      element={<PerformanceDashboardPage />}
                    />
                  </Route>
                  <Route path="content" element={<ContentPipelineTabs />}>
                    <Route index element={<Navigate to="kanban" replace />} />
                    <Route path="kanban" element={<ContentKanbanPage />} />
                    <Route path="asset" element={<AssetDetailPage />} />
                    <Route path="library" element={<ContentLibraryPage />} />
                  </Route>
                  <Route path="interfaces" element={<InterfacesTabs />}>
                    <Route index element={<Navigate to="all" replace />} />
                    <Route path="all" element={<AllInterfacesPage />} />
                    <Route path="channels" element={<ChannelsListPage />} />
                    <Route
                      path="performance"
                      element={<InterfacePerformancePage />}
                    />
                    <Route path="budget" element={<BudgetAllocationPage />} />
                  </Route>
                </Route>

                {/* BRAND & CREATIVE (formerly CREATIVE) */}
                <Route path="/brand-creative" element={<BrandCreativePage />}>
                  <Route index element={<Navigate to="ydc-map" replace />} />
                  <Route path="ydc-map" element={<DesignSystemPage />} />
                  <Route
                    path="competitor-analysis"
                    element={<CompetitorAnalysisPage />}
                  />
                  <Route path="visual-mood" element={<VisualMoodPage />} />
                  <Route
                    path="experience-store"
                    element={<ExperienceStorePage />}
                  />
                  <Route
                    path="customer-journey"
                    element={<CustomerJourneyPage />}
                  />
                </Route>

                {/* REVENUE */}
                <Route path="/revenue" element={<RevenuePage />}>
                  <Route index element={<Navigate to="leads" replace />} />
                  <Route path="leads" element={<LeadsTabs />}>
                    <Route index element={<Navigate to="inbox" replace />} />
                    <Route path="inbox" element={<LeadInboxPage />} />
                    <Route path="detail" element={<LeadDetailPage />} />
                    <Route path="scoring" element={<LeadScoringPage />} />
                  </Route>
                  <Route path="opportunities" element={<OpportunitiesTabs />}>
                    <Route
                      index
                      element={<Navigate to="pipeline" replace />}
                    />
                    <Route path="pipeline" element={<PipelineViewPage />} />
                    <Route
                      path="detail"
                      element={<OpportunityDetailPage />}
                    />
                    <Route path="forecast" element={<DealForecastPage />} />
                  </Route>
                  <Route path="accounts" element={<AccountsTabs />}>
                    <Route index element={<Navigate to="all" replace />} />
                    <Route path="all" element={<AllAccountsPage />} />
                    <Route
                      path="view-360"
                      element={<Account360ViewPage />}
                    />
                    <Route path="health" element={<AccountHealthPage />} />
                  </Route>
                  <Route path="products" element={<ProductsTabs />}>
                    <Route index element={<Navigate to="catalog" replace />} />
                    <Route path="catalog" element={<ProductCatalogPage />} />
                    <Route path="detail" element={<ProductDetailPage />} />
                    <Route
                      path="inventory"
                      element={<InventoryStatusPage />}
                    />
                  </Route>
                </Route>

                {/* STRATEGY */}
                <Route path="/strategy" element={<StrategyPage />}>
                  <Route
                    index
                    element={<Navigate to="dashboard" replace />}
                  />
                  <Route path="dashboard" element={<FlywheelsMapPage />} />
                  <Route path="business-model-canvas" element={<BusinessModelCanvasPage />} />
                  <Route path="positioning" element={<PositioningPage />} />
                  <Route path="business-units" element={<BusinessUnitsTabs />}>
                    <Route
                      index
                      element={<Navigate to="performance" replace />}
                    />
                    <Route
                      path="performance"
                      element={<BUPerformancePage />}
                    />
                    <Route path="detail" element={<BUDetailPage />} />
                    <Route
                      path="maturity"
                      element={<BUMaturityTrackerPage />}
                    />
                  </Route>
                  <Route path="metrics" element={<MetricsTabs />}>
                    <Route
                      index
                      element={<Navigate to="scorecard" replace />}
                    />
                    <Route
                      path="scorecard"
                      element={<ExecutiveScorecardPage />}
                    />
                    <Route
                      path="review"
                      element={<WeeklyBusinessReviewPage />}
                    />
                    <Route path="targets" element={<MetricTargetsPage />} />
                  </Route>
                  <Route path="briefs" element={<BriefsTabs />}>
                    <Route index element={<Navigate to="active" replace />} />
                    <Route path="active" element={<ActiveDecisionsPage />} />
                    <Route path="detail" element={<DecisionDetailPage />} />
                    <Route path="archive" element={<DecisionArchivePage />} />
                  </Route>
                </Route>

                {/* SYSTEM */}
                <Route path="/system" element={<SystemPage />}>
                  <Route index element={<Navigate to="map" replace />} />
                  <Route path="map" element={<SystemMapPage />} />
                </Route>

                {/* ANALYTICS (New) */}
                <Route path="/analytics" element={<AnalyticsPage />}>
                  <Route index element={<Navigate to="kpi-imports" replace />} />
                  <Route path="kpi-imports" element={<KPIImportsPage />} />
                </Route>

                {/* TOOLS */}
                <Route path="/tools" element={<ToolsPage />}>
                  <Route
                    index
                    element={<Navigate to="braindump" replace />}
                  />
                  <Route path="braindump" element={<BrainDumpPage />} />
                  <Route path="ai-assistant" element={<AIAssistantPage />} />
                  <Route path="notebook-llm" element={<NotebookLLMPage />} />
                  <Route path="inbox" element={<InboxPage />} />
                  <Route path="calendar" element={<CalendarPage />} />
                  <Route path="notes" element={<NotesDocsPage />} />
                </Route>

                {/* ADMIN */}
                <Route path="/admin" element={<AdminPage />}>
                  <Route
                    index
                    element={<Navigate to="integrations" replace />}
                  />
                  <Route
                    path="integrations"
                    element={<PlatformsIntegrationsPage />}
                  />
                  <Route
                    path="health-check"
                    element={<SheetHealthCheckPage />}
                  />
                  <Route path="hubs" element={<HubsFunctionsPage />} />
                  <Route
                    path="financials"
                    element={<FinancialTrackingPage />}
                  />
                  <Route
                    path="workflows"
                    element={<DelegationWorkflowsPage />}
                  />
                </Route>

                {/* PROFILE */}
                <Route path="/profile" element={<ProfilePage />}>
                  <Route index element={<Navigate to="settings" replace />} />
                  <Route path="settings" element={<MySettingsPage />} />
                  <Route
                    path="notifications"
                    element={<NotificationsPage />}
                  />
                  <Route path="preferences" element={<PreferencesPage />} />
                  <Route path="roles" element={<RoleManagementPage />} />
                </Route>

                <Route
                  path="*"
                  element={
                    <Navigate to="/command-center/dashboard" replace />
                  }
                />
              </Routes>
            )}
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default App;