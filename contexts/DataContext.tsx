
import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo, useCallback } from 'react';
import type { Person, Project, Task, BusinessUnit, Flywheel, Lead, Opportunity, Account, BrainDump, Role, LogEntry } from '../types';
import { useAuth } from './AuthContext';
import * as sheetService from '../services/googleSheetService';
import { mockPeople, mockProjects, mockTasks, mockBusinessUnits, mockFlywheels, mockLeads, mockOpportunities, mockAccounts, mockBrainDumps, mockRoles } from '../data/mockData';
import { useSpreadsheetConfig } from './SpreadsheetConfigContext';
import * as config from '../sheetConfig';

interface IDataContext {
  people: Person[];
  projects: Project[];
  tasks: Task[];
  businessUnits: BusinessUnit[];
  flywheels: Flywheel[];
  leads: Lead[];
  opportunities: Opportunity[];
  accounts: Account[];
  braindumps: BrainDump[];
  roles: Role[];
  loading: boolean;
  addPerson: (person: Omit<Person, 'user_id'>) => Promise<void>;
  updatePerson: (person: Person) => Promise<void>;
  deletePerson: (userId: string) => Promise<void>;
  addProject: (project: Omit<Project, 'project_id'>) => Promise<void>;
  updateProject: (project: Project) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  addTask: (task: Omit<Task, 'task_id'>) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  addLead: (lead: Omit<Lead, 'lead_id'>) => Promise<void>;
  updateLead: (lead: Lead) => Promise<void>;
  deleteLead: (leadId: string) => Promise<void>;
  addOpportunity: (opportunity: Omit<Opportunity, 'opportunity_id'>) => Promise<void>;
  updateOpportunity: (opportunity: Opportunity) => Promise<void>;
  deleteOpportunity: (opportunityId: string) => Promise<void>;
  addAccount: (account: Omit<Account, 'account_id'>) => Promise<void>;
  updateAccount: (account: Account) => Promise<void>;
  deleteAccount: (accountId: string) => Promise<void>;
  addBrainDump: (item: Omit<BrainDump, 'braindump_id'>) => Promise<void>;
  updateBrainDump: (item: BrainDump) => Promise<void>;
  deleteBrainDump: (itemId: string) => Promise<void>;
  addBusinessUnit: (bu: Omit<BusinessUnit, 'bu_id'>) => Promise<void>;
  updateBusinessUnit: (bu: BusinessUnit) => Promise<void>;
  deleteBusinessUnit: (buId: string) => Promise<void>;
}

