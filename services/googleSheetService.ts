import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

import { getAuthAccessToken } from './googleAuth'; // Import our token getter

export interface SheetConfig<T> {
  spreadsheetId: string;
  gid: string; // Google Sheet ID
  range: string;
  namedDataRange?: string;
  keyField: keyof T;
  columns: {
      [K in keyof T]?: {
          header: string;
          type?: 'string' | 'number' | 'boolean' | 'string_array';
      };
  };
  schema: z.ZodType<T>;
}

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


// --- Caching ---
const IN_MEMORY_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const inMemoryCache = new Map<string, { data: any; timestamp: number }>();
const SYNC_JOURNAL_KEY = 'yd_labs_sync_journal';

export function setInMemoryCache(key: string, data: any) {
  inMemoryCache.set(key, { data, timestamp: Date.now() });
}

export function getInMemoryCache(key: string): any | null {
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
        localStorage.removeItem(SYNC_JOURNAL_KEY); // Clear entire journal if parse/save fails
    }
}

// --- API Call Utilities with Retries & Backoff ---

const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 1000;

async function withRetries<T>(apiCall: () => Promise<Response>): Promise<T> {
  const token = getAuthAccessToken();
  if (!token) {
    throw new Error('Authentication token is missing. Please sign in.');
  }

  let lastError: any;
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const response = await apiCall();
      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`HTTP error! Status: ${response.status}, Body: ${errorBody}`);
      }
      return await response.json() as T;
    } catch (err: any) {
      lastError = err;
      const errorMessage = String(err); // Convert error to string for checking
      const isRetryable =
        errorMessage.includes('429') || // Too Many Requests
        errorMessage.includes('500') || // Internal Server Error
        errorMessage.includes('503') || // Service Unavailable
        errorMessage.includes('Network Error'); // Generic network error

      if (isRetryable && i < MAX_RETRIES - 1) {
        const delayMs = INITIAL_BACKOFF_MS * Math.pow(2, i) + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, delayMs));
      } else {
        throw lastError; // Re-throw if not retryable or max retries reached
      }
    }
  }
  throw lastError; // Should not be reached, but for type safety
}

/**
 * Fetches the header row for a given sheet and returns a map from header name to its column index.
 * Caches the result.
 */
export async function getHeaderMap(spreadsheetId: string, sheetName: string): Promise<Record<string, number>> {
  const cacheKey = `headers-${spreadsheetId}-${sheetName}`;
  const cachedHeaders = getInMemoryCache(cacheKey);
  if (cachedHeaders) {
    return cachedHeaders;
  }

  try {
    const token = getAuthAccessToken();
    if (!token) throw new Error('Authentication token is missing.');

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}!1:1`;
    const response: any = await withRetries(() =>
      fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    );

    const headers: string[] = response.values ? response.values[0] : [];
    const headerMap = headers.reduce((acc: Record<string, number>, header: string, index: number) => {
      acc[header] = index;
      return acc;
    }, {});

    setInMemoryCache(cacheKey, headerMap);
    return headerMap;
  } catch (error: any) {
    console.error(`Failed to fetch headers for sheet ${sheetName} in spreadsheet ${spreadsheetId}:`, error);
    throw new Error(`Failed to load sheet headers. Please ensure the sheet name is correct and you have access. Error: ${error.message || JSON.stringify(error)}`);
  }
}

/**
 * Fetches all sheet names within a given spreadsheet.
 */
export async function getAllSheetNames(spreadsheetId: string): Promise<{name: string, gid: string}[]> {
  const cacheKey = `sheetnames-${spreadsheetId}`;
  const cachedNames = getInMemoryCache(cacheKey);
  if (cachedNames) {
    return cachedNames;
  }

  try {
    const token = getAuthAccessToken();
    if (!token) throw new Error('Authentication token is missing.');

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties`;
    const response: any = await withRetries(() =>
      fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    );

    const sheetNames = response.sheets?.map((sheet: any) => ({
      name: sheet.properties.title,
      gid: String(sheet.properties.sheetId)
    })) || [];
    
    setInMemoryCache(cacheKey, sheetNames);
    return sheetNames;
  } catch (error: any) {
    console.error(`Failed to fetch sheet names for spreadsheet ${spreadsheetId}:`, error);
    throw new Error(`Failed to load sheet names. Error: ${error.message || JSON.stringify(error)}`);
  }
}

/**
 * Maps a row of raw sheet values to an object based on the schema and column configuration.
 */
