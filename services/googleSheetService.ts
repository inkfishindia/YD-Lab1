import {
    peopleConfig,
    projectsConfig,
    tasksConfig,
    businessUnitsConfig,
    flywheelsConfig,
    leadsConfig,
    opportunitiesConfig,
    accountsConfig,
    braindumpConfig,
    logConfig,
    SheetConfig
} from '../sheetConfig';
import type { Person, Project, Task, BusinessUnit, Flywheel, Lead, Opportunity, Account, BrainDump, LogEntry } from '../types';

// --- Type Helper Utilities ---

const safeParseFloat = (val: any): number => {
    if (typeof val === 'number') return val;
    if (typeof val !== 'string' || !val) return 0;
    const num = parseFloat(val.replace(/[^0-9.-]+/g, ""));
    return isNaN(num) ? 0 : num;
};

const safeParseBool = (val: any): boolean => {
    if (typeof val === 'boolean') return val;
    return val ? String(val).toLowerCase() === 'true' : false;
};

// --- Core Data Fetching and Caching Logic ---

const headerCache = new Map<string, Record<string, number>>();
const spreadsheetMetadataCache = new Map<string, any>();

async function getHeaderMap(spreadsheetId: string, sheetName: string): Promise<Record<string, number>> {
    const cacheKey = `${spreadsheetId}-${sheetName}`;
    if (headerCache.has(cacheKey)) {
        return headerCache.get(cacheKey)!;
    }

    try {
        const headerRange = `${sheetName}!1:1`;
        const response = await (window as any).gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId,
            range: headerRange,
        });
        
        const headers = response.result.values ? response.result.values[0] : [];
        const headerMap: Record<string, number> = {};
        headers.forEach((header: string, index: number) => {
            if (header) {
                headerMap[header.trim()] = index;
            }
        });
        
        headerCache.set(cacheKey, headerMap);
        return headerMap;
    } catch (err: any) {
        console.error(`Error fetching header for sheet '${sheetName}':`, err);
        throw new Error(`Could not fetch headers for sheet: ${sheetName}. Check sheet name and permissions.`);
    }
}

async function fetchSheetData(spreadsheetId: string, range: string): Promise<any[][]> {
    try {
        if (!(window as any).gapi?.client?.sheets) {
            throw new Error("Google Sheets API client is not initialized.");
        }
        const response = await (window as any).gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId,
            range,
        });
        return response.result.values || [];
    } catch (err: any) {
        const message = err.result?.error?.message || err.message || 'An unknown error occurred.';
        console.error(`Error fetching sheet range '${range}': ${message}`, { spreadsheetId, range, error: err });
        throw new Error(message);
    }
}

async function fetchAndParseSheetData<T>(config: SheetConfig<T>): Promise<T[]> {
    const { spreadsheetId, range, columns, keyField } = config;
    const sheetName = range.split('!')[0];

    const [headerMap, data] = await Promise.all([
        getHeaderMap(spreadsheetId, sheetName),
        fetchSheetData(spreadsheetId, range)
    ]);

    if (Object.keys(headerMap).length === 0) {
        console.warn(`No headers found for sheet '${sheetName}'. Returning empty array.`);
        return [];
    }
    
    return data.map((row: any[]) => {
        const item: { [key: string]: any } = {};
        for (const key in columns) {
            const colConfig = columns[key as keyof T];
            const header = colConfig.header;
            const colIndex = headerMap[header];

            const rawValue: any = (colIndex !== undefined && row[colIndex] !== null) ? row[colIndex] : undefined;

            switch (colConfig.type) {
                case 'number':
                    item[key] = safeParseFloat(rawValue);
                    break;
                case 'boolean':
                    item[key] = safeParseBool(rawValue);
                    break;
                case 'string_array':
                    item[key] = typeof rawValue === 'string' && rawValue ? rawValue.split(',').map(s => s.trim()) : [];
                    break;
                default: // 'string' or undefined
                    item[key] = rawValue !== undefined ? String(rawValue) : '';
            }
        }
        return item as T;
    }).filter(item => item && item[keyField] && String(item[keyField]).trim() !== '');
}


// --- Helper Functions for Mutations ---

async function getSheetId(spreadsheetId: string, sheetName: string): Promise<number> {
    let spreadsheet;
    if (spreadsheetMetadataCache.has(spreadsheetId)) {
        spreadsheet = spreadsheetMetadataCache.get(spreadsheetId);
    } else {
        const response = await (window as any).gapi.client.sheets.spreadsheets.get({ spreadsheetId });
        spreadsheet = response.result;
        spreadsheetMetadataCache.set(spreadsheetId, spreadsheet);
    }

    const sheet = spreadsheet.sheets.find((s: any) => s.properties.title === sheetName);
    if (!sheet) {
        throw new Error(`Sheet with name "${sheetName}" not found in spreadsheet ${spreadsheetId}.`);
    }
    return sheet.properties.sheetId;
}

