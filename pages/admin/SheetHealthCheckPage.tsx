import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSpreadsheetConfig, SpreadsheetIds } from '../../contexts/SpreadsheetConfigContext';
import type { SheetMappings, SheetRelations, SheetDataTypes } from '../../contexts/SpreadsheetConfigContext';
import { groupedSheetConfigs, allSheetConfigs, SheetConfig } from '../../sheetConfig';
import type { SheetMappingInfo } from '../../services/googleSheetService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, ChevronDownIcon } from '../../components/Icons';
import { useData } from '../../contexts/DataContext';

type MappingStatus = 'OK' | 'Unmapped';
const DATA_TYPE_OPTIONS: Array<'string' | 'number' | 'boolean' | 'string_array'> = ['string', 'number', 'boolean', 'string_array'];

const predefinedRelations: Record<string, Record<string, string>> = {
    'Projects': {
        owner_user_id: 'People',
        business_unit_id: 'Business Units',
    },
    'Tasks': {
        project_id: 'Projects',
        assignee_user_id: 'People',
    },
    'Business Units': {
        owner_user_id: 'People',
        primary_flywheel_id: 'Flywheels',
        upsell_flywheel_id: 'Flywheels',
    },
    'Hubs': {
        owner_user_id: 'People',
    },
    'Interfaces': {
        channel_id: 'Channels',
        flywheel_id: 'Flywheels',
        interface_owner: 'People',
    },
    'Leads': {
        sdr_owner_fk: 'People',
    },
    'Opportunities': {
        account_id: 'Accounts',
        owner_user_id: 'People',
    },
    'Accounts': {
        owner_user_id: 'People',
    },
    'Customer Segments': {
        flywheel_id: 'Flywheels',
    }
};

