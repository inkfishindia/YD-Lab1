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
import { SheetConfig } from '../sheetConfig';
// FIX: Add Project and Task to imports for data mapping.
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
  // FIX: Add missing types for PositioningPage.
  FlywheelStrategy,
  SegmentPositioning,
  FunnelStage,
  InterfaceMap,
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
  // FIX: Add missing mock data for PositioningPage.
  mockFlywheelStrategies,
  mockSegmentPositionings,
  mockFunnelStages,
  mockInterfaceMaps,
} from '../data/mockData';
import * as sheetService from '../services/googleSheetService';

import { useAuth } from './AuthContext';
import { useSpreadsheetConfig } from './SpreadsheetConfigContext';

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
  // FIX: Add projects and tasks for backward compatibility.
  projects: Project[];
  tasks: Task[];
  programs: Program[];
  mgmtProjects: MgmtProject[];
  milestones: Milestone[];
  mgmtTasks: MgmtTask[];
  mgmtHubs: MgmtHub[];
  weeklyUpdates: WeeklyUpdate[];
  decisionLogs: DecisionLog[];
  // FIX: Add properties for PositioningPage data.
  flywheelStrategies: FlywheelStrategy[];
  segmentPositionings: SegmentPositioning[];
  funnelStages: FunnelStage[];
  interfaceMaps: InterfaceMap[];
  allData: Record<string, any[]>;
  loading: boolean;
  dataError: Error | null;
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

  // FIX: Add CRUD operations for legacy projects and tasks.
  addProject: (project: Omit<Project, 'project_id'>) => Promise<void>;
  updateProject: (project: Project) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  addTask: (task: Omit<Task, 'task_id'>) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;

  // System CRUD
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
  const { spreadsheetIds, sheetMappings, sheetDataTypes, isConfigured } =
    useSpreadsheetConfig();
  const [loading, setLoading] = useState(true);
  const [dataError, setDataError] = useState<Error | null>(null);

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

  // FIX: Add state for PositioningPage data.
  const [flywheelStrategies, setFlywheelStrategies] = useState<
    FlywheelStrategy[]
  >([]);
  const [segmentPositionings, setSegmentPositionings] = useState<
    SegmentPositioning[]
  >([]);
  const [funnelStages, setFunnelStages] = useState<FunnelStage[]>([]);
  const [interfaceMaps, setInterfaceMaps] = useState<InterfaceMap[]>([]);

  const dynamicConfigs: Record<string, SheetConfig<any>> | null = useMemo(() => {
    if (!isConfigured) return null;

    const mappedConfigs: { [key: string]: SheetConfig<any> } = {};
    Object.entries(config.allSheetConfigs).forEach(([configName, configFn]) => {
      const defaultConfig = configFn(spreadsheetIds);
      const customMappings = sheetMappings[configName];
      const customDataTypes = sheetDataTypes[configName];

      const newColumns = JSON.parse(JSON.stringify(defaultConfig.columns)); // Deep copy

      if (customMappings) {
        Object.entries(customMappings).forEach(([appField, sheetHeader]) => {
          if (newColumns[appField]) {
            newColumns[appField].header = sheetHeader;
          }
        });
      }

      if (customDataTypes) {
        Object.entries(customDataTypes).forEach(([appField, dataType]) => {
          if (newColumns[appField]) {
            newColumns[appField].type = dataType;
          }
        });
      }

      mappedConfigs[configName] = { ...defaultConfig, columns: newColumns };
    });

    return {
      people: mappedConfigs['People'],
      businessUnits: mappedConfigs['Business Units'],
      flywheels: mappedConfigs['Flywheels'],
      leads: mappedConfigs['Leads'],
      opportunities: mappedConfigs['Opportunities'],
      accounts: mappedConfigs['Accounts'],
      braindumps: mappedConfigs['BrainDump'],
      roles: mappedConfigs['Roles'],
      logs: mappedConfigs['Logs'],
      hubs: mappedConfigs['Hubs'],
      interfaces: mappedConfigs['Interfaces'],
      channels: mappedConfigs['Channels'],
      customerSegments: mappedConfigs['Customer Segments'],
      systemSegments: mappedConfigs['SystemSegments'],
      systemFlywheels: mappedConfigs['SystemFlywheels'],
      systemBusinessUnits: mappedConfigs['SystemBusinessUnits'],
      systemChannels: mappedConfigs['SystemChannels'],
      systemInterfaces: mappedConfigs['SystemInterfaces'],
      systemHubs: mappedConfigs['SystemHubs'],
      systemPeople: mappedConfigs['SystemPeople'],
      systemStages: mappedConfigs['SystemStages'],
      systemTouchpoints: mappedConfigs['SystemTouchpoints'],
      systemPlatforms: mappedConfigs['SystemPlatforms'],
      programs: mappedConfigs['Programs'],
      mgmtProjects: mappedConfigs['MgmtProjects'],
      milestones: mappedConfigs['Milestones'],
      mgmtTasks: mappedConfigs['MgmtTasks'],
      mgmtHubs: mappedConfigs['MgmtHubs'],
      weeklyUpdates: mappedConfigs['WeeklyUpdates'],
      decisionLogs: mappedConfigs['DecisionLogs'],
    };
  }, [spreadsheetIds, sheetMappings, sheetDataTypes, isConfigured]);

  const refreshData = useCallback(async () => {
    const shouldFetchData = isSignedIn && isConfigured && dynamicConfigs;
    if (!shouldFetchData) {
      console.warn(
        'Refresh called, but preconditions not met (not signed in or configured).',
      );
      return;
    }

    setLoading(true);
    setDataError(null);
    try {
      // Group configs by spreadsheet ID to batch requests efficiently.
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
      const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

      // Fetch spreadsheets sequentially to avoid rate-limiting.
      for (const [spreadsheetId, configs] of Object.entries(
        configsBySpreadsheet,
      )) {
        const result = await sheetService.batchFetchAndParseSheetData(
          spreadsheetId,
          configs,
        );
        combinedData = { ...combinedData, ...result };
        await delay(1500); // Wait 1.5 seconds between each spreadsheet to stay within per-minute quotas.
      }

      // Set all data states after all fetches are complete.
      setPeople(combinedData.people || []);
      setBusinessUnits(combinedData.businessUnits || []);
      setFlywheels(combinedData.flywheels || []);
      setLeads(combinedData.leads || []);
      setOpportunities(combinedData.opportunities || []);
      setAccounts(combinedData.accounts || []);
      setBrainDumps(combinedData.braindumps || []);
      setRoles(combinedData.roles || []);
      setHubs(combinedData.hubs || []);
      setInterfaces(combinedData.interfaces || []);
      setChannels(combinedData.channels || []);
      setCustomerSegments(combinedData.customerSegments || []);

      setSystemSegments(combinedData.systemSegments || []);
      setSystemFlywheels(combinedData.systemFlywheels || []);
      setSystemBusinessUnits(combinedData.systemBusinessUnits || []);
      setSystemChannels(combinedData.systemChannels || []);
      setSystemInterfaces(combinedData.systemInterfaces || []);
      setSystemHubs(combinedData.systemHubs || []);
      setSystemPeople(combinedData.systemPeople || []);
      setSystemStages(combinedData.systemStages || []);
      setSystemTouchpoints(combinedData.systemTouchpoints || []);
      setSystemPlatforms(combinedData.systemPlatforms || []);

      setPrograms(combinedData.programs || []);
      setMgmtProjects(combinedData.mgmtProjects || []);
      setMilestones(combinedData.milestones || []);
      setMgmtTasks(combinedData.mgmtTasks || []);
      setMgmtHubs(combinedData.mgmtHubs || []);
      setWeeklyUpdates(combinedData.weeklyUpdates || []);
      setDecisionLogs(combinedData.decisionLogs || []);
    } catch (error: any) {
      console.error('Failed to fetch data from Google Sheets:', error);
      // Try to parse GAPI error for more specific user feedback
      const gapiError = error.result?.error;
      let errorMessage =
        'Could not fetch data from Google Sheets. Please go to Admin > Sheet Health Check for a detailed analysis of your configuration.';
      if (gapiError) {
        errorMessage = `Failed to access spreadsheet. Check permissions or ID. Error: ${gapiError.message}`;
      } else if (error.message) {
        errorMessage = error.message;
      }
      setDataError(new Error(errorMessage));
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
        // FIX: Add mock data for PositioningPage when not signed in.
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
      if (!dynamicConfigs?.people) throw new Error('People config not ready');
      // The user_id and email are the same, derived from the form's email field.
      const newPerson: Person = {
        ...person,
        user_id: person.email,
        is_active: person.is_active ?? true,
      };
      await sheetService.appendEntity(dynamicConfigs.people, newPerson);
      setPeople((prev) => [...prev, newPerson]);
    },
    [dynamicConfigs],
  );

  const updatePerson = useCallback(
    async (person: Person) => {
      if (!dynamicConfigs?.people) throw new Error('People config not ready');
      await sheetService.updateEntity(dynamicConfigs.people, person);
      setPeople((prev) =>
        prev.map((p) => (p.user_id === person.user_id ? person : p)),
      );
    },
    [dynamicConfigs],
  );

  const deletePerson = useCallback(
    async (userId: string) => {
      if (!dynamicConfigs?.people) throw new Error('People config not ready');
      await sheetService.deleteEntity(dynamicConfigs.people, userId);
      setPeople((prev) => prev.filter((p) => p.user_id !== userId));
    },
    [dynamicConfigs],
  );

  const addRole = useCallback(
    async (role: Role) => {
      if (!dynamicConfigs?.roles) throw new Error('Roles config not ready');
      if (
        roles.some(
          (r) => r.role_name.toLowerCase() === role.role_name.toLowerCase(),
        )
      ) {
        throw new Error(`Role "${role.role_name}" already exists.`);
      }
      await sheetService.appendEntity(dynamicConfigs.roles, role);
      setRoles((prev) => [...prev, role]);
    },
    [dynamicConfigs, roles],
  );

  const updateRole = useCallback(
    async (role: Role) => {
      if (!dynamicConfigs?.roles) throw new Error('Roles config not ready');
      await sheetService.updateEntity(dynamicConfigs.roles, role);
      setRoles((prev) =>
        prev.map((r) => (r.role_name === role.role_name ? role : r)),
      );
    },
    [dynamicConfigs],
  );

  const deleteRole = useCallback(
    async (roleName: string) => {
      if (!dynamicConfigs?.roles) throw new Error('Roles config not ready');
      await sheetService.deleteEntity(dynamicConfigs.roles, roleName);
      setRoles((prev) => prev.filter((r) => r.role_name !== roleName));
    },
    [dynamicConfigs],
  );

  const addLead = useCallback(
    async (lead: Omit<Lead, 'lead_id'>) => {
      if (!dynamicConfigs?.leads) throw new Error('Leads config not ready');
      const newLead = await sheetService.createEntity(dynamicConfigs.leads, lead);
      setLeads((prev) => [...prev, newLead]);
    },
    [dynamicConfigs],
  );

  const updateLead = useCallback(
    async (lead: Lead) => {
      if (!dynamicConfigs?.leads) throw new Error('Leads config not ready');
      await sheetService.updateEntity(dynamicConfigs.leads, lead);
      setLeads((prev) =>
        prev.map((l) => (l.lead_id === lead.lead_id ? lead : l)),
      );
    },
    [dynamicConfigs],
  );

  const deleteLead = useCallback(
    async (leadId: string) => {
      if (!dynamicConfigs?.leads) throw new Error('Leads config not ready');
      await sheetService.deleteEntity(dynamicConfigs.leads, leadId);
      setLeads((prev) => prev.filter((l) => l.lead_id !== leadId));
    },
    [dynamicConfigs],
  );

  const addOpportunity = useCallback(
    async (opportunity: Omit<Opportunity, 'opportunity_id'>) => {
      if (!dynamicConfigs?.opportunities)
        throw new Error('Opportunities config not ready');
      const newOpp = await sheetService.createEntity(
        dynamicConfigs.opportunities,
        opportunity,
      );
      setOpportunities((prev) => [...prev, newOpp]);
    },
    [dynamicConfigs],
  );

  const updateOpportunity = useCallback(
    async (opportunity: Opportunity) => {
      if (!dynamicConfigs?.opportunities)
        throw new Error('Opportunities config not ready');
      await sheetService.updateEntity(dynamicConfigs.opportunities, opportunity);
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
      if (!dynamicConfigs?.opportunities)
        throw new Error('Opportunities config not ready');
      await sheetService.deleteEntity(dynamicConfigs.opportunities, opportunityId);
      setOpportunities((prev) =>
        prev.filter((o) => o.opportunity_id !== opportunityId),
      );
    },
    [dynamicConfigs],
  );

  const addAccount = useCallback(
    async (account: Omit<Account, 'account_id'>) => {
      if (!dynamicConfigs?.accounts) throw new Error('Accounts config not ready');
      const newAccount = await sheetService.createEntity(
        dynamicConfigs.accounts,
        account,
      );
      setAccounts((prev) => [...prev, newAccount]);
    },
    [dynamicConfigs],
  );

  const updateAccount = useCallback(
    async (account: Account) => {
      if (!dynamicConfigs?.accounts) throw new Error('Accounts config not ready');
      await sheetService.updateEntity(dynamicConfigs.accounts, account);
      setAccounts((prev) =>
        prev.map((a) => (a.account_id === account.account_id ? account : a)),
      );
    },
    [dynamicConfigs],
  );

  const deleteAccount = useCallback(
    async (accountId: string) => {
      if (!dynamicConfigs?.accounts) throw new Error('Accounts config not ready');
      await sheetService.deleteEntity(dynamicConfigs.accounts, accountId);
      setAccounts((prev) => prev.filter((a) => a.account_id !== accountId));
    },
    [dynamicConfigs],
  );

  const addBrainDump = useCallback(
    async (item: Omit<BrainDump, 'braindump_id'>) => {
      if (!dynamicConfigs?.braindumps)
        throw new Error('BrainDump config not ready');
      const newItem = await sheetService.createEntity(
        dynamicConfigs.braindumps,
        item,
      );
      setBrainDumps((prev) => [...prev, newItem]);
    },
    [dynamicConfigs],
  );

  const updateBrainDump = useCallback(
    async (item: BrainDump) => {
      if (!dynamicConfigs?.braindumps)
        throw new Error('BrainDump config not ready');
      await sheetService.updateEntity(dynamicConfigs.braindumps, item);
      setBrainDumps((prev) =>
        prev.map((bd) => (bd.braindump_id === item.braindump_id ? item : bd)),
      );
    },
    [dynamicConfigs],
  );

  const deleteBrainDump = useCallback(
    async (itemId: string) => {
      if (!dynamicConfigs?.braindumps)
        throw new Error('BrainDump config not ready');
      await sheetService.deleteEntity(dynamicConfigs.braindumps, itemId);
      setBrainDumps((prev) => prev.filter((bd) => bd.braindump_id !== itemId));
    },
    [dynamicConfigs],
  );

  const addBusinessUnit = useCallback(
    async (bu: Omit<BusinessUnit, 'bu_id'>) => {
      if (!dynamicConfigs?.businessUnits)
        throw new Error('BusinessUnits config not ready');
      const newBu = await sheetService.createEntity(
        dynamicConfigs.businessUnits,
        bu,
      );
      setBusinessUnits((prev) => [...prev, newBu]);
    },
    [dynamicConfigs],
  );

  const updateBusinessUnit = useCallback(
    async (bu: BusinessUnit) => {
      if (!dynamicConfigs?.businessUnits)
        throw new Error('BusinessUnits config not ready');
      await sheetService.updateEntity(dynamicConfigs.businessUnits, bu);
      setBusinessUnits((prev) =>
        prev.map((b) => (b.bu_id === bu.bu_id ? bu : b)),
      );
    },
    [dynamicConfigs],
  );

  const deleteBusinessUnit = useCallback(
    async (buId: string) => {
      if (!dynamicConfigs?.businessUnits)
        throw new Error('BusinessUnits config not ready');
      await sheetService.deleteEntity(dynamicConfigs.businessUnits, buId);
      setBusinessUnits((prev) => prev.filter((b) => b.bu_id !== buId));
    },
    [dynamicConfigs],
  );

  const addHub = useCallback(
    async (hub: Omit<Hub, 'hub_id'>) => {
      if (!dynamicConfigs?.hubs) throw new Error('Hubs config not ready');
      const newHub = await sheetService.createEntity(dynamicConfigs.hubs, hub);
      setHubs((prev) => [...prev, newHub]);
    },
    [dynamicConfigs],
  );

  const updateHub = useCallback(
    async (hub: Hub) => {
      if (!dynamicConfigs?.hubs) throw new Error('Hubs config not ready');
      await sheetService.updateEntity(dynamicConfigs.hubs, hub);
      setHubs((prev) => prev.map((h) => (h.hub_id === hub.hub_id ? hub : h)));
    },
    [dynamicConfigs],
  );

  const deleteHub = useCallback(
    async (hubId: string) => {
      if (!dynamicConfigs?.hubs) throw new Error('Hubs config not ready');
      await sheetService.deleteEntity(dynamicConfigs.hubs, hubId);
      setHubs((prev) => prev.filter((h) => h.hub_id !== hubId));
    },
    [dynamicConfigs],
  );

  const addInterface = useCallback(
    async (iface: Omit<Interface, 'interface_id'>) => {
      if (!dynamicConfigs?.interfaces)
        throw new Error('Interfaces config not ready');
      const newIface = await sheetService.createEntity(
        dynamicConfigs.interfaces,
        iface,
      );
      setInterfaces((prev) => [...prev, newIface]);
    },
    [dynamicConfigs],
  );

  const updateInterface = useCallback(
    async (iface: Interface) => {
      if (!dynamicConfigs?.interfaces)
        throw new Error('Interfaces config not ready');
      await sheetService.updateEntity(dynamicConfigs.interfaces, iface);
      setInterfaces((prev) =>
        prev.map((i) => (i.interface_id === iface.interface_id ? iface : i)),
      );
    },
    [dynamicConfigs],
  );

  const deleteInterface = useCallback(
    async (ifaceId: string) => {
      if (!dynamicConfigs?.interfaces)
        throw new Error('Interfaces config not ready');
      await sheetService.deleteEntity(dynamicConfigs.interfaces, ifaceId);
      setInterfaces((prev) => prev.filter((i) => i.interface_id !== ifaceId));
    },
    [dynamicConfigs],
  );

  const addChannel = useCallback(
    async (channel: Omit<Channel, 'channel_id'>) => {
      if (!dynamicConfigs?.channels) throw new Error('Channels config not ready');
      const newChannel = await sheetService.createEntity(
        dynamicConfigs.channels,
        channel,
      );
      setChannels((prev) => [...prev, newChannel]);
    },
    [dynamicConfigs],
  );

  const updateChannel = useCallback(
    async (channel: Channel) => {
      if (!dynamicConfigs?.channels) throw new Error('Channels config not ready');
      await sheetService.updateEntity(dynamicConfigs.channels, channel);
      setChannels((prev) =>
        prev.map((c) => (c.channel_id === channel.channel_id ? channel : c)),
      );
    },
    [dynamicConfigs],
  );

  const deleteChannel = useCallback(
    async (channelId: string) => {
      if (!dynamicConfigs?.channels) throw new Error('Channels config not ready');
      await sheetService.deleteEntity(dynamicConfigs.channels, channelId);
      setChannels((prev) => prev.filter((c) => c.channel_id !== channelId));
    },
    [dynamicConfigs],
  );

  const addFlywheel = useCallback(
    async (flywheel: Omit<Flywheel, 'flywheel_id'>) => {
      if (!dynamicConfigs?.flywheels)
        throw new Error('Flywheels config not ready');
      const newFlywheel = await sheetService.createEntity(
        dynamicConfigs.flywheels,
        flywheel,
      );
      setFlywheels((prev) => [...prev, newFlywheel]);
    },
    [dynamicConfigs],
  );

  const updateFlywheel = useCallback(
    async (flywheel: Flywheel) => {
      if (!dynamicConfigs?.flywheels)
        throw new Error('Flywheels config not ready');
      await sheetService.updateEntity(dynamicConfigs.flywheels, flywheel);
      setFlywheels((prev) =>
        prev.map((f) => (f.flywheel_id === flywheel.flywheel_id ? flywheel : f)),
      );
    },
    [dynamicConfigs],
  );

  const addCustomerSegment = useCallback(
    async (segment: CustomerSegment) => {
      if (!dynamicConfigs?.customerSegments)
        throw new Error('Customer Segments config not ready');
      const { spreadsheetId, range, columns } = dynamicConfigs.customerSegments;
      const sheetName = range.split('!')[0];
      const headerMap = await sheetService.getHeaderMap(spreadsheetId, sheetName);
      const rowData = sheetService.mapEntityToRowArray(
        segment,
        headerMap,
        columns,
      );

      await (window as any).gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId,
        range: sheetName,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        resource: { values: [rowData] },
      });
      setCustomerSegments((prev) => [...prev, segment]);
    },
    [dynamicConfigs],
  );

  const updateCustomerSegment = useCallback(
    async (segment: CustomerSegment) => {
      if (!dynamicConfigs?.customerSegments)
        throw new Error('Customer Segments config not ready');
      await sheetService.updateEntity(dynamicConfigs.customerSegments, segment);
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
      async (entity: Omit<T, keyof T>) => {
        if (!dynamicConfigs?.[configKey])
          throw new Error(`${configKey} config not ready`);
        const newEntity = await sheetService.createEntity(
          dynamicConfigs[configKey],
          entity,
        );
        stateSetter((prev) => [...prev, newEntity]);
      },
      [dynamicConfigs],
    );

    const updateEntity = useCallback(
      async (entity: T) => {
        if (!dynamicConfigs?.[configKey])
          throw new Error(`${configKey} config not ready`);
        await sheetService.updateEntity(dynamicConfigs[configKey], entity);
        const keyField = dynamicConfigs[configKey].keyField;
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
        if (!dynamicConfigs?.[configKey])
          throw new Error(`${configKey} config not ready`);
        await sheetService.deleteEntity(dynamicConfigs[configKey], id);
        const keyField = dynamicConfigs[configKey].keyField;
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
  } = createCrudForSystemEntity('systemSegments', setSystemSegments);
  const {
    addEntity: addSystemFlywheel,
    updateEntity: updateSystemFlywheel,
    deleteEntity: deleteSystemFlywheel,
  } = createCrudForSystemEntity('systemFlywheels', setSystemFlywheels);
  const {
    addEntity: addSystemBusinessUnit,
    updateEntity: updateSystemBusinessUnit,
    deleteEntity: deleteSystemBusinessUnit,
  } = createCrudForSystemEntity('systemBusinessUnits', setSystemBusinessUnits);
  const {
    addEntity: addSystemChannel,
    updateEntity: updateSystemChannel,
    deleteEntity: deleteSystemChannel,
  } = createCrudForSystemEntity('systemChannels', setSystemChannels);
  const {
    addEntity: addSystemInterface,
    updateEntity: updateSystemInterface,
    deleteEntity: deleteSystemInterface,
  } = createCrudForSystemEntity('systemInterfaces', setSystemInterfaces);
  const {
    addEntity: addSystemHub,
    updateEntity: updateSystemHub,
    deleteEntity: deleteSystemHub,
  } = createCrudForSystemEntity('systemHubs', setSystemHubs);
  const {
    addEntity: addSystemPerson,
    updateEntity: updateSystemPerson,
    deleteEntity: deleteSystemPerson,
  } = createCrudForSystemEntity('systemPeople', setSystemPeople);
  const {
    addEntity: addSystemStage,
    updateEntity: updateSystemStage,
    deleteEntity: deleteSystemStage,
  } = createCrudForSystemEntity('systemStages', setSystemStages);
  const {
    addEntity: addSystemTouchpoint,
    updateEntity: updateSystemTouchpoint,
    deleteEntity: deleteSystemTouchpoint,
  } = createCrudForSystemEntity('systemTouchpoints', setSystemTouchpoints);
  const {
    addEntity: addSystemPlatform,
    updateEntity: updateSystemPlatform,
    deleteEntity: deleteSystemPlatform,
  } = createCrudForSystemEntity('systemPlatforms', setSystemPlatforms);

  // FIX: Map new Mgmt data models to old Project/Task models for backward compatibility.
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
      business_unit_id: hubBuMap.get(mp.hub_id) || [],
      owner_user_id: mp.owner_id,
      priority: mp.priority as Priority,
      status: mp.status as Status,
      start_date: mp.start_date,
      target_end_date: mp.end_date,
      budget_planned: mp.budget || 0,
      budget_spent: 0, // Not available in new model
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

  // FIX: Add mock CRUD functions for legacy projects/tasks to avoid crashes.
  const addProject = useCallback(async (project: Omit<Project, 'project_id'>) => {
    console.warn('addProject is a mock function and does not save data.');
    return Promise.resolve();
  }, []);
  const updateProject = useCallback(async (project: Project) => {
    console.warn('updateProject is a mock function and does not save data.');
    return Promise.resolve();
  }, []);
  const deleteProject = useCallback(async (projectId: string) => {
    console.warn('deleteProject is a mock function and does not save data.');
    return Promise.resolve();
  }, []);
  const addTask = useCallback(async (task: Omit<Task, 'task_id'>) => {
    console.warn('addTask is a mock function and does not save data.');
    return Promise.resolve();
  }, []);
  const updateTask = useCallback(async (task: Task) => {
    console.warn('updateTask is a mock function and does not save data.');
    return Promise.resolve();
  }, []);
  const deleteTask = useCallback(async (taskId: string) => {
    console.warn('deleteTask is a mock function and does not save data.');
    return Promise.resolve();
  }, []);

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
      Projects: projects, // Add mapped projects
      Tasks: tasks, // Add mapped tasks
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
      // FIX: Add PositioningPage data to allData.
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
      // FIX: Add PositioningPage data dependencies.
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
    tasks, // Add mapped data to context
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
    // FIX: Add PositioningPage data to context value.
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
    // Add mock CRUD functions to context
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