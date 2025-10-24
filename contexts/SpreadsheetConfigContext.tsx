import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
} from 'react';
import { z } from 'zod';

import { appStructure } from '../config/appStructure';
import { getHeaderMap, SheetConfig, getAllSheetNames } from '../services/googleSheetService';
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
    ids?: SpreadsheetIds;
    aliasMappings?: Record<number, string>;
    headerMappings?: Record<string, Record<string, string>>;
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
  STRATEGY: '1iJ3SoeZiaeBbGm8KIwRYtEKwZQ88FPvQ17o2Xwo-AJc',
  PARTNERS: '1TEcuV4iL_xgf5CYKt7Q_uBt-6T7TejcAlAIKaunQxSs',
  YDS_APP: '1wvjgA8ESxxn_hl86XeL_gOecDjSYPgSo6qyzewP-oJw',
  YDC_BASE: '1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY',
  YDS_MANAGEMENT: '1y1rke6XG8SIs9O6bjOFhronEyzMhOsnsIDydTiop-wA',
  MASTER_SCHEMA: '1wvjgA8ESxxn_hl86XeL_gOecDjSYPgSo6qyzewP-oJw',
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
      const resolvedSpreadsheetId = rowData.spreadsheet_id || (rowData.spreadsheet_code ? resolvedSpreadsheetIds[rowData.spreadsheet_code as keyof SpreadsheetIds] : '');
      const resolvedSpreadsheetName = rowData.spreadsheet_name || (
          rowData.spreadsheet_code 
          ? Object.values(allSheetConfigs).find(cfg => cfg(resolvedSpreadsheetIds).spreadsheetId === resolvedSpreadsheetId)?.(resolvedSpreadsheetIds).range.split('!')[0].replace(/'/g, '') // Try to derive name
          : ''
      );

      // Determine GID: ALWAYS prioritize from allSheetConfigs for the given alias.
      const hardcodedSheetConfig = rowData.table_alias ? allSheetConfigs[rowData.table_alias as keyof typeof allSheetConfigs]?.(resolvedSpreadsheetIds) : undefined;
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
      populateField('gid', resolvedGid);
      populateField('header', rowData.header); // This `header` here is for `App` sheet itself, not for data sheets
      
      return values;
  }, [allSheetConfigs]);


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
      const appSheetResponse: any = await (window as any).gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: masterSpreadsheetId,
        range: 'App!A:Z',
      });
      const appRowsData = appSheetResponse.result.values || [];
      const appSheetHeaders = appRowsData.shift() || []; // Headers for parsing
      const appSheetHeaderIndexMap = appSheetHeaders.reduce((acc: any, h: string, i: number) => ({ ...acc, [h.toLowerCase()]: i }), {});


      const parsedAppRows: AppSheetRow[] = appRowsData.map((row: any[], index: number) => {
        const rowData: Partial<AppSheetRow> = {
            _rowIndex: index + 2,
            spreadsheet_name: row[appSheetHeaderIndexMap['spreadsheet_name']],
            spreadsheet_code: row[appSheetHeaderIndexMap['spreadsheet_code']],
            spreadsheet_id: row[appSheetHeaderIndexMap['spreadsheet_id']],
            sheet_name: row[appSheetHeaderIndexMap['sheet_name']],
            table_alias: row[appSheetHeaderIndexMap['table_alias']],
            sheet_id: row[appSheetHeaderIndexMap['gid']], // Map 'gid' column from sheet to 'sheet_id' in schema
            header: row[appSheetHeaderIndexMap['header']], // Header field from App sheet itself
        };
        return AppSheetRowSchema.parse(rowData); // Validate and potentially fill defaults
      }).filter((r: AppSheetRow) => r.spreadsheet_code || r.sheet_name); // Filter out empty rows

      setAppSheetRows(parsedAppRows);

      const dynamicIds = parsedAppRows.reduce((acc: Partial<SpreadsheetIds>, row) => {
        if (row.spreadsheet_code && row.spreadsheet_id) {
          acc[row.spreadsheet_code as keyof SpreadsheetIds] = row.spreadsheet_id;
        }
        return acc;
      }, {});

      // Merge initial, dynamic (from App sheet), and local storage IDs
      const finalIds = { ...initialIds, ...dynamicIds, ...localIds };
      setSpreadsheetIds(finalIds);

      // --- Fetch Master Schema Rows (for Health Check, not for runtime mapping) ---
      // This logic remains to support the SheetHealthCheckPage, but these rows are NOT used
      // to construct `finalConfigs` or resolve headers for actual data sheets.
      const schemaHeadersMap = await getHeaderMap(masterSpreadsheetId, 'HEADERS_SNAPSHOT_PARENT');
      const schemaResponse: any = await (window as any).gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: masterSpreadsheetId,
        range: 'HEADERS_SNAPSHOT_PARENT!A:AZ',
      });
      const schemaRowsData = schemaResponse.result.values || [];
      const schemaHeaders = schemaRowsData.shift() || [];
      const schemaHeaderIndexMap = schemaHeaders.reduce((acc: any, h: string, i: number) => ({ ...acc, [h.toLowerCase()]: i }), {});

      const parsedSchemaRows: MasterSchemaRow[] = schemaRowsData.map((row: any[], index: number) => {
        const rowData: Partial<MasterSchemaRow> = {
            _rowIndex: index + 2,
            table_alias: row[schemaHeaderIndexMap['table_alias']],
            app_field: row[schemaHeaderIndexMap['app_field']],
            header: row[schemaHeaderIndexMap['header']],
            spreadsheet_id: row[schemaHeaderIndexMap['spreadsheet_id']],
            spreadsheet_name: row[schemaHeaderIndexMap['spreadsheet_name']],
            sheet_name: row[schemaHeaderIndexMap['sheet_name']],
            gid: row[schemaHeaderIndexMap['gid']],
            A1_Column_Range: row[schemaHeaderIndexMap['a1_column_range']],
            Named_Range_Name: row[schemaHeaderIndexMap['named_range_name']],
            col_index: row[schemaHeaderIndexMap['col_index']],
            'Column Letter': row[schemaHeaderIndexMap['column letter']],
            sample_value: row[schemaHeaderIndexMap['sample_value']],
            Protection_Status: row[schemaHeaderIndexMap['protection_status']],
            Data_Type: row[schemaHeaderIndexMap['data_type']],
            Contains_Formula: row[schemaHeaderIndexMap['contains_formula']],
            Data_Validation: row[schemaHeaderIndexMap['data_validation']],
            Column_aliases: row[schemaHeaderIndexMap['column_aliases']],
            key_field: row[schemaHeaderIndexMap['key_field']],
            named_data_range: row[schemaHeaderIndexMap['named_data_range']],
            range: row[schemaHeaderIndexMap['range']],
            sheet_type: row[schemaHeaderIndexMap['sheet_type']],
            system_role: row[schemaHeaderIndexMap['system_role']],
            data_tier: row[schemaHeaderIndexMap['data_tier']],
            description: row[schemaHeaderIndexMap['description']],
            detected_type: row[schemaHeaderIndexMap['detected_type']],
            has_formula: row[schemaHeaderIndexMap['has_formula']],
            snapshot_ts: row[schemaHeaderIndexMap['snapshot_ts']],
            is_pk: row[schemaHeaderIndexMap['is_pk']],
            fk_ref: row[schemaHeaderIndexMap['fk_ref']],
        };
        return MasterSchemaRowSchema.parse(rowData);
      }).filter((r: MasterSchemaRow) => r.table_alias && r.app_field);
      
      setMasterSchemaRows(parsedSchemaRows);
      
      const allIdsPresent = Object.values(finalIds).every(
        (id) => typeof id === 'string' && id.trim() !== '',
      );
      setIsConfigured(allIdsPresent);

    } catch (error) {
      console.error('Failed to load master configuration:', error);
      setIsConfigured(false);
    } finally {
      setIsConfigLoading(false);
    }
  }, [isSignedIn, getSheetNamesInSpreadsheet, buildAppSheetRowValues]);

  useEffect(() => {
    const initConfig = async () => {
      await loadConfig();
    };
    initConfig();
  }, [loadConfig]);

  const finalConfigs: Record<string, SheetConfig<any>> = useMemo(() => {
    if (isConfigLoading) return {}; 

    const generatedConfigs: Record<string, SheetConfig<any>> = {};
    const appTableAliases = Object.keys(appStructure);

    appTableAliases.forEach((alias) => {
        const schemaConfig = appStructure[alias as keyof typeof appStructure];
        const appRow = appSheetRows.find(row => row.table_alias === alias);
        
        // Retrieve hardcoded config (which now contains GID and full column definitions)
        const hardcodedSheetConfig = allSheetConfigs[alias as keyof typeof allSheetConfigs]?.(spreadsheetIds); 

        // If no hardcoded config exists for this alias, we can't build a final config.
        if (!hardcodedSheetConfig) {
            console.warn(`No hardcoded sheet configuration found for alias: ${alias}. Skipping config generation.`);
            return;
        }

        // Determine spreadsheet ID: Prioritize from App sheet, then hardcoded, then fallback
        let currentSpreadsheetId = hardcodedSheetConfig.spreadsheetId;
        if (appRow?.spreadsheet_code && spreadsheetIds[appRow.spreadsheet_code as keyof SpreadsheetIds]) {
            currentSpreadsheetId = spreadsheetIds[appRow.spreadsheet_code as keyof SpreadsheetIds];
        } else if (!currentSpreadsheetId) { // Fallback if hardcoded also doesn't provide it (shouldn't happen with updated sheetConfig)
             currentSpreadsheetId = spreadsheetIds.YDC_BASE; // Last resort
        }
        
        // Determine GID: ALWAYS use the GID from `hardcodedSheetConfig` (sheetConfig.ts is the source of truth)
        const currentGid = hardcodedSheetConfig.gid;

        // Determine Sheet Name: Use the sheet name part from the hardcoded config's range.
        const currentSheetName = hardcodedSheetConfig.range.split('!')[0].replace(/'/g, '');

        // Final check for essential properties
        if (!currentSpreadsheetId || !currentGid || !currentSheetName) {
            console.warn(`Skipping config for alias ${alias}: Missing spreadsheetId (${currentSpreadsheetId}), gid (${currentGid}), or derived sheetName (${currentSheetName}).`);
            return;
        }

        // Use column definitions from hardcodedSheetConfig directly (these are now comprehensive)
        const columnMappings = hardcodedSheetConfig.columns; 

        generatedConfigs[alias] = {
            spreadsheetId: currentSpreadsheetId,
            gid: currentGid,
            range: `${currentSheetName}!A:Z`, // Use dynamic sheet name but generic A:Z range
            namedDataRange: hardcodedSheetConfig.namedDataRange, // Preserve if exists
            keyField: schemaConfig.keyField,
            columns: columnMappings, 
            schema: schemaConfig.schema,
        };
    });

    return generatedConfigs;

  }, [isConfigLoading, appSheetRows, spreadsheetIds, allSheetConfigs]);

  const value = {
    spreadsheetIds,
    isConfigured,
    isConfigLoading,
    finalConfigs,
    saveSheetConfiguration: useCallback(
      async (config: {
        ids?: SpreadsheetIds;
        aliasMappings?: Record<number, string>;
        // headerMappings is no longer used for runtime config but might be part of an admin tool UI if needed
      }) => {
        let newIds = { ...spreadsheetIds };
        if (config.ids) {
          newIds = { ...newIds, ...config.ids };
          setSpreadsheetIds(newIds); // Update state immediately
        }

        // Persist to local storage
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ ids: newIds }));

        // Update App sheet with new alias mappings
        if (config.aliasMappings) {
          const masterSchemaId = newIds.MASTER_SCHEMA;
          if (!masterSchemaId) {
            throw new Error("Master Schema Spreadsheet ID is not configured.");
          }
          const appSheetCurrentHeaders = await getHeaderMap(masterSchemaId, 'App');
          const appSheetAllRows = await googleSheetService.fetchSheetData<AppSheetRow>({
              spreadsheetId: masterSchemaId,
              gid: (appSheetRows.find(r => r.sheet_name === 'App')?.sheet_id || '0'), // Find App sheet's GID
              range: 'App!A:Z',
              keyField: '_rowIndex',
              columns: Object.keys(AppSheetRowSchema.shape).reduce((acc: any, key: string) => {
                  acc[key] = { header: key }; 
                  return acc;
              }, {}),
              schema: AppSheetRowSchema,
          });

          for (const rowIndexStr in config.aliasMappings) {
            const rowIndex = parseInt(rowIndexStr, 10);
            const newAlias = config.aliasMappings[rowIndex];
            
            const existingAppRow = appSheetAllRows.find(r => r._rowIndex === rowIndex);
            if (existingAppRow) {
                // Keep existing data, just update the alias
                const updatedRowData: Partial<AppSheetRow> = { ...existingAppRow, table_alias: newAlias };
                const values = buildAppSheetRowValues(updatedRowData, appSheetCurrentHeaders, newIds);
                await googleSheetService.updateAppSheetRow(masterSchemaId, rowIndex, values);
            } else {
                console.warn(`AppSheetRow for rowIndex ${rowIndex} not found. Cannot update alias.`);
            }
          }
        }
        
        // No longer processing config.headerMappings directly via API calls to HEADERS_SNAPSHOT_PARENT
        // as column definitions are now hardcoded in sheetConfig.ts.

        await loadConfig(); // After saving, reload config to reflect changes
      },
      [spreadsheetIds, appSheetRows, loadConfig, buildAppSheetRowValues],
    ),
    appSheetRows,
    masterSchemaRows, // Still providing this for health check page
    addAppSheetRow: useCallback(async (rowData: Omit<AppSheetRow, '_rowIndex'>) => {
        const masterSchemaId = spreadsheetIds.MASTER_SCHEMA;
        if (!masterSchemaId) throw new Error("Master Schema Spreadsheet ID is not configured.");
        const appSheetHeadersMap = await getHeaderMap(masterSchemaId, 'App');
        
        const newRowValues = buildAppSheetRowValues(rowData, appSheetHeadersMap, spreadsheetIds);
        
        await googleSheetService.addAppSheetRow(masterSchemaId, newRowValues);
        await loadConfig(); // Reload to update state
    }, [spreadsheetIds, loadConfig, buildAppSheetRowValues]),
    updateAppSheetRow: useCallback(async (rowData: AppSheetRow) => {
        const masterSchemaId = spreadsheetIds.MASTER_SCHEMA;
        if (!masterSchemaId) throw new Error("Master Schema Spreadsheet ID is not configured.");
        if (rowData._rowIndex === undefined) throw new Error("Row index is required to update an AppSheetRow.");
        const appSheetHeadersMap = await getHeaderMap(masterSchemaId, 'App');

        const updatedRowValues = buildAppSheetRowValues(rowData, appSheetHeadersMap, spreadsheetIds);

        await googleSheetService.updateAppSheetRow(masterSchemaId, rowData._rowIndex, updatedRowValues);
        await loadConfig(); // Reload to update state
    }, [spreadsheetIds, loadConfig, buildAppSheetRowValues]),
    deleteAppSheetRow: useCallback(async (rowIndex: number) => {
        const masterSchemaId = spreadsheetIds.MASTER_SCHEMA;
        if (!masterSchemaId) throw new Error("Master Schema Spreadsheet ID is not configured.");
        await googleSheetService.deleteRow(masterSchemaId, 'App', rowIndex);
        await loadConfig(); // Reload to update state
    }, [spreadsheetIds, loadConfig]),
    getSheetNamesInSpreadsheet,
  };

  return (
    <SpreadsheetConfigContext.Provider value={value}>
      {children}
    </SpreadsheetConfigContext.Provider>
  );
};

export const useSpreadsheetConfig = () => {
  const context = useContext(SpreadsheetConfigContext);
  if (context === undefined) {
    throw new Error('useSpreadsheetConfig must be used within a SpreadsheetConfigProvider');
  }
  return context;
};