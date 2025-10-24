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
import { allSheetConfigs } from '../../sheetConfig'; // FIX: Updated import for allSheetConfigs

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
    // Aggregate unique spreadsheet names from appSheetRows or allSheetConfigs
    const uniqueDefs = new Map<string, string>(); // Map from code (e.g., 'YDS_APP') to name (e.g., 'YDS Application Config')
    appSheetRows.forEach(row => {
        if(row.spreadsheet_code && row.spreadsheet_name) {
            uniqueDefs.set(row.spreadsheet_code, row.spreadsheet_name);
        }
    });

    // Add any hardcoded definitions that might not be in appSheetRows yet
    for (const key in spreadsheetIds) {
      const spreadsheetCode = key as keyof SpreadsheetIds;
      const spreadsheetId = spreadsheetIds[spreadsheetCode];
      if (spreadsheetId && !uniqueDefs.has(spreadsheetCode)) {
        // Try to get a more readable name from allSheetConfigs or a default
        let name = spreadsheetCode;
        switch (spreadsheetCode) {
            case 'YDS_APP': name = 'YDS Application Config'; break;
            case 'YDC_BASE': name = 'YDC Base Data'; break;
            case 'MASTER_SCHEMA': name = 'Master Schema & Config'; break;
            case 'STRATEGY': name = 'Strategy & BMC'; break;
            case 'PARTNERS': name = 'Partners & Ecosystem'; break;
            case 'YDS_MANAGEMENT': name = 'YDS Program Management'; break;
            default: name = spreadsheetCode.replace(/_/g, ' '); break; // Fallback to formatted code
        }
        uniqueDefs.set(spreadsheetCode, name);
      }
    }

    return Array.from(uniqueDefs.entries()).map(([code, name]) => ({ code, name }));
}, [spreadsheetIds, appSheetRows]);


  const TableHeader: React.FC<{ sortKey: keyof AppSheetRow, label: React.ReactNode }> = ({ sortKey, label }) => (
    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer">
        <div className="flex items-center">{label}</div>
    </th>
);

  const handleIdChange = (code: keyof SpreadsheetIds, value: string) => {
    setLocalIds((prev) => ({ ...prev, [code]: value }));
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      await saveSheetConfiguration({ ids: localIds });
      alert('Configuration saved successfully!');
    } catch (error: any) {
      console.error('Failed to save configuration:', error);
      alert(`Error saving configuration: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const openAppSheetRowModal = (row: AppSheetRow | null = null) => {
    setAppSheetRowModal({ isOpen: true, data: row });
  };

  const closeAppSheetRowModal = () => {
    setAppSheetRowModal({ isOpen: false, data: null });
  };

  const handleSaveAppSheetRow = async (rowData: AppSheetRow) => {
    if (rowData._rowIndex) {
      await updateAppSheetRow(rowData);
    } else {
      await addAppSheetRow(rowData);
    }
    closeAppSheetRowModal();
  };

  const handleDeleteAppSheetRow = async (rowIndex: number | undefined) => {
    if (rowIndex === undefined) {
      alert("Cannot delete row without a valid index.");
      return;
    }
    if (window.confirm("Are you sure you want to delete this sheet mapping? This cannot be undone.")) {
      await deleteAppSheetRow(rowIndex);
    }
  };

  if (isConfigLoading) {
    return (
      <div className="text-center p-8 text-white animate-pulse">
        Loading configuration...
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6">
      <h1 className="text-2xl font-semibold text-white">
        Platforms & Integrations
      </h1>
      <p className="text-gray-400 -mt-2">
        Manage the Google Sheet IDs and their mappings for the application.
      </p>

      <Card title="Core Spreadsheet IDs">
        <div className="space-y-4">
          {(Object.keys(spreadsheetIds) as Array<keyof SpreadsheetIds>).map(
            (code) => (
              <div key={code}>
                <label
                  htmlFor={code}
                  className="block text-sm font-medium text-gray-300"
                >
                  {code.replace(/_/g, ' ')} ID
                </label>
                <input
                  type="text"
                  id={code}
                  name={code}
                  value={localIds[code] || ''}
                  onChange={(e) => handleIdChange(code, e.target.value)}
                  className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white"
                  placeholder={`Enter Google Sheet ID for ${code.replace(
                    /_/g,
                    ' ',
                  )}`}
                />
              </div>
            ),
          )}
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={handleSaveAll} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Core IDs'}
          </Button>
        </div>
      </Card>

      <Card title="Application Sheet Mappings">
        <div className="flex justify-end mb-4">
            <Button onClick={() => openAppSheetRowModal()} className="flex items-center gap-2">
                <PlusIcon className="w-5 h-5" /> Add New Sheet Mapping
            </Button>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-800">
                    <tr>
                        <TableHeader sortKey="table_alias" label="Table Alias" />
                        <TableHeader sortKey="spreadsheet_code" label="Spreadsheet Code" />
                        <TableHeader sortKey="sheet_name" label="Sheet Name" />
                        <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                    {appSheetRows.map((row) => (
                        <tr key={row._rowIndex} className="hover:bg-gray-800">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{row.table_alias}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{row.spreadsheet_code}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{row.sheet_name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                <button onClick={() => openAppSheetRowModal(row)} className="text-blue-400 hover:text-blue-300"><EditIcon className="w-5 h-5"/></button>
                                <button onClick={() => handleDeleteAppSheetRow(row._rowIndex)} className="text-red-400 hover:text-red-300"><TrashIcon className="w-5 h-5"/></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </Card>
      
      <AppSheetRowFormModal 
        isOpen={appSheetRowModal.isOpen} 
        onClose={closeAppSheetRowModal} 
        onSave={handleSaveAppSheetRow} 
        initialData={appSheetRowModal.data} 
        spreadsheetDefs={masterSpreadsheetDefinitions}
      />
    </div>
  );
};

export default PlatformsIntegrationsPage;