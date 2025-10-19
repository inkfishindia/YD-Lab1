import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

import { allSheetConfigs, predefinedRelations } from '../../sheetConfig';
import {
  CheckCircleIcon,
  ChevronDownIcon,
  ExclamationTriangleIcon,
} from '../../components/Icons';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { useData } from '../../contexts/DataContext';
import {
  useSpreadsheetConfig,
  SpreadsheetIds,
} from '../../contexts/SpreadsheetConfigContext';
import type {
  SheetDataTypes,
  SheetMappings,
  SheetRelations,
} from '../../contexts/SpreadsheetConfigContext';
import type { SheetConfig, SheetMappingInfo } from '../../services/sheetGateway';

type MappingStatus = 'OK' | 'Unmapped';

const SheetHealthCheckPage: React.FC = () => {
  const {
    spreadsheetIds,
    sheetMappings,
    sheetRelations,
    sheetDataTypes,
    saveSheetConfiguration,
    isConfigured,
    dynamicGroupedConfigs,
    appSheetRows,
  } = useSpreadsheetConfig();
  const dataContext = useData();
  const [mappingInfo, setMappingInfo] = useState<
    Record<string, SheetMappingInfo>
  >({});
  const [localMappings, setLocalMappings] =
    useState<SheetMappings>(sheetMappings);
  const [localRelations, setLocalRelations] =
    useState<SheetRelations>(sheetRelations);
  const [localDataTypes, setLocalDataTypes] =
    useState<SheetDataTypes>(sheetDataTypes);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [relationStatus, setRelationStatus] = useState<
    Record<string, { status: 'ok' | 'error'; errors: string[] }>
  >({});

  const runChecks = useCallback(async () => {
    const groupedConfigs = dynamicGroupedConfigs;
    if (Object.keys(groupedConfigs).length === 0) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setMappingInfo({});

    const configsBySpreadsheet: Record<
      string,
      { name: string; configFn: (ids: SpreadsheetIds) => SheetConfig<any> }[]
    > = {};
    for (const group of Object.values(groupedConfigs)) {
      const spreadsheetId = spreadsheetIds[group.spreadsheetIdKey];
      if (!spreadsheetId) continue;
      if (!configsBySpreadsheet[spreadsheetId])
        configsBySpreadsheet[spreadsheetId] = [];
      for (const [name, configFn] of Object.entries(group.configs)) {
        configsBySpreadsheet[spreadsheetId].push({ name, configFn });
      }
    }

    const allResults: Record<string, SheetMappingInfo> = {};

    for (const spreadsheetId of Object.keys(configsBySpreadsheet)) {
      const configsForThisSS = configsBySpreadsheet[spreadsheetId];

      try {
        const spreadsheetResponse =
          await (window as any).gapi.client.sheets.spreadsheets.get({
            spreadsheetId,
          });
        const spreadsheet = spreadsheetResponse.result;
        const allSheetNamesInSpreadsheet = spreadsheet.sheets.map(
          (s: any) => s.properties.title,
        );

        const sheetNamesToFetch = [
          ...new Set(
            configsForThisSS
              .map(({ name }) => {
                const appRow = appSheetRows.find(
                  (row) => row.table_alias === name,
                );
                return appRow?.sheet_name;
              })
              .filter(Boolean),
          ),
        ];

        const headerRanges = sheetNamesToFetch.map(
          (name) => `${name.includes(' ') ? `'${name}'` : name}!1:1`,
        );
        const headersMap = new Map<string, string[]>();

        if (headerRanges.length > 0) {
          const headersResponse =
            await (window as any).gapi.client.sheets.spreadsheets.values.batchGet(
              { spreadsheetId, ranges: headerRanges },
            );
          const headerValueRanges = headersResponse.result.valueRanges || [];
          headerValueRanges.forEach((vr: any) => {
            const sheetName = vr.range.split('!')[0].replace(/'/g, '');
            headersMap.set(sheetName, vr.values?.[0] || []);
          });
        }

        for (const { name: configName, configFn } of configsForThisSS) {
          const config = configFn(spreadsheetIds);
          const { gid, columns } = config;
          const appRow = appSheetRows.find(
            (row) => row.table_alias === configName,
          );
          const sheetName = appRow?.sheet_name || '[Not Mapped]';

          const fieldDetails = Object.entries(columns).map(
            ([key, value]: [string, any]) => ({
              appField: key,
              defaultHeader: value.header,
              dataType: value.type || 'string',
            }),
          );

          if (!appRow || !appRow.sheet_name) {
            allResults[configName] = {
              configName,
              spreadsheetId,
              gid,
              sheetName,
              fieldDetails,
              actualHeaders: [],
              allSheetNamesInSpreadsheet,
              error: `This table alias is not mapped to any sheet.`,
            };
          } else if (!allSheetNamesInSpreadsheet.includes(sheetName)) {
            allResults[configName] = {
              configName,
              spreadsheetId,
              gid,
              sheetName,
              fieldDetails,
              actualHeaders: [],
              allSheetNamesInSpreadsheet,
              error: `Sheet named "${sheetName}" was not found in the spreadsheet.`,
            };
          } else {
            const actualHeaders = headersMap.get(sheetName) || [];
            allResults[configName] = {
              configName,
              spreadsheetId,
              gid,
              sheetName,
              fieldDetails,
              actualHeaders,
              allSheetNamesInSpreadsheet,
              error: null,
            };
          }
        }
      } catch (err: any) {
        const message =
          err.result?.error?.message || err.message || 'An unknown error occurred.';
        console.error(
          `Health Check failed for spreadsheet ${spreadsheetId}:`,
          message,
        );
      }
    }
    setMappingInfo(allResults);
    setIsLoading(false);
  }, [spreadsheetIds, dynamicGroupedConfigs, appSheetRows]);

  useEffect(() => {
    setLocalMappings(sheetMappings);
    setLocalRelations(sheetRelations);
    setLocalDataTypes(sheetDataTypes);
  }, [sheetMappings, sheetRelations, sheetDataTypes]);

  useEffect(() => {
    if (isConfigured) runChecks();
    else setIsLoading(false);
  }, [isConfigured, runChecks]);

  useEffect(() => {
    if (dataContext.loading || Object.keys(dataContext.allData).length === 0)
      return;

    const allRelations = { ...predefinedRelations, ...localRelations };
    const newStatus: Record<
      string,
      { status: 'ok' | 'error'; errors: string[] }
    > = {};

    for (const [configName, relations] of Object.entries(allRelations)) {
      newStatus[configName] = { status: 'ok', errors: [] };
      if (!relations) continue;

      for (const [field, targetConfigName] of Object.entries(relations)) {
        if (!targetConfigName) continue;
        const sourceData = dataContext.allData[configName];
        const targetData = dataContext.allData[targetConfigName];

        if (!sourceData || !targetData) continue;

        const targetConfigFn = allSheetConfigs[targetConfigName];
        if (!targetConfigFn) continue;

        const targetConfig = targetConfigFn(spreadsheetIds);
        const targetKeyField = targetConfig.keyField as string;

        const targetIds = new Set(targetData.map((item) => item[targetKeyField]));

        for (const sourceItem of sourceData) {
          const foreignKeyValue = sourceItem[field];
          if (foreignKeyValue) {
            const valuesToCheck = String(foreignKeyValue)
              .split(/[,|]/)
              .map((s) => s.trim())
              .filter(Boolean);
            valuesToCheck.forEach((fk) => {
              if (!targetIds.has(fk)) {
                newStatus[configName].status = 'error';
                newStatus[configName].errors.push(
                  `Invalid ID '${fk}' in '${configName}' (field: '${field}') referencing '${targetConfigName}'.`,
                );
              }
            });
          }
        }
      }
    }
    setRelationStatus(newStatus);
  }, [dataContext.loading, dataContext.allData, localRelations, spreadsheetIds]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveSheetConfiguration({
        mappings: localMappings,
        // Relations and DataTypes are no longer edited here, but we save them anyway
        // in case they were loaded from a previous state.
        relations: localRelations,
        dataTypes: localDataTypes,
      });
      await dataContext.refreshData();
      alert('Mappings saved and data refreshed!');
    } catch (error) {
      console.error('Failed to save mappings:', error);
      alert('An error occurred during save. Check console for details.');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSection = (sectionName: string) =>
    setOpenSections((prev) => ({ ...prev, [sectionName]: !prev[sectionName] }));

  const handleMappingChange = (
    configName: string,
    appField: string,
    newHeader: string,
  ) => {
    setLocalMappings((prev) => ({
      ...prev,
      [configName]: { ...(prev[configName] || {}), [appField]: newHeader },
    }));
  };

  if (isLoading)
    return (
      <div className="text-center p-8 animate-pulse">
        Running health checks...
      </div>
    );
  if (!isConfigured)
    return (
      <div className="text-center p-8 text-yellow-400">
        Please configure spreadsheet IDs in Admin &gt; Integrations first.
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            Schema Editor & Health Check (Layer 3)
          </h1>
          <p className="text-gray-400 mt-1">
            Map the app's internal fields to your Google Sheet column headers.
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Mappings'}
        </Button>
      </div>

      {Object.entries(dynamicGroupedConfigs)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([groupName, group]) => {
          const hasErrorInGroup = Object.keys(group.configs).some(
            (configName) =>
              mappingInfo[configName]?.error ||
              relationStatus[configName]?.status === 'error',
          );

          return (
            <Card key={groupName} className="!p-0">
              <button
                onClick={() => toggleSection(groupName)}
                className="w-full flex justify-between items-center px-6 py-4"
              >
                <div className="flex items-center gap-3">
                  {hasErrorInGroup ? (
                    <ExclamationTriangleIcon className="w-6 h-6 text-yellow-400" />
                  ) : (
                    <CheckCircleIcon className="w-6 h-6 text-green-400" />
                  )}
                  <h2 className="text-lg font-semibold text-white">{groupName}</h2>
                </div>
                <ChevronDownIcon
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    openSections[groupName] ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openSections[groupName] && (
                <div className="pb-6 space-y-4">
                  {Object.keys(group.configs)
                    .sort()
                    .map((configName) => {
                      const info = mappingInfo[configName];
                      if (!info) return null;

                      const overallStatus: 'OK' | 'Error' | 'Unmapped' = info.error
                        ? 'Error'
                        : info.fieldDetails.some(
                            (fd) =>
                              !info.actualHeaders.includes(
                                localMappings[configName]?.[fd.appField] ||
                                  fd.defaultHeader,
                              ),
                          )
                        ? 'Unmapped'
                        : 'OK';
                      const relStatus = relationStatus[configName];

                      return (
                        <div
                          key={configName}
                          className="px-6 pt-4 space-y-3"
                        >
                          <div className="p-4 bg-gray-950/50 border border-gray-700 rounded-lg">
                            <div className="flex items-center gap-3 mb-3">
                              {overallStatus === 'OK' && !relStatus?.errors.length ? (
                                <CheckCircleIcon className="w-5 h-5 text-green-400" />
                              ) : (
                                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />
                              )}
                              <h3 className="font-semibold text-white">
                                {configName}{' '}
                                <span className="text-xs font-mono text-gray-500">
                                  ({info.sheetName})
                                </span>
                              </h3>
                            </div>

                            {info.error ? (
                              <div className="mt-3 p-3 bg-red-900/30 border border-red-500/30 rounded-lg text-sm text-red-300">
                                <p>{info.error}</p>
                                <Link
                                  to="/admin/integrations"
                                  className="text-blue-400 hover:underline font-semibold mt-2 inline-block"
                                >
                                  Fix on Platforms & Integrations page &rarr;
                                </Link>
                              </div>
                            ) : (
                              <>
                                <table className="w-full text-sm text-left">
                                  <thead className="text-xs text-gray-500 uppercase">
                                    <tr>
                                      <th className="py-2 px-4 w-1/3">
                                        App's Required Field
                                      </th>
                                      <th className="py-2 px-4 w-1/2">
                                        Mapped Google Sheet Column
                                      </th>
                                      <th className="py-2 px-4 text-center w-1/6">
                                        Status
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {info.fieldDetails.map((field) => {
                                      const customMapping =
                                        localMappings[configName]?.[
                                          field.appField
                                        ];
                                      const headerToUse =
                                        customMapping || field.defaultHeader;
                                      const mappingStatus: MappingStatus =
                                        info.actualHeaders.includes(headerToUse)
                                          ? 'OK'
                                          : 'Unmapped';
                                      return (
                                        <tr
                                          key={field.appField}
                                          className="border-t border-gray-800"
                                        >
                                          <td className="py-3 px-4">
                                            <span
                                              className="font-mono text-gray-300"
                                              title={field.defaultHeader}
                                            >
                                              {field.appField}
                                            </span>
                                          </td>
                                          <td className="py-3 px-4">
                                            <select
                                              value={customMapping || ''}
                                              onChange={(e) =>
                                                handleMappingChange(
                                                  configName,
                                                  field.appField,
                                                  e.target.value,
                                                )
                                              }
                                              className={`w-full bg-gray-800 border rounded-md text-white text-sm py-1.5 px-2 ${
                                                mappingStatus === 'Unmapped'
                                                  ? 'border-yellow-500/50 ring-1 ring-yellow-500/50'
                                                  : 'border-gray-700'
                                              }`}
                                            >
                                              <option value="">
                                                -- Use Default: "
                                                {field.defaultHeader}" --
                                              </option>
                                              {info.actualHeaders.map((h) => (
                                                <option key={h} value={h}>
                                                  {h}
                                                </option>
                                              ))}
                                            </select>
                                          </td>
                                          <td className="py-3 px-4 text-center">
                                            {mappingStatus === 'OK' ? (
                                              <CheckCircleIcon
                                                title={`Mapped successfully to "${headerToUse}"`}
                                                className="w-5 h-5 text-green-500 mx-auto"
                                              />
                                            ) : (
                                              <ExclamationTriangleIcon
                                                title={`Header "${headerToUse}" not found in sheet.`}
                                                className="w-5 h-5 text-yellow-500 mx-auto"
                                              />
                                            )}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                                {relStatus?.status === 'error' && (
                                  <div className="mt-3 p-3 bg-red-900/30 border border-red-500/30 rounded-lg">
                                    <h4 className="font-semibold text-red-400">
                                      Data Integrity Errors
                                    </h4>
                                    <ul className="list-disc list-inside text-xs text-red-300 mt-2 max-h-24 overflow-y-auto">
                                      {relStatus.errors
                                        .slice(0, 5)
                                        .map((err, i) => (
                                          <li key={i}>{err}</li>
                                        ))}
                                      {relStatus.errors.length > 5 && (
                                        <li>
                                          ...and {relStatus.errors.length - 5} more.
                                        </li>
                                      )}
                                    </ul>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
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
