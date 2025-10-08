
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider } from './contexts/DataContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardPage from './pages/DashboardPage';
import PeoplePage from './pages/PeoplePage';
import ProjectsPage from './pages/ProjectsPage';
import TasksPage from './pages/TasksPage';
import StrategyPage from './pages/StrategyPage';
import LeadsPage from './pages/LeadsPage';
import OpportunitiesPage from './pages/OpportunitiesPage';
import AccountsPage from './pages/AccountsPage';
import BrainDumpPage from './pages/BrainDumpPage';
import ExecutiveDashboardPage from './pages/ExecutiveDashboardPage';
import WorkspacePage from './pages/WorkspacePage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
};

const AppContent: React.FC = () => {
  const { isLoading, initError } = useAuth();

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
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950">
        <div className="text-white text-xl animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <HashRouter>
      <MainLayout />
    </HashRouter>
  );
};

const MainLayout: React.FC = () => (
  <div className="flex h-screen bg-gray-950 text-gray-200 font-sans">
    <Sidebar />
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header />
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-900 p-4 md:p-6 lg:p-8">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/executive-dashboard" element={<ExecutiveDashboardPage />} />
          <Route path="/workspace" element={<WorkspacePage />} />
          <Route path="/execution/people" element={<PeoplePage />} />
          <Route path="/execution/projects" element={<ProjectsPage />} />
          <Route path="/execution/tasks" element={<TasksPage />} />
          <Route path="/execution/braindump" element={<BrainDumpPage />} />
          <Route path="/partners/leads" element={<LeadsPage />} />
          <Route path="/partners/opportunities" element={<OpportunitiesPage />} />
          <Route path="/partners/accounts" element={<AccountsPage />} />
          <Route path="/strategy" element={<StrategyPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  </div>
);

export default App;