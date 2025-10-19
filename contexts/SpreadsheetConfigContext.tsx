import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
// FIX: Corrected import syntax for sheetConfig.
import * as config from '../sheetConfig';
// FIX: Changed import from googleSheetService to sheetGateway and included SheetConfig
import { getHeaderMap, SheetConfig } from '../services/sheetGateway';
import type { AppSheetRow, MasterSchemaRow } from '../types';

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
export type SheetRelations = Record<string, Record<string, string>>;
export type SheetDataTypes = Record<
  string,
  Record<string, 'string' | 'number' | 'boolean' | 'string_array'>
>;

// FIX: Added explicit type for dynamically built grouped configs.
type DynamicGroupedConfigs = Record<
  string,
  {
    spreadsheetIdKey: keyof SpreadsheetIds;
    configs: Record<string, (ids: SpreadsheetIds) => SheetConfig<any>>;
  }
>;

interface ISpreadsheetConfigContext {
  spreadsheetIds: SpreadsheetIds;
  sheetMappings: SheetMappings;
  sheetRelations: SheetRelations;
  sheetDataTypes: SheetDataTypes;
  isConfigured: boolean;
  isConfigLoading: boolean;
  saveSheetConfiguration: (config: {
    ids?: SpreadsheetIds;
    mappings?: SheetMappings;
    relations?: SheetRelations;
    dataTypes?: SheetDataTypes;
    sheetNameMappings?: Record<string, string>;
    aliasMappings?: Record<number, string>; // rowIndex -> table_alias
    sheetNameUpdates?: Record<number, string>; // rowIndex -> sheet_name
  }) => Promise<void>;
  masterSchemaRows: MasterSchemaRow[];
  appSheetRows: AppSheetRow[];
  dynamicGroupedConfigs: DynamicGroupedConfigs;
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
  MASTER_SCHEMA: '1wvjgA8ESxxn_hl86XeL_gOecDjSYPgSo6qyzewP-oJw', // Master schema is in the YDS_APP sheet
};

