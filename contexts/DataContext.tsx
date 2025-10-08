
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Person, Project, Task, BusinessUnit, Flywheel, Lead, Opportunity, Account, BrainDump } from '../types';
import { useAuth } from './AuthContext';
import * as sheetService from '../services/googleSheetService';

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
  const [loading, setLoading] = useState(true);
  const [people, setPeople] = useState<Person[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([]);
  const [flywheels, setFlywheels] = useState<Flywheel[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [braindumps, setBrainDumps] = useState<BrainDump[]>([]);

  useEffect(() => {
    if (isSignedIn) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const [peopleData, projectsData, tasksData, buData, flywheelData, leadsData, opportunitiesData, accountsData, braindumpData] = await Promise.all([
            sheetService.getPeople(),
            sheetService.getProjects(),
            sheetService.getTasks(),
            sheetService.getBusinessUnits(),
            sheetService.getFlywheels(),
            sheetService.getLeads(),
            sheetService.getOpportunities(),
            sheetService.getAccounts(),
            sheetService.getBrainDumps(),
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
        } catch (error) {
          console.error("Failed to fetch data from Google Sheets:", error);
          alert("Could not fetch data from Google Sheets. Check the console for more details.");
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    } else {
      // Not signed in, clear all data.
      setLoading(false);
      setPeople([]);
      setProjects([]);
      setTasks([]);
      setBusinessUnits([]);
      setFlywheels([]);
      setLeads([]);
      setOpportunities([]);
      setAccounts([]);
      setBrainDumps([]);
    }
  }, [isSignedIn]);
  
  const handleError = (error: any, action: string) => {
      console.error(`Failed to ${action}:`, error);
      alert(`Error: Could not ${action}. ${error.message || 'Unknown error'}`);
  }

  // People CRUD
  const addPerson = async (person: Omit<Person, 'user_id'>) => {
    try {
        const newPerson = await sheetService.addPerson(person);
        setPeople(prev => [...prev, newPerson]);
    } catch(error) { handleError(error, 'add person'); }
  };
  const updatePerson = async (updatedPerson: Person) => {
    try {
        await sheetService.updatePerson(updatedPerson);
        setPeople(prev => prev.map(p => (p.user_id === updatedPerson.user_id ? updatedPerson : p)));
    } catch(error) { handleError(error, 'update person'); }
  };
  const deletePerson = async (userId: string) => {
    try {
        await sheetService.deletePerson(userId);
        setPeople(prev => prev.filter(p => p.user_id !== userId));
    } catch(error) { handleError(error, 'delete person'); }
  };

  // Projects CRUD
  const addProject = async (project: Omit<Project, 'project_id'>) => {
    try {
        const newProject = await sheetService.addProject(project);
        setProjects(prev => [...prev, newProject]);
    } catch(error) { handleError(error, 'add project'); }
  };
  const updateProject = async (updatedProject: Project) => {
    try {
        await sheetService.updateProject(updatedProject);
        setProjects(prev => prev.map(p => (p.project_id === updatedProject.project_id ? updatedProject : p)));
    } catch(error) { handleError(error, 'update project'); }
  };
  const deleteProject = async (projectId: string) => {
    try {
        await sheetService.deleteProject(projectId);
        setProjects(prev => prev.filter(p => p.project_id !== projectId));
    } catch(error) { handleError(error, 'delete project'); }
  };

  // Tasks CRUD
  const addTask = async (task: Omit<Task, 'task_id'>) => {
    try {
        const newTask = await sheetService.addTask(task);
        setTasks(prev => [...prev, newTask]);
    } catch(error) { handleError(error, 'add task'); }
  };
  const updateTask = async (updatedTask: Task) => {
    try {
        await sheetService.updateTask(updatedTask);
        setTasks(prev => prev.map(t => (t.task_id === updatedTask.task_id ? updatedTask : t)));
    } catch(error) { handleError(error, 'update task'); }
  };
  const deleteTask = async (taskId: string) => {
    try {
        await sheetService.deleteTask(taskId);
        setTasks(prev => prev.filter(t => t.task_id !== taskId));
    } catch(error) { handleError(error, 'delete task'); }
  };
  
  // Business Units CRUD
  const addBusinessUnit = async (bu: Omit<BusinessUnit, 'bu_id'>) => {
    try {
        const newBu = await sheetService.addBusinessUnit(bu);
        setBusinessUnits(prev => [...prev, newBu]);
    } catch(error) { handleError(error, 'add business unit'); }
  };
  const updateBusinessUnit = async (updatedBu: BusinessUnit) => {
    try {
        await sheetService.updateBusinessUnit(updatedBu);
        setBusinessUnits(prev => prev.map(bu => (bu.bu_id === updatedBu.bu_id ? updatedBu : bu)));
    } catch(error) { handleError(error, 'update business unit'); }
  };
  const deleteBusinessUnit = async (buId: string) => {
    try {
        await sheetService.deleteBusinessUnit(buId);
        setBusinessUnits(prev => prev.filter(bu => bu.bu_id !== buId));
    } catch(error) { handleError(error, 'delete business unit'); }
  };

  // Partners CRUD
  const addLead = async (lead: Omit<Lead, 'lead_id'>) => {
    try {
        const newLead = await sheetService.addLead(lead);
        setLeads(prev => [...prev, newLead]);
    } catch(error) { handleError(error, 'add lead'); }
  };
  const updateLead = async (updatedLead: Lead) => {
    try {
        await sheetService.updateLead(updatedLead);
        setLeads(prev => prev.map(l => (l.lead_id === updatedLead.lead_id ? updatedLead : l)));
    } catch(error) { handleError(error, 'update lead'); }
  };
  const deleteLead = async (leadId: string) => {
    try {
        await sheetService.deleteLead(leadId);
        setLeads(prev => prev.filter(l => l.lead_id !== leadId));
    } catch(error) { handleError(error, 'delete lead'); }
  };
  
  const addOpportunity = async (opportunity: Omit<Opportunity, 'opportunity_id'>) => {
    try {
        const newOpp = await sheetService.addOpportunity(opportunity);
        setOpportunities(prev => [...prev, newOpp]);
    } catch(error) { handleError(error, 'add opportunity'); }
  };
  const updateOpportunity = async (updatedOpportunity: Opportunity) => {
    try {
        await sheetService.updateOpportunity(updatedOpportunity);
        setOpportunities(prev => prev.map(o => (o.opportunity_id === updatedOpportunity.opportunity_id ? updatedOpportunity : o)));
    } catch(error) { handleError(error, 'update opportunity'); }
  };
  const deleteOpportunity = async (opportunityId: string) => {
    try {
        await sheetService.deleteOpportunity(opportunityId);
        setOpportunities(prev => prev.filter(o => o.opportunity_id !== opportunityId));
    } catch(error) { handleError(error, 'delete opportunity'); }
  };
  
  const addAccount = async (account: Omit<Account, 'account_id'>) => {
    try {
        const newAccount = await sheetService.addAccount(account);
        setAccounts(prev => [...prev, newAccount]);
    } catch(error) { handleError(error, 'add account'); }
  };
  const updateAccount = async (updatedAccount: Account) => {
    try {
        await sheetService.updateAccount(updatedAccount);
        setAccounts(prev => prev.map(a => (a.account_id === updatedAccount.account_id ? updatedAccount : a)));
    } catch(error) { handleError(error, 'update account'); }
  };
  const deleteAccount = async (accountId: string) => {
    try {
        await sheetService.deleteAccount(accountId);
        setAccounts(prev => prev.filter(a => a.account_id !== accountId));
    } catch(error) { handleError(error, 'delete account'); }
  };

  // BrainDump CRUD
  const addBrainDump = async (item: Omit<BrainDump, 'braindump_id'>) => {
    try {
        const newItem = await sheetService.addBrainDump(item);
        setBrainDumps(prev => [...prev, newItem]);
    } catch(error) { handleError(error, 'add braindump item'); }
  };
  const updateBrainDump = async (updatedItem: BrainDump) => {
    try {
        await sheetService.updateBrainDump(updatedItem);
        setBrainDumps(prev => prev.map(item => (item.braindump_id === updatedItem.braindump_id ? updatedItem : item)));
    } catch(error) { handleError(error, 'update braindump item'); }
  };
  const deleteBrainDump = async (itemId: string) => {
    try {
        await sheetService.deleteBrainDump(itemId);
        setBrainDumps(prev => prev.filter(item => item.braindump_id !== itemId));
    } catch(error) { handleError(error, 'delete braindump item'); }
  };

  return (
    <DataContext.Provider value={{
      people, projects, tasks, businessUnits, flywheels, leads, opportunities, accounts, braindumps, loading,
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
