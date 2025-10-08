
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

const LOCAL_STORAGE_KEY = 'yd_labs_spreadsheet_ids';

export interface SpreadsheetIds {
  EXECUTION: string;
  STRATEGY: string;
  PARTNERS: string;
  YDS_APP: string;
  MANIFEST: string;
}

interface ISpreadsheetConfigContext {
  spreadsheetIds: SpreadsheetIds;
  isConfigured: boolean;
  isConfigLoading: boolean;
  saveSpreadsheetIds: (ids: SpreadsheetIds) => void;
}

const SpreadsheetConfigContext = createContext<ISpreadsheetConfigContext | undefined>(undefined);

const initialIds: SpreadsheetIds = {
  EXECUTION: '',
  STRATEGY: '',
  PARTNERS: '',
  YDS_APP: '',
  MANIFEST: '',
};

export const SpreadsheetConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [spreadsheetIds, setSpreadsheetIds] = useState<SpreadsheetIds>(initialIds);
  const [isConfigured, setIsConfigured] = useState(false);
  const [isConfigLoading, setIsConfigLoading] = useState(true);

  useEffect(() => {
    try {
      const storedIdsJson = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedIdsJson) {
        const storedIds = JSON.parse(storedIdsJson);
        if (storedIds.EXECUTION && storedIds.STRATEGY && storedIds.PARTNERS && storedIds.YDS_APP && storedIds.MANIFEST) {
          setSpreadsheetIds(storedIds);
          setIsConfigured(true);
        }
      }
    } catch (error) {
      console.error("Failed to load spreadsheet IDs from local storage:", error);
    } finally {
      setIsConfigLoading(false);
    }
  }, []);

  const saveSpreadsheetIds = useCallback((ids: SpreadsheetIds) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(ids));
      setSpreadsheetIds(ids);
      // FIX: The result of chained `&&` on strings is a string, not a boolean.
      // Explicitly convert the truthy/falsy value to a boolean before setting the state.
      const allIdsPresent = !!(ids.EXECUTION && ids.STRATEGY && ids.PARTNERS && ids.YDS_APP && ids.MANIFEST);
      setIsConfigured(allIdsPresent);
    } catch (error) {
      console.error("Failed to save spreadsheet IDs to local storage:", error);
      alert("Could not save settings. Your browser might be in private mode or has storage disabled.");
    }
  }, []);

  const value = {
    spreadsheetIds,
    isConfigured,
    isConfigLoading,
    saveSpreadsheetIds,
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