export const SpreadsheetConfigProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { isSignedIn } = useAuth();
  const [spreadsheetIds, setSpreadsheetIds] =
    useState<SpreadsheetIds>(initialIds);
  const [sheetMappings, setSheetMappings] = useState<SheetMappings>({});
  const [sheetRelations, setSheetRelations] = useState<SheetRelations>({});
  const [sheetDataTypes, setSheetDataTypes] = useState<SheetDataTypes>({});
  const [isConfigured, setIsConfigured] = useState(false);
  const [isConfigLoading, setIsConfigLoading] = useState(true);
  const [appSheetRows, setAppSheetRows] = useState<AppSheetRow[]>([]);
  const [masterSchemaRows, setMasterSchemaRows] = useState<MasterSchemaRow[]>(
    [],
  );
  // FIX: Used explicit type for dynamic grouped configs state.
  const [dynamicGroupedConfigs, setDynamicGroupedConfigs] =
    useState<DynamicGroupedConfigs>({});

  // Load configuration from local storage on mount
  useEffect(() => {
    try {
      const storedConfigJson = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedConfigJson) {
        const { ids, mappings, relations, dataTypes } =
          JSON.parse(storedConfigJson);
        if (ids) {
          const mergedIds = { ...initialIds, ...ids };
          setSpreadsheetIds(mergedIds);
          if (
            mergedIds.STRATEGY &&
            mergedIds.PARTNERS &&
            mergedIds.YDS_APP &&
            mergedIds.YDC_BASE &&
            mergedIds.YDS_MANAGEMENT
          ) {
            setIsConfigured(true);
          }
        }
        // These will be merged with the master schema later
        if (mappings) setSheetMappings(mappings);
        if (relations) setSheetRelations(relations);
        if (dataTypes) setSheetDataTypes(dataTypes);
      }
    } catch (error) {
      console.error(
        'Failed to load spreadsheet config from local storage:',
        error,
      );
    } finally {
      setIsConfigLoading(false);
    }
  }, []);

  // Fetch and process master schema
  useEffect(() => {
    const fetchMasterSchema = async () => {
      if (!spreadsheetIds.MASTER_SCHEMA || !isSignedIn) return;

      setIsConfigLoading(true);
      try {
        // --- Phase 1: Fetch Spreadsheet IDs from 'App' sheet ---
        const appSheetResponse =
          await (window as any).gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: spreadsheetIds.MASTER_SCHEMA,
            range: 'App!A:Z', // spreadsheet_name, spreadsheet_code, spreadsheet_id, sheet_name, table_alias
          });
        const appRows = appSheetResponse.result.values || [];
        const appSheetHeaders = appRows.shift() || [];
        const appSheetHeaderMap = appSheetHeaders.reduce(
          (acc: any, h: string, i: number) => ({ ...acc, [h.toLowerCase()]: i }),
          {},
        );

        const parsedAppRows: AppSheetRow[] = appRows
          .map((row: any[], index: number) => ({
            _rowIndex: index + 2, // 1-based index + header row
            spreadsheet_name: row[appSheetHeaderMap['spreadsheet_name']],
            spreadsheet_code: row[appSheetHeaderMap['spreadsheet_code']],
            spreadsheet_id: row[appSheetHeaderMap['spreadsheet_id']],
            sheet_name: row[appSheetHeaderMap['sheet_name']],
            table_alias: row[appSheetHeaderMap['table_alias']],
            sheet_id: row[appSheetHeaderMap['sheet_id']],
          }))
          .filter((r: AppSheetRow) => r.spreadsheet_id || r.sheet_name);

        setAppSheetRows(parsedAppRows);
        const appSheetIds = parsedAppRows.reduce(
          (acc: Partial<SpreadsheetIds>, row) => {
            if (row.spreadsheet_code && row.spreadsheet_id) {
              acc[row.spreadsheet_code as keyof SpreadsheetIds] =
                row.spreadsheet_id;
            }
            return acc;
          },
          {},
        );

        // --- Phase 2: Fetch Mappings from 'HEADERS_SNAPSHOT_PARENT' ---
        const schemaResponse =
          await (window as any).gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: spreadsheetIds.MASTER_SCHEMA,
            range: 'HEADERS_SNAPSHOT_PARENT!A2:AC', // Fetch a wide range
          });

        const rows = schemaResponse.result.values || [];
        const headerResponse =
          await (window as any).gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: spreadsheetIds.MASTER_SCHEMA,
            range: 'HEADERS_SNAPSHOT_PARENT!1:1',
          });
        const headers = headerResponse.result.values?.[0] || [];
        const headerMap: { [key: string]: number } = {};
        headers.forEach((h: string, i: number) => (headerMap[h.toLowerCase()] = i));

        const parsedSchema: MasterSchemaRow[] = rows
          .map((row: any[], index: number) => {
            const rowObject: { [key: string]: any } = {};
            for (const key in headerMap) {
              rowObject[key] = row[headerMap[key]];
            }
            if (rowObject.table_alias && rowObject.app_field) {
              return { ...rowObject, _rowIndex: index + 2 } as MasterSchemaRow;
            }
            return null;
          })
          .filter((r: MasterSchemaRow | null): r is MasterSchemaRow => r !== null);

        setMasterSchemaRows(parsedSchema);

        const baseMappings: SheetMappings = {};
        const baseDataTypes: SheetDataTypes = {};
        const baseRelations: SheetRelations = {};

        for (const row of parsedSchema) {
          const { table_alias, app_field, header, data_type, fk_ref } = row;
          if (!table_alias || !app_field) continue;
          if (!baseMappings[table_alias]) baseMappings[table_alias] = {};
          if (!baseDataTypes[table_alias]) baseDataTypes[table_alias] = {};
          if (!baseRelations[table_alias]) baseRelations[table_alias] = {};

          if (header) baseMappings[table_alias][app_field] = header;
          if (data_type) baseDataTypes[table_alias][app_field] = data_type;
          if (fk_ref) baseRelations[table_alias][app_field] = fk_ref;
        }

        // --- Phase 3: Set the grouped config for Health Check page from static config ---
        // The structure of the health check page must be defined by the app's static requirements,
        // not the current state of the mappings in the 'App' sheet. The static groupedSheetConfigs
        // from sheetConfig.ts is the single source of truth for the page's structure.
        setDynamicGroupedConfigs(config.groupedSheetConfigs);


        // Merge IDs: Local Storage > App Sheet > Initial
        setSpreadsheetIds((prev) => ({ ...initialIds, ...appSheetIds, ...prev }));

        // Merge Mappings: Master Schema > Local Storage
        setSheetMappings((prev) => deepMerge(baseMappings, prev));
        setSheetDataTypes((prev) => deepMerge(baseDataTypes, prev));
        setSheetRelations((prev) => deepMerge(baseRelations, prev));
        setIsConfigured(true);
      } catch (error) {
        console.error('Failed to fetch or parse master schema:', error);
        setIsConfigured(false);
      } finally {
        setIsConfigLoading(false);
      }
    };

    fetchMasterSchema();
  }, [spreadsheetIds.MASTER_SCHEMA, isSignedIn]);

  const saveSheetConfiguration = useCallback(
    async (config: {
      ids?: SpreadsheetIds;
      mappings?: SheetMappings;
      relations?: SheetRelations;
      dataTypes?: SheetDataTypes;
      sheetNameMappings?: Record<string, string>;
      aliasMappings?: Record<number, string>;
      sheetNameUpdates?: Record<number, string>;
    }) => {
      try {
        const newIds = { ...spreadsheetIds, ...config.ids };
        const newMappings = config.mappings ?? sheetMappings;
        const newRelations = config.relations ?? sheetRelations;
        const newDataTypes = config.dataTypes ?? sheetDataTypes;

        // --- WRITE-BACK TO GOOGLE SHEETS ---
        const writeData: { range: string; values: any[][] }[] = [];

        if (appSheetRows.length > 0 && spreadsheetIds.MASTER_SCHEMA) {
            const headerMap = await getHeaderMap(spreadsheetIds.MASTER_SCHEMA, 'App');
            
            // Handle Spreadsheet ID updates
            if (config.ids) {
              const idColIndex = headerMap['spreadsheet_id'];
              const codeColIndex = headerMap['spreadsheet_code'];
              const codeToSheetNameMap: Partial<Record<keyof SpreadsheetIds, string>> = {
                MASTER_SCHEMA: 'YD - App', YDS_MANAGEMENT: 'YDS - Management',
                YDS_APP: 'YD - App', YDC_BASE: 'YDC - Base',
                PARTNERS: 'Partners', STRATEGY: 'Strategy',
              };

              if (idColIndex !== undefined) {
                const idColLetter = String.fromCharCode(65 + idColIndex);
                for (const [code, newId] of Object.entries(config.ids)) {
                  if (spreadsheetIds[code as keyof SpreadsheetIds] !== newId) {
                    let rowToUpdate = appSheetRows.find(row => row.spreadsheet_code === code);
                    if (!rowToUpdate) {
                      const sheetNameMatch = codeToSheetNameMap[code as keyof SpreadsheetIds];
                      if (sheetNameMatch) {
                        rowToUpdate = appSheetRows.find(r => r.spreadsheet_name && r.spreadsheet_name.trim().toLowerCase() === sheetNameMatch.trim().toLowerCase());
                      }
                    }
                    if (rowToUpdate && rowToUpdate._rowIndex) {
                      writeData.push({ range: `App!${idColLetter}${rowToUpdate._rowIndex}`, values: [[newId]] });
                      if (codeColIndex !== undefined && !rowToUpdate.spreadsheet_code) {
                        const codeColLetter = String.fromCharCode(65 + codeColIndex);
                        writeData.push({ range: `App!${codeColLetter}${rowToUpdate._rowIndex}`, values: [[code]] });
                      }
                    }
                  }
                }
              }
            }
            
            // Handle Table Alias updates
            if (config.aliasMappings) {
               const aliasColIndex = headerMap['table_alias'];
               if (aliasColIndex !== undefined) {
                    const aliasColLetter = String.fromCharCode(65 + aliasColIndex);
                    for (const [rowIndexStr, alias] of Object.entries(config.aliasMappings)) {
                        const rowIndex = parseInt(rowIndexStr, 10);
                         writeData.push({
                            range: `App!${aliasColLetter}${rowIndex}`,
                            values: [[alias || null]]
                        });
                    }
               } else {
                   console.warn("Could not save alias mappings: 'table_alias' column not found in 'App' sheet.");
               }
            }

            // Handle Sheet Name updates
            if (config.sheetNameUpdates) {
                const sheetNameColIndex = headerMap['sheet_name'];
                if (sheetNameColIndex !== undefined) {
                    const sheetNameColLetter = String.fromCharCode(65 + sheetNameColIndex);
                    for (const [rowIndexStr, sheetName] of Object.entries(config.sheetNameUpdates)) {
                        const rowIndex = parseInt(rowIndexStr, 10);
                        writeData.push({
                            range: `App!${sheetNameColLetter}${rowIndex}`,
                            values: [[sheetName || null]]
                        });
                    }
                } else {
                    console.warn("Could not save sheet name updates: 'sheet_name' column not found in 'App' sheet.");
                }
            }
        }

        if (masterSchemaRows.length > 0 && spreadsheetIds.MASTER_SCHEMA) {
          const headerMap = await getHeaderMap(
            spreadsheetIds.MASTER_SCHEMA,
            'HEADERS_SNAPSHOT_PARENT',
          );

          const headerCol =
            headerMap['header'] !== undefined
              ? String.fromCharCode(65 + headerMap['header'])
              : null;
          const dataTypeCol =
            headerMap['data_type'] !== undefined
              ? String.fromCharCode(65 + headerMap['data_type'])
              : null;
          const fkRefCol =
            headerMap['fk_ref'] !== undefined
              ? String.fromCharCode(65 + headerMap['fk_ref'])
              : null;
          const sheetNameCol =
            headerMap['sheet_name'] !== undefined
              ? String.fromCharCode(65 + headerMap['sheet_name'])
              : null;

          if (sheetNameCol && config.sheetNameMappings) {
            masterSchemaRows.forEach((row) => {
              const { table_alias, _rowIndex, sheet_name } = row;
              if (!table_alias || !_rowIndex) return;

              const newSheetName = config.sheetNameMappings![table_alias];
              if (newSheetName && newSheetName !== sheet_name) {
                writeData.push({
                  range: `HEADERS_SNAPSHOT_PARENT!${sheetNameCol}${_rowIndex}`,
                  values: [[newSheetName]],
                });
              }
            });
          }

          masterSchemaRows.forEach((row) => {
            const { table_alias, app_field, _rowIndex } = row;
            if (!table_alias || !app_field || !_rowIndex) return;

            const newHeader =
              newMappings[table_alias]?.[app_field] || row.header;
            const newDataType =
              newDataTypes[table_alias]?.[app_field] || row.data_type;
            const newRelation =
              newRelations[table_alias]?.[app_field] || row.fk_ref || '';

            if (headerCol && newHeader !== row.header) {
              writeData.push({
                range: `HEADERS_SNAPSHOT_PARENT!${headerCol}${_rowIndex}`,
                values: [[newHeader]],
              });
            }
            if (dataTypeCol && newDataType !== row.data_type) {
              writeData.push({
                range: `HEADERS_SNAPSHOT_PARENT!${dataTypeCol}${_rowIndex}`,
                values: [[newDataType]],
              });
            }
            if (fkRefCol && newRelation !== (row.fk_ref || '')) {
              writeData.push({
                range: `HEADERS_SNAPSHOT_PARENT!${fkRefCol}${_rowIndex}`,
                values: [[newRelation]],
              });
            }
          });
        }

        if (writeData.length > 0) {
          await (window as any).gapi.client.sheets.spreadsheets.values.batchUpdate(
            {
              spreadsheetId: spreadsheetIds.MASTER_SCHEMA,
              resource: { valueInputOption: 'USER_ENTERED', data: writeData },
            },
          );
        }

        // --- UPDATE LOCAL STATE & LOCALSTORAGE ---
        const newLocalConfig = {
          ids: newIds,
          mappings: newMappings,
          relations: newRelations,
          dataTypes: newDataTypes,
        };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newLocalConfig));

        setSpreadsheetIds(newIds);
        setSheetMappings(newMappings);
        setSheetRelations(newRelations);
        setSheetDataTypes(newDataTypes);

        const allIdsPresent = !!(
          newIds.STRATEGY &&
          newIds.PARTNERS &&
          newIds.YDS_APP &&
          newIds.YDC_BASE &&
          newIds.YDS_MANAGEMENT
        );
        setIsConfigured(allIdsPresent);
      } catch (error) {
        console.error('Failed to save configuration:', error);
        alert(
          'Could not save settings. Your browser might be in private mode or has storage disabled. Check console for details.',
        );
        throw error;
      }
    },
    [
      spreadsheetIds,
      sheetMappings,
      sheetRelations,
      sheetDataTypes,
      masterSchemaRows,
      appSheetRows,
    ],
  );

  const value = {
    spreadsheetIds,
    sheetMappings,
    sheetRelations,
    sheetDataTypes,
    isConfigured,
    isConfigLoading,
    saveSheetConfiguration,
    masterSchemaRows,
    appSheetRows,
    dynamicGroupedConfigs,
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
    throw new Error(
      'useSpreadsheetConfig must be used within a SpreadsheetConfigProvider',
    );
  }
  return context;
};

// Helper for deep merging objects, used to combine master schema with local overrides
function deepMerge(target: any, source: any) {
  const output = { ...target };
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (!(key in target)) Object.assign(output, { [key]: source[key] });
        else output[key] = deepMerge(target[key], source[key]);
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
}

function isObject(item: any) {
  return item && typeof item === 'object' && !Array.isArray(item);
}
