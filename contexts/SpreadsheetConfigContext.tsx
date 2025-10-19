import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';

// FIX: Changed import from googleSheetService to sheetGateway
import { getHeaderMap } from '../services/sheetGateway';
import type { MasterSchemaRow } from '../types';

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
  }) => Promise<void>;
  masterSchemaRows: MasterSchemaRow[];
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
  const [masterSchemaRows, setMasterSchemaRows] = useState<MasterSchemaRow[]>(
    [],
  );

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
        const response =
          await (window as any).gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: spreadsheetIds.MASTER_SCHEMA,
            range: 'HEADERS_SNAPSHOT_PARENT!A2:AC', // Fetch a wide range
          });

        const rows = response.result.values || [];
        const headerResponse =
          await (window as any).gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: spreadsheetIds.MASTER_SCHEMA,
            range: 'HEADERS_SNAPSHOT_PARENT!1:1',
          });
        const headers = headerResponse.result.values?.[0] || [];
        const headerMap: { [key: string]: number } = {};
        headers.forEach((h: string, i: number) => (headerMap[h] = i));

        const parsedSchema: MasterSchemaRow[] = rows
          .map((row: any[], index: number) => {
            // Map row array to an object using the header map
            const rowObject: { [key: string]: any } = {};
            for (const key in headerMap) {
              rowObject[key] = row[headerMap[key]];
            }
            // Ensure required fields exist
            if (rowObject.table_alias && rowObject.app_field) {
              return {
                ...rowObject,
                _rowIndex: index + 2, // 1-based index, plus header row offset
              } as MasterSchemaRow;
            }
            return null;
          })
          .filter((r: MasterSchemaRow | null): r is MasterSchemaRow => r !== null);

        setMasterSchemaRows(parsedSchema);

        // Derive base configurations from master schema
        const baseMappings: SheetMappings = {};
        const baseDataTypes: SheetDataTypes = {};
        const baseRelations: SheetRelations = {};

        for (const row of parsedSchema) {
          const { table_alias, app_field, header, data_type, fk_reference } = row;
          if (!baseMappings[table_alias]) baseMappings[table_alias] = {};
          if (!baseDataTypes[table_alias]) baseDataTypes[table_alias] = {};
          if (!baseRelations[table_alias]) baseRelations[table_alias] = {};

          if (header) baseMappings[table_alias][app_field] = header;
          if (data_type) baseDataTypes[table_alias][app_field] = data_type;
          if (fk_reference) baseRelations[table_alias][app_field] = fk_reference;
        }

        // Merge with local storage values to preserve unsaved changes
        setSheetMappings((prev) => deepMerge(baseMappings, prev));
        setSheetDataTypes((prev) => deepMerge(baseDataTypes, prev));
        setSheetRelations((prev) => deepMerge(baseRelations, prev));
      } catch (error) {
        console.error('Failed to fetch or parse master schema:', error);
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
    }) => {
      try {
        const newIds = config.ids ?? spreadsheetIds;
        const newMappings = config.mappings ?? sheetMappings;
        const newRelations = config.relations ?? sheetRelations;
        const newDataTypes = config.dataTypes ?? sheetDataTypes;

        const newConfig = {
          ids: newIds,
          mappings: newMappings,
          relations: newRelations,
          dataTypes: newDataTypes,
        };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newConfig));

        if (config.ids) {
          setSpreadsheetIds(newIds);
          const allIdsPresent = !!(
            newIds.STRATEGY &&
            newIds.PARTNERS &&
            newIds.YDS_APP &&
            newIds.YDC_BASE &&
            newIds.YDS_MANAGEMENT
          );
          setIsConfigured(allIdsPresent);
        }
        if (config.mappings) setSheetMappings(newMappings);
        if (config.relations) setSheetRelations(newRelations);
        if (config.dataTypes) setSheetDataTypes(newDataTypes);

        // --- WRITE-BACK LOGIC ---
        if (
          (config.mappings || config.dataTypes || config.relations) &&
          masterSchemaRows.length > 0 &&
          spreadsheetIds.MASTER_SCHEMA
        ) {
          const headerMap = await getHeaderMap(
            spreadsheetIds.MASTER_SCHEMA,
            'HEADERS_SNAPSHOT_PARENT',
          );
          const headerCol =
            headerMap.header !== undefined
              ? String.fromCharCode(65 + headerMap.header)
              : null;
          const dataTypeCol =
            headerMap.data_type !== undefined
              ? String.fromCharCode(65 + headerMap.data_type)
              : null;
          const fkRefCol =
            headerMap.fk_reference !== undefined
              ? String.fromCharCode(65 + headerMap.fk_reference)
              : null;

          const data: { range: string; values: any[][] }[] = [];

          masterSchemaRows.forEach((row) => {
            const { table_alias, app_field, _rowIndex } = row;
            const newHeader = newMappings[table_alias]?.[app_field] || row.header;
            const newDataType =
              newDataTypes[table_alias]?.[app_field] || row.data_type;
            const newRelation =
              newRelations[table_alias]?.[app_field] || row.fk_reference || '';

            if (headerCol && newHeader !== row.header) {
              data.push({
                range: `HEADERS_SNAPSHOT_PARENT!${headerCol}${_rowIndex}`,
                values: [[newHeader]],
              });
            }
            if (dataTypeCol && newDataType !== row.data_type) {
              data.push({
                range: `HEADERS_SNAPSHOT_PARENT!${dataTypeCol}${_rowIndex}`,
                values: [[newDataType]],
              });
            }
            if (fkRefCol && newRelation !== (row.fk_reference || '')) {
              data.push({
                range: `HEADERS_SNAPSHOT_PARENT!${fkRefCol}${_rowIndex}`,
                values: [[newRelation]],
              });
            }
          });

          if (data.length > 0) {
            await (window as any).gapi.client.sheets.spreadsheets.values.batchUpdate(
              {
                spreadsheetId: spreadsheetIds.MASTER_SCHEMA,
                resource: {
                  valueInputOption: 'USER_ENTERED',
                  data,
                },
              },
            );
          }
        }
      } catch (error) {
        console.error(
          'Failed to save configuration to local storage or Google Sheets:',
          error,
        );
        alert(
          'Could not save settings. Your browser might be in private mode or has storage disabled.',
        );
      }
    },
    [
      spreadsheetIds,
      sheetMappings,
      sheetRelations,
      sheetDataTypes,
      masterSchemaRows,
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