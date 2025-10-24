import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { z } from 'zod';

import { appStructure } from '../../config/appStructure';
import { predefinedRelations } from '../../sheetConfig'; // FIX: Updated import for predefinedRelations
import {
  // FIX: Updated import for CheckCircleIcon
  CheckCircleIcon,
  ChevronDownIcon,
  ExclamationTriangleIcon,
} from '../../components/Icons';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { useData } from '../../contexts/DataContext';
import {
  useSpreadsheetConfig
} from '../../contexts/SpreadsheetConfigContext';
import type { SheetConfig, SheetMappingInfo } from '../../services/googleSheetService';
import { getHeaderMap } from '../../services/googleSheetService';

const SheetHealthCheckPage: React.FC = () => {
  const {
    isConfigured, // FIX: Use isConfigured from useSpreadsheetConfig
    finalConfigs, // FIX: Use finalConfigs from useSpreadsheetConfig
  } = useSpreadsheetConfig();
  const dataContext = useData();
  const [mappingInfo, setMappingInfo] = useState<
    Record<string, SheetMappingInfo>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [relationStatus, setRelationStatus] = useState<
    Record<string, { status: 'ok' | 'error'; errors: string[] }>
  >({});

  const runChecks = useCallback(async () => {
    if (Object.keys(finalConfigs).length === 0) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const allResults: Record<string, SheetMappingInfo> = {};

    for (const configName in finalConfigs) {
        const config = finalConfigs[configName];
        const { spreadsheetId, range, columns, schema } = config;
        const sheetName = range.split('!')[0].replace(/'/g, '');

        // Generate field details directly from the config's columns
        const fieldDetails = Object.keys(columns).map(key => ({
            appField: key,
            defaultHeader: (columns as any)[key]?.header || key, // Use the configured header
            dataType: (columns as any)[key]?.type || 'string', // Use the configured type
        }));

        try {
            // Fetch original headers using googleSheetService.getHeaderMap
            const actualHeadersMap = await getHeaderMap(spreadsheetId, sheetName);
            const actualHeaders = Object.keys(actualHeadersMap).sort((a, b) => actualHeadersMap[a] - actualHeadersMap[b]);

            allResults[configName] = {
              configName,
              spreadsheetId,
              gid: config.gid,
              sheetName,
              fieldDetails,
              actualHeaders,
              allSheetNamesInSpreadsheet: [], 
              error: null,
            };

        } catch (err: any) {
            allResults[configName] = {
              configName,
              spreadsheetId,
              gid: config.gid,
              sheetName,
              fieldDetails,
              actualHeaders: [],
              allSheetNamesInSpreadsheet: [],
              error: err.message || `Failed to fetch headers for sheet: ${sheetName}`,
            };
        }
    }
    setMappingInfo(allResults);
    setIsLoading(false);
  }, [finalConfigs]);

  useEffect(() => {
    if (isConfigured) runChecks(); // FIX: Use isConfigured from SpreadsheetConfigContext
    else setIsLoading(false);
  }, [isConfigured, runChecks]);
  
  // Relation Check logic
  useEffect(() => {
    const runRelationChecks = async () => {
      // FIX: Use dataContext.loading and isConfigured from SpreadsheetConfigContext
      if (dataContext.loading || !isConfigured || Object.keys(dataContext.allData).length === 0) {
        setRelationStatus({});
        return;
      }

      const newRelationStatus: typeof relationStatus = {};
      let overallError = false;

      for (const relation of predefinedRelations) {
        const fromConfig = finalConfigs[relation.from];
        const toConfig = finalConfigs[relation.to];

        if (!fromConfig || !toConfig) {
          console.warn(`Skipping relation check for ${relation.from}.${relation.fromField} to ${relation.to}.${relation.toField}: one or both configs missing.`);
          continue;
        }

        const fromData = dataContext.allData[relation.from];
        const toData = dataContext.allData[relation.to];
        // FIX: Cast keyField to string to ensure it's a valid index type.
        const toKeyField = appStructure[relation.to].keyField as string; // Get key field from appStructure

        const errors: string[] = [];
        if (fromData && toData) {
          const validToIds = new Set(toData.map((item) => (item as any)[toKeyField] as string));

          fromData.forEach((fromItem, index) => {
            const fromFieldValue = (fromItem as any)[relation.fromField];
            if (fromFieldValue && !validToIds.has(fromFieldValue)) {
              errors.push(
                `Row ${index + 1} in ${relation.from} has invalid ${
                  relation.fromField
                }: ${fromFieldValue}`,
              );
            }
          });
        } else {
          errors.push(`Data not loaded for ${relation.from} or ${relation.to}`);
        }

        if (errors.length > 0) {
          overallError = true;
          newRelationStatus[`${relation.from}.${relation.fromField}-to-${relation.to}.${relation.toField}`] = {
            status: 'error',
            errors,
          };
        } else {
           newRelationStatus[`${relation.from}.${relation.fromField}-to-${relation.to}.${relation.toField}`] = {
            status: 'ok',
            errors: [],
          };
        }
      }
      newRelationStatus['overall'] = { status: overallError ? 'error' : 'ok', errors: [] };
      setRelationStatus(newRelationStatus);
    };

    runRelationChecks();
  }, [dataContext.loading, dataContext.allData, isConfigured, finalConfigs]); // FIX: Added finalConfigs to dependency array

  const toggleSection = (sectionName: string) =>
    setOpenSections((prev) => ({ ...prev, [sectionName]: !prev[sectionName] }));

  if (isLoading) return <div className="text-center p-8 animate-pulse">Running health checks...</div>;
  if (!isConfigured) return (
    <div className="flex items-center justify-center h-full">
      <Card className="max-w-xl text-center">
            <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-yellow-500" />
            <h2 className="mt-4 text-xl font-semibold text-white">
                Configuration Needed
            </h2>
            <p className="mt-2 text-gray-400">
                Please go to <Link to="/admin/integrations" className="text-blue-400 hover:underline">Platforms & Integrations</Link> to enter your spreadsheet IDs and set up sheet mappings.
            </p>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-white">Schema Health Check</h1>
          <p className="text-gray-400 mt-1">Verify that your Google Sheet columns are correctly mapped to the app's fields.</p>
        </div>
        <Button variant="secondary" onClick={runChecks}>Re-run Checks</Button>
      </div>

      {Object.keys(appStructure).sort().map((configName) => {
          const info = mappingInfo[configName];
          if (!info) return null; // Or show a loading/unmapped state

          const hasMappingError = info.fieldDetails.some(fd => !info.actualHeaders.includes(fd.defaultHeader));
          const hasError = !!info.error || hasMappingError;

          return (
            <Card key={configName} className="!p-0">
                <button
                    onClick={() => toggleSection(configName)}
                    className="w-full flex justify-between items-center px-6 py-4"
                >
                    <div className="flex items-center gap-3">
                        {hasError ? <ExclamationTriangleIcon className="w-6 h-6 text-yellow-400" /> : <CheckCircleIcon className="w-6 h-6 text-green-500" />}
                        <span className="font-semibold text-white">{info.configName}</span>
                    </div>
                    <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform ${openSections[configName] ? 'rotate-180' : ''}`} />
                </button>
                {openSections[configName] && (
                    <div className="px-6 pb-6 bg-gray-950/50 border-t border-gray-700">
                        {info.error && (
                            <div className="bg-red-900/20 border border-red-500/50 text-red-300 text-sm p-3 rounded-md mt-4">
                                <p className="font-medium">Error accessing sheet:</p>
                                <p className="mt-1 whitespace-pre-wrap">{info.error}</p>
                            </div>
                        )}
                        <h4 className="text-base font-semibold text-white mt-4 mb-3 pb-2 border-b border-gray-700">
                            Sheet Details: <span className="font-normal text-gray-300">{info.sheetName} (ID: {info.gid})</span>
                        </h4>
                        <div className="grid grid-cols-[1fr,1fr,1fr] gap-4">
                            <div className="text-sm text-gray-400">
                                <p className="font-semibold">App Field</p>
                                {info.fieldDetails.map(fd => <p key={fd.appField} className="text-gray-300">{fd.appField}</p>)}
                            </div>
                            <div className="text-sm text-gray-400">
                                <p className="font-semibold">Expected Header</p>
                                {info.fieldDetails.map(fd => {
                                    const isCorrectlyMapped = info.actualHeaders.includes(fd.defaultHeader);
                                    return (
                                        <p key={fd.appField} className={`font-mono ${isCorrectlyMapped ? 'text-green-400' : 'text-red-400'}`}>
                                            {fd.defaultHeader}
                                        </p>
                                    );
                                })}
                            </div>
                            <div className="text-sm text-gray-400">
                                <p className="font-semibold">Actual Header Status</p>
                                {info.fieldDetails.map(fd => {
                                    const isCorrectlyMapped = info.actualHeaders.includes(fd.defaultHeader);
                                    return (
                                        <p key={fd.appField} className={`font-mono ${isCorrectlyMapped ? 'text-green-400' : 'text-red-400'}`}>
                                            {isCorrectlyMapped ? '✅ Found' : '❌ Missing'}
                                        </p>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </Card>
          );
      })}
    </div>
  );
};

export default SheetHealthCheckPage;