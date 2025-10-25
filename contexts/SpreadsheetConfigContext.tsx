import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import { z } from 'zod';

import { appStructure } from '../config/appStructure';
import { getHeaderMap, SheetConfig, getAllSheetNames, fetchSheetData } from '../services/googleSheetService';
import type { AppSheetRow, MasterSchemaRow } from '../types';
import { AppSheetRowSchema, MasterSchemaRowSchema } from '../schemas'; // Import schemas
import * as googleSheetService from '../services/googleSheetService';
import { allSheetConfigs } from '../sheetConfig'; // Import allSheetConfigs

import { useAuth } from './AuthContext';

const LOCAL_STORAGE_KEY = 'yd_labs_spreadsheet_config';

export interface SpreadsheetIds {
  STRATEGY: string;
  PARTNERS: string;
  YDS_APP: string;
  YDC_BASE: string;
  YDS_MANAGEMENT: string;
  MASTER_SCHEMA: string;
}

export type SheetMappings = Record<string, Record<string, string>>;

interface ISpreadsheetConfigContext {
  spreadsheetIds: SpreadsheetIds;
  isConfigured: boolean;
  isConfigLoading: boolean;
  finalConfigs: Record<string, SheetConfig<any>>;
  saveSheetConfiguration: (config: {
    ids?: Partial<SpreadsheetIds>;
    aliasMappings?: Record<number, string>;
    // headerMappings is no longer used for runtime config but might be part of an admin tool UI if needed
  }) => Promise<void>;
  appSheetRows: AppSheetRow[];
  masterSchemaRows: MasterSchemaRow[]; // Still needed for SheetHealthCheck
  addAppSheetRow: (rowData: Omit<AppSheetRow, '_rowIndex'>) => Promise<void>;
  updateAppSheetRow: (rowData: AppSheetRow) => Promise<void>;
  deleteAppSheetRow: (rowIndex: number) => Promise<void>;
  getSheetNamesInSpreadsheet: (spreadsheetId: string) => Promise<{name: string, gid: string}[]>;
}

const SpreadsheetConfigContext = createContext<
  ISpreadsheetConfigContext | undefined
>(undefined);

const initialIds: SpreadsheetIds = {
  // FIX: Use process.env for all VITE_* prefixed environment variables.
  STRATEGY: process.env.VITE_STRATEGY_ID || '1iJ3SoeZiaeBbGm8KIwRYtEKwZQ88FPvQ17o2Xwo-AJc',
  PARTNERS: process.env.VITE_PARTNERS_ID || '1TEcuV4iL_xgf5CYKt7Q_uBt-6T7TejcAlAIKaunQxSs',
  YDS_APP: process.env.VITE_SHEETS_ID || '1wvjgA8ESxxn_hl86XeL_gOecDjSYPgSo6qyzewP-oJw',
  YDC_BASE: process.env.VITE_YDC_BASE_ID || '1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY',
  YDS_MANAGEMENT: process.env.VITE_YDS_MANAGEMENT_ID || '1y1rke6XG8SIs9O6bjOFhronEyzMhOsnsIDydTiop-wA',
  MASTER_SCHEMA: process.env.VITE_SHEETS_ID || '1wvjgA8ESxxn_hl86XeL_gOecDjSYPgSo6qyzewP-oJw',
};