async function findRowIndex<T>(config: SheetConfig<T>, id: string): Promise<number> {
    const { spreadsheetId, range, keyField, columns } = config;
    const sheetName = range.split('!')[0];
    const headerMap = await getHeaderMap(spreadsheetId, sheetName);
    const keyColumnHeader = columns[keyField]?.header;
    if (!keyColumnHeader) throw new Error(`Key field header for '${String(keyField)}' not found in config.`);
    
    const keyColumnIndex = headerMap[keyColumnHeader];
    if (keyColumnIndex === undefined) throw new Error(`Column '${keyColumnHeader}' not found in sheet '${sheetName}'.`);

    const keyColumnLetter = String.fromCharCode('A'.charCodeAt(0) + keyColumnIndex);
    const dataRange = `${sheetName}!${keyColumnLetter}2:${keyColumnLetter}`;

    const response = await (window as any).gapi.client.sheets.spreadsheets.values.get({ spreadsheetId, range: dataRange });
    const values = response.result.values;
    if (!values) throw new Error(`No data found to update for ID ${id}.`);

    const rowIndex = values.findIndex((row: any[]) => row[0] === id);
    if (rowIndex === -1) throw new Error(`ID '${id}' not found in sheet '${sheetName}'.`);

    return rowIndex + 2; // +2 because data starts from row 2 and findIndex is 0-indexed.
}

function mapEntityToRowArray<T>(entity: Partial<T>, headerMap: Record<string, number>, columns: SheetConfig<T>['columns']): any[] {
    const totalColumns = Object.keys(headerMap).length > 0 ? Math.max(...Object.values(headerMap)) + 1 : 0;
    const row = new Array(totalColumns).fill(null); // Use null for empty cells for better API compatibility

    for (const key in columns) {
        const colConfig = columns[key as keyof T];
        const header = colConfig.header;
        const colIndex = headerMap[header];
        
        if (colIndex !== undefined) {
            const value = entity[key as keyof T];
            if (value === undefined || value === null) {
                row[colIndex] = null;
            } else if (colConfig.type === 'string_array' && Array.isArray(value)) {
                row[colIndex] = value.join(', ');
            } else {
                row[colIndex] = value;
            }
        }
    }
    return row;
}

// --- Generic CRUD Functions ---

async function createEntity<T extends { [key: string]: any }>(config: SheetConfig<T>, entityData: Partial<T>): Promise<T> {
    const { spreadsheetId, range, columns, keyField } = config;
    const sheetName = range.split('!')[0];

    const newId = `${String(keyField).replace(/_id$/, '')}_${new Date().getTime()}`;
    const fullEntity = { ...entityData, [keyField]: newId } as T;

    const headerMap = await getHeaderMap(spreadsheetId, sheetName);
    const rowData = mapEntityToRowArray(fullEntity, headerMap, columns);
    
    await (window as any).gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId,
        range: sheetName,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        resource: { values: [rowData] },
    });
    
    return fullEntity;
}

async function updateEntity<T extends { [key: string]: any }>(config: SheetConfig<T>, entityData: T): Promise<T> {
    const { spreadsheetId, range, columns, keyField } = config;
    const sheetName = range.split('!')[0];
    const id = entityData[keyField] as string;

    const [rowIndex, headerMap] = await Promise.all([
        findRowIndex(config, id),
        getHeaderMap(spreadsheetId, sheetName)
    ]);

    const rowData = mapEntityToRowArray(entityData, headerMap, columns);
    const updateRange = `${sheetName}!A${rowIndex}`;

    await (window as any).gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId,
        range: updateRange,
        valueInputOption: 'USER_ENTERED',
        resource: { values: [rowData] },
    });

    return entityData;
}

async function deleteEntity<T>(config: SheetConfig<T>, id: string): Promise<void> {
    const { spreadsheetId, range } = config;
    const sheetName = range.split('!')[0];
    const [sheetId, rowIndex] = await Promise.all([
        getSheetId(spreadsheetId, sheetName),
        findRowIndex(config, id)
    ]);
    
    await (window as any).gapi.client.sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: {
            requests: [{
                deleteDimension: {
                    range: {
                        sheetId: sheetId,
                        dimension: 'ROWS',
                        startIndex: rowIndex - 1, // API is 0-indexed
                        endIndex: rowIndex,
                    },
                },
            }],
        },
    });
}

