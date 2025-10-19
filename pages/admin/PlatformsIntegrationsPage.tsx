import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useSpreadsheetConfig, SpreadsheetIds } from '../../contexts/SpreadsheetConfigContext';
import { useData } from '../../contexts/DataContext';
import { ExclamationTriangleIcon } from '../../components/Icons';
import { groupedSheetConfigs } from '../../sheetConfig';

const PlatformsIntegrationsPage: React.FC = () => {
    const { appSheetRows, spreadsheetIds, saveSheetConfiguration, isConfigLoading } = useSpreadsheetConfig();
    const { refreshData } = useData();
    const navigate = useNavigate();

    const [localIds, setLocalIds] = useState<SpreadsheetIds>(spreadsheetIds);
    const [aliasToRowIndexMap, setAliasToRowIndexMap] = useState<Record<string, number | null>>({});
    const [isSaving, setIsSaving] = useState(false);

    const appTableAliases = useMemo(() => {
        const aliases = new Set<string>();
        Object.values(groupedSheetConfigs).forEach(group => {
            Object.keys(group.configs).forEach(alias => aliases.add(alias));
        });
        return Array.from(aliases).sort();
    }, []);

    const masterSpreadsheetDefinitions = useMemo(() => {
        const codes = Object.keys(spreadsheetIds) as Array<keyof SpreadsheetIds>;
        const codeToNameMap = new Map<string, string>();
        appSheetRows.forEach(row => {
            if (row.spreadsheet_code && row.spreadsheet_name && !codeToNameMap.has(row.spreadsheet_code)) {
                codeToNameMap.set(row.spreadsheet_code, row.spreadsheet_name);
            }
        });

        return codes
          .filter(code => code !== 'MASTER_SCHEMA')
          .map(code => ({
            code: code,
            name: codeToNameMap.get(code) || code.replace(/_/g, ' ').replace('YDS', 'YDS').replace('YDC', 'YDC'),
        }));
    }, [spreadsheetIds, appSheetRows]);

    const groupedSheetOptions = useMemo(() => {
        const grouped: Record<string, { _rowIndex: number; sheet_name: string }[]> = {};
        const spreadsheetCodeToNameMap = new Map<string, string>();
        appSheetRows.forEach(row => {
            if (row.spreadsheet_code && row.spreadsheet_name) {
                spreadsheetCodeToNameMap.set(row.spreadsheet_code, row.spreadsheet_name);
            }
        });

        appSheetRows.forEach(row => {
            const groupName = spreadsheetCodeToNameMap.get(row.spreadsheet_code || '') || row.spreadsheet_name || 'Unknown Spreadsheet';
            if (row._rowIndex && row.sheet_name) {
                if (!grouped[groupName]) {
                    grouped[groupName] = [];
                }
                grouped[groupName].push({ _rowIndex: row._rowIndex, sheet_name: row.sheet_name });
            }
        });
        return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
    }, [appSheetRows]);

    useEffect(() => {
        setLocalIds(spreadsheetIds);
        const initialMap: Record<string, number | null> = {};
        appTableAliases.forEach(alias => initialMap[alias] = null);

        appSheetRows.forEach(row => {
            if (row.table_alias && row._rowIndex && appTableAliases.includes(row.table_alias)) {
                initialMap[row.table_alias] = row._rowIndex;
            }
        });
        setAliasToRowIndexMap(initialMap);
    }, [spreadsheetIds, appSheetRows, appTableAliases]);

    const handleIdChange = (code: keyof SpreadsheetIds, id: string) => {
        setLocalIds(prev => ({ ...prev, [code]: id }));
    };

    const handleSelectChange = (alias: string, selectedRowIndexStr: string) => {
        const selectedRowIndex = selectedRowIndexStr ? parseInt(selectedRowIndexStr, 10) : null;
        setAliasToRowIndexMap(prev => {
            const newMap = { ...prev };
            if (selectedRowIndex !== null) {
                for (const key in newMap) {
                    if (newMap[key] === selectedRowIndex && key !== alias) {
                        newMap[key] = null;
                    }
                }
            }
            newMap[alias] = selectedRowIndex;
            return newMap;
        });
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const aliasPayload: Record<number, string> = {};
            const rowIndexToAliasMap: Record<number, string> = {};
            for (const [alias, rowIndex] of Object.entries(aliasToRowIndexMap)) {
                if (rowIndex !== null) {
                    rowIndexToAliasMap[rowIndex] = alias;
                }
            }
            appSheetRows.forEach(row => {
                if (row._rowIndex && row.sheet_name) { // Only consider rows that are actual sheets
                    const newAlias = rowIndexToAliasMap[row._rowIndex] || '';
                    if (newAlias !== (row.table_alias || '')) {
                        aliasPayload[row._rowIndex] = newAlias;
                    }
                }
            });

            await saveSheetConfiguration({ ids: localIds, aliasMappings: aliasPayload });
            
            // Wait a moment for sheets to process, then refresh data
            await new Promise(resolve => setTimeout(resolve, 1500));
            await refreshData();
            alert('Configuration saved successfully and data has been refreshed!');
        } catch (error) {
            console.error("Failed to save configuration:", error);
            alert("An error occurred while saving. Please check the console for details.");
        } finally {
            setIsSaving(false);
        }
    };
    
    const unmappedRows = useMemo(() => {
        const mappedRowIndexes = new Set(Object.values(aliasToRowIndexMap).filter(v => v !== null));
        return appSheetRows.filter(row => row._rowIndex && row.sheet_name && !row.table_alias && !mappedRowIndexes.has(row._rowIndex));
    }, [appSheetRows, aliasToRowIndexMap]);

    if (isConfigLoading) {
      return <div className="text-center p-8 text-gray-400 animate-pulse">Loading master configuration...</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold text-white">Platforms & Integrations</h1>
                    <p className="text-gray-400 text-sm mt-1">
                        Manage your master spreadsheet connections and map them to application data tables.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                     <Button variant="secondary" onClick={() => navigate('/admin/health-check')}>Go to Schema Health Check</Button>
                      <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save & Refresh All'}
                    </Button>
                </div>
            </div>

            <Card className="!p-0">
                 <div className="px-6 py-4 border-b border-gray-800">
                    <h2 className="text-lg font-semibold text-white">Layer 1: Spreadsheet Connections</h2>
                    <p className="text-sm text-gray-400 mt-1">Enter the Google Spreadsheet ID for each master sheet.</p>
                </div>
                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-3 gap-4 items-center px-1 pb-2 border-b border-gray-700">
                        <h3 className="text-sm font-medium text-gray-400">Spreadsheet Name</h3>
                        <h3 className="text-sm font-medium text-gray-400">Spreadsheet Code</h3>
                        <h3 className="text-sm font-medium text-gray-400">Spreadsheet ID</h3>
                    </div>
                    {masterSpreadsheetDefinitions.map(({ code, name }) => {
                        return (
                            <div key={code} className="grid grid-cols-3 gap-4 items-center">
                                <label htmlFor={code} className="text-gray-300 font-medium">{name}</label>
                                <span className="font-mono text-sm bg-gray-800 px-2 py-1 rounded text-gray-400">{code}</span>
                                <input 
                                    id={code}
                                    type="text" 
                                    value={localIds[code] || ''}
                                    onChange={e => handleIdChange(code, e.target.value)}
                                    placeholder="Enter Spreadsheet ID"
                                    className="block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-blue-500 focus:border-blue-500"
                                    disabled={isSaving}
                                />
                            </div>
                        );
                    })}
                </div>
            </Card>

            <Card className="!p-0">
                <div className="px-6 py-4 border-b border-gray-800">
                    <h2 className="text-lg font-semibold text-white">Layer 2: Table & Sheet Mapping</h2>
                    <p className="text-sm text-gray-400 mt-1">Map each Application Table to a specific Google Sheet tab from your connected spreadsheets.</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-800/50">
                            <tr>
                                <th className="px-6 py-4 text-left font-medium text-gray-300 w-1/2">Application Table Alias</th>
                                <th className="px-6 py-4 text-left font-medium text-gray-300 w-1/2">Mapped Google Sheet</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(groupedSheetConfigs).sort(([a], [b]) => a.localeCompare(b)).map(([groupName, groupData]) => (
                                <React.Fragment key={groupName}>
                                    <tr className="bg-gray-800/30">
                                        <td colSpan={2} className="px-4 py-2 text-sm font-semibold text-gray-300 sticky left-0">
                                            {groupName}
                                        </td>
                                    </tr>
                                    {Object.keys(groupData.configs).sort().map(alias => (
                                        <tr key={alias} className="border-t border-gray-800">
                                            <td className="pl-8 pr-6 py-4 font-mono text-white">{alias}</td>
                                            <td className="px-6 py-4">
                                                <select 
                                                    value={aliasToRowIndexMap[alias] || ''}
                                                    onChange={e => handleSelectChange(alias, e.target.value)}
                                                    className="block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-blue-500 focus:border-blue-500"
                                                    disabled={isSaving}
                                                >
                                                    <option value="">-- Not Mapped --</option>
                                                    {groupedSheetOptions.map(([optGroupName, options]) => (
                                                        <optgroup key={optGroupName} label={optGroupName}>
                                                            {options.map(opt => (
                                                                <option key={opt._rowIndex} value={opt._rowIndex}>{opt.sheet_name}</option>
                                                            ))}
                                                        </optgroup>
                                                    ))}
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {unmappedRows.length > 0 && (
                <Card className="!p-0 border-yellow-500/50">
                     <div className="px-6 py-4 border-b border-gray-800 flex items-center gap-3">
                        <ExclamationTriangleIcon className="w-6 h-6 text-yellow-400" />
                        <h2 className="text-lg font-semibold text-white">Unmapped Sheets</h2>
                    </div>
                    <div className="p-6 text-sm text-gray-400">
                        <p className="mb-4">The following sheets were found in your 'App' configuration but are not currently mapped to any Application Table. You can map them above if needed.</p>
                        <ul className="space-y-2 list-disc list-inside">
                        {unmappedRows.map(row => (
                            <li key={row._rowIndex}>
                                <span className="font-semibold text-gray-300">{row.spreadsheet_name} / {row.sheet_name}</span>
                            </li>
                        ))}
                        </ul>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default PlatformsIntegrationsPage;