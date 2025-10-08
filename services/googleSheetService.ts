import { db } from '../config';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import type { Person, Project, Task, BusinessUnit, Flywheel, Lead, Opportunity, Account, BrainDump, LogEntry } from '../types';

// --- Firestore Collection Names ---
const COLLECTION = {
    PEOPLE: 'people',
    PROJECTS: 'projects',
    TASKS: 'tasks',
    BUSINESS_UNITS: 'business_units',
    FLYWHEELS: 'flywheels',
    LEADS: 'leads',
    OPPORTUNITIES: 'opportunities',
    ACCOUNTS: 'accounts',
    BRAINDUMPS: 'braindumps',
    LOGS: 'logs',
};

// --- Generic Firestore Helper Functions ---

async function fetchCollection<T>(collectionName: string, idField: keyof T): Promise<T[]> {
    const colRef = collection(db, collectionName);
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map(doc => ({
        ...doc.data(),
        [idField]: doc.id,
    })) as T[];
}

async function createEntity<T>(collectionName: string, data: any, idField: keyof T): Promise<T> {
    const colRef = collection(db, collectionName);
    // Firestore security rules should handle data validation
    const docRef = await addDoc(colRef, data);
    return { ...data, [idField]: docRef.id } as T;
}

async function updateEntity<T>(collectionName: string, data: any, idField: keyof T): Promise<T> {
    const docId = data[idField];
    if (!docId) throw new Error("Document ID is missing for update.");
    
    const docRef = doc(db, collectionName, docId);
    const updateData = { ...data };
    delete updateData[idField]; // Do not write the ID field back into the document
    await updateDoc(docRef, updateData);
    return data;
}

async function deleteEntity(collectionName: string, id: string): Promise<void> {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
}

// --- Public Read API ---

export const getPeople = (): Promise<Person[]> => fetchCollection<Person>(COLLECTION.PEOPLE, 'user_id');
export const getProjects = (): Promise<Project[]> => fetchCollection<Project>(COLLECTION.PROJECTS, 'project_id');
export const getTasks = (): Promise<Task[]> => fetchCollection<Task>(COLLECTION.TASKS, 'task_id');
export const getBusinessUnits = (): Promise<BusinessUnit[]> => fetchCollection<BusinessUnit>(COLLECTION.BUSINESS_UNITS, 'bu_id');
export const getFlywheels = (): Promise<Flywheel[]> => fetchCollection<Flywheel>(COLLECTION.FLYWHEELS, 'flywheel_id');
export const getLeads = (): Promise<Lead[]> => fetchCollection<Lead>(COLLECTION.LEADS, 'lead_id');
export const getOpportunities = (): Promise<Opportunity[]> => fetchCollection<Opportunity>(COLLECTION.OPPORTUNITIES, 'opportunity_id');
export const getAccounts = (): Promise<Account[]> => fetchCollection<Account>(COLLECTION.ACCOUNTS, 'account_id');
export const getBrainDumps = (): Promise<BrainDump[]> => fetchCollection<BrainDump>(COLLECTION.BRAINDUMPS, 'braindump_id');

// --- Public Write API ---

export const addPerson = (person: Omit<Person, 'user_id'>): Promise<Person> => createEntity<Person>(COLLECTION.PEOPLE, person, 'user_id');
export const updatePerson = (person: Person): Promise<Person> => updateEntity<Person>(COLLECTION.PEOPLE, person, 'user_id');
export const deletePerson = (userId: string): Promise<void> => deleteEntity(COLLECTION.PEOPLE, userId);

export const addProject = (project: Omit<Project, 'project_id'>): Promise<Project> => createEntity<Project>(COLLECTION.PROJECTS, project, 'project_id');
export const updateProject = (project: Project): Promise<Project> => updateEntity<Project>(COLLECTION.PROJECTS, project, 'project_id');
export const deleteProject = (projectId: string): Promise<void> => deleteEntity(COLLECTION.PROJECTS, projectId);

export const addTask = (task: Omit<Task, 'task_id'>): Promise<Task> => createEntity<Task>(COLLECTION.TASKS, task, 'task_id');
export const updateTask = (task: Task): Promise<Task> => updateEntity<Task>(COLLECTION.TASKS, task, 'task_id');
export const deleteTask = (taskId: string): Promise<void> => deleteEntity(COLLECTION.TASKS, taskId);

export const addBusinessUnit = (bu: Omit<BusinessUnit, 'bu_id'>): Promise<BusinessUnit> => createEntity<BusinessUnit>(COLLECTION.BUSINESS_UNITS, bu, 'bu_id');
export const updateBusinessUnit = (bu: BusinessUnit): Promise<BusinessUnit> => updateEntity<BusinessUnit>(COLLECTION.BUSINESS_UNITS, bu, 'bu_id');
export const deleteBusinessUnit = (buId: string): Promise<void> => deleteEntity(COLLECTION.BUSINESS_UNITS, buId);

export const addLead = (lead: Omit<Lead, 'lead_id'>): Promise<Lead> => createEntity<Lead>(COLLECTION.LEADS, lead, 'lead_id');
export const updateLead = (lead: Lead): Promise<Lead> => updateEntity<Lead>(COLLECTION.LEADS, lead, 'lead_id');
export const deleteLead = (leadId: string): Promise<void> => deleteEntity(COLLECTION.LEADS, leadId);

export const addOpportunity = (opportunity: Omit<Opportunity, 'opportunity_id'>): Promise<Opportunity> => createEntity<Opportunity>(COLLECTION.OPPORTUNITIES, opportunity, 'opportunity_id');
export const updateOpportunity = (opportunity: Opportunity): Promise<Opportunity> => updateEntity<Opportunity>(COLLECTION.OPPORTUNITIES, opportunity, 'opportunity_id');
export const deleteOpportunity = (opportunityId: string): Promise<void> => deleteEntity(COLLECTION.OPPORTUNITIES, opportunityId);

export const addAccount = (account: Omit<Account, 'account_id'>): Promise<Account> => createEntity<Account>(COLLECTION.ACCOUNTS, account, 'account_id');
export const updateAccount = (account: Account): Promise<Account> => updateEntity<Account>(COLLECTION.ACCOUNTS, account, 'account_id');
export const deleteAccount = (accountId: string): Promise<void> => deleteEntity(COLLECTION.ACCOUNTS, accountId);

export const addBrainDump = (item: Omit<BrainDump, 'braindump_id'>): Promise<BrainDump> => createEntity<BrainDump>(COLLECTION.BRAINDUMPS, item, 'braindump_id');
export const updateBrainDump = (item: BrainDump): Promise<BrainDump> => updateEntity<BrainDump>(COLLECTION.BRAINDUMPS, item, 'braindump_id');
export const deleteBrainDump = (itemId: string): Promise<void> => deleteEntity(COLLECTION.BRAINDUMPS, itemId);

// This function can be called from anywhere to log an action.
export const logUserAction = (logData: Omit<LogEntry, 'log_id' | 'timestamp'>): void => {
  const logEntry: Omit<LogEntry, 'log_id'> = {
    ...logData,
    timestamp: new Date().toISOString(),
  };
  // Fire-and-forget, with error logging.
  createEntity(COLLECTION.LOGS, logEntry, 'log_id').catch(error => {
    console.error("Failed to log user action:", error);
  });
};