// --- Public Read API ---

export const getPeople = (): Promise<Person[]> => fetchAndParseSheetData(peopleConfig);
export const getProjects = (): Promise<Project[]> => fetchAndParseSheetData(projectsConfig);
export const getTasks = (): Promise<Task[]> => fetchAndParseSheetData(tasksConfig);
export const getBusinessUnits = (): Promise<BusinessUnit[]> => fetchAndParseSheetData(businessUnitsConfig);
export const getFlywheels = (): Promise<Flywheel[]> => fetchAndParseSheetData(flywheelsConfig);
export const getLeads = (): Promise<Lead[]> => fetchAndParseSheetData(leadsConfig);
export const getOpportunities = (): Promise<Opportunity[]> => fetchAndParseSheetData(opportunitiesConfig);
export const getAccounts = (): Promise<Account[]> => fetchAndParseSheetData(accountsConfig);
export const getBrainDumps = (): Promise<BrainDump[]> => fetchAndParseSheetData(braindumpConfig);

// --- Public Write API ---

export const addPerson = (person: Omit<Person, 'user_id'>): Promise<Person> => createEntity(peopleConfig, person);
export const updatePerson = (person: Person): Promise<Person> => updateEntity(peopleConfig, person);
export const deletePerson = (userId: string): Promise<void> => deleteEntity(peopleConfig, userId);

export const addProject = (project: Omit<Project, 'project_id'>): Promise<Project> => createEntity(projectsConfig, project);
export const updateProject = (project: Project): Promise<Project> => updateEntity(projectsConfig, project);
export const deleteProject = (projectId: string): Promise<void> => deleteEntity(projectsConfig, projectId);

export const addTask = (task: Omit<Task, 'task_id'>): Promise<Task> => createEntity(tasksConfig, task);
export const updateTask = (task: Task): Promise<Task> => updateEntity(tasksConfig, task);
export const deleteTask = (taskId: string): Promise<void> => deleteEntity(tasksConfig, taskId);

export const addBusinessUnit = (bu: Omit<BusinessUnit, 'bu_id'>): Promise<BusinessUnit> => createEntity(businessUnitsConfig, bu);
export const updateBusinessUnit = (bu: BusinessUnit): Promise<BusinessUnit> => updateEntity(businessUnitsConfig, bu);
export const deleteBusinessUnit = (buId: string): Promise<void> => deleteEntity(businessUnitsConfig, buId);

export const addLead = (lead: Omit<Lead, 'lead_id'>): Promise<Lead> => createEntity(leadsConfig, lead);
export const updateLead = (lead: Lead): Promise<Lead> => updateEntity(leadsConfig, lead);
export const deleteLead = (leadId: string): Promise<void> => deleteEntity(leadsConfig, leadId);

export const addOpportunity = (opportunity: Omit<Opportunity, 'opportunity_id'>): Promise<Opportunity> => createEntity(opportunitiesConfig, opportunity);
export const updateOpportunity = (opportunity: Opportunity): Promise<Opportunity> => updateEntity(opportunitiesConfig, opportunity);
export const deleteOpportunity = (opportunityId: string): Promise<void> => deleteEntity(opportunitiesConfig, opportunityId);

export const addAccount = (account: Omit<Account, 'account_id'>): Promise<Account> => createEntity(accountsConfig, account);
export const updateAccount = (account: Account): Promise<Account> => updateEntity(accountsConfig, account);
export const deleteAccount = (accountId: string): Promise<void> => deleteEntity(accountsConfig, accountId);

export const addBrainDump = (item: Omit<BrainDump, 'braindump_id'>): Promise<BrainDump> => createEntity(braindumpConfig, item);
export const updateBrainDump = (item: BrainDump): Promise<BrainDump> => updateEntity(braindumpConfig, item);
export const deleteBrainDump = (itemId: string): Promise<void> => deleteEntity(braindumpConfig, itemId);

// This function can be called from anywhere to log an action,
// avoiding context circular dependencies.
export const logUserAction = (logData: Omit<LogEntry, 'log_id' | 'timestamp'>): void => {
  const logEntry: Omit<LogEntry, 'log_id'> = {
    ...logData,
    timestamp: new Date().toISOString(),
  };
  // Fire-and-forget, with error logging.
  createEntity(logConfig, logEntry).catch(error => {
    console.error("Failed to log user action:", error);
  });
};