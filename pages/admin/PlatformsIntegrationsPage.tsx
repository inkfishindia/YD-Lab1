import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { appStructure } from '../../config/appStructure';
import {
  // FIX: Updated import for CheckCircleIcon
  CheckCircleIcon,
  ChevronDownIcon,
  ExclamationTriangleIcon,
  EditIcon,
  TrashIcon,
  PlusIcon
} from '../../components/Icons';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import {
  SpreadsheetIds,
  useSpreadsheetConfig,
} from '../../contexts/SpreadsheetConfigContext';
import { AppSheetRow } from '../../types';
import AppSheetRowFormModal from '../../components/forms/AppSheetRowFormModal';
import { getHeaderMap } from '../../services/googleSheetService'; // Import getHeaderMap
import { allSheetConfigs } from '../../sheetConfig';

const PlatformsIntegrationsPage: React.FC = () => {
  const {
    spreadsheetIds,
    saveSheetConfiguration,
    isConfigLoading,
    appSheetRows,
    addAppSheetRow,
    updateAppSheetRow,
    deleteAppSheetRow,
  } = useSpreadsheetConfig();
  const navigate = useNavigate();

  // Component State
  const [localIds, setLocalIds] = useState<SpreadsheetIds>(spreadsheetIds);
  const [localAliasMappings, setLocalAliasMappings] = useState<
    Record<string, number | null>
  >({});
  const [isSaving, setIsSaving] = useState(false);
  const [appSheetRowModal, setAppSheetRowModal] = useState<{ isOpen: boolean, data: AppSheetRow | null }>({ isOpen: false, data: null });

  // Memoized initial state setup from context
  useEffect(() => {
    setLocalIds(spreadsheetIds);

    const aliasMap: Record<string, number | null> = {};
    Object.keys(appStructure).forEach((alias) => {
      const row = appSheetRows.find((r) => r.table_alias === alias);
      aliasMap[alias] = row?._rowIndex || null;
    });
    setLocalAliasMappings(aliasMap);

  }, [spreadsheetIds, appSheetRows]);

  const masterSpreadsheetDefinitions = useMemo(() => {
    const codes = Object.keys(spreadsheetIds) as Array<keyof SpreadsheetIds>;
    
    // Aggregate unique spreadsheet names from appSheetRows or allSheetConfigs
    const uniqueDefs = new Map<string, string>();
    appSheetRows.forEach(row => {
        if(row.spreadsheet_code && row.spreadsheet_name) {
            uniqueDefs