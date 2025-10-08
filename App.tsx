
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider } from './contexts/DataContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PermissionsProvider } from './contexts/PermissionsContext';
import { SpreadsheetConfigProvider, useSpreadsheetConfig } from './contexts/SpreadsheetConfigContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LoginPage from './pages/LoginPage';
import ConfigurationNeeded from './components/ConfigurationNeeded';

// --- Layouts ---
import CommandCenterPage from './pages/CommandCenterPage';
import ExecutionPage from './pages/ExecutionPage';
import MarketingPage from './pages/MarketingPage';
import RevenuePage from './pages/RevenuePage';
import StrategyPage from './pages/StrategyPage';
import ToolsPage from './pages/ToolsPage';
import AdminPage from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';

// --- Command Center ---
import DashboardPage from './pages/command-center/DashboardPage';
import ExecutiveDashboardPage from './pages/command-center/ExecutiveDashboardPage';

// --- Execution ---
import ProjectsTabs from './pages/execution/ProjectsTabs';
import AllProjectsListPage from './pages/execution/projects/AllProjectsListPage';
import ProjectDetailPage from './pages/execution/projects/ProjectDetailPage';
import ProjectAnalyticsPage from './pages/execution/projects/ProjectAnalyticsPage';
import TasksTabs from './pages/execution/TasksTabs';
import MyTasksPage from './pages/execution/tasks/MyTasksPage';
import AllTasksTablePage from './pages/execution/tasks/AllTasksTablePage';
import BoardViewPage from './pages/execution/tasks/BoardViewPage';
import CalendarViewPage from './pages/execution/tasks/CalendarViewPage';
import PeopleTabs from './pages/execution/PeopleTabs';
import TeamDirectoryPage from './pages/execution/people/TeamDirectoryPage';
import PersonDetailPage from './pages/execution/people/PersonDetailPage';
import CapacityDashboardPage from './pages/execution/people/CapacityDashboardPage';
import TimeTrackingTabs from './pages/execution/TimeTrackingTabs';
import WeeklyTimesheetPage from './pages/execution/timetracking/WeeklyTimesheetPage';
import UtilizationReportPage from './pages/execution/timetracking/UtilizationReportPage';

// --- Marketing ---
import CampaignsTabs from './pages/marketing/CampaignsTabs';
import CampaignCalendarPage from './pages/marketing/campaigns/CampaignCalendarPage';
import CampaignDetailPage from './pages/marketing/campaigns/CampaignDetailPage';
import PerformanceDashboardPage from './pages/marketing/campaigns/PerformanceDashboardPage';
import ContentPipelineTabs from './pages/marketing/ContentPipelineTabs';
import ContentKanbanPage from './pages/marketing/content/ContentKanbanPage';
import AssetDetailPage from './pages/marketing/content/AssetDetailPage';
import ContentLibraryPage from './pages/marketing/content/ContentLibraryPage';
import ChannelsTabs from './pages/marketing/ChannelsTabs';
import AllChannelsPage from './pages/marketing/channels/AllChannelsPage';
import ChannelPerformancePage from './pages/marketing/channels/ChannelPerformancePage';
import BudgetAllocationPage from './pages/marketing/channels/BudgetAllocationPage';

// --- Revenue ---
import LeadsTabs from './pages/revenue/LeadsTabs';
import LeadInboxPage from './pages/revenue/leads/LeadInboxPage';
import LeadDetailPage from './pages/revenue/leads/LeadDetailPage';
import LeadScoringPage from './pages/revenue/leads/LeadScoringPage';
import OpportunitiesTabs from './pages/revenue/OpportunitiesTabs';
import PipelineViewPage from './pages/revenue/opportunities/PipelineViewPage';
import OpportunityDetailPage from './pages/revenue/opportunities/OpportunityDetailPage';
import DealForecastPage from './pages/revenue/opportunities/DealForecastPage';
import AccountsTabs from './pages/revenue/AccountsTabs';
import AllAccountsPage from './pages/revenue/accounts/AllAccountsPage';
import Account360ViewPage from './pages/revenue/accounts/Account360ViewPage';
import AccountHealthPage from './pages/revenue/accounts/AccountHealthPage';
import ProductsTabs from './pages/revenue/ProductsTabs';
import ProductCatalogPage from './pages/revenue/products/ProductCatalogPage';
import ProductDetailPage from './pages/revenue/products/ProductDetailPage';
import InventoryStatusPage from './pages/revenue/products/InventoryStatusPage';