const DataContext = createContext<IDataContext | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isSignedIn } = useAuth();
  const { spreadsheetIds, isConfigured } = useSpreadsheetConfig();
  const [loading, setLoading] = useState(true);
  
  // Data states
  const [people, setPeople] = useState<Person[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([]);
  const [flywheels, setFlywheels] = useState<Flywheel[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [braindumps, setBrainDumps] = useState<BrainDump[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);

  // Memoize dynamic sheet configurations
  const dynamicConfigs = useMemo(() => {
    if (!isConfigured) return null;
    return {
      people: config.getPeopleConfig(spreadsheetIds),
      projects: config.getProjectsConfig(spreadsheetIds),
      tasks: config.getTasksConfig(spreadsheetIds),
      businessUnits: config.getBusinessUnitsConfig(spreadsheetIds),
      flywheels: config.getFlywheelsConfig(spreadsheetIds),
      leads: config.getLeadsConfig(spreadsheetIds),
      opportunities: config.getOpportunitiesConfig(spreadsheetIds),
      accounts: config.getAccountsConfig(spreadsheetIds),
      braindumps: config.getBrainDumpConfig(spreadsheetIds),
      roles: config.getRolesConfig(spreadsheetIds),
      logs: config.getLogConfig(spreadsheetIds),
    };
  }, [spreadsheetIds, isConfigured]);

  useEffect(() => {
    const shouldFetchData = isSignedIn && isConfigured && dynamicConfigs;

    if (shouldFetchData) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const [peopleData, projectsData, tasksData, buData, flywheelData, leadsData, opportunitiesData, accountsData, braindumpData, rolesData] = await Promise.all([
            sheetService.fetchAndParseSheetData(dynamicConfigs.people),
            sheetService.fetchAndParseSheetData(dynamicConfigs.projects),
            sheetService.fetchAndParseSheetData(dynamicConfigs.tasks),
            sheetService.fetchAndParseSheetData(dynamicConfigs.businessUnits),
            sheetService.fetchAndParseSheetData(dynamicConfigs.flywheels),
            sheetService.fetchAndParseSheetData(dynamicConfigs.leads),
            sheetService.fetchAndParseSheetData(dynamicConfigs.opportunities),
            sheetService.fetchAndParseSheetData(dynamicConfigs.accounts),
            sheetService.fetchAndParseSheetData(dynamicConfigs.braindumps),
            sheetService.fetchAndParseSheetData(dynamicConfigs.roles),
          ]);
          setPeople(peopleData);
          setProjects(projectsData);
          setTasks(tasksData);
          setBusinessUnits(buData);
          setFlywheels(flywheelData);
          setLeads(leadsData);
          setOpportunities(opportunitiesData);
          setAccounts(accountsData);
          setBrainDumps(braindumpData);
          setRoles(rolesData);
        } catch (error) {
          console.error("Failed to fetch data from Google Sheets:", error);
          alert("Could not fetch data from Google Sheets. Check spreadsheet IDs in settings and console for more details.");
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    } else {
      // Not signed in or not configured, load mock data for a demo view
      setLoading(true);
      setPeople(mockPeople);
      setProjects(mockProjects);
      setTasks(mockTasks);
      setBusinessUnits(mockBusinessUnits);
      setFlywheels(mockFlywheels);
      setLeads(mockLeads);
      setOpportunities(mockOpportunities);
      setAccounts(mockAccounts);
      setBrainDumps(mockBrainDumps);
      setRoles(mockRoles);
      setLoading(false);
    }
  }, [isSignedIn, isConfigured, dynamicConfigs]);
  
  const handleError = (error: any, action: string) => {
      console.error(`Failed to ${action}:`, error);
      alert(`Error: Could not ${action}. ${error.message || 'Unknown error'}`);
  }

  const logUserAction = useCallback((logData: Omit<LogEntry, 'log_id' | 'timestamp'>) => {
    if (!dynamicConfigs) return;
    const logEntry: Omit<LogEntry, 'log_id'> = {
      ...logData,
      timestamp: new Date().toISOString(),
    };
    sheetService.createEntity(dynamicConfigs.logs, logEntry).catch(error => {
      console.error("Failed to log user action:", error);
    });
  }, [dynamicConfigs]);

  // CRUD operations now use dynamicConfigs
  const addPerson = async (person: Omit<Person, 'user_id'>) => {
    if (!dynamicConfigs) return;
    try {
        const newPerson = await sheetService.createEntity(dynamicConfigs.people, person);
        setPeople(prev => [...prev, newPerson]);
    } catch(error) { handleError(error, 'add person'); }
  };
  const updatePerson = async (updatedPerson: Person) => {
    if (!dynamicConfigs) return;
    try {
        await sheetService.updateEntity(dynamicConfigs.people, updatedPerson);
        setPeople(prev => prev.map(p => (p.user_id === updatedPerson.user_id ? updatedPerson : p)));
    } catch(error) { handleError(error, 'update person'); }
  };
  const deletePerson = async (userId: string) => {
    if (!dynamicConfigs) return;
    try {
        await sheetService.deleteEntity(dynamicConfigs.people, userId);
        setPeople(prev => prev.filter(p => p.user_id !== userId));
    } catch(error) { handleError(error, 'delete person'); }
  };

  const addProject = async (project: Omit<Project, 'project_id'>) => {
    if (!dynamicConfigs) return;
    try {
        const newProject = await sheetService.createEntity(dynamicConfigs.projects, project);
        setProjects(prev => [...prev, newProject]);
    } catch(error) { handleError(error, 'add project'); }
  };
  const updateProject = async (updatedProject: Project) => {
    if (!dynamicConfigs) return;
    try {
        await sheetService.updateEntity(dynamicConfigs.projects, updatedProject);
        setProjects(prev => prev.map(p => (p.project_id === updatedProject.project_id ? updatedProject : p)));
    } catch(error) { handleError(error, 'update project'); }
  };
  const deleteProject = async (projectId: string) => {
    if (!dynamicConfigs) return;
    try {
        await sheetService.deleteEntity(dynamicConfigs.projects, projectId);
        setProjects(prev => prev.filter(p => p.project_id !== projectId));
    } catch(error) { handleError(error, 'delete project'); }
  };

  const addTask = async (task: Omit<Task, 'task_id'>) => {
    if (!dynamicConfigs) return;
    try {
        const newTask = await sheetService.createEntity(dynamicConfigs.tasks, task);
        setTasks(prev => [...prev, newTask]);
    } catch(error) { handleError(error, 'add task'); }
  };
  const updateTask = async (updatedTask: Task) => {
    if (!dynamicConfigs) return;
    try {
        await sheetService.updateEntity(dynamicConfigs.tasks, updatedTask);
        setTasks(prev => prev.map(t => (t.task_id === updatedTask.task_id ? updatedTask : t)));
    } catch(error) { handleError(error, 'update task'); }
  };
  const deleteTask = async (taskId: string) => {
    if (!dynamicConfigs) return;
    try {
        await sheetService.deleteEntity(dynamicConfigs.tasks, taskId);
        setTasks(prev => prev.filter(t => t.task_id !== taskId));
    } catch(error) { handleError(error, 'delete task'); }
  };
  
  const addBusinessUnit = async (bu: Omit<BusinessUnit, 'bu_id'>) => {
    if (!dynamicConfigs) return;
    try {
        const newBu = await sheetService.createEntity(dynamicConfigs.businessUnits, bu);
        setBusinessUnits(prev => [...prev, newBu]);
    } catch(error) { handleError(error, 'add business unit'); }
  };
  const updateBusinessUnit = async (updatedBu: BusinessUnit) => {
    if (!dynamicConfigs) return;
    try {
        await sheetService.updateEntity(dynamicConfigs.businessUnits, updatedBu);
        setBusinessUnits(prev => prev.map(bu => (bu.bu_id === updatedBu.bu_id ? updatedBu : bu)));
    } catch(error) { handleError(error, 'update business unit'); }
  };
  const deleteBusinessUnit = async (buId: string) => {
    if (!dynamicConfigs) return;
    try {
        await sheetService.deleteEntity(dynamicConfigs.businessUnits, buId);
        setBusinessUnits(prev => prev.filter(bu => bu.bu_id !== buId));
    } catch(error) { handleError(error, 'delete business unit'); }
  };

  const addLead = async (lead: Omit<Lead, 'lead_id'>) => {
    if (!dynamicConfigs) return;
    try {
        const newLead = await sheetService.createEntity(dynamicConfigs.leads, lead);
        setLeads(prev => [...prev, newLead]);
    } catch(error) { handleError(error, 'add lead'); }
  };
  const updateLead = async (updatedLead: Lead) => {
    if (!dynamicConfigs) return;
    try {
        await sheetService.updateEntity(dynamicConfigs.leads, updatedLead);
        setLeads(prev => prev.map(l => (l.lead_id === updatedLead.lead_id ? updatedLead : l)));
    } catch(error) { handleError(error, 'update lead'); }
  };
  const deleteLead = async (leadId: string) => {
    if (!dynamicConfigs) return;
    try {
        await sheetService.deleteEntity(dynamicConfigs.leads, leadId);
        setLeads(prev => prev.filter(l => l.lead_id !== leadId));
    } catch(error) { handleError(error, 'delete lead'); }
  };
  
  const addOpportunity = async (opportunity: Omit<Opportunity, 'opportunity_id'>) => {
    if (!dynamicConfigs) return;
    try {
        const newOpp = await sheetService.createEntity(dynamicConfigs.opportunities, opportunity);
        setOpportunities(prev => [...prev, newOpp]);
    } catch(error) { handleError(error, 'add opportunity'); }
  };
  const updateOpportunity = async (updatedOpportunity: Opportunity) => {
    if (!dynamicConfigs) return;
    try {
        await sheetService.updateEntity(dynamicConfigs.opportunities, updatedOpportunity);
        setOpportunities(prev => prev.map(o => (o.opportunity_id === updatedOpportunity.opportunity_id ? updatedOpportunity : o)));
    } catch(error) { handleError(error, 'update opportunity'); }
  };
  const deleteOpportunity = async (opportunityId: string) => {
    if (!dynamicConfigs) return;
    try {
        await sheetService.deleteEntity(dynamicConfigs.opportunities, opportunityId);
        setOpportunities(prev => prev.filter(o => o.opportunity_id !== opportunityId));
    } catch(error) { handleError(error, 'delete opportunity'); }
  };
  
  const addAccount = async (account: Omit<Account, 'account_id'>) => {
    if (!dynamicConfigs) return;
    try {
        const newAccount = await sheetService.createEntity(dynamicConfigs.accounts, account);
        setAccounts(prev => [...prev, newAccount]);
    } catch(error) { handleError(error, 'add account'); }
  };
  const updateAccount = async (updatedAccount: Account) => {
    if (!dynamicConfigs) return;
    try {
        await sheetService.updateEntity(dynamicConfigs.accounts, updatedAccount);
        setAccounts(prev => prev.map(a => (a.account_id === updatedAccount.account_id ? updatedAccount : a)));
    } catch(error) { handleError(error, 'update account'); }
  };
  const deleteAccount = async (accountId: string) => {
    if (!dynamicConfigs) return;
    try {
        await sheetService.deleteEntity(dynamicConfigs.accounts, accountId);
        setAccounts(prev => prev.filter(a => a.account_id !== accountId));
    } catch(error) { handleError(error, 'delete account'); }
  };

  const addBrainDump = async (item: Omit<BrainDump, 'braindump_id'>) => {
    if (!dynamicConfigs) return;
    try {
        const newItem = await sheetService.createEntity(dynamicConfigs.braindumps, item);
        setBrainDumps(prev => [...prev, newItem]);
    } catch(error) { handleError(error, 'add braindump item'); }
  };
  const updateBrainDump = async (updatedItem: BrainDump) => {
    if (!dynamicConfigs) return;
    try {
        await sheetService.updateEntity(dynamicConfigs.braindumps, updatedItem);
        setBrainDumps(prev => prev.map(item => (item.braindump_id === updatedItem.braindump_id ? updatedItem : item)));
    } catch(error) { handleError(error, 'update braindump item'); }
  };
  const deleteBrainDump = async (itemId: string) => {
    if (!dynamicConfigs) return;
    try {
        await sheetService.deleteEntity(dynamicConfigs.braindumps, itemId);
        setBrainDumps(prev => prev.filter(item => item.braindump_id !== itemId));
    } catch(error) { handleError(error, 'delete braindump item'); }
  };

  return (
    <DataContext.Provider value={{
      people, projects, tasks, businessUnits, flywheels, leads, opportunities, accounts, braindumps, roles, loading,
      addPerson, updatePerson, deletePerson,
      addProject, updateProject, deleteProject,
      addTask, updateTask, deleteTask,
      addBusinessUnit, updateBusinessUnit, deleteBusinessUnit,
      addLead, updateLead, deleteLead,
      addOpportunity, updateOpportunity, deleteOpportunity,
      addAccount, updateAccount, deleteAccount,
      addBrainDump, updateBrainDump, deleteBrainDump
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
