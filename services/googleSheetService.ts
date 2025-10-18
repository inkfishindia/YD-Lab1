import { SheetConfig } from '../sheetConfig';
import { LogEntry } from '../types';

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

// --- New Helper Functions ---
const chunk = <T>(arr: T[], size: number): T[][] => {
  return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
    arr.slice(i * size, i * size + size)
  );
};

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));


export async function getHeaderMap(spreadsheetId: string, sheetName: string): Promise<Record<string, number>> {
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

async function batchGetHeaderMaps(spreadsheetId: string, sheetNames: string[]): Promise<void> {
    const ranges = sheetNames.map(name => `${name}!1:1`);
    try {
        const response = await (window as any).gapi.client.sheets.spreadsheets.values.batchGet({
            spreadsheetId,
            ranges,
        });
        const valueRanges = response.result.valueRanges || [];
        valueRanges.forEach((valueRange: any, index: number) => {
            const sheetName = sheetNames[index];
            const cacheKey = `${spreadsheetId}-${sheetName}`;
            const headers = valueRange.values ? valueRange.values[0] : [];
            const headerMap: Record<string, number> = {};
            headers.forEach((header: string, i: number) => {
                if (header) headerMap[header.trim()] = i;
            });
            headerCache.set(cacheKey, headerMap);
        });
    } catch (err: any) {
        console.error(`Error batch fetching headers for spreadsheet '${spreadsheetId}':`, err);
        // This will be caught by the main batch fetch and reported with more context.
        throw err;
    }
}

export async function batchFetchAndParseSheetData<T extends { [key: string]: any }>(
  spreadsheetId: string,
  configs: { key: string, config: SheetConfig<T> }[]
): Promise<Record<string, T[]>> {
  if (!configs || configs.length === 0) {
    return {};
  }

  const allResults: Record<string, T[]> = {};
  const CHUNK_SIZE = 5; // Process 5 sheets at a time to stay under burst limits
  const DELAY_BETWEEN_CHUNKS = 1000; // 1 second delay

  const configChunks = chunk(configs, CHUNK_SIZE);

  for (const chunk of configChunks) {
    // 1. Efficiently pre-fetch all headers for the current chunk.
    const sheetNamesInChunk = [...new Set(chunk.map(c => c.config.range.split('!')[0]))];
    await batchGetHeaderMaps(spreadsheetId, sheetNamesInChunk);
    
    // 2. Fetch all data ranges for the current chunk.
    const dataRanges = chunk.map(c => c.config.range);
    const dataResponse = await (window as any).gapi.client.sheets.spreadsheets.values.batchGet({
      spreadsheetId,
      ranges: dataRanges,
    });

    const valueRanges = dataResponse.result.valueRanges || [];
    
    // 3. Process the data for this chunk using the pre-populated header cache.
    valueRanges.forEach((valueRange: any, index: number) => {
      if (!chunk[index]) return; // Safeguard
      const { key, config } = chunk[index];
      const { range, columns, keyField } = config;
      const sheetName = range.split('!')[0];
      const data = valueRange.values || [];
      
      const headerMap = headerCache.get(`${spreadsheetId}-${sheetName}`);

      if (!headerMap || Object.keys(headerMap).length === 0) {
          console.warn(`No headers found for sheet '${sheetName}'. Returning empty array for key '${key}'.`);
          allResults[key] = [];
          return;
      }
      
      // The range already starts from A2, so the returned data does not include the header row.
      const dataRows = data;

      const parsedData = dataRows.map((row: any[]) => {
          const item: { [key: string]: any } = {};
          for (const itemKey in columns) {
              const colConfig = columns[itemKey as keyof T];
              const header = colConfig.header;
              const colIndex = headerMap[header];
              const rawValue: any = (colIndex !== undefined && row[colIndex] !== null) ? row[colIndex] : undefined;
              switch (colConfig.type) {
                  case 'number':
                      item[itemKey] = safeParseFloat(rawValue);
                      break;
                  case 'boolean':
                      item[itemKey] = safeParseBool(rawValue);
                      break;
                  case 'string_array':
                      item[itemKey] = typeof rawValue === 'string' && rawValue ? rawValue.split(',').map(s => s.trim()) : [];
                      break;
                  default: // 'string' or undefined
                      item[itemKey] = rawValue !== undefined ? String(rawValue) : '';
              }
          }
          return item as T;
      }).filter((item: T) => item && item[keyField] && String(item[keyField]).trim() !== '');

      allResults[key] = parsedData;
    });

    // 4. Wait before processing the next chunk, if there is one.
    if (configChunks.indexOf(chunk) < configChunks.length - 1) {
       await delay(DELAY_BETWEEN_CHUNKS);
    }
  }

  return allResults;
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

export function mapEntityToRowArray<T>(entity: Partial<T>, headerMap: Record<string, number>, columns: SheetConfig<T>['columns']): any[] {
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

export async function createEntity<T extends { [key: string]: any }>(config: SheetConfig<T>, entityData: Partial<T>): Promise<T> {
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

export async function appendEntity<T>(config: SheetConfig<T>, entityData: T): Promise<void> {
    const { spreadsheetId, range, columns } = config;
    const sheetName = range.split('!')[0];
    const headerMap = await getHeaderMap(spreadsheetId, sheetName);
    const rowData = mapEntityToRowArray(entityData, headerMap, columns);

    await (window as any).gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId,
        range: sheetName,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        resource: { values: [rowData] },
    });
}


export async function updateEntity<T extends { [key: string]: any }>(config: SheetConfig<T>, entityData: T): Promise<T> {
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

export async function deleteEntity<T>(config: SheetConfig<T>, id: string): Promise<void> {
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

// --- Workspace API Functions ---

export async function fetchUnreadGmailCount(): Promise<number> {
    try {
        if (!(window as any).gapi?.client?.gmail) {
            throw new Error("Google Gmail API client is not initialized.");
        }
        const response = await (window as any).gapi.client.gmail.users.labels.get({
            userId: 'me',
            id: 'INBOX'
        });
        return response.result.messagesUnread || 0;
    } catch (err: any) {
        const message = err.result?.error?.message || err.message || 'An unknown error occurred.';
        console.error(`Error fetching unread Gmail count: ${message}`, { error: err });
        throw new Error(message);
    }
}

export async function fetchNextCalendarEvent(): Promise<any | null> {
    try {
        if (!(window as any).gapi?.client?.calendar) {
            throw new Error("Google Calendar API client is not initialized.");
        }
        const response = await (window as any).gapi.client.calendar.events.list({
            'calendarId': 'primary',
            'timeMin': (new Date()).toISOString(),
            'showDeleted': false,
            'singleEvents': true,
            'maxResults': 1,
            'orderBy': 'startTime'
        });
        return response.result.items && response.result.items.length > 0 ? response.result.items[0] : null;
    } catch (err: any) {
        const message = err.result?.error?.message || err.message || 'An unknown error occurred.';
        console.error(`Error fetching next calendar event: ${message}`, { error: err });
        throw new Error(message);
    }
}

// --- Health Check & Mapping Functionality ---

export interface FieldDetail {
    appField: string;
    defaultHeader: string;
    dataType: 'string' | 'number' | 'boolean' | 'string_array';
}

export interface SheetMappingInfo {
  configName: string;
  spreadsheetId: string;
  gid: string;
  sheetName: string;
  fieldDetails: FieldDetail[];
  actualHeaders: string[];
  error: string | null;
}

export async function getSheetMappingInfo(config: SheetConfig<any>, configName: string): Promise<SheetMappingInfo> {
    const { spreadsheetId, gid, range, columns } = config;
    const sheetName = range.split('!')[0];
    
    const fieldDetails = Object.entries(columns).map(([key, value]: [string, any]) => ({
        appField: key,
        defaultHeader: value.header,
        dataType: value.type || 'string',
    }));

    if (!spreadsheetId) {
        return {
            configName, spreadsheetId, gid, sheetName, fieldDetails, actualHeaders: [],
            error: "Spreadsheet ID is not configured in Admin > Integrations."
        };
    }

    try {
        let spreadsheet;
        if (spreadsheetMetadataCache.has(spreadsheetId)) {
            spreadsheet = spreadsheetMetadataCache.get(spreadsheetId);
        } else {
            const response = await (window as any).gapi.client.sheets.spreadsheets.get({ spreadsheetId });
            spreadsheet = response.result;
            spreadsheetMetadataCache.set(spreadsheetId, spreadsheet);
        }
        
        const sheets = spreadsheet.sheets;
        const sheetExists = sheets.some((s: any) => s.properties.title === sheetName);

        if (!sheetExists) {
            const availableSheets = sheets.map((s: any) => s.properties.title).join(', ');
            return {
                configName, spreadsheetId, gid, sheetName, fieldDetails, actualHeaders: [],
                error: `Sheet named "${sheetName}" was not found. Available sheets: ${availableSheets}.`
            };
        }

        const headerResponse = await (window as any).gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${sheetName}!1:1`,
        });
        const actualHeaders = headerResponse.result.values ? headerResponse.result.values[0] : [];
        
        return { configName, spreadsheetId, gid, sheetName, fieldDetails, actualHeaders, error: null };

    } catch (err: any) {
        const message = err.result?.error?.message || err.message || 'An unknown error occurred.';
        return {
            configName, spreadsheetId, gid, sheetName, fieldDetails, actualHeaders: [],
            error: `Failed to access spreadsheet. Check permissions or ID. Error: ${message}`
        };
    }
}