const SheetHealthCheckPage: React.FC = () => {
    const { spreadsheetIds, sheetMappings, sheetRelations, sheetDataTypes, saveSheetConfiguration, isConfigured } = useSpreadsheetConfig();
    const dataContext = useData();
    const [mappingInfo, setMappingInfo] = useState<Record<string, SheetMappingInfo>>({});
    const [localMappings, setLocalMappings] = useState<SheetMappings>(sheetMappings);
    const [localRelations, setLocalRelations] = useState<SheetRelations>(sheetRelations);
    const [localDataTypes, setLocalDataTypes] = useState<SheetDataTypes>(sheetDataTypes);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaved, setIsSaved] = useState(false);
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
    const [relationStatus, setRelationStatus] = useState<Record<string, { status: 'ok' | 'error', errors: string[] }>>({});
    const premappingDone = useRef(false);
    const relationsPremapped = useRef(false);
    
    const runChecks = useCallback(async () => {
        setIsLoading(true);
        setMappingInfo({});
        
        const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

        const configsBySpreadsheet: Record<string, { name: string, configFn: (ids: SpreadsheetIds) => SheetConfig<any> }[]> = {};
        for (const group of Object.values(groupedSheetConfigs)) {
            const spreadsheetId = spreadsheetIds[group.spreadsheetIdKey];
            if (!spreadsheetId) continue;
            if (!configsBySpreadsheet[spreadsheetId]) configsBySpreadsheet[spreadsheetId] = [];
            for (const [name, configFn] of Object.entries(group.configs)) {
                configsBySpreadsheet[spreadsheetId].push({ name, configFn });
            }
        }

        for (const spreadsheetId of Object.keys(configsBySpreadsheet)) {
            const currentBatchResults: Record<string, SheetMappingInfo> = {};
            const configsForThisSS = configsBySpreadsheet[spreadsheetId];
            
            try {
                const spreadsheetResponse = await (window as any).gapi.client.sheets.spreadsheets.get({ spreadsheetId });
                const spreadsheet = spreadsheetResponse.result;
                const sheetPropertiesMap = new Map(spreadsheet.sheets.map((s: any) => [s.properties.title, s.properties]));

                const sheetNames = configsForThisSS.map(({ configFn }) => configFn(spreadsheetIds).range.split('!')[0]);
                const headerRanges = sheetNames.map(name => `${name}!1:1`);
                
                const headersResponse = await (window as any).gapi.client.sheets.spreadsheets.values.batchGet({ spreadsheetId, ranges: headerRanges });
                const headerValueRanges = headersResponse.result.valueRanges || [];
                
                // FIX: Refactor headersMap creation to be more explicit and imperative to avoid potential type inference issues.
                const headersMap = new Map<string, string[]>();
                headerValueRanges.forEach((vr: any, index: number) => {
                    const headers = vr?.values?.[0];
                    const sheetName = sheetNames[index];
                    if (Array.isArray(headers)) {
                        headersMap.set(sheetName, headers.map(h => String(h ?? '')));
                    } else if (sheetName) {
                        headersMap.set(sheetName, []);
                    }
                });
                
                for (const { name: configName, configFn } of configsForThisSS) {
                    const config = configFn(spreadsheetIds);
                    const { gid, range, columns } = config;
                    const sheetName = range.split('!')[0];
                    const fieldDetails = Object.entries(columns).map(([key, value]: [string, any]) => ({ appField: key, defaultHeader: value.header, dataType: value.type || 'string' }));

                    if (!sheetPropertiesMap.has(sheetName)) {
                        currentBatchResults[configName] = { configName, spreadsheetId, gid, sheetName, fieldDetails, actualHeaders: [], error: `Sheet named "${sheetName}" was not found.` };
                    } else {
                        const actualHeaders = headersMap.get(sheetName) || [];
                        currentBatchResults[configName] = { configName, spreadsheetId, gid, sheetName, fieldDetails, actualHeaders, error: null };
                    }
                }
            } catch (err: any) {
                const message = err.result?.error?.message || err.message || 'An unknown error occurred.';
                for (const { name: configName, configFn } of configsForThisSS) {
                    const config = configFn(spreadsheetIds);
                    const { gid, range, columns } = config;
                    const sheetName = range.split('!')[0];
                    const fieldDetails = Object.entries(columns).map(([key, value]: [string, any]) => ({ appField: key, defaultHeader: value.header, dataType: value.type || 'string' }));
                    currentBatchResults[configName] = { configName, spreadsheetId, gid, sheetName, fieldDetails, actualHeaders: [], error: `Failed to access spreadsheet: ${message}` };
                }
            }
            
            setMappingInfo(prev => ({...prev, ...currentBatchResults}));
            await delay(1500); 
        }
        
        setIsLoading(false);
    }, [spreadsheetIds]);

    useEffect(() => {
      setLocalMappings(sheetMappings);
      setLocalRelations(sheetRelations);
      setLocalDataTypes(sheetDataTypes);
    }, [sheetMappings, sheetRelations, sheetDataTypes]);
    
    useEffect(() => {
        if (isConfigured) runChecks();
        else {
            setIsLoading(false);
            setMappingInfo({});
        }
    }, [isConfigured, runChecks]);

    useEffect(() => {
        if (dataContext.loading || Object.keys(localRelations).length === 0) return;

        const newStatus: Record<string, { status: 'ok' | 'error', errors: string[] }> = {};
        
        for (const [configName, relations] of Object.entries(localRelations)) {
            newStatus[configName] = { status: 'ok', errors: [] };

            for (const [field, targetConfigName] of Object.entries(relations)) {
                const sourceData = dataContext.allData[configName];
                const targetData = dataContext.allData[targetConfigName];

                if (!sourceData || !targetData) {
                    newStatus[configName].status = 'error';
                    newStatus[configName].errors.push(`Data for '${configName}' or '${targetConfigName}' not found.`);
                    continue;
                }
                
                const targetConfigFn = allSheetConfigs[targetConfigName];
                if (!targetConfigFn) continue;
                
                const targetConfig = targetConfigFn(spreadsheetIds);
                const targetKeyField = targetConfig.keyField as string;
                const sourceConfig = allSheetConfigs[configName](spreadsheetIds);
                const sourceKeyField = sourceConfig.keyField as string;
                
                const targetIds = new Set(targetData.map(item => item[targetKeyField]));

                for (const sourceItem of sourceData) {
                    const foreignKeyValue = sourceItem[field];
                    const checkFk = (fk: any) => {
                        if (fk && !targetIds.has(fk)) {
                            newStatus[configName].status = 'error';
                            newStatus[configName].errors.push(`Invalid ID '${fk}' in '${configName}' (item: ${sourceItem[sourceKeyField]}) for field '${field}' (target: '${targetConfigName}').`);
                        }
                    };
                    
                    if (Array.isArray(foreignKeyValue)) foreignKeyValue.forEach(checkFk);
                    else checkFk(foreignKeyValue);
                }
            }
        }
        setRelationStatus(newStatus);
    }, [dataContext.loading, dataContext.allData, localRelations, spreadsheetIds]);

    const handleSave = () => {
        saveSheetConfiguration({ mappings: localMappings, relations: localRelations, dataTypes: localDataTypes });
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
    };

    const toggleSection = (sectionName: string) => setOpenSections(prev => ({ ...prev, [sectionName]: !prev[sectionName] }));

    const handleMappingChange = (configName: string, appField: string, newHeader: string) => {
        setLocalMappings(prev => {
            const newConf = { ...(prev[configName] || {}) };
            if (newHeader) {
                newConf[appField] = newHeader;
            } else {
                delete newConf[appField];
            }
            return { ...prev, [configName]: newConf };
        });
    };
    
    const handleDataTypeChange = (configName: string, appField: string, newType: string) => {
        setLocalDataTypes(prev => {
            const newConf = { ...(prev[configName] || {}) };
            if (newType) {
                newConf[appField] = newType as any;
            } else {
                delete newConf[appField];
            }
            return { ...prev, [configName]: newConf };
        });
    };

    if (isLoading) return <div className="text-center p-8 animate-pulse">Loading health checks...</div>;
    if (!isConfigured) return <div className="text-center p-8 text-yellow-400">Please configure your spreadsheet IDs in Admin &gt; Integrations first.</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-white">Sheet Health Check & Mapping</h1>
                <div className="flex items-center gap-4">
                    <Button onClick={handleSave}>Save Mappings</Button>
                    {isSaved && <span className="text-green-400">Configuration saved!</span>}
                </div>
            </div>

            {Object.entries(groupedSheetConfigs).map(([groupName, group]) => {
                const spreadsheetId = spreadsheetIds[group.spreadsheetIdKey];
                const hasErrorInGroup = Object.keys(group.configs).some(configName => mappingInfo[configName]?.error);
                
                return (
                    <Card key={groupName} className="!p-0">
                        <button onClick={() => toggleSection(groupName)} className="w-full flex justify-between items-center px-6 py-4">
                            <div className="flex items-center gap-3">
                                {hasErrorInGroup ? <ExclamationTriangleIcon className="w-6 h-6 text-yellow-400" /> : <CheckCircleIcon className="w-6 h-6 text-green-400" />}
                                <h2 className="text-lg font-semibold text-white">{groupName}</h2>
                            </div>
                            <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform ${openSections[groupName] ? 'rotate-180' : ''}`} />
                        </button>
                        {openSections[groupName] && (
                            <div className="px-6 pb-6 space-y-4 border-t border-gray-800 pt-4">
                                <p className="text-sm text-gray-500">Spreadsheet ID: <code className="bg-gray-800 text-gray-300 px-1 rounded">{spreadsheetId}</code></p>
                                {Object.keys(group.configs).map(configName => {
                                    const info = mappingInfo[configName];
                                    if (!info) return null;

                                    const overallStatus: 'OK' | 'Error' | 'Unmapped' = info.error ? 'Error' : 
                                        info.fieldDetails.some(fd => {
                                            const customMapping = localMappings[configName]?.[fd.appField];
                                            const headerToFind = customMapping || fd.defaultHeader;
                                            return !info.actualHeaders.includes(headerToFind);
                                        }) ? 'Unmapped' : 'OK';

                                    return (
                                        <div key={configName} className="p-4 bg-gray-950/50 border border-gray-700 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                {overallStatus === 'OK' && <CheckCircleIcon className="w-5 h-5 text-green-400" />}
                                                {overallStatus === 'Unmapped' && <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />}
                                                {overallStatus === 'Error' && <XCircleIcon className="w-5 h-5 text-red-400" />}
                                                <h3 className="font-semibold text-white">{configName} <span className="text-gray-400 font-normal">({info.sheetName})</span></h3>
                                            </div>
                                            {info.error ? (
                                                <p className="mt-2 text-sm text-red-400">{info.error}</p>
                                            ) : (
                                                <table className="mt-4 w-full text-sm text-left table-fixed">
                                                    <thead><tr className="text-xs text-gray-500 uppercase"><th className="pb-2 w-1/4">App Field</th><th className="pb-2 w-1/4">Default Header</th><th className="pb-2 w-1/3">Sheet Header Mapping</th><th className="pb-2 w-1/6">Data Type</th><th className="pb-2 text-center">Status</th></tr></thead>
                                                    <tbody>
                                                        {info.fieldDetails.map(field => {
                                                             const customMapping = localMappings[configName]?.[field.appField];
                                                             const headerToUse = customMapping || field.defaultHeader;
                                                             const mappingStatus: MappingStatus = info.actualHeaders.includes(headerToUse) ? 'OK' : 'Unmapped';
                                                             const currentDataType = localDataTypes[configName]?.[field.appField] || field.dataType;
                                                            return (
                                                                <tr key={field.appField} className="border-t border-gray-800">
                                                                    <td className="py-2 pr-4"><span className="font-mono text-gray-300">{field.appField}</span></td>
                                                                    <td className="py-2 pr-4"><span className="text-gray-500">{field.defaultHeader}</span></td>
                                                                    <td className="py-2 pr-4">
                                                                        <select value={customMapping || ''} onChange={(e) => handleMappingChange(configName, field.appField, e.target.value)} className={`w-full bg-gray-800 border rounded-md text-white text-xs py-1 px-2 ${mappingStatus === 'Unmapped' ? 'border-red-500' : 'border-gray-700'}`}>
                                                                            <option value="">-- Use Default --</option>
                                                                            {info.actualHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                                                                        </select>
                                                                    </td>
                                                                    <td className="py-2 pr-4">
                                                                        <select value={currentDataType} onChange={(e) => handleDataTypeChange(configName, field.appField, e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-md text-white text-xs py-1 px-2">
                                                                            {DATA_TYPE_OPTIONS.map(dt => <option key={dt} value={dt}>{dt}</option>)}
                                                                        </select>
                                                                    </td>
                                                                    {/* FIX: Replaced `title` prop on SVG components with a `span` wrapper to provide a tooltip, resolving TS error. */}
                                                                    <td className="py-2 pl-4 text-center">
                                                                        {mappingStatus === 'OK' ? <span title="Mapped"><CheckCircleIcon className="w-5 h-5 text-green-500 mx-auto" /></span> : <span title="Not mapped"><ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 mx-auto" /></span>}
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </Card>
                );
            })}
        </div>
    );
};

export default SheetHealthCheckPage;