function mapRowToObject<T>(
  row: any[],
  columns: SheetConfig<T>['columns'],
  schema: z.ZodType<T>,
  headers: string[],
): T {
  const obj: Record<string, any> = {};
  const headerMap: Record<string, number> = headers.reduce((acc, header, idx) => ({ ...acc, [header]: idx }), {});

  for (const key in columns) {
    const colConfig = columns[key as keyof T];
    if (colConfig) {
      const headerIndex = headerMap[colConfig.header];
      if (headerIndex !== undefined && row[headerIndex] !== undefined) {
        let value = row[headerIndex];
        // Basic type coercion based on schema (can be expanded)
        switch (colConfig.type) {
          case 'number':
            value = Number(value);
            if (isNaN(value)) value = undefined; // Let Zod handle validation for undefined
            break;
          case 'boolean':
            value = String(value).toLowerCase() === 'true';
            break;
          case 'string_array':
            value = typeof value === 'string' ? value.split(/[,|]/).map(s => s.trim()).filter(Boolean) : [];
            break;
          default:
            // For strings, treat empty string as undefined to allow Zod's optional() to work.
            if (value === '') value = undefined;
            break;
        }
        obj[key] = value;
      } else {
        obj[key] = undefined; // Explicitly set to undefined if header not found or value missing
      }
    }
  }

  // Attempt to parse with Zod schema for full validation and default values
  return schema.parse(obj);
}

/**
 * Maps a JavaScript object to a row of values suitable for writing to a sheet, based on the sheet's headers.
 */
function mapObjectToRow<T>(obj: T, columns: SheetConfig<T>['columns'], headers: string[]): any[] {
  const row: any[] = new Array(headers.length).fill(null);

  for (const key in columns) {
    const colConfig = columns[key as keyof T];
    if (colConfig) {
      const headerIndex = headers.indexOf(colConfig.header);
      if (headerIndex !== -1) {
        let value: any = obj[key as keyof T]; // Initialize as any
        
        // Handle specific types for writing back
        switch (colConfig.type) {
            case 'string_array':
                value = Array.isArray(value) ? value.join(', ') : '';
                break;
            case 'boolean':
                value = value ? 'TRUE' : 'FALSE';
                break;
            case 'number':
                value = (value === null || value === undefined) ? '' : value; // Google Sheets treats empty string as empty cell
                break;
            default:
                value = (value === null || value === undefined) ? '' : String(value);
                break;
        }
        row[headerIndex] = value;
      }
    }
  }
  return row;
}

/**
 * Fetches and parses data for a single sheet using its configuration.
 */
