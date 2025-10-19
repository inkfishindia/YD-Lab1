import { z } from 'zod';

// FIX: Define SheetConfig here as sheetConfig.ts is deprecated.
export interface SheetConfig<T> {
  spreadsheetId: string;
  gid: string;
  range: string;
  namedDataRange?: string; // Added for named range support
  keyField: keyof T;
  columns: {
      [K in keyof T]?: {
          header: string;
          type?: 'string' | 'number' | 'boolean' | 'string_array';
      };
  };
  schema: z.ZodType<T>;
}

// --- Caching ---
const IN_MEMORY_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const inMemoryCache = new Map<string, { data: any; timestamp: number }>();
const SYNC_JOURNAL_KEY = 'yd_labs_sync_journal';

function setInMemoryCache(key: string, data: any) {
  inMemoryCache.set(key, { data, timestamp: Date.now() });
}

function getInMemoryCache(key: string): any | null {
  const cached = inMemoryCache.get(key);
  if (!cached) return null;
  if (Date.now() - cached.timestamp > IN_MEMORY_CACHE_TTL) {
    inMemoryCache.delete(key);
    return null;
  }
  return cached.data;
}

export function clearCache() {
  inMemoryCache.clear();
}

export function invalidateSyncJournal(spreadsheetId: string) {
    try {
        const journal = JSON.parse(localStorage.getItem(SYNC_JOURNAL_KEY) || '{}');
        delete journal[spreadsheetId];
        localStorage.setItem(SYNC_JOURNAL_KEY, JSON.stringify(journal));
    } catch (e) {
        console.error("Failed to invalidate sync journal for spreadsheet:", spreadsheetId, e);
        localStorage.removeItem(SYNC_JOURNAL_KEY);
    }
}


// FIX: Added SheetMappingInfo interface for health check page
export interface SheetMappingInfo {
  configName: string;
  spreadsheetId: string;
  gid: string;
  sheetName: string;
  fieldDetails: {
    appField: string;
    defaultHeader: string;
    dataType: 'string' | 'number' | 'boolean' | 'string_array';
  }[];
  actualHeaders: string[];
  allSheetNamesInSpreadsheet: string[];
  error: string | null;
}


// --- Phase 2: API Call Utilities with Retries & Backoff ---

const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 1000;

async function withRetries<T>(apiCall: () => Promise<T>): Promise<T> {
    let lastError: any;
    for (let i = 0; i < MAX_RETRIES; i++) {
        try {
            return await apiCall();
        } catch (err: unknown) {
            lastError = err;
            // FIX: Cast 'err' to 'any' to safely access properties on the error object, resolving 'unknown' type error.
            const status = (err as any).result?.error?.code;

            // Only retry on specific transient errors
            const isRetryable = status === 429 || status === 500 || status === 503 || (err instanceof Error && err.message.includes('Network Error'));
            
            if (isRetryable) {
                const delayMs = INITIAL_BACKOFF_MS * Math.pow(2, i) + Math.random() * 1000; // Exponential backoff with jitter
                console.warn(`API call failed with status ${status}. Retrying in ${Math.round(delayMs)}ms... (Attempt ${i + 1}/${MAX_RETRIES})`);
                await new Promise(resolve => setTimeout(resolve, delayMs));
            } else {
                // For non-retryable errors (e.g., 403 Forbidden, 404 Not Found), fail immediately.
                throw err;
            }
        }
    }
    // If all retries fail, throw the last captured error.
    throw lastError;
}

const headerCache = new Map<string, Record<string, number>>();
const spreadsheetMetadataCache = new Map<string, any>();

function createLowercaseHeaderMap(headers: string[]): Record<string, number> {
    const headerMap: Record<string, number> = {};
    headers.forEach((header: string, index: number) => {
        if (header) headerMap[header.trim().toLowerCase()] = index;
    });
    return headerMap;
}

