import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useMemo,
  useCallback,
} from 'react';

import * as config from '../sheetConfig';
// FIX: Changed import for SheetConfig to come from sheetGateway.ts
import { SheetConfig } from '../services/sheetGateway';
import {
  Person,
  Project,
  Task,
  BusinessUnit,
  Flywheel,
  Lead,
  Opportunity,
  Account,
  BrainDump,
  Role,
  Hub,
  Interface,
  Channel,
  CustomerSegment,
  SystemSegment,
  SystemFlywheel,
  SystemBusinessUnit,
  SystemChannel,
  SystemInterface,
  SystemHub,
  SystemPerson,
  SystemStage,
  SystemTouchpoint,
  Program,
  MgmtProject,
  Milestone,
  MgmtTask,
  MgmtHub,
  WeeklyUpdate,
  DecisionLog,
  Priority,
  Status,
  SystemPlatform,
  FlywheelStrategy,
  SegmentPositioning,
  FunnelStage,
  InterfaceMap,
  AppSheetRow,
} from '../types';
import {
  mockPeople,
  mockBusinessUnits,
  mockFlywheels,
  mockLeads,
  mockOpportunities,
  mockAccounts,
  mockBrainDumps,
  mockRoles,
  mockHubs,
  mockInterfaces,
  mockChannels,
  mockCustomerSegments,
  mockFlywheelStrategies,
  mockSegmentPositionings,
  mockFunnelStages,
  mockInterfaceMaps,
} from '../data/mockData';
import * as sheetGateway from '../services/sheetGateway';

import { useAuth } from './AuthContext';
import { SpreadsheetIds, useSpreadsheetConfig } from './SpreadsheetConfigContext';

interface IDataContext {
  people: Person[];
  businessUnits: BusinessUnit[];
  flywheels: Flywheel[];
  leads: Lead[];
  opportunities: Opportunity[];
  accounts: Account[];
  braindumps: BrainDump[];
  roles: Role[];
  hubs: Hub[];
  interfaces: Interface[];
  channels: Channel[];
  customerSegments: CustomerSegment[];
  systemSegments: SystemSegment[];
  systemFlywheels: SystemFlywheel[];
  systemBusinessUnits: SystemBusinessUnit[];
  systemChannels: SystemChannel[];
  systemInterfaces: SystemInterface[];
  systemHubs: SystemHub[];
  systemPeople: SystemPerson[];
  systemStages: SystemStage[];
  systemTouchpoints: SystemTouchpoint[];
  systemPlatforms: SystemPlatform[];
  projects: Project[];
  tasks: Task[];
  programs: Program[];
  mgmtProjects: MgmtProject[];
  milestones: Milestone[];
  mgmtTasks: MgmtTask[];
  mgmtHubs: MgmtHub[];
  weeklyUpdates: WeeklyUpdate[];
  decisionLogs: DecisionLog[];
  flywheelStrategies: FlywheelStrategy[];
  segmentPositionings: SegmentPositioning[];
  funnelStages: FunnelStage[];
  interfaceMaps: InterfaceMap[];
  allData: Record<string, any[]>;
  loading: boolean;
  dataError: Error[];
  addPerson: (person: Omit<Person, 'user_id'>) => Promise<void>;
  updatePerson: (person: Person) => Promise<void>;
  deletePerson: (userId: string) => Promise<void>;
  addLead: (lead: Omit<Lead, 'lead_id'>) => Promise<void>;
  updateLead: (lead: Lead) => Promise<void>;
  deleteLead: (leadId: string) => Promise<void>;
  addOpportunity: (
    opportunity: Omit<Opportunity, 'opportunity_id'>,
  ) => Promise<void>;
  updateOpportunity: (opportunity: Opportunity) => Promise<void>;
  deleteOpportunity: (opportunityId: string) => Promise<void>;
  addAccount: (account: Omit<Account, 'account_id'>) => Promise<void>;
  updateAccount: (account: Account) => Promise<void>;
  deleteAccount: (accountId: string) => Promise<void>;
  addBrainDump: (item: Omit<BrainDump, 'braindump_id'>) => Promise<void>;
  updateBrainDump: (item: BrainDump) => Promise<void>;
  deleteBrainDump: (itemId: string) => Promise<void>;
  addBusinessUnit: (bu: Omit<BusinessUnit, 'bu_id'>) => Promise<void>;
  updateBusinessUnit: (bu: BusinessUnit) => Promise<void>;
  deleteBusinessUnit: (buId: string) => Promise<void>;
  addHub: (hub: Omit<Hub, 'hub_id'>) => Promise<void>;
  updateHub: (hub: Hub) => Promise<void>;
  deleteHub: (hubId: string) => Promise<void>;
  addInterface: (iface: Omit<Interface, 'interface_id'>) => Promise<void>;
  updateInterface: (iface: Interface) => Promise<void>;
  deleteInterface: (ifaceId: string) => Promise<void>;
  addChannel: (channel: Omit<Channel, 'channel_id'>) => Promise<void>;
  updateChannel: (channel: Channel) => Promise<void>;
  deleteChannel: (channelId: string) => Promise<void>;
  addFlywheel: (flywheel: Omit<Flywheel, 'flywheel_id'>) => Promise<void>;
  updateFlywheel: (flywheel: Flywheel) => Promise<void>;
  addCustomerSegment: (segment: CustomerSegment) => Promise<void>;
  updateCustomerSegment: (segment: CustomerSegment) => Promise<void>;
  addRole: (role: Role) => Promise<void>;
  updateRole: (role: Role) => Promise<void>;
  deleteRole: (roleName: string) => Promise<void>;
  addProject: (project: Omit<Project, 'project_id'>) => Promise<void>;
  updateProject: (project: Project) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  addTask: (task: Omit<Task, 'task_id'>) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  addSystemSegment: (
    segment: Omit<SystemSegment, 'segment_id'>,
  ) => Promise<void>;
  updateSystemSegment: (segment: SystemSegment) => Promise<void>;
  deleteSystemSegment: (id: string) => Promise<void>;
  addSystemFlywheel: (
    flywheel: Omit<SystemFlywheel, 'flywheel_id'>,
  ) => Promise<void>;
  updateSystemFlywheel: (flywheel: SystemFlywheel) => Promise<void>;
  deleteSystemFlywheel: (id: string) => Promise<void>;
  addSystemBusinessUnit: (
    bu: Omit<SystemBusinessUnit, 'bu_id'>,
  ) => Promise<void>;
  updateSystemBusinessUnit: (bu: SystemBusinessUnit) => Promise<void>;
  deleteSystemBusinessUnit: (id: string) => Promise<void>;
  addSystemChannel: (
    channel: Omit<SystemChannel, 'channel_id'>,
  ) => Promise<void>;
  updateSystemChannel: (channel: SystemChannel) => Promise<void>;
  deleteSystemChannel: (id: string) => Promise<void>;
  addSystemInterface: (
    iface: Omit<SystemInterface, 'interface_id'>,
  ) => Promise<void>;
  updateSystemInterface: (iface: SystemInterface) => Promise<void>;
  deleteSystemInterface: (id: string) => Promise<void>;
  addSystemHub: (hub: Omit<SystemHub, 'hub_id'>) => Promise<void>;
  updateSystemHub: (hub: SystemHub) => Promise<void>;
  deleteSystemHub: (id: string) => Promise<void>;
  addSystemPerson: (person: Omit<SystemPerson, 'person_id'>) => Promise<void>;
  updateSystemPerson: (person: SystemPerson) => Promise<void>;
  deleteSystemPerson: (id: string) => Promise<void>;
  addSystemStage: (stage: Omit<SystemStage, 'stage_id'>) => Promise<void>;
  updateSystemStage: (stage: SystemStage) => Promise<void>;
  deleteSystemStage: (id: string) => Promise<void>;
  addSystemTouchpoint: (
    touchpoint: Omit<SystemTouchpoint, 'touchpoint_id'>,
  ) => Promise<void>;
  updateSystemTouchpoint: (touchpoint: SystemTouchpoint) => Promise<void>;
  deleteSystemTouchpoint: (id: string) => Promise<void>;
  addSystemPlatform: (
    platform: Omit<SystemPlatform, 'platform_id'>,
  ) => Promise<void>;
  updateSystemPlatform: (platform: SystemPlatform) => Promise<void>;
  deleteSystemPlatform: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<IDataContext | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { isSignedIn } = useAuth();
  const {
    spreadsheetIds,
    sheetMappings,
    sheetDataTypes,
    isConfigured,
    appSheetRows,
  } = useSpreadsheetConfig();
  const [loading, setLoading] = useState(true);
  const [dataError, setDataError] = useState<Error[]>([]);

