import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

const LOCAL_STORAGE_KEY = 'yd_labs_spreadsheet_config';

export interface SpreadsheetIds {
  STRATEGY: string;
  PARTNERS: string;
  YDS_APP: string;
  YDC_BASE: string;
  YDS_MANAGEMENT: string;
}

export type SheetMappings = Record<string, Record<string, string>>;
export type SheetRelations = Record<string, Record<string, string>>;
export type SheetDataTypes = Record<string, Record<string, 'string' | 'number' | 'boolean' | 'string_array'>>;


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
  }) => void;
}

const SpreadsheetConfigContext = createContext<ISpreadsheetConfigContext | undefined>(undefined);

const initialIds: SpreadsheetIds = {
  STRATEGY: '1iJ3SoeZiaeBbGm8KIwRYtEKwZQ88FPvQ17o2Xwo-AJc',
  PARTNERS: '1TEcuV4iL_xgf5CYKt7Q_uBt-6T7TejcAlAIKaunQxSs',
  YDS_APP: '1wvjgA8ESxxn_hl86XeL_gOecDjSYPgSo6qyzewP-oJw',
  YDC_BASE: '1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY',
  YDS_MANAGEMENT: '1y1rke6XG8SIs9O6bjOFhronEyzMhOsnsIDydTiop-wA',
};

export const SpreadsheetConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [spreadsheetIds, setSpreadsheetIds] = useState<SpreadsheetIds>(initialIds);
  const [sheetMappings, setSheetMappings] = useState<SheetMappings>({});
  const [sheetRelations, setSheetRelations] = useState<SheetRelations>({});
  const [sheetDataTypes, setSheetDataTypes] = useState<SheetDataTypes>({});
  const [isConfigured, setIsConfigured] = useState(false);
  const [isConfigLoading, setIsConfigLoading] = useState(true);

  useEffect(() => {
    try {
      const storedConfigJson = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedConfigJson) {
        const { ids, mappings, relations, dataTypes } = JSON.parse(storedConfigJson);
        if (ids) {
            // Merge stored IDs with initial IDs to ensure new fields are present
            const mergedIds = { ...initialIds, ...ids };
            setSpreadsheetIds(mergedIds);
            if (mergedIds.STRATEGY && mergedIds.PARTNERS && mergedIds.YDS_APP && mergedIds.YDC_BASE && mergedIds.YDS_MANAGEMENT) {
              setIsConfigured(true);
            }
        }
        if (mappings) setSheetMappings(mappings);
        if (relations) setSheetRelations(relations);
        if (dataTypes) setSheetDataTypes(dataTypes);
      }
    } catch (error) {
      console.error("Failed to load spreadsheet config from local storage:", error);
    } finally {
      setIsConfigLoading(false);
    }
  }, []);

  const saveSheetConfiguration = useCallback((config: { ids?: SpreadsheetIds; mappings?: SheetMappings; relations?: SheetRelations; dataTypes?: SheetDataTypes }) => {
    try {
        const newIds = config.ids ?? spreadsheetIds;
        const newMappings = config.mappings ?? sheetMappings;
        const newRelations = config.relations ?? sheetRelations;
        const newDataTypes = config.dataTypes ?? sheetDataTypes;
        
        const newConfig = { ids: newIds, mappings: newMappings, relations: newRelations, dataTypes: newDataTypes };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newConfig));
        
        if (config.ids) {
            setSpreadsheetIds(newIds);
            const allIdsPresent = !!(newIds.STRATEGY && newIds.PARTNERS && newIds.YDS_APP && newIds.YDC_BASE && newIds.YDS_MANAGEMENT);
            setIsConfigured(allIdsPresent);
        }
        if (config.mappings) setSheetMappings(newMappings);
        if (config.relations) setSheetRelations(newRelations);
        if (config.dataTypes) setSheetDataTypes(newDataTypes);

    } catch (error) {
        console.error("Failed to save configuration to local storage:", error);
        alert("Could not save settings. Your browser might be in private mode or has storage disabled.");
    }
  }, [spreadsheetIds, sheetMappings, sheetRelations, sheetDataTypes]);


  const value = {
    spreadsheetIds,
    sheetMappings,
    sheetRelations,
    sheetDataTypes,
    isConfigured,
    isConfigLoading,
    saveSheetConfiguration,
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