export async function fetchSheetData<T>(config: SheetConfig<T>): Promise<T[]> {
  const cacheKey = `data-${config.spreadsheetId}-${config.range}`;
  const cachedData = getInMemoryCache(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  try {
    const token = getAuthAccessToken();
    if (!token) throw new Error('Authentication token is missing.');

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheetId}/values/${encodeURIComponent(config.range)}`;
    const response: any = await withRetries(() =>
      fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    );

    const values = response.values || [];
    if (values.length === 0) return [];

    const headers: string[] = values[0];
    const rows = values.slice(1); // Exclude header row

    const parsedData: T[] = rows.map(row => 
      mapRowToObject(row, config.columns, config.schema, headers)
    );

    setInMemoryCache(cacheKey, parsedData);
    return parsedData;
  } catch (error) {
    console.error(`Failed to fetch data for sheet ${config.range} in spreadsheet ${config.spreadsheetId}:`, error);
    throw new Error(`Failed to load sheet data. Error: ${error.message || JSON.stringify(error)}`);
  }
}

/**
 * Fetches and parses data for multiple sheets within the same spreadsheet in a batch.
 */
export async function batchFetchAndParseSheetData(
  spreadsheetId: string,
  configs: { key: string; config: SheetConfig<any> }[],
): Promise<Record<string, any[]>> {
  const ranges = configs.map(c => c.config.range);
  const cacheKey = `batch-data-${spreadsheetId}-${JSON.stringify(ranges)}`;
  const cachedData = getInMemoryCache(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  try {
    const token = getAuthAccessToken();
    if (!token) throw new Error('Authentication token is missing.');

    const queryString = ranges.map(range => `ranges=${encodeURIComponent(range)}`).join('&');
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet?${queryString}`;
    
    const response: any = await withRetries(() =>
      fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    );

    const result: Record<string, any[]> = {};
    for (const valueRange of response.valueRanges || []) {
      const configEntry = configs.find(c => valueRange.range?.startsWith(c.config.range.split('!')[0]));
      if (configEntry) {
        const values = valueRange.values || [];
        if (values.length === 0) {
          result[configEntry.key] = [];
          continue;
        }
        
        // Fetch headers for this specific sheet using getHeaderMap
        // This ensures the header map is correct and cached.
        const sheetName = configEntry.config.range.split('!')[0].replace(/'/g, '');
        const headersMap = await getHeaderMap(spreadsheetId, sheetName);
        const headersArray = Object.keys(headersMap).sort((a,b) => headersMap[a] - headersMap[b]);

        const rows = values.slice(1); // Exclude header row (as getHeaderMap already deals with it)

        const parsedData = rows.map((row: any[]) => 
          mapRowToObject(row, configEntry.config.columns, configEntry.config.schema, headersArray)
        );
        result[configEntry.key] = parsedData;
      }
    }


    setInMemoryCache(cacheKey, result);
    return result;
  } catch (error) {
    console.error(`Failed to batch fetch data for spreadsheet ${spreadsheetId}:`, error);
    throw new Error(`Failed to batch load sheet data. Error: ${error.message || JSON.stringify(error)}`);
  }
}

/**
 * Appends a new entity to a sheet.
 */
export async function appendEntity<T>(config: SheetConfig<T>, entity: T): Promise<T> {
  const sheetName = config.range.split('!')[0].replace(/'/g, ''); // Extract sheet name correctly
  const headers = await getHeaderMap(config.spreadsheetId, sheetName);
  const headerArray = Object.keys(headers).sort((a,b) => headers[a] - headers[b]);
  const row = mapObjectToRow(entity, config.columns, headerArray);

  const token = getAuthAccessToken();
  if (!token) throw new Error('Authentication token is missing.');

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheetId}/values/${encodeURIComponent(config.range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  await withRetries(() =>
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        values: [row],
      }),
    })
  );
  clearCache(); // Invalidate cache after write
  invalidateSyncJournal(config.spreadsheetId);
  return entity;
}

/**
 * Updates an existing entity in a sheet.
 */
export async function updateEntity<T>(config: SheetConfig<T>, entity: T): Promise<T> {
  const sheetName = config.range.split('!')[0].replace(/'/g, '');
  const headers = await getHeaderMap(config.spreadsheetId, sheetName);
  const headerArray = Object.keys(headers).sort((a,b) => headers[a] - headers[b]);

  const allData = await fetchSheetData(config);
  // FIX: Cast config.keyField to string to ensure it's a valid index type.
  const rowIndex = allData.findIndex(item => (item as any)[config.keyField as string] === (entity as any)[config.keyField as string]);

  if (rowIndex === -1) {
    throw new Error(`Entity with key field '${String(config.keyField)}' and value '${(entity as any)[config.keyField]}' not found for update.`);
  }

  // Row index + 2 because sheet rows are 1-based and we skipped the header row when fetching
  const sheetRowIndex = rowIndex + 2; 
  const row = mapObjectToRow(entity, config.columns, headerArray);

  const token = getAuthAccessToken();
  if (!token) throw new Error('Authentication token is missing.');

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheetId}/values/${encodeURIComponent(sheetName)}!A${sheetRowIndex}?valueInputOption=USER_ENTERED`;

  await withRetries(() =>
    fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        values: [row],
      }),
    })
  );
  clearCache(); // Invalidate cache after write
  invalidateSyncJournal(config.spreadsheetId);
  return entity;
}

/**
 * Deletes an entity from a sheet.
 */
export async function deleteEntity<T>(config: SheetConfig<T>, key: string): Promise<void> {
  const sheetName = config.range.split('!')[0].replace(/'/g, '');
  const allData = await fetchSheetData(config);
  // FIX: Cast config.keyField to string to ensure it's a valid index type.
  const rowIndex = allData.findIndex(item => (item as any)[config.keyField as string] === key);

  if (rowIndex === -1) {
    throw new Error(`Entity with key field '${String(config.keyField)}' and value '${key}' not found for deletion.`);
  }

  const sheetRowIndex = rowIndex + 2; // +2 because sheet rows are 1-based and we skipped the header row

  const token = getAuthAccessToken();
  if (!token) throw new Error('Authentication token is missing.');

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheetId}:batchUpdate`;

  await withRetries(() =>
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        requests: [
          {
            deleteRange: {
              range: {
                sheetId: parseInt(config.gid),
                startRowIndex: sheetRowIndex -1, // API is 0-indexed
                endRowIndex: sheetRowIndex,
              },
              shiftDimension: 'ROWS',
            },
          },
        ],
      }),
    })
  );
  clearCache(); // Invalidate cache after write
  invalidateSyncJournal(config.spreadsheetId);
}