  // Data states
  const [people, setPeople] = useState<Person[]>([]);
  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([]);
  const [flywheels, setFlywheels] = useState<Flywheel[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [braindumps, setBrainDumps] = useState<BrainDump[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [interfaces, setInterfaces] = useState<Interface[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [customerSegments, setCustomerSegments] = useState<CustomerSegment[]>(
    [],
  );

  // System Data states
  const [systemSegments, setSystemSegments] = useState<SystemSegment[]>([]);
  const [systemFlywheels, setSystemFlywheels] = useState<SystemFlywheel[]>([]);
  const [systemBusinessUnits, setSystemBusinessUnits] = useState<
    SystemBusinessUnit[]
  >([]);
  const [systemChannels, setSystemChannels] = useState<SystemChannel[]>([]);
  const [systemInterfaces, setSystemInterfaces] = useState<SystemInterface[]>(
    [],
  );
  const [systemHubs, setSystemHubs] = useState<SystemHub[]>([]);
  const [systemPeople, setSystemPeople] = useState<SystemPerson[]>([]);
  const [systemStages, setSystemStages] = useState<SystemStage[]>([]);
  const [systemTouchpoints, setSystemTouchpoints] = useState<SystemTouchpoint[]>(
    [],
  );
  const [systemPlatforms, setSystemPlatforms] = useState<SystemPlatform[]>([]);

  // YDS Management states
  const [programs, setPrograms] = useState<Program[]>([]);
  const [mgmtProjects, setMgmtProjects] = useState<MgmtProject[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [mgmtTasks, setMgmtTasks] = useState<MgmtTask[]>([]);
  const [mgmtHubs, setMgmtHubs] = useState<MgmtHub[]>([]);
  const [weeklyUpdates, setWeeklyUpdates] = useState<WeeklyUpdate[]>([]);
  const [decisionLogs, setDecisionLogs] = useState<DecisionLog[]>([]);
  const [flywheelStrategies, setFlywheelStrategies] = useState<
    FlywheelStrategy[]
  >([]);
  const [segmentPositionings, setSegmentPositionings] = useState<
    SegmentPositioning[]
  >([]);
  const [funnelStages, setFunnelStages] = useState<FunnelStage[]>([]);
  const [interfaceMaps, setInterfaceMaps] = useState<InterfaceMap[]>([]);

  const dynamicConfigs: Record<string, SheetConfig<any>> | null = useMemo(() => {
    if (!isConfigured || !appSheetRows || appSheetRows.length === 0) return null;

    const mappedConfigs: { [key: string]: SheetConfig<any> } = {};

    // Layer 1 is directly from the context's `spreadsheetIds`.
    // The `appSheetRows` are for Layer 2 mappings.

    Object.entries(config.allSheetConfigs).forEach(([configName, configFn]) => {
      // Layer 2: Find the row in 'App' that maps the alias (configName) to a sheet_name and a spreadsheet_code.
      const sheetRow = appSheetRows.find(
        (row) => row.table_alias === configName,
      );

      if (sheetRow && sheetRow.sheet_name && sheetRow.spreadsheet_code) {
        const spreadsheetCode =
          sheetRow.spreadsheet_code.trim() as keyof SpreadsheetIds;

        // Layer 1 lookup: Get the ID from the context state, which is the source of truth.
        const spreadsheetIdToUse = spreadsheetIds[spreadsheetCode];

        if (spreadsheetIdToUse) {
          const defaultConfig = configFn(spreadsheetIds); // This is just for schema, columns, etc. The ID will be overridden.
          const newSheetName = sheetRow.sheet_name;

          // Re-build the range string with the dynamically found sheet name.
          const sheetPart = newSheetName.includes(' ')
            ? `'${newSheetName}'`
            : newSheetName;
          const originalRangeParts = defaultConfig.range.split('!');
          const newRange = `${sheetPart}!${
            originalRangeParts.length > 1 ? originalRangeParts[1] : 'A:Z'
          }`;

          // Layer 3: Apply custom column header and data type mappings from the master schema.
          const customMappings = sheetMappings[configName];
          const customDataTypes = sheetDataTypes[configName];
          // Deep copy to avoid mutating the base config.
          const newColumns = JSON.parse(JSON.stringify(defaultConfig.columns));

          if (customMappings) {
            Object.entries(customMappings).forEach(
              ([appField, sheetHeader]) => {
                if (newColumns[appField]) {
                  newColumns[appField].header = sheetHeader;
                }
              },
            );
          }
          if (customDataTypes) {
            Object.entries(customDataTypes).forEach(([appField, dataType]) => {
              if (newColumns[appField]) {
                newColumns[appField].type = dataType;
              }
            });
          }

          mappedConfigs[configName] = {
            ...defaultConfig,
            spreadsheetId: spreadsheetIdToUse, // Use the resolved ID.
            range: newRange,
            columns: newColumns,
          };
        } else {
          console.warn(
            `Could not resolve spreadsheet_id for spreadsheet_code '${spreadsheetCode}' (from table alias '${configName}'). Check your configuration in Admin > Integrations.`,
          );
        }
      }
    });

    return mappedConfigs;
  }, [spreadsheetIds, sheetMappings, sheetDataTypes, isConfigured, appSheetRows]);

  const refreshData = useCallback(async () => {
    const shouldFetchData = isSignedIn && isConfigured && dynamicConfigs;
    if (!shouldFetchData) {
      console.warn(
        'Refresh called, but preconditions not met (not signed in or configured).',
      );
      return;
    }

    setLoading(true);
    setDataError([]);
    try {
      sheetGateway.clearCache();
      const configsBySpreadsheet: Record<
        string,
        { key: string; config: SheetConfig<any> }[]
      > = {};
      for (const [key, sheetConfig] of Object.entries(dynamicConfigs)) {
        if (!sheetConfig || !sheetConfig.spreadsheetId) continue;
        const { spreadsheetId } = sheetConfig;
        if (!configsBySpreadsheet[spreadsheetId]) {
          configsBySpreadsheet[spreadsheetId] = [];
        }
        configsBySpreadsheet[spreadsheetId].push({ key, config: sheetConfig });
      }

      let combinedData: Record<string, any[]> = {};

      for (const [spreadsheetId, configs] of Object.entries(
        configsBySpreadsheet,
      )) {
        try {
          const result = await sheetGateway.batchFetchAndParseSheetData(
            spreadsheetId,
            configs,
          );
          combinedData = { ...combinedData, ...result };
        } catch (error: any) {
          console.error(
            `Failed to fetch or parse data for spreadsheet ${spreadsheetId}:`,
            error,
          );
          const gapiError = error.result?.error;
          let errorMessage = `Could not fetch data for one or more sheets in spreadsheet ID ending in ...${spreadsheetId.slice(
            -6,
          )}.`;
          if (gapiError) {
            errorMessage = `Failed to access spreadsheet ...${spreadsheetId.slice(
              -6,
            )}. Error: ${gapiError.message}`;
          } else if (error.message) {
            errorMessage = `Error for spreadsheet ...${spreadsheetId.slice(
              -6,
            )}: ${error.message}`;
          }
          setDataError((prev) => [...prev, new Error(errorMessage)]);
        }
      }

      // Set all data states after all fetches are complete.
      setPeople(combinedData.SystemPeople || []);
      setBusinessUnits(combinedData['Business Units'] || []);
      setFlywheels(combinedData.Flywheels || []);
      setLeads(combinedData.Leads || []);
      setOpportunities(combinedData.Opportunities || []);
      setAccounts(combinedData.Accounts || []);
      setBrainDumps(combinedData.BrainDump || []);
      setRoles(combinedData.Roles || []);
      setHubs(combinedData.Hubs || []);
      setInterfaces(combinedData.Interfaces || []);
      setChannels(combinedData.Channels || []);
      setCustomerSegments(combinedData['Customer Segments'] || []);
      setSystemSegments(combinedData.SystemSegments || []);
      setSystemFlywheels(combinedData.SystemFlywheels || []);
      setSystemBusinessUnits(combinedData.SystemBusinessUnits || []);
      setSystemChannels(combinedData.SystemChannels || []);
      setSystemInterfaces(combinedData.SystemInterfaces || []);
      setSystemHubs(combinedData.SystemHubs || []);
      setSystemPeople(combinedData.SystemPeople || []);
      setSystemStages(combinedData.SystemStages || []);
      setSystemTouchpoints(combinedData.SystemTouchpoints || []);
      setSystemPlatforms(combinedData.SystemPlatforms || []);
      setPrograms(combinedData.Programs || []);
      setMgmtProjects(combinedData.MgmtProjects || []);
      setMilestones(combinedData.Milestones || []);
      setMgmtTasks(combinedData.MgmtTasks || []);
      setMgmtHubs(combinedData.MgmtHubs || []);
      setWeeklyUpdates(combinedData.WeeklyUpdates || []);
      setDecisionLogs(combinedData.DecisionLogs || []);
    } catch (error: any) {
      console.error('An unexpected error occurred during data refresh:', error);
      setDataError((prev) => [
        ...prev,
        new Error('An unexpected error occurred. Check console for details.'),
      ]);
    } finally {
      setLoading(false);
    }
  }, [isSignedIn, isConfigured, dynamicConfigs]);

  useEffect(() => {
    const shouldFetchData = isSignedIn && isConfigured && dynamicConfigs;

    if (shouldFetchData) {
      refreshData();
    } else {
      if (!isSignedIn) {
        setPeople(mockPeople);
        setBusinessUnits(mockBusinessUnits);
        setFlywheels(mockFlywheels);
        setLeads(mockLeads);
        setOpportunities(mockOpportunities);
        setAccounts(mockAccounts);
        setBrainDumps(mockBrainDumps);
        setRoles(mockRoles);
        setHubs(mockHubs);
        setInterfaces(mockInterfaces);
        setChannels(mockChannels);
        setCustomerSegments(mockCustomerSegments);
        setPrograms([]);
        setMgmtProjects([]);
        setMilestones([]);
        setMgmtTasks([]);
        setMgmtHubs([]);
        setWeeklyUpdates([]);
        setDecisionLogs([]);
        setFlywheelStrategies(mockFlywheelStrategies);
        setSegmentPositionings(mockSegmentPositionings);
        setFunnelStages(mockFunnelStages);
        setInterfaceMaps(mockInterfaceMaps);
      }
      setLoading(false);
    }
  }, [isSignedIn, isConfigured, dynamicConfigs, refreshData]);

  const addPerson = useCallback(
    async (person: Omit<Person, 'user_id'>) => {
      if (!dynamicConfigs?.SystemPeople) throw new Error('People config not ready');
      const newPerson: Person = {
        ...person,
        user_id: person.email,
        is_active: person.is_active ?? true,
      };
      await sheetGateway.appendEntity(dynamicConfigs.SystemPeople, newPerson);
      setPeople((prev) => [...prev, newPerson]);
    },
    [dynamicConfigs],
  );

  const updatePerson = useCallback(
    async (person: Person) => {
      if (!dynamicConfigs?.SystemPeople) throw new Error('People config not ready');
      await sheetGateway.updateEntity(dynamicConfigs.SystemPeople, person);
      setPeople((prev) =>
        prev.map((p) => (p.user_id === person.user_id ? person : p)),
      );
    },
    [dynamicConfigs],
  );

  const deletePerson = useCallback(
    async (userId: string) => {
      if (!dynamicConfigs?.SystemPeople) throw new Error('People config not ready');
      await sheetGateway.deleteEntity(dynamicConfigs.SystemPeople, userId);
      setPeople((prev) => prev.filter((p) => p.user_id !== userId));
    },
    [dynamicConfigs],
  );

  const addRole = useCallback(
    async (role: Role) => {
      if (!dynamicConfigs?.Roles) throw new Error('Roles config not ready');
      if (
        roles.some(
          (r) => r.role_name.toLowerCase() === role.role_name.toLowerCase(),
        )
      ) {
        throw new Error(`Role "${role.role_name}" already exists.`);
      }
      await sheetGateway.appendEntity(dynamicConfigs.Roles, role);
      setRoles((prev) => [...prev, role]);
    },
    [dynamicConfigs, roles],
  );

  const updateRole = useCallback(
    async (role: Role) => {
      if (!dynamicConfigs?.Roles) throw new Error('Roles config not ready');
      await sheetGateway.updateEntity(dynamicConfigs.Roles, role);
      setRoles((prev) =>
        prev.map((r) => (r.role_name === role.role_name ? role : r)),
      );
    },
    [dynamicConfigs],
  );

  const deleteRole = useCallback(
    async (roleName: string) => {
      if (!dynamicConfigs?.Roles) throw new Error('Roles config not ready');
      await sheetGateway.deleteEntity(dynamicConfigs.Roles, roleName);
      setRoles((prev) => prev.filter((r) => r.role_name !== roleName));
    },
    [dynamicConfigs],
  );

  const addLead = useCallback(
    async (lead: Omit<Lead, 'lead_id'>) => {
      if (!dynamicConfigs?.Leads) throw new Error('Leads config not ready');
      const newLead = await sheetGateway.createEntity(dynamicConfigs.Leads, lead);
      setLeads((prev) => [...prev, newLead]);
    },
    [dynamicConfigs],
  );

  const updateLead = useCallback(
    async (lead: Lead) => {
      if (!dynamicConfigs?.Leads) throw new Error('Leads config not ready');
      await sheetGateway.updateEntity(dynamicConfigs.Leads, lead);
      setLeads((prev) =>
        prev.map((l) => (l.lead_id === lead.lead_id ? lead : l)),
      );
    },
    [dynamicConfigs],
  );

  const deleteLead = useCallback(
    async (leadId: string) => {
      if (!dynamicConfigs?.Leads) throw new Error('Leads config not ready');
      await sheetGateway.deleteEntity(dynamicConfigs.Leads, leadId);
      setLeads((prev) => prev.filter((l) => l.lead_id !== leadId));
    },
    [dynamicConfigs],
  );

  const addOpportunity = useCallback(
    async (opportunity: Omit<Opportunity, 'opportunity_id'>) => {
      if (!dynamicConfigs?.Opportunities)
        throw new Error('Opportunities config not ready');
      const newOpp = await sheetGateway.createEntity(
        dynamicConfigs.Opportunities,
        opportunity,
      );
      setOpportunities((prev) => [...prev, newOpp]);
    },
    [dynamicConfigs],
  );

  const updateOpportunity = useCallback(
    async (opportunity: Opportunity) => {
      if (!dynamicConfigs?.Opportunities)
        throw new Error('Opportunities config not ready');
      await sheetGateway.updateEntity(dynamicConfigs.Opportunities, opportunity);
      setOpportunities((prev) =>
        prev.map((o) =>
          o.opportunity_id === opportunity.opportunity_id ? opportunity : o,
        ),
      );
    },
    [dynamicConfigs],
  );

  const deleteOpportunity = useCallback(
    async (opportunityId: string) => {
      if (!dynamicConfigs?.Opportunities)
        throw new Error('Opportunities config not ready');
      await sheetGateway.deleteEntity(dynamicConfigs.Opportunities, opportunityId);
      setOpportunities((prev) =>
        prev.filter((o) => o.opportunity_id !== opportunityId),
      );
    },
    [dynamicConfigs],
  );

  const addAccount = useCallback(
    async (account: Omit<Account, 'account_id'>) => {
      if (!dynamicConfigs?.Accounts) throw new Error('Accounts config not ready');
      const newAccount = await sheetGateway.createEntity(
        dynamicConfigs.Accounts,
        account,
      );
      setAccounts((prev) => [...prev, newAccount]);
    },
    [dynamicConfigs],
  );

  const updateAccount = useCallback(
    async (account: Account) => {
      if (!dynamicConfigs?.Accounts) throw new Error('Accounts config not ready');
      await sheetGateway.updateEntity(dynamicConfigs.Accounts, account);
      setAccounts((prev) =>
        prev.map((a) => (a.account_id === account.account_id ? account : a)),
      );
    },
    [dynamicConfigs],
  );

  const deleteAccount = useCallback(
    async (accountId: string) => {
      if (!dynamicConfigs?.Accounts) throw new Error('Accounts config not ready');
      await sheetGateway.deleteEntity(dynamicConfigs.Accounts, accountId);
      setAccounts((prev) => prev.filter((a) => a.account_id !== accountId));
    },
    [dynamicConfigs],
  );

  const addBrainDump = useCallback(
    async (item: Omit<BrainDump, 'braindump_id'>) => {
      if (!dynamicConfigs?.BrainDump)
        throw new Error('BrainDump config not ready');
      const newItem = await sheetGateway.createEntity(
        dynamicConfigs.BrainDump,
        item,
      );
      setBrainDumps((prev) => [...prev, newItem]);
    },
    [dynamicConfigs],
  );

  const updateBrainDump = useCallback(
    async (item: BrainDump) => {
      if (!dynamicConfigs?.BrainDump)
        throw new Error('BrainDump config not ready');
      await sheetGateway.updateEntity(dynamicConfigs.BrainDump, item);
      setBrainDumps((prev) =>
        prev.map((bd) => (bd.braindump_id === item.braindump_id ? item : bd)),
      );
    },
    [dynamicConfigs],
  );

  const deleteBrainDump = useCallback(
    async (itemId: string) => {
      if (!dynamicConfigs?.BrainDump)
        throw new Error('BrainDump config not ready');
      await sheetGateway.deleteEntity(dynamicConfigs.BrainDump, itemId);
      setBrainDumps((prev) => prev.filter((bd) => bd.braindump_id !== itemId));
    },
    [dynamicConfigs],
  );

  const addBusinessUnit = useCallback(
    async (bu: Omit<BusinessUnit, 'bu_id'>) => {
      if (!dynamicConfigs?.['Business Units'])
        throw new Error('BusinessUnits config not ready');
      const newBu = await sheetGateway.createEntity(
        dynamicConfigs['Business Units'],
        bu,
      );
      setBusinessUnits((prev) => [...prev, newBu]);
    },
    [dynamicConfigs],
  );

  const updateBusinessUnit = useCallback(
    async (bu: BusinessUnit) => {
      if (!dynamicConfigs?.['Business Units'])
        throw new Error('BusinessUnits config not ready');
      await sheetGateway.updateEntity(dynamicConfigs['Business Units'], bu);
      setBusinessUnits((prev) =>
        prev.map((b) => (b.bu_id === bu.bu_id ? bu : b)),
      );
    },
    [dynamicConfigs],
  );

  const deleteBusinessUnit = useCallback(
    async (buId: string) => {
      if (!dynamicConfigs?.['Business Units'])
        throw new Error('BusinessUnits config not ready');
      await sheetGateway.deleteEntity(dynamicConfigs['Business Units'], buId);
      setBusinessUnits((prev) => prev.filter((b) => b.bu_id !== buId));
    },
    [dynamicConfigs],
  );

  const addHub = useCallback(
    async (hub: Omit<Hub, 'hub_id'>) => {
      if (!dynamicConfigs?.Hubs) throw new Error('Hubs config not ready');
      const newHub = await sheetGateway.createEntity(dynamicConfigs.Hubs, hub);
      setHubs((prev) => [...prev, newHub]);
    },
    [dynamicConfigs],
  );

  const updateHub = useCallback(
    async (hub: Hub) => {
      if (!dynamicConfigs?.Hubs) throw new Error('Hubs config not ready');
      await sheetGateway.updateEntity(dynamicConfigs.Hubs, hub);
      setHubs((prev) => prev.map((h) => (h.hub_id === hub.hub_id ? hub : h)));
    },
    [dynamicConfigs],
  );

  const deleteHub = useCallback(
    async (hubId: string) => {
      if (!dynamicConfigs?.Hubs) throw new Error('Hubs config not ready');
      await sheetGateway.deleteEntity(dynamicConfigs.Hubs, hubId);
      setHubs((prev) => prev.filter((h) => h.hub_id !== hubId));
    },
    [dynamicConfigs],
  );

  const addInterface = useCallback(
    async (iface: Omit<Interface, 'interface_id'>) => {
      if (!dynamicConfigs?.Interfaces)
        throw new Error('Interfaces config not ready');
      const newIface = await sheetGateway.createEntity(
        dynamicConfigs.Interfaces,
        iface,
      );
      setInterfaces((prev) => [...prev, newIface]);
    },
    [dynamicConfigs],
  );

  const updateInterface = useCallback(
    async (iface: Interface) => {
      if (!dynamicConfigs?.Interfaces)
        throw new Error('Interfaces config not ready');
      await sheetGateway.updateEntity(dynamicConfigs.Interfaces, iface);
      setInterfaces((prev) =>
        prev.map((i) => (i.interface_id === iface.interface_id ? iface : i)),
      );
    },
    [dynamicConfigs],
  );

  const deleteInterface = useCallback(
    async (ifaceId: string) => {
      if (!dynamicConfigs?.Interfaces)
        throw new Error('Interfaces config not ready');
      await sheetGateway.deleteEntity(dynamicConfigs.Interfaces, ifaceId);
      setInterfaces((prev) => prev.filter((i) => i.interface_id !== ifaceId));
    },
    [dynamicConfigs],
  );

  const addChannel = useCallback(
    async (channel: Omit<Channel, 'channel_id'>) => {
      if (!dynamicConfigs?.Channels) throw new Error('Channels config not ready');
      const newChannel = await sheetGateway.createEntity(
        dynamicConfigs.Channels,
        channel,
      );
      setChannels((prev) => [...prev, newChannel]);
    },
    [dynamicConfigs],
  );

  const updateChannel = useCallback(
    async (channel: Channel) => {
      if (!dynamicConfigs?.Channels) throw new Error('Channels config not ready');
      await sheetGateway.updateEntity(dynamicConfigs.Channels, channel);
      setChannels((prev) =>
        prev.map((c) => (c.channel_id === channel.channel_id ? channel : c)),
      );
    },
    [dynamicConfigs],
  );

  const deleteChannel = useCallback(
    async (channelId: string) => {
      if (!dynamicConfigs?.Channels) throw new Error('Channels config not ready');
      await sheetGateway.deleteEntity(dynamicConfigs.Channels, channelId);
      setChannels((prev) => prev.filter((c) => c.channel_id !== channelId));
    },
    [dynamicConfigs],
  );

  const addFlywheel = useCallback(
    async (flywheel: Omit<Flywheel, 'flywheel_id'>) => {
      if (!dynamicConfigs?.Flywheels)
        throw new Error('Flywheels config not ready');
      const newFlywheel = await sheetGateway.createEntity(
        dynamicConfigs.Flywheels,
        flywheel,
      );
      setFlywheels((prev) => [...prev, newFlywheel]);
    },
    [dynamicConfigs],
  );

  const updateFlywheel = useCallback(
    async (flywheel: Flywheel) => {
      if (!dynamicConfigs?.Flywheels)
        throw new Error('Flywheels config not ready');
      await sheetGateway.updateEntity(dynamicConfigs.Flywheels, flywheel);
      setFlywheels((prev) =>
        prev.map((f) => (f.flywheel_id === flywheel.flywheel_id ? flywheel : f)),
      );
    },
    [dynamicConfigs],
  );

  const addCustomerSegment = useCallback(
    async (segment: CustomerSegment) => {
      if (!dynamicConfigs?.['Customer Segments'])
        throw new Error('Customer Segments config not ready');
      await sheetGateway.appendEntity(dynamicConfigs['Customer Segments'], segment);
      setCustomerSegments((prev) => [...prev, segment]);
    },
    [dynamicConfigs],
  );

  const updateCustomerSegment = useCallback(
    async (segment: CustomerSegment) => {
      if (!dynamicConfigs?.['Customer Segments'])
        throw new Error('Customer Segments config not ready');
      await sheetGateway.updateEntity(dynamicConfigs['Customer Segments'], segment);
      setCustomerSegments((prev) =>
        prev.map((cs) =>
          cs.customer_segment === segment.customer_segment ? segment : cs,
        ),
      );
    },
    [dynamicConfigs],
  );

  // --- System CRUD ---
  const createCrudForSystemEntity = <T extends { [key: string]: any }>(
    configKey: string,
    stateSetter: React.Dispatch<React.SetStateAction<T[]>>,
  ) => {
    const addEntity = useCallback(
      // FIX: Changed entity type to 'any' to resolve a complex generic type mismatch issue.
      async (entity: any) => {
        const config = dynamicConfigs?.[configKey];
        if (!config) throw new Error(`${configKey} config not ready`);
        const newEntity = await sheetGateway.createEntity(config, entity);
        stateSetter((prev) => [...prev, newEntity]);
      },
      [dynamicConfigs],
    );

    const updateEntity = useCallback(
      async (entity: T) => {
        const config = dynamicConfigs?.[configKey];
        if (!config) throw new Error(`${configKey} config not ready`);
        await sheetGateway.updateEntity(config, entity);
        const keyField = config.keyField;
        if (typeof keyField === 'symbol') {
          throw new Error(`Symbol key fields are not supported for ${configKey}`);
        }
        stateSetter((prev) =>
          prev.map((e) => (e[keyField] === entity[keyField] ? entity : e)),
        );
      },
      [dynamicConfigs],
    );

    const deleteEntity = useCallback(
      async (id: string) => {
        const config = dynamicConfigs?.[configKey];
        if (!config) throw new Error(`${configKey} config not ready`);
        await sheetGateway.deleteEntity(config, id);
        const keyField = config.keyField;
        if (typeof keyField === 'symbol') {
          throw new Error(`Symbol key fields are not supported for ${configKey}`);
        }
        stateSetter((prev) => prev.filter((e) => e[keyField] !== id));
      },
      [dynamicConfigs],
    );

    return { addEntity, updateEntity, deleteEntity };
  };

  const {
    addEntity: addSystemSegment,
    updateEntity: updateSystemSegment,
    deleteEntity: deleteSystemSegment,
  } = createCrudForSystemEntity('SystemSegments', setSystemSegments);
  const {
    addEntity: addSystemFlywheel,
    updateEntity: updateSystemFlywheel,
    deleteEntity: deleteSystemFlywheel,
  } = createCrudForSystemEntity('SystemFlywheels', setSystemFlywheels);
  const {
    addEntity: addSystemBusinessUnit,
    updateEntity: updateSystemBusinessUnit,
    deleteEntity: deleteSystemBusinessUnit,
  } = createCrudForSystemEntity('SystemBusinessUnits', setSystemBusinessUnits);
  const {
    addEntity: addSystemChannel,
    updateEntity: updateSystemChannel,
    deleteEntity: deleteSystemChannel,
  } = createCrudForSystemEntity('SystemChannels', setSystemChannels);
  const {
    addEntity: addSystemInterface,
    updateEntity: updateSystemInterface,
    deleteEntity: deleteSystemInterface,
  } = createCrudForSystemEntity('SystemInterfaces', setSystemInterfaces);
  const {
    addEntity: addSystemHub,
    updateEntity: updateSystemHub,
    deleteEntity: deleteSystemHub,
  } = createCrudForSystemEntity('SystemHubs', setSystemHubs);
  const {
    addEntity: addSystemPerson,
    updateEntity: updateSystemPerson,
    deleteEntity: deleteSystemPerson,
  } = createCrudForSystemEntity('SystemPeople', setSystemPeople);
  const {
    addEntity: addSystemStage,
    updateEntity: updateSystemStage,
    deleteEntity: deleteSystemStage,
  } = createCrudForSystemEntity('SystemStages', setSystemStages);
  const {
    addEntity: addSystemTouchpoint,
    updateEntity: updateSystemTouchpoint,
    deleteEntity: deleteSystemTouchpoint,
  } = createCrudForSystemEntity('SystemTouchpoints', setSystemTouchpoints);
  const {
    addEntity: addSystemPlatform,
    updateEntity: updateSystemPlatform,
    deleteEntity: deleteSystemPlatform,
  } = createCrudForSystemEntity('SystemPlatforms', setSystemPlatforms);

  const projects: Project[] = useMemo(() => {
    const hubBuMap = new Map<string, string[]>();
    hubs.forEach((hub) => {
      const bus: string[] = [];
      if (hub.serves_bu1) {
        const bu = businessUnits[0];
        if (bu) bus.push(bu.bu_id);
      }
      if (hub.serves_bu2) {
        const bu = businessUnits[1];
        if (bu) bus.push(bu.bu_id);
      }
      if (hub.serves_bu3) {
        const bu = businessUnits[2];
        if (bu) bus.push(bu.bu_id);
      }
      if (hub.serves_bu4) {
        const bu = businessUnits[3];
        if (bu) bus.push(bu.bu_id);
      }
      if (hub.serves_bu5) {
        const bu = businessUnits[4];
        if (bu) bus.push(bu.bu_id);
      }
      if (hub.serves_bu6) {
        const bu = businessUnits[5];
        if (bu) bus.push(bu.bu_id);
      }
      hubBuMap.set(hub.hub_id, bus);
    });

    return mgmtProjects.map((mp) => ({
      project_id: mp.project_id,
      project_name: mp.project_name,
      business_unit_id: hubBuMap.get(mp.hub_id || '') || [],
      owner_user_id: mp.owner_id || '',
      priority: mp.priority as Priority,
      status: mp.status as Status,
      start_date: mp.start_date,
      target_end_date: mp.end_date,
      budget_planned: mp.budget || 0,
      budget_spent: 0,
    }));
  }, [mgmtProjects, hubs, businessUnits]);

  const tasks: Task[] = useMemo(() => {
    const milestoneProjectMap = new Map(
      milestones.map((m) => [m.milestone_id, m.project_id]),
    );

    return mgmtTasks.map((mt) => {
      const projectIdFromMilestone = mt.milestone_id
        ? milestoneProjectMap.get(mt.milestone_id)
        : undefined;
      return {
        task_id: mt.task_id,
        title: mt.task_name,
        project_id: mt.project_id || projectIdFromMilestone || '',
        assignee_user_id: mt.assignee_User_id || '',
        status: mt.status as Status,
        priority: mt.priority as Priority,
        estimate_hours: mt.effort_hours,
        due_date: mt.due_date,
      };
    });
  }, [mgmtTasks, milestones]);

  const addProject = useCallback(
    async (project: Omit<Project, 'project_id'>) => {
      if (!dynamicConfigs?.MgmtProjects) throw new Error('MgmtProjects config not ready');

      let hub_id: string | undefined = undefined;
      const bu_id = project.business_unit_id?.[0];
      if (bu_id) {
        const buIndex = businessUnits.findIndex((bu) => bu.bu_id === bu_id);
        if (buIndex > -1) {
          const hub = hubs.find(
            (h: any) => h[`serves_bu${buIndex + 1}`] === true,
          );
          if (hub) hub_id = hub.hub_id;
        }
      }

      const mgmtProjectData: Partial<MgmtProject> = {
        project_name: project.project_name,
        owner_id: project.owner_user_id,
        priority: project.priority,
        status: project.status,
        start_date: project.start_date,
        end_date: project.target_end_date,
        budget: project.budget_planned,
        hub_id: hub_id,
      };

      const newMgmtProject = await sheetGateway.createEntity(
        dynamicConfigs.MgmtProjects,
        mgmtProjectData,
      );
      setMgmtProjects((prev) => [...prev, newMgmtProject]);
    },
    [dynamicConfigs, businessUnits, hubs],
  );

  const updateProject = useCallback(
    async (project: Project) => {
      if (!dynamicConfigs?.MgmtProjects) throw new Error('MgmtProjects config not ready');

      const existing = mgmtProjects.find(
        (p) => p.project_id === project.project_id,
      );
      if (!existing) throw new Error('Project not found to update.');

      let hub_id: string | undefined = existing.hub_id;
      const bu_id = project.business_unit_id?.[0];
      if (bu_id) {
        const buIndex = businessUnits.findIndex((bu) => bu.bu_id === bu_id);
        if (buIndex > -1) {
          const hub = hubs.find(
            (h: any) => h[`serves_bu${buIndex + 1}`] === true,
          );
          if (hub) hub_id = hub.hub_id;
        }
      }

      const updatedMgmtProject: MgmtProject = {
        ...existing,
        project_name: project.project_name,
        owner_id: project.owner_user_id,
        priority: project.priority,
        status: project.status,
        start_date: project.start_date,
        end_date: project.target_end_date,
        budget: project.budget_planned,
        hub_id: hub_id,
      };

      await sheetGateway.updateEntity(
        dynamicConfigs.MgmtProjects,
        updatedMgmtProject,
      );
      setMgmtProjects((prev) =>
        prev.map((p) =>
          p.project_id === project.project_id ? updatedMgmtProject : p,
        ),
      );
    },
    [dynamicConfigs, mgmtProjects, businessUnits, hubs],
  );

  const deleteProject = useCallback(
    async (projectId: string) => {
      if (!dynamicConfigs?.MgmtProjects) throw new Error('MgmtProjects config not ready');
      await sheetGateway.deleteEntity(dynamicConfigs.MgmtProjects, projectId);
      setMgmtProjects((prev) => prev.filter((p) => p.project_id !== projectId));
    },
    [dynamicConfigs],
  );

  const addTask = useCallback(
    async (task: Omit<Task, 'task_id'>) => {
      if (!dynamicConfigs?.MgmtTasks) throw new Error('MgmtTasks config not ready');

      const mgmtTaskData: Partial<MgmtTask> = {
        task_name: task.title,
        project_id: task.project_id,
        assignee_User_id: task.assignee_user_id,
        status: task.status,
        priority: task.priority,
        effort_hours: task.estimate_hours,
        due_date: task.due_date,
        description: task.description,
      };

      const newMgmtTask = await sheetGateway.createEntity(
        dynamicConfigs.MgmtTasks,
        mgmtTaskData,
      );
      setMgmtTasks((prev) => [...prev, newMgmtTask]);
    },
    [dynamicConfigs],
  );

  const updateTask = useCallback(
    async (task: Task) => {
      if (!dynamicConfigs?.MgmtTasks) throw new Error('MgmtTasks config not ready');

      const existing = mgmtTasks.find((t) => t.task_id === task.task_id);
      if (!existing) throw new Error('Task not found for update.');

      const updatedMgmtTask: MgmtTask = {
        ...existing,
        task_name: task.title,
        project_id: task.project_id,
        assignee_User_id: task.assignee_user_id,
        status: task.status,
        priority: task.priority,
        effort_hours: task.estimate_hours,
        due_date: task.due_date,
        description: task.description,
      };

      await sheetGateway.updateEntity(dynamicConfigs.MgmtTasks, updatedMgmtTask);
      setMgmtTasks((prev) =>
        prev.map((t) => (t.task_id === task.task_id ? updatedMgmtTask : t)),
      );
    },
    [dynamicConfigs, mgmtTasks],
  );

  const deleteTask = useCallback(
    async (taskId: string) => {
      if (!dynamicConfigs?.MgmtTasks) throw new Error('MgmtTasks config not ready');
      await sheetGateway.deleteEntity(dynamicConfigs.MgmtTasks, taskId);
      setMgmtTasks((prev) => prev.filter((t) => t.task_id !== taskId));
    },
    [dynamicConfigs],
  );

  const allData = useMemo(
    () => ({
      People: people,
      'Business Units': businessUnits,
      Flywheels: flywheels,
      Leads: leads,
      Opportunities: opportunities,
      Accounts: accounts,
      BrainDump: braindumps,
      Roles: roles,
      Hubs: hubs,
      Interfaces: interfaces,
      Channels: channels,
      'Customer Segments': customerSegments,
      Projects: projects,
      Tasks: tasks,
      SystemSegments: systemSegments,
      SystemFlywheels: systemFlywheels,
      SystemBusinessUnits: systemBusinessUnits,
      SystemChannels: systemChannels,
      SystemInterfaces: systemInterfaces,
      SystemHubs: systemHubs,
      SystemPeople: systemPeople,
      SystemStages: systemStages,
      SystemTouchpoints: systemTouchpoints,
      SystemPlatforms: systemPlatforms,
      Programs: programs,
      MgmtProjects: mgmtProjects,
      Milestones: milestones,
      MgmtTasks: mgmtTasks,
      MgmtHubs: mgmtHubs,
      WeeklyUpdates: weeklyUpdates,
      DecisionLogs: decisionLogs,
      FlywheelStrategies: flywheelStrategies,
      SegmentPositionings: segmentPositionings,
      FunnelStages: funnelStages,
      InterfaceMaps: interfaceMaps,
    }),
    [
      people,
      businessUnits,
      flywheels,
      leads,
      opportunities,
      accounts,
      braindumps,
      roles,
      hubs,
      interfaces,
      channels,
      customerSegments,
      projects,
      tasks,
      systemSegments,
      systemFlywheels,
      systemBusinessUnits,
      systemChannels,
      systemInterfaces,
      systemHubs,
      systemPeople,
      systemStages,
      systemTouchpoints,
      systemPlatforms,
      programs,
      mgmtProjects,
      milestones,
      mgmtTasks,
      mgmtHubs,
      weeklyUpdates,
      decisionLogs,
      flywheelStrategies,
      segmentPositionings,
      funnelStages,
      interfaceMaps,
    ],
  );

  const value = {
    people,
    businessUnits,
    flywheels,
    leads,
    opportunities,
    accounts,
    braindumps,
    roles,
    hubs,
    interfaces,
    channels,
    customerSegments,
    projects,
    tasks,
    systemSegments,
    systemFlywheels,
    systemBusinessUnits,
    systemChannels,
    systemInterfaces,
    systemHubs,
    systemPeople,
    systemStages,
    systemTouchpoints,
    systemPlatforms,
    programs,
    mgmtProjects,
    milestones,
    mgmtTasks,
    mgmtHubs,
    weeklyUpdates,
    decisionLogs,
    flywheelStrategies,
    segmentPositionings,
    funnelStages,
    interfaceMaps,
    allData,
    loading,
    dataError,
    addPerson,
    updatePerson,
    deletePerson,
    addLead,
    updateLead,
    deleteLead,
    addOpportunity,
    updateOpportunity,
    deleteOpportunity,
    addAccount,
    updateAccount,
    deleteAccount,
    addBrainDump,
    updateBrainDump,
    deleteBrainDump,
    addBusinessUnit,
    updateBusinessUnit,
    deleteBusinessUnit,
    addHub,
    updateHub,
    deleteHub,
    addInterface,
    updateInterface,
    deleteInterface,
    addChannel,
    updateChannel,
    deleteChannel,
    addFlywheel,
    updateFlywheel,
    addCustomerSegment,
    updateCustomerSegment,
    addRole,
    updateRole,
    deleteRole,
    addProject,
    updateProject,
    deleteProject,
    addTask,
    updateTask,
    deleteTask,
    addSystemSegment,
    updateSystemSegment,
    deleteSystemSegment,
    addSystemFlywheel,
    updateSystemFlywheel,
    deleteSystemFlywheel,
    addSystemBusinessUnit,
    updateSystemBusinessUnit,
    deleteSystemBusinessUnit,
    addSystemChannel,
    updateSystemChannel,
    deleteSystemChannel,
    addSystemInterface,
    updateSystemInterface,
    deleteSystemInterface,
    addSystemHub,
    updateSystemHub,
    deleteSystemHub,
    addSystemPerson,
    updateSystemPerson,
    deleteSystemPerson,
    addSystemStage,
    updateSystemStage,
    deleteSystemStage,
    addSystemTouchpoint,
    updateSystemTouchpoint,
    deleteSystemTouchpoint,
    addSystemPlatform,
    updateSystemPlatform,
    deleteSystemPlatform,
    refreshData,
  };

  return (
    <DataContext.Provider value={value}>{children}</DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