export const SpreadsheetConfigProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { isSignedIn } = useAuth();
  const [spreadsheetIds, setSpreadsheetIds] =
    useState<SpreadsheetIds>(initialIds);
  const [isConfigured, setIsConfigured] = useState(false);
  const [isConfigLoading, setIsConfigLoading] = useState(true);
  const [appSheetRows, setAppSheetRows] = useState<AppSheetRow[]>([]);
  const [masterSchemaRows, setMasterSchemaRows] = useState<MasterSchemaRow[]>(
    [],
  );

  const getSheetNamesInSpreadsheet = useCallback(async (spreadsheetId: string) => {
    try {
      return await getAllSheetNames(spreadsheetId);
    } catch (error) {
      console.error(`Failed to get sheet names for ${spreadsheetId}:`, error);
      return [];
    }
  }, []);

  // Helper to construct AppSheetRow values for writing back to Google Sheets
  // Ensures the order matches the actual sheet headers and populates derived fields
  const buildAppSheetRowValues = useCallback((
      rowData: Partial<AppSheetRow>,
      currentHeaders: Record<string, number>, // headerName -> index
      resolvedSpreadsheetIds: SpreadsheetIds // for looking up spreadsheet_id from code
  ): any[] => {
      const values: any[] = new Array(Object.keys(currentHeaders).length).fill('');
      const headerMap = Object.entries(currentHeaders).reduce((acc, [h, idx]) => ({...acc, [h]: idx}), {} as Record<string, number>);

      // Determine spreadsheet_id and spreadsheet_name based on code and global IDs
      const resolvedSpreadsheetId = rowData.spreadsheet_code ? resolvedSpreadsheetIds[rowData.spreadsheet_code as keyof SpreadsheetIds] : rowData.spreadsheet_id;
      const resolvedSpreadsheetName = rowData.spreadsheet_code 
          // FIX: Use allSheetConfigs to get the sheet name if available, fallback to empty string
          ? (allSheetConfigs as any)[rowData.table_alias as keyof typeof allSheetConfigs]?.(resolvedSpreadsheetIds)?.range.split('!')[0].replace(/'/g, '') || '' 
          : rowData.spreadsheet_name || '';

      // Determine GID: ALWAYS prioritize from allSheetConfigs for the given alias.
      const hardcodedSheetConfig = rowData.table_alias ? (allSheetConfigs as any)[rowData.table_alias as keyof typeof allSheetConfigs]?.(resolvedSpreadsheetIds) : undefined;
      const resolvedGid = rowData.sheet_id || hardcodedSheetConfig?.gid || '';

      const populateField = (header: string, value: any) => {
          const idx = headerMap[header];
          if (idx !== undefined) {
              values[idx] = value !== undefined && value !== null ? String(value) : '';
          }
      };

      populateField('spreadsheet_name', rowData.spreadsheet_name || resolvedSpreadsheetName);
      populateField('spreadsheet_code', rowData.spreadsheet_code);
      populateField('spreadsheet_id', resolvedSpreadsheetId);
      populateField('sheet_name', rowData.sheet_name);
      populateField('table_alias', rowData.table_alias);
      populateField('sheet_id', resolvedGid); // Use sheet_id here as it's the expected column name in AppSheetRow
      populateField('header', rowData.header); // This `header` here is for `App` sheet itself, not for data sheets
      
      return values;
  }, []);


  const loadConfig = useCallback(async () => {
    if (!isSignedIn) {
      setIsConfigLoading(false);
      return;
    }

    setIsConfigLoading(true);

    try {
      // --- Load Local Storage ---
      const storedConfigJson = localStorage.getItem(LOCAL_STORAGE_KEY);
      let localIds: Partial<SpreadsheetIds> = {};
      if (storedConfigJson) {
        const storedConfig = JSON.parse(storedConfigJson);
        if (storedConfig.ids) localIds = storedConfig.ids;
      }
      
      const masterSpreadsheetId = localIds.MASTER_SCHEMA || initialIds.MASTER_SCHEMA;
      
      // --- Fetch Layer 1 Config from 'App' sheet ---
      const appSheetHeadersMap = await getHeaderMap(masterSpreadsheetId, 'App');
      const appSheetAllSheets = await getAllSheetNames(masterSpreadsheetId);
      const appSheetGid = appSheetAllSheets.find(s => s.name === 'App')?.gid || '0';

      const appSheetData = await googleSheetService.fetchSheetData<AppSheetRow>({
          spreadsheetId: masterSpreadsheetId,
          gid: appSheetGid, // Use the dynamically retrieved GID
          range: 'App!A:Z',
          keyField: '_rowIndex',
          schema: AppSheetRowSchema,
          columns: allSheetConfigs(initialIds).App.columns, // Use base columns
      });
      setAppSheetRows(appSheetData);

      // --- Fetch Master Schema Data ---
      const masterSchemaAllSheets = await getAllSheetNames(masterSpreadsheetId);
      const masterSchemaGid = masterSchemaAllSheets.find(s => s.name === 'HEADERS_SNAPSHOT_PARENT')?.gid || '594360110';

      const masterSchemaData = await googleSheetService.fetchSheetData<MasterSchemaRow>({
          spreadsheetId: masterSpreadsheetId,
          gid: masterSchemaGid,
          range: 'HEADERS_SNAPSHOT_PARENT!A:AZ',
          keyField: '_rowIndex',
          schema: MasterSchemaRowSchema,
          columns: allSheetConfigs(initialIds).MasterSchemaRows.columns,
      });
      setMasterSchemaRows(masterSchemaData);

      // --- Consolidate Spreadsheet IDs ---
      const resolvedSpreadsheetIds: SpreadsheetIds = { ...initialIds, ...localIds };
      appSheetData.forEach(row => {
          if (row.spreadsheet_code && row.spreadsheet_id) {
              resolvedSpreadsheetIds[row.spreadsheet_code as keyof SpreadsheetIds] = row.spreadsheet_id;
          }
      });
      setSpreadsheetIds(resolvedSpreadsheetIds);

      // Check if all essential IDs are configured
      const allEssentialIdsConfigured = Object.values(resolvedSpreadsheetIds).every(id => !!id);
      setIsConfigured(allEssentialIdsConfigured);

    } catch (error: any) {
      console.error('Failed to load spreadsheet configuration:', error);
      const gapiError = error.result?.error;
      let errorMessage = `Failed to load application configuration from Google Sheets.`;
      if (gapiError) {
        errorMessage += ` Error: ${gapiError.message}`;
      } else if (error.message) {
        errorMessage += ` Error: ${error.message}`;
      } else {
        errorMessage += ` Details: ${JSON.stringify(error)}`;
      }
      // Provide actionable advice if specific errors are detected
      if (errorMessage.includes('Requested entity was not found')) {
        errorMessage += `\n\nPlease ensure the "Master Schema & Config" spreadsheet ID is correct and you have access to it. Also verify sheet names like "App" and "HEADERS_SNAPSHOT_PARENT" exist in that spreadsheet.`;
      } else if (errorMessage.includes('API Key not valid')) {
        errorMessage += `\n\nPlease ensure your API Key is correctly configured and has access to Google Sheets API.`;
      }
      // Assuming a global error state or similar mechanism exists in AuthContext or App.tsx
      // For now, setting it to a console.warn so it doesn't break the app logic here if not handled.
      // console.warn('Caught config loading error:', errorMessage);
      // setInitError(errorMessage); // This is not part of this context, but how it might be handled.
    } finally {
      setIsConfigLoading(false);
    }
  }, [isSignedIn, initialIds, buildAppSheetRowValues]);


  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  // Dynamically generate SheetConfig objects based on resolved IDs and appStructure
  const finalConfigs: Record<string, SheetConfig<any>> = useMemo(() => {
    if (!isConfigured && isSignedIn) {
      // If not fully configured but signed in, return minimal configs for setup pages
      const masterSchemaConfig = allSheetConfigs(spreadsheetIds).MasterSchemaRows;
      const appConfig = allSheetConfigs(spreadsheetIds).App;
      return {
        MasterSchemaRows: { ...masterSchemaConfig, spreadsheetId: spreadsheetIds.MASTER_SCHEMA },
        App: { ...appConfig, spreadsheetId: spreadsheetIds.MASTER_SCHEMA },
      };
    }
    
    // Otherwise, return all generated configs
    return allSheetConfigs(spreadsheetIds);
  }, [spreadsheetIds, isConfigured, isSignedIn]);


  const saveSheetConfiguration = useCallback(
    async (config: { ids?: Partial<SpreadsheetIds> }) => {
      // Merge new IDs with existing ones
      const newIds = { ...spreadsheetIds, ...config.ids };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ ids: newIds }));
      setSpreadsheetIds(newIds); // Update state immediately

      // Refresh data after saving config
      await loadConfig();
    },
    [spreadsheetIds, loadConfig],
  );

  const addAppSheetRow = useCallback(async (rowData: Omit<AppSheetRow, '_rowIndex'>) => {
    if (!spreadsheetIds.MASTER_SCHEMA) throw new Error('Master Schema ID is not configured.');
    const appSheetHeaders = await getHeaderMap(spreadsheetIds.MASTER_SCHEMA, 'App');
    const values = buildAppSheetRowValues(rowData, appSheetHeaders, spreadsheetIds);
    await googleSheetService.addAppSheetRow(spreadsheetIds.MASTER_SCHEMA, values);
    await loadConfig(); // Reload all config after adding a row
  }, [spreadsheetIds, buildAppSheetRowValues, loadConfig]);

  const updateAppSheetRow = useCallback(async (rowData: AppSheetRow) => {
    if (!spreadsheetIds.MASTER_SCHEMA) throw new Error('Master Schema ID is not configured.');
    if (rowData._rowIndex === undefined) throw new Error('Cannot update AppSheetRow without _rowIndex.');
    const appSheetHeaders = await getHeaderMap(spreadsheetIds.MASTER_SCHEMA, 'App');
    const values = buildAppSheetRowValues(rowData, appSheetHeaders, spreadsheetIds);
    await googleSheetService.updateAppSheetRow(spreadsheetIds.MASTER_SCHEMA, rowData._rowIndex, values);
    await loadConfig(); // Reload all config after updating a row
  }, [spreadsheetIds, buildAppSheetRowValues, loadConfig]);

  const deleteAppSheetRow = useCallback(async (rowIndex: number) => {
    if (!spreadsheetIds.MASTER_SCHEMA) throw new Error('Master Schema ID is not configured.');
    await googleSheetService.deleteRow(spreadsheetIds.MASTER_SCHEMA, 'App', rowIndex);
    await loadConfig(); // Reload all config after deleting a row
  }, [spreadsheetIds, loadConfig]);


  const value = {
    spreadsheetIds,
    isConfigured,
    isConfigLoading,
    finalConfigs,
    saveSheetConfiguration,
    appSheetRows,
    masterSchemaRows,
    addAppSheetRow,
    updateAppSheetRow,
    deleteAppSheetRow,
    getSheetNamesInSpreadsheet,
  };

  return (
    <SpreadsheetConfigContext.Provider value={value}>
      {children}
    </SpreadsheetConfigContext.Provider>
  );
};

// FIX: Export useSpreadsheetConfig
export const useSpreadsheetConfig = () => {
  const context = useContext(SpreadsheetConfigContext);
  if (context === undefined) {
    throw new Error('useSpreadsheetConfig must be used within a SpreadsheetConfigProvider');
  }
  return context;
};