/**
 * Creates a new entity with a generated ID and appends it to the sheet.
 */
export async function createEntity<T extends { [K in keyof T]: any }, K extends keyof T>(
  config: SheetConfig<T>,
  entity: Omit<T, K>,
): Promise<T> {
  const newId = uuidv4();
  // Ensure the keyField is a string before assigning newId
  const keyFieldName = String(config.keyField); 
  const fullEntity: T = { ...entity, [keyFieldName]: newId } as T;
  return appendEntity(config, fullEntity);
}

// --- Google Workspace API Integrations ---

/**
 * Fetches the count of unread messages in Gmail.
 */
export async function fetchUnreadGmailCount(): Promise<number> {
  try {
    const token = getAuthAccessToken();
    if (!token) throw new Error('Authentication token is missing.');

    const url = `https://www.googleapis.com/gmail/v1/users/me/messages?q=is:unread%20in:inbox`;
    const response: any = await withRetries(() =>
      fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    );
    return response.messages ? response.messages.length : 0;
  } catch (error) {
    console.error('Error fetching Gmail unread count:', error);
    throw new Error('Failed to fetch Gmail unread count.');
  }
}

/**
 * Fetches the next upcoming event from Google Calendar.
 */
export async function fetchNextCalendarEvent(): Promise<any | null> {
  try {
    const token = getAuthAccessToken();
    if (!token) throw new Error('Authentication token is missing.');

    const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${new Date().toISOString()}&showDeleted=false&singleEvents=true&maxResults=1&orderBy=startTime`;
    const response: any = await withRetries(() =>
      fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    );
    const events = response.items;
    return events && events.length > 0 ? events[0] : null;
  } catch (error) {
    console.error('Error fetching next calendar event:', error);
    throw new Error('Failed to fetch next calendar event.');
  }
}

/**
 * Appends a new row to the 'App' sheet.
 */
export async function addAppSheetRow(spreadsheetId: string, values: any[]): Promise<void> {
  const token = getAuthAccessToken();
  if (!token) throw new Error('Authentication token is missing.');

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/App:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  await withRetries(() =>
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        values: [values],
      }),
    })
  );
  clearCache();
  invalidateSyncJournal(spreadsheetId);
}

/**
 * Updates a specific row in the 'App' sheet.
 */
export async function updateAppSheetRow(spreadsheetId: string, rowIndex: number, values: any[]): Promise<void> {
  const token = getAuthAccessToken();
  if (!token) throw new Error('Authentication token is missing.');

  // `rowIndex` here is 1-based from the sheet (including header), so it directly corresponds to the sheet row.
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/App!A${rowIndex}?valueInputOption=USER_ENTERED`;

  await withRetries(() =>
    fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        values: [values],
      }),
    })
  );
  clearCache();
  invalidateSyncJournal(spreadsheetId);
}

/**
 * Deletes a row from a specific sheet.
 * `rowIndex` is 1-based, directly from the sheet.
 */
export async function deleteRow(spreadsheetId: string, sheetName: string, rowIndex: number): Promise<void> {
  const token = getAuthAccessToken();
  if (!token) throw new Error('Authentication token is missing.');

  const sheetIdResponse: any = await withRetries(() =>
    fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties`, {
      headers: { Authorization: `Bearer ${token}` }
    })
  );
  
  const sheets = sheetIdResponse.sheets;
  const targetSheet = sheets?.find((s: any) => s.properties.title === sheetName);

  if (!targetSheet || !targetSheet.properties?.sheetId) {
    throw new Error(`Sheet '${sheetName}' not found or its ID could not be retrieved.`);
  }

  const gid = targetSheet.properties.sheetId;

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`;

  await withRetries(() =>
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        requests: [
          {
            deleteRange: {
              range: {
                sheetId: gid,
                startRowIndex: rowIndex - 1, // API is 0-indexed
                endRowIndex: rowIndex,
              },
              shiftDimension: 'ROWS',
            },
          },
        ],
      }),
    })
  );
  clearCache();
  invalidateSyncJournal(spreadsheetId);
}