export async function getHeaderMap(spreadsheetId: string, sheetName: string): Promise<Record<string, number>> {
    const cacheKey = `header-${spreadsheetId}-${sheetName}`;
    const cachedHeader = getInMemoryCache(cacheKey);
    if (cachedHeader) return cachedHeader;

    try {
        const response = await withRetries(() => (window as any).gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${sheetName.includes(' ') ? `'${sheetName}'` : sheetName}!1:1`,
        }));
        // FIX: Cast 'response' to 'any' to safely access 'result' property.
        const headers = (response as any).result.values ? (response as any).result.values[0] : [];
        const headerMap = createLowercaseHeaderMap(headers);
        setInMemoryCache(cacheKey, headerMap);
        return headerMap;
    } catch (err: any) {
        console.error(`Error fetching header for sheet '${sheetName}':`, err);
        throw new Error(`Could not fetch headers for sheet: ${sheetName}. Check sheet name and permissions.`);
    }
}

// --- Phase 3: Sync Journal (Checksums) ---
// Simple string hash function (sdbm) for checksum generation.
const stringToHash = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = char + (hash << 6) + (hash << 16) - hash;
  }
  return hash;
};


// --- Core Data Fetching Logic (Updated with Checksums) ---
export async function batchFetchAndParseSheetData<T extends { [key: string]: any }>(
    spreadsheetId: string,
    configs: { key: string; config: SheetConfig<T> }[],
): Promise<Record<string, T[]>> {
    if (!configs || configs.length === 0) return {};
    
    const inMemoryCacheKey = `data-${spreadsheetId}-${configs.map(c => c.key).join(',')}`;
    const cachedInMemory = getInMemoryCache(inMemoryCacheKey);
    if (cachedInMemory) return cachedInMemory;

    // Prioritize named ranges, fall back to A1 notation
    const ranges = configs.map(c => c.config.namedDataRange || c.config.range);
    
    // 1. Fetch raw data from the API.
    const rawDataResponse = await withRetries(() => (window as any).gapi.client.sheets.spreadsheets.values.batchGet({ spreadsheetId, ranges }));
    
    // 2. Compute checksum from raw data.
    // FIX: Cast 'rawDataResponse' to 'any' to safely access 'result' property.
    const rawDataString = JSON.stringify((rawDataResponse as any).result.valueRanges);
    const newChecksum = stringToHash(rawDataString);

    // 3. Check against sync journal in localStorage.
    try {
        const journal = JSON.parse(localStorage.getItem(SYNC_JOURNAL_KEY) || '{}');
        const journalEntry = journal[spreadsheetId];
        if (journalEntry && journalEntry.checksum === newChecksum) {
            setInMemoryCache(inMemoryCacheKey, journalEntry.parsedData);
            return journalEntry.parsedData;
        }
    } catch (e) { console.error("Could not read from sync journal:", e); }

    // 4. If checksums mismatch (or no journal entry), parse the data.
    const allResults: Record<string, T[]> = {};
    const sheetNames = [...new Set(configs.map(c => c.config.range.split('!')[0].replace(/'/g, '')))];
    
    // Pre-fetch all headers for this spreadsheet.
    const headerRanges = sheetNames.map(name => `${name.includes(' ') ? `'${name}'` : name}!1:1`);
    const headersResponse = await withRetries(() => (window as any).gapi.client.sheets.spreadsheets.values.batchGet({ spreadsheetId, ranges: headerRanges }));
    // FIX: Cast 'headersResponse' to 'any' to safely access 'result' property.
    const headerValueRanges = (headersResponse as any).result.valueRanges || [];
    headerValueRanges.forEach((vr: any, index: number) => {
        const sheetName = sheetNames[index];
        const headers = vr?.values?.[0] || [];
        const headerMap = createLowercaseHeaderMap(headers);
        headerCache.set(`${spreadsheetId}-${sheetName}`, headerMap);
    });

    // FIX: Cast 'rawDataResponse' to 'any' to safely access 'result' property.
    const valueRanges = (rawDataResponse as any).result.valueRanges || [];

    valueRanges.forEach((valueRange: any, index: number) => {
        if (!configs[index]) return;
        const { key, config } = configs[index];
        const { range, columns, keyField, schema } = config;
        const sheetName = range.split('!')[0].replace(/'/g, '');
        const data = valueRange.values || [];
        const headerMap = headerCache.get(`${spreadsheetId}-${sheetName}`);

        if (!headerMap || Object.keys(headerMap).length === 0) {
            console.warn(`No headers found for sheet '${sheetName}'. Returning empty array for key '${key}'.`);
            allResults[key] = [];
            return;
        }

        const dataRows = data;
        const parsedAndValidatedData = dataRows.reduce((acc: T[], row: any[], rowIndex: number) => {
            if (row.every(cell => cell === null || cell === '')) return acc;

            const item: { [key: string]: any } = {};
            for (const itemKey in columns) {
                const colConfig = columns[itemKey as keyof T];
                if(colConfig) {
                    const header = colConfig.header;
                    const colIndex = headerMap[header.toLowerCase()];
                    item[itemKey] = (colIndex !== undefined && row[colIndex] !== null && row[colIndex] !== '') ? row[colIndex] : undefined;
                }
            }
            
            if (!item[keyField as string] || String(item[keyField as string]).trim() === '') {
                return acc;
            }

            const validationResult = schema.safeParse(item);
            if(validationResult.success) {
                acc.push(validationResult.data);
            } else {
                console.error(
                    `[Zod Validation Error] in sheet: "${sheetName}" (Table: ${key}), Row: ${rowIndex + 2}\n`,
                    `Invalid data for item with key: ${item[keyField as string]}\n`,
                    `Errors:`, validationResult.error.flatten()
                );
            }
            return acc;
        }, []);
        allResults[key] = parsedAndValidatedData;
    });
    
    // 5. Save new result to caches.
    setInMemoryCache(inMemoryCacheKey, allResults);
    try {
        const journal = JSON.parse(localStorage.getItem(SYNC_JOURNAL_KEY) || '{}');
        journal[spreadsheetId] = { checksum: newChecksum, parsedData: allResults };
        localStorage.setItem(SYNC_JOURNAL_KEY, JSON.stringify(journal));
    } catch(e) { console.error("Failed to write to sync journal:", e); }

    return allResults;
}


// --- Helper Functions for Mutations ---

async function getSheetId(spreadsheetId: string, sheetName: string): Promise<number | undefined> {
  let spreadsheet;
  const metaCacheKey = `meta-${spreadsheetId}`;
  if (getInMemoryCache(metaCacheKey)) {
    spreadsheet = getInMemoryCache(metaCacheKey);
  } else {
    const response = await withRetries(() => (window as any).gapi.client.sheets.spreadsheets.get({ spreadsheetId }));
    // FIX: Cast 'response' to 'any' to safely access 'result' property.
    spreadsheet = (response as any).result;
    setInMemoryCache(metaCacheKey, spreadsheet);
  }

  const sheet = spreadsheet.sheets.find((s: any) => s.properties.title === sheetName);
  return sheet?.properties.sheetId;
}

async function findRowIndex<T>(config: SheetConfig<T>, id: string): Promise<number> {
  const { spreadsheetId, range, keyField, columns } = config;
  const sheetName = range.split('!')[0].replace(/'/g, '');
  const headerMap = await getHeaderMap(spreadsheetId, sheetName);
  const keyColumnConfig = columns[keyField];
  if (!keyColumnConfig) throw new Error(`Key field header for '${String(keyField)}' not found.`);
  const keyColumnHeader = keyColumnConfig.header;

  const keyColumnIndex = headerMap[keyColumnHeader.toLowerCase()];
  if (keyColumnIndex === undefined) throw new Error(`Column '${keyColumnHeader}' not found in sheet '${sheetName}'.`);

  const keyColumnLetter = String.fromCharCode('A'.charCodeAt(0) + keyColumnIndex);
  const dataRange = `${sheetName.includes(' ') ? `'${sheetName}'` : sheetName}!${keyColumnLetter}2:${keyColumnLetter}`;

  const response = await withRetries(() => (window as any).gapi.client.sheets.spreadsheets.values.get({ spreadsheetId, range: dataRange }));
  // FIX: Cast 'response' to 'any' to safely access 'result' property.
  const values = (response as any).result.values;
  if (!values) throw new Error(`No data found to update for ID ${id}.`);

  const rowIndex = values.findIndex((row: any[]) => row[0] === id);
  if (rowIndex === -1) throw new Error(`ID '${id}' not found in sheet '${sheetName}'.`);

  return rowIndex + 2; // +2 for 1-based index and header row
}

export function mapEntityToRowArray<T>(entity: Partial<T>, headerMap: Record<string, number>, columns: SheetConfig<T>['columns']): any[] {
  const totalColumns = Object.keys(headerMap).length > 0 ? Math.max(...Object.values(headerMap)) + 1 : 0;
  const row = new Array(totalColumns).fill(null);

  for (const key in columns) {
    const colConfig = columns[key as keyof T];
    if(colConfig){
        const header = colConfig.header;
        const colIndex = headerMap[header.toLowerCase()];
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
  }
  return row;
}


// --- Generic CRUD Functions ---

export async function createEntity<T extends { [key: string]: any }>(config: SheetConfig<T>, entityData: Partial<T>): Promise<T> {
  const { spreadsheetId, range, columns, keyField } = config;
  const sheetName = range.split('!')[0].replace(/'/g, '');
  clearCache();
  invalidateSyncJournal(spreadsheetId);

  const newId = `${String(keyField).replace(/_id$/, '')}_${new Date().getTime()}`;
  const fullEntity = { ...entityData, [keyField]: newId } as T;

  const headerMap = await getHeaderMap(spreadsheetId, sheetName);
  const rowData = mapEntityToRowArray(fullEntity, headerMap, columns);

  await withRetries(() => (window as any).gapi.client.sheets.spreadsheets.values.append({
    spreadsheetId,
    range: sheetName,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    resource: { values: [rowData] },
  }));

  return fullEntity;
}

export async function appendEntity<T>(config: SheetConfig<T>, entityData: T): Promise<void> {
    const { spreadsheetId, range, columns } = config;
    const sheetName = range.split('!')[0].replace(/'/g, '');
    clearCache();
    invalidateSyncJournal(spreadsheetId);

    const headerMap = await getHeaderMap(spreadsheetId, sheetName);
    const rowData = mapEntityToRowArray(entityData, headerMap, columns);
    await withRetries(() => (window as any).gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId,
        range: sheetName,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        resource: { values: [rowData] },
    }));
}

export async function updateEntity<T extends { [key: string]: any }>(config: SheetConfig<T>, entityData: T): Promise<T> {
  const { spreadsheetId, range, columns, keyField } = config;
  const sheetName = range.split('!')[0].replace(/'/g, '');
  const id = entityData[keyField] as string;
  clearCache();
  invalidateSyncJournal(spreadsheetId);

  const [rowIndex, headerMap] = await Promise.all([
    findRowIndex(config, id),
    getHeaderMap(spreadsheetId, sheetName),
  ]);

  const rowData = mapEntityToRowArray(entityData, headerMap, columns);
  const updateRange = `${sheetName.includes(' ') ? `'${sheetName}'` : sheetName}!A${rowIndex}`;
  await withRetries(() => (window as any).gapi.client.sheets.spreadsheets.values.update({
    spreadsheetId,
    range: updateRange,
    valueInputOption: 'USER_ENTERED',
    resource: { values: [rowData] },
  }));

  return entityData;
}

export async function deleteEntity<T>(config: SheetConfig<T>, id: string): Promise<void> {
  const { spreadsheetId, range } = config;
  const sheetName = range.split('!')[0].replace(/'/g, '');
  clearCache();
  invalidateSyncJournal(spreadsheetId);

  const [sheetId, rowIndex] = await Promise.all([
    getSheetId(spreadsheetId, sheetName),
    findRowIndex(config, id),
  ]);

  if (sheetId === undefined) return;

  await withRetries(() => (window as any).gapi.client.sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    resource: {
      requests: [{
        deleteDimension: {
          range: {
            sheetId: sheetId,
            dimension: 'ROWS',
            startIndex: rowIndex - 1,
            endIndex: rowIndex,
          },
        },
      }],
    },
  }));
}

// --- Workspace API Functions ---
export async function fetchUnreadGmailCount(): Promise<number> {
  try {
    const response = await withRetries(() => (window as any).gapi.client.gmail.users.labels.get({
      userId: 'me',
      id: 'UNREAD',
    }));
    // FIX: Cast 'response' to 'any' to safely access 'result' property.
    return (response as any).result.messagesUnread || 0;
  } catch (error) {
    console.error('Error fetching unread Gmail count:', error);
    throw new Error('Could not fetch Gmail data. Check API permissions.');
  }
}

export async function fetchNextCalendarEvent(): Promise<any | null> {
  try {
    const response = await withRetries(() => (window as any).gapi.client.calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      showDeleted: false,
      singleEvents: true,
      maxResults: 1,
      orderBy: 'startTime',
    }));
    // FIX: Cast 'response' to 'any' to safely access 'result' property.
    const events = (response as any).result.items;
    return events.length > 0 ? events[0] : null;
  } catch (error) {
    console.error('Error fetching next calendar event:', error);
    throw new Error('Could not fetch Calendar data. Check API permissions.');
  }
}