// --- Strategy ---
import FoundationTabs from './pages/strategy/FoundationTabs';
import CustomerSegmentsPage from './pages/strategy/foundation/CustomerSegmentsPage';
import FlywheelsMapPage from './pages/strategy/foundation/FlywheelsMapPage';
import BusinessUnitsOverviewPage from './pages/strategy/foundation/BusinessUnitsOverviewPage';
import BusinessUnitsTabs from './pages/strategy/BusinessUnitsTabs';
import BUPerformancePage from './pages/strategy/business-units/BUPerformancePage';
import BUDetailPage from './pages/strategy/business-units/BUDetailPage';
import BUMaturityTrackerPage from './pages/strategy/business-units/BUMaturityTrackerPage';
import MetricsTabs from './pages/strategy/MetricsTabs';
import ExecutiveScorecardPage from './pages/strategy/metrics/ExecutiveScorecardPage';
import WeeklyBusinessReviewPage from './pages/strategy/metrics/WeeklyBusinessReviewPage';
import MetricTargetsPage from './pages/strategy/metrics/MetricTargetsPage';
import BriefsTabs from './pages/strategy/BriefsTabs';
import ActiveDecisionsPage from './pages/strategy/briefs/ActiveDecisionsPage';
import DecisionDetailPage from './pages/strategy/briefs/DecisionDetailPage';
import DecisionArchivePage from './pages/strategy/briefs/DecisionArchivePage';

// --- Tools ---
import BrainDumpPage from './pages/tools/BrainDumpPage';
import AIAssistantPage from './pages/tools/AIAssistantPage';
import InboxPage from './pages/tools/InboxPage';
import CalendarPage from './pages/tools/CalendarPage';
import NotesDocsPage from './pages/tools/NotesDocsPage';

// --- Admin ---
import PlatformsIntegrationsPage from './pages/admin/PlatformsIntegrationsPage';
import HubsFunctionsPage from './pages/admin/HubsFunctionsPage';
import FinancialTrackingPage from './pages/admin/FinancialTrackingPage';
import DelegationWorkflowsPage from './pages/admin/DelegationWorkflowsPage';

// --- Profile ---
import MySettingsPage from './pages/profile/MySettingsPage';
import NotificationsPage from './pages/profile/NotificationsPage';
import PreferencesPage from './pages/profile/PreferencesPage';


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

  if (initError) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950 text-white p-4">
        <div className="max-w-2xl w-full text-center p-8 bg-gray-900 rounded-lg shadow-xl border border-red-500/50">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Application Configuration Error</h2>
          <p className="text-gray-300 text-left whitespace-pre-wrap">{initError}</p>
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

  return (
    <HashRouter>
      <Routes>
        {!isSignedIn ? (
          <Route path="*" element={<LoginPage />} />
        ) : !isConfigured ? (
          <Route path="*" element={<MainLayout unconfigured />} />
        ) : (
          <Route path="/*" element={<MainLayout />} />
        )}
      </Routes>
    </HashRouter>
  );
};

const MainLayout: React.FC<{ unconfigured?: boolean }> = ({ unconfigured = false }) => (
  <div className="flex h-screen bg-gray-950 text-gray-200 font-sans">
    <Sidebar />
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header />
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-900 p-4 md:p-6 lg:p-8">
        {unconfigured ? (
          <Routes>
              <Route path="/admin/integrations" element={<PlatformsIntegrationsPage />} />
              <Route path="*" element={<ConfigurationNeeded />} />
          </Routes>
        ) : (
          <Routes>
            <Route path="/" element={<Navigate to="/command-center/dashboard" replace />} />

            {/* COMMAND CENTER */}
            <Route path="/command-center" element={<CommandCenterPage />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="executive-dashboard" element={<ExecutiveDashboardPage />} />
            </Route>

            {/* EXECUTION */}
            <Route path="/execution" element={<ExecutionPage />}>
              <Route index element={<Navigate to="projects" replace />} />
              <Route path="projects" element={<ProjectsTabs />}>
                <Route index element={<Navigate to="all" replace />} />
                <Route path="all" element={<AllProjectsListPage />} />
                <Route path="detail" element={<ProjectDetailPage />} />
                <Route path="analytics" element={<ProjectAnalyticsPage />} />
              </Route>
              <Route path="tasks" element={<TasksTabs />}>
                <Route index element={<Navigate to="my-tasks" replace />} />
                <Route path="my-tasks" element={<MyTasksPage />} />
                <Route path="all" element={<AllTasksTablePage />} />
                <Route path="board" element={<BoardViewPage />} />
                <Route path="calendar" element={<CalendarViewPage />} />
              </Route>
              <Route path="people" element={<PeopleTabs />}>
                <Route index element={<Navigate to="directory" replace />} />
                <Route path="directory" element={<TeamDirectoryPage />} />
                <Route path="detail" element={<PersonDetailPage />} />
                <Route path="capacity" element={<CapacityDashboardPage />} />
              </Route>
              <Route path="time-tracking" element={<TimeTrackingTabs />}>
                <Route index element={<Navigate to="timesheet" replace />} />
                <Route path="timesheet" element={<WeeklyTimesheetPage />} />
                <Route path="utilization" element={<UtilizationReportPage />} />
              </Route>
            </Route>

            {/* MARKETING */}
            <Route path="/marketing" element={<MarketingPage />}>
              <Route index element={<Navigate to="campaigns" replace />} />
              <Route path="campaigns" element={<CampaignsTabs />}>
                <Route index element={<Navigate to="calendar" replace />} />
                <Route path="calendar" element={<CampaignCalendarPage />} />
                <Route path="detail" element={<CampaignDetailPage />} />
                <Route path="performance" element={<PerformanceDashboardPage />} />
              </Route>
              <Route path="content" element={<ContentPipelineTabs />}>
                <Route index element={<Navigate to="kanban" replace />} />
                <Route path="kanban" element={<ContentKanbanPage />} />
                <Route path="asset" element={<AssetDetailPage />} />
                <Route path="library" element={<ContentLibraryPage />} />
              </Route>
              <Route path="channels" element={<ChannelsTabs />}>
                <Route index element={<Navigate to="all" replace />} />
                <Route path="all" element={<AllChannelsPage />} />
                <Route path="performance" element={<ChannelPerformancePage />} />
                <Route path="budget" element={<BudgetAllocationPage />} />
              </Route>
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
                <Route index element={<Navigate to="pipeline" replace />} />
                <Route path="pipeline" element={<PipelineViewPage />} />
                <Route path="detail" element={<OpportunityDetailPage />} />
                <Route path="forecast" element={<DealForecastPage />} />
              </Route>
              <Route path="accounts" element={<AccountsTabs />}>
                <Route index element={<Navigate to="all" replace />} />
                <Route path="all" element={<AllAccountsPage />} />
                <Route path="view-360" element={<Account360ViewPage />} />
                <Route path="health" element={<AccountHealthPage />} />
              </Route>
              <Route path="products" element={<ProductsTabs />}>
                <Route index element={<Navigate to="catalog" replace />} />
                <Route path="catalog" element={<ProductCatalogPage />} />
                <Route path="detail" element={<ProductDetailPage />} />
                <Route path="inventory" element={<InventoryStatusPage />} />
              </Route>
            </Route>

            {/* STRATEGY */}
            <Route path="/strategy" element={<StrategyPage />}>
              <Route index element={<Navigate to="foundation" replace />} />
              <Route path="foundation" element={<FoundationTabs />}>
                <Route index element={<Navigate to="segments" replace />} />
                <Route path="segments" element={<CustomerSegmentsPage />} />
                <Route path="flywheels" element={<FlywheelsMapPage />} />
                <Route path="business-units" element={<BusinessUnitsOverviewPage />} />
              </Route>
              <Route path="business-units" element={<BusinessUnitsTabs />}>
                  <Route index element={<Navigate to="performance" replace />} />
                  <Route path="performance" element={<BUPerformancePage />} />
                  <Route path="detail" element={<BUDetailPage />} />
                  <Route path="maturity" element={<BUMaturityTrackerPage />} />
              </Route>
              <Route path="metrics" element={<MetricsTabs />}>
                  <Route index element={<Navigate to="scorecard" replace />} />
                  <Route path="scorecard" element={<ExecutiveScorecardPage />} />
                  <Route path="review" element={<WeeklyBusinessReviewPage />} />
                  <Route path="targets" element={<MetricTargetsPage />} />
              </Route>
              <Route path="briefs" element={<BriefsTabs />}>
                  <Route index element={<Navigate to="active" replace />} />
                  <Route path="active" element={<ActiveDecisionsPage />} />
                  <Route path="detail" element={<DecisionDetailPage />} />
                  <Route path="archive" element={<DecisionArchivePage />} />
              </Route>
            </Route>

            {/* TOOLS */}
            <Route path="/tools" element={<ToolsPage />}>
              <Route index element={<Navigate to="braindump" replace />} />
              <Route path="braindump" element={<BrainDumpPage />} />
              <Route path="ai-assistant" element={<AIAssistantPage />} />
              <Route path="inbox" element={<InboxPage />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="notes" element={<NotesDocsPage />} />
            </Route>

            {/* ADMIN */}
            <Route path="/admin" element={<AdminPage />}>
              <Route index element={<Navigate to="integrations" replace />} />
              <Route path="integrations" element={<PlatformsIntegrationsPage />} />
              <Route path="hubs" element={<HubsFunctionsPage />} />
              <Route path="financials" element={<FinancialTrackingPage />} />
              <Route path="workflows" element={<DelegationWorkflowsPage />} />
            </Route>
            
            {/* PROFILE */}
            <Route path="/profile" element={<ProfilePage />}>
              <Route index element={<Navigate to="settings" replace />} />
              <Route path="settings" element={<MySettingsPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="preferences" element={<PreferencesPage />} />
            </Route>


            <Route path="*" element={<Navigate to="/command-center/dashboard" replace />} />
          </Routes>
        )}
      </main>
    </div>
  </div>
);

export default App;
