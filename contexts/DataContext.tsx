import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useMemo,
  useCallback,
} from 'react';

import { SheetConfig } from '../services/googleSheetService';
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
  Partner,
  CostStructure,
  RevenueStream,
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
import * as googleSheetService from '../services/googleSheetService';

import { useAuth } from './AuthContext';
import {
  // FIX: Exported member 'useSpreadsheetConfig' must be imported from the module.
  useSpreadsheetConfig,
} from './SpreadsheetConfigContext';

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
  partners: Partner[];
  costStructure: CostStructure[];
  revenueStreams: RevenueStream[];
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
  addSystemPerson: (person: Omit<SystemPerson, 'user_id'>) => Promise<void>;
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
  const { finalConfigs: dynamicConfigs, isConfigured } = useSpreadsheetConfig();
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
  const [partners, setPartners] = useState<Partner[]>([]);
  const [costStructure, setCostStructure] = useState<CostStructure[]>([]);
  const [revenueStreams, setRevenueStreams] = useState<RevenueStream[]>([]);


  // System Data states
  const [systemSegments, setSystemSegments] = useState<SystemSegment[]>([]);
  const [systemFlywheels, setSystemFlywheels] = useState<SystemFlywheel[]>([]);
  const [systemBusinessUnits, setSystemBusinessUnits] = useState<
    SystemBusinessUnit[]
  >([]);
  const [systemChannels, setSystemChannels] = useState<SystemChannel[]>([]);
  // FIX: Corrected the destructuring of the useState hook.
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

  const refreshData = useCallback(async () => {
    const shouldFetchData = isSignedIn && isConfigured && Object.keys(dynamicConfigs).length > 0;
    if (!shouldFetchData) {
      console.warn('Refresh called, but preconditions not met (not signed in or not configured).');
      setLoading(false);
      return;
    }

    setLoading(true);
    setDataError([]);

    // Reset all sheet-derived data states to clear out any old/stale data
    setPeople([]); setSystemPeople([]);
    setBusinessUnits([]); setFlywheels([]); setLeads([]); setOpportunities([]); setAccounts([]);
    setBrainDumps([]); setRoles([]); setHubs([]); setInterfaces([]); setChannels([]);
    setCustomerSegments([]); setPartners([]); setCostStructure([]); setRevenueStreams([]);
    setSystemSegments([]); setSystemFlywheels([]); setSystemBusinessUnits([]);
    setSystemChannels([]); setSystemInterfaces([]); setSystemHubs([]); setSystemStages([]);
    setSystemTouchpoints([]); setSystemPlatforms([]);
    setPrograms([]); setMgmtProjects([]); setMilestones([]); setMgmtTasks([]);
    setMgmtHubs([]); setWeeklyUpdates([]); setDecisionLogs([]);
    setFlywheelStrategies([]); setSegmentPositionings([]); setFunnelStages([]); setInterfaceMaps([]);

    const setterMap: Record<string, (data: any[]) => void> = {
      'Business Units': (data: BusinessUnit[]) => setBusinessUnits(data),
      Flywheels: (data: Flywheel[]) => setFlywheels(data),
      Leads: (data: Lead[]) => setLeads(data),
      Opportunities: (data: Opportunity[]) => setOpportunities(data),
      Accounts: (data: Account[]) => setAccounts(data),
      BrainDump: (data: BrainDump[]) => setBrainDumps(data),
      Roles: (data: Role[]) => setRoles(data),
      Hubs: (data: Hub[]) => setHubs(data),
      Interfaces: (data: Interface[]) => setInterfaces(data),
      Channels: (data: Channel[]) => setChannels(data),
      'Customer Segments': (data: CustomerSegment[]) => setCustomerSegments(data),
      Partners: (data: Partner[]) => setPartners(data),
      'Cost Structure': (data: CostStructure[]) => setCostStructure(data),
      'Revenue Streams': (data: RevenueStream[]) => setRevenueStreams(data),
      SystemSegments: (data: SystemSegment[]) => setSystemSegments(data),
      SystemFlywheels: (data: SystemFlywheel[]) => setSystemFlywheels(data),
      SystemBusinessUnits: (data: SystemBusinessUnit[]) => setSystemBusinessUnits(data),
      SystemChannels: (data: SystemChannel[]) => setSystemChannels(data),
      SystemInterfaces: (data: SystemInterface[]) => setSystemInterfaces(data),
      SystemHubs: (data: SystemHub[]) => setSystemHubs(data),
      SystemPeople: (data: SystemPerson[]) => {
        // When SystemPeople is loaded, update both generic People and SystemPeople states.
        setPeople(data as Person[]);
        setSystemPeople(data);
      },
      SystemStages: (data: SystemStage[]) => setSystemStages(data),
      SystemTouchpoints: (data: SystemTouchpoint[]) => setSystemTouchpoints(data),
      SystemPlatforms: (data: SystemPlatform[]) => setSystemPlatforms(data),
      Programs: (data: Program[]) => setPrograms(data),
      MgmtProjects: (data: MgmtProject[]) => setMgmtProjects(data),
      Milestones: (data: Milestone[]) => setMilestones(data),
      MgmtTasks: (data: MgmtTask[]) => setMgmtTasks(data),
      MgmtHubs: (data: MgmtHub[]) => setMgmtHubs(data),
      WeeklyUpdates: (data: WeeklyUpdate[]) => setWeeklyUpdates(data),
      DecisionLogs: (data: DecisionLog[]) => setDecisionLogs(data),
      FlywheelStrategies: (data: FlywheelStrategy[]) => setFlywheelStrategies(data),
      SegmentPositionings: (data: SegmentPositioning[]) => setSegmentPositionings(data),
      FunnelStages: (data: FunnelStage[]) => setFunnelStages(data),
      InterfaceMaps: (data: InterfaceMap[]) => setInterfaceMaps(data),
    };

    try {
      googleSheetService.clearCache();
      const configsBySpreadsheet: Record<string, { key: string; config: SheetConfig<any> }[]> = {};
      Object.keys(dynamicConfigs).forEach((key) => {
        const sheetConfig = dynamicConfigs[key];
        if (!sheetConfig || !sheetConfig.spreadsheetId) return;
        const { spreadsheetId } = sheetConfig;
        if (!configsBySpreadsheet[spreadsheetId]) {
          configsBySpreadsheet[spreadsheetId] = [];
        }
        configsBySpreadsheet[spreadsheetId].push({ key, config: sheetConfig });
      });

      const fetchPromises = Object.entries(configsBySpreadsheet).map(
        ([spreadsheetId, configs]) =>
          googleSheetService.batchFetchAndParseSheetData(spreadsheetId, configs)
            .then((result: Record<string, any[]>) => {
              // This part runs as soon as one spreadsheet is done, updating state immediately.
              Object.entries(result).forEach(([key, data]) => {
                const setter = setterMap[key];
                if (setter) {
                  setter(data);
                } else {
                  console.warn(`No state setter found for data key: ${key}`);
                }
              });
            })
            .catch(error => {
              // Handle error for this specific spreadsheet without stopping others.
              console.error(`Failed to fetch or parse data for spreadsheet ${spreadsheetId}:`, error);
              const gapiError = error.result?.error;
              let errorMessage = `Could not fetch data for one or more sheets in spreadsheet ID ending in ...${spreadsheetId.slice(-6)}.`;
              if (gapiError) {
                errorMessage = `Failed to access spreadsheet ...${spreadsheetId.slice(-6)}. Error: ${gapiError.message}`;
              } else if (error.message) {
                errorMessage = `Error for spreadsheet ...${spreadsheetId.slice(-6)}: ${error.message}`;
              }
              setDataError((prev) => [...prev, new Error(errorMessage)]);
            })
      );

      // Wait for all fetches to complete to turn off the global loading spinner.
      await Promise.all(fetchPromises);
    } catch (error: any) {
      console.error('An unexpected error occurred during data refresh setup:', error);
      setDataError((prev) => [
        ...prev,
        new Error('An unexpected error occurred. Check console for details.'),
      ]);
    } finally {
      setLoading(false);
    }
  }, [isSignedIn, isConfigured, dynamicConfigs]);

  useEffect(() => {
    const shouldFetchData = isSignedIn && isConfigured && Object.keys(dynamicConfigs).length > 0;

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
        // FIX: Changed to empty array
        setMgmtProjects([]); 
        setMilestones([]);
        // FIX: Changed to empty array
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

  const projectsMemo: Project[] = useMemo(() => {
    const hubBuMap = new Map<string, string[]>();
    hubs.forEach((hub) => {
      const bus: string[] = [];
      // Assuming serves_bu1 to serves_bu6 are boolean flags or similar
      if (hub.serves_bu1 && businessUnits[0]) bus.push(businessUnits[0].bu_id!);
      if (hub.serves_bu2 && businessUnits[1]) bus.push(businessUnits[1].bu_id!);
      if (hub.serves_bu3 && businessUnits[2]) bus.push(businessUnits[2].bu_id!);
      if (hub.serves_bu4 && businessUnits[3]) bus.push(businessUnits[3].bu_id!);
      if (hub.serves_bu5 && businessUnits[4]) bus.push(businessUnits[4].bu_id!);
      if (hub.serves_bu6 && businessUnits[5]) bus.push(businessUnits[5].bu_id!);
      hubBuMap.set(hub.hub_id!, bus);
    });

    return mgmtProjects.map((mp) => ({
      project_id: mp.project_id,
      project_name: mp.project_name,
      business_unit_id: (mp.business_unit_impact ? mp.business_unit_impact.split(',').map(s => s.trim()) : undefined) || hubBuMap.get(mp.hub_id || '') || [], // Convert string to array
      owner_user_id: mp.owner_id || '',
      priority: mp.priority as Priority,
      status: mp.status as Status,
      start_date: mp.start_date,
      target_end_date: mp.end_date,
      budget_planned: mp.budget || 0,
      budget_spent: mp.budget_spent || 0, // Default value from MgmtProject
      objective: mp.objective,
      confidence_pct: mp.health_score || 0, // Default values for non-existent fields in MgmtProject
      // FIX: Mapped `risk_level` to `risk_flag` as a boolean.
      risk_flag: mp.risk_level === 'High', 
      risk_note: '',
      channels_impacted: mp.channel_ids || [],
      touchpoints_impacted: [],
      hub_dependencies: [],
      team_members: [],
      success_metrics: mp.success_metric,
      created_at: mp.created_at,
      updated_at: mp.updated_at,
    }));
  }, [mgmtProjects, hubs, businessUnits]);

  const tasksMemo: Task[] = useMemo(() => {
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
        assignee_user_id: mt.assignee_ids ? mt.assignee_ids : '', // Ensure assignee_user_id is string
        status: mt.status as Status,
        priority: mt.priority as Priority,
        estimate_hours: mt.effort_hours,
        due_date: mt.due_date,
        description: mt.description,
        logged_hours: mt.actual_completion_date || 0, // Assuming actual_completion_date is used for logged hours
        channel_id: '',
        touchpoint_id: '',
        hub_id: mt.hub_id,
        dependency_task_id: mt.dependencies || '', // Ensure dependency_task_id is string
      };
    });
  }, [mgmtTasks, milestones]);

  const addPerson = useCallback(
    async (person: Omit<Person, 'user_id'>) => {
      if (!dynamicConfigs?.SystemPeople) throw new Error('People config not ready');
      // FIX: Corrected types for newPerson to be SystemPerson directly,
      // as it is being mapped to SystemPeople. Provide defaults for all required fields.
      // user_id will be generated by the createEntity service, using email as an identifier
      const newSystemPerson: Omit<SystemPerson, 'user_id'> = {
        personId: person.email, // Map user_id to personId
        fullName: person.full_name || '', // Map full_name to fullName
        role: person.role_title || '', // Map role_title to role
        // Ensure all required SystemPerson fields are present and handle potential unknown types from Person
        email: person.email ?? '', 
        primary_hub: (person as any).primary_hub ?? '',
        owns_business_units_ids: (person as any).owns_business_units_ids ?? [],
        owns_channels_ids: (person as any).owns_channels_ids ?? [],
        owns_flywheels_ids: (person as any).owns_flywheels_ids ?? [],
        owns_interfaces_ids: (person as any).owns_interfaces_ids ?? [],
        owns_platforms_ids: (person as any).owns_platforms_ids ?? [],
        owns_segments_ids: (person as any).owns_segments_ids ?? [],
        owns_stages_ids: (person as any).owns_stages_ids ?? [],
        owns_touchpoints_ids: (person as any).owns_touchpoints_ids ?? [],
        annual_comp_inr: (person as any).annual_comp_inr ?? 0,
        capacity_utilization_pct: (person as any).capacity_utilization_pct ?? 0,
        primary_okrs: (person as any).primary_okrs ?? '',
        phone: (person as any).phone ?? '',
        department: (person as any).department ?? '',
        role_title: (person as any).role_title ?? '',
        manager_id: (person as any).manager_id ?? '',
        employment_type: (person as any).employment_type ?? '',
        weekly_hours_capacity: (person as any).weekly_hours_capacity ?? 0,
        location: (person as any).location ?? '',
        notes: (person as any).notes ?? '',
      };
      const createdSystemPerson = await googleSheetService.createEntity(dynamicConfigs.SystemPeople, newSystemPerson as SystemPerson);
      setPeople((prev) => [...prev, createdSystemPerson as Person]);
      setSystemPeople((prev) => [...prev, createdSystemPerson]); // Also update SystemPeople
    },
    [dynamicConfigs],
  );

  const updatePerson = useCallback(
    async (person: Person) => {
      if (!dynamicConfigs?.SystemPeople) throw new Error('People config not ready');
      // FIX: Corrected types for updatedSystemPerson to be SystemPerson directly,
      // as it is being mapped to SystemPeople. Provide defaults for all required fields.
      const updatedSystemPerson: SystemPerson = {
        user_id: person.user_id!,
        personId: person.personId || person.user_id!,
        fullName: person.full_name || '',
        role: person.role_title || '',
        // Ensure all required SystemPerson fields are present and handle potential unknown types from Person
        email: person.email ?? '', 
        primary_hub: (person as any).primary_hub ?? '',
        owns_business_units_ids: (person as any).owns_business_units_ids ?? [],
        owns_channels_ids: (person as any).owns_channels_ids ?? [],
        owns_flywheels_ids: (person as any).owns_flywheels_ids ?? [],
        owns_interfaces_ids: (person as any).owns_interfaces_ids ?? [],
        owns_platforms_ids: (person as any).owns_platforms_ids ?? [],
        owns_segments_ids: (person as any).owns_segments_ids ?? [],
        owns_stages_ids: (person as any).owns_stages_ids ?? [],
        owns_touchpoints_ids: (person as any).owns_touchpoints_ids ?? [],
        annual_comp_inr: (person as any).annual_comp_inr ?? 0,
        capacity_utilization_pct: (person as any).capacity_utilization_pct ?? 0,
        primary_okrs: (person as any).primary_okrs ?? '',
        phone: (person as any).phone ?? '',
        department: (person as any).department ?? '',
        role_title: (person as any).role_title ?? '',
        manager_id: (person as any).manager_id ?? '',
        employment_type: (person as any).employment_type ?? '',
        weekly_hours_capacity: (person as any).weekly_hours_capacity ?? 0,
        location: (person as any).location ?? '',
        notes: (person as any).notes ?? '',
      };
      await googleSheetService.updateEntity(dynamicConfigs.SystemPeople, updatedSystemPerson);
      setPeople((prev) =>
        prev.map((p) => (p.user_id === person.user_id ? person : p)),
      );
      setSystemPeople((prev) => // Also update SystemPeople
        prev.map((p) => (p.user_id === person.user_id ? updatedSystemPerson : p)),
      );
    },
    [dynamicConfigs],
  );

  const deletePerson = useCallback(
    async (userId: string) => {
      if (!dynamicConfigs?.SystemPeople) throw new Error('People config not ready');
      await googleSheetService.deleteEntity(dynamicConfigs.SystemPeople, userId);
      setPeople((prev) => prev.filter((p) => p.user_id !== userId));
      setSystemPeople((prev) => prev.filter((p) => p.user_id !== userId)); // Also update SystemPeople
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
      await googleSheetService.appendEntity(dynamicConfigs.Roles, role);
      setRoles((prev) => [...prev, role]);
    },
    [dynamicConfigs, roles],
  );

  const updateRole = useCallback(
    async (role: Role) => {
      if (!dynamicConfigs?.Roles) throw new Error('Roles config not ready');
      await googleSheetService.updateEntity(dynamicConfigs.Roles, role);
      setRoles((prev) =>
        prev.map((r) => (r.role_name === role.role_name ? role : r)),
      );
    },
    [dynamicConfigs],
  );

  const deleteRole = useCallback(
    async (roleName: string) => {
      if (!dynamicConfigs?.Roles) throw new Error('Roles config not ready');
      await googleSheetService.deleteEntity(dynamicConfigs.Roles, roleName);
      setRoles((prev) => prev.filter((r) => r.role_name !== roleName));
    },
    [dynamicConfigs],
  );

  const addLead = useCallback(
    async (lead: Omit<Lead, 'lead_id'>) => {
      if (!dynamicConfigs?.Leads) throw new Error('Leads config not ready');
      const newLead = await googleSheetService.createEntity(dynamicConfigs.Leads, lead);
      setLeads((prev) => [...prev, newLead]);
    },
    [dynamicConfigs],
  );

  const updateLead = useCallback(
    async (lead: Lead) => {
      if (!dynamicConfigs?.Leads) throw new Error('Leads config not ready');
      await googleSheetService.updateEntity(dynamicConfigs.Leads, lead);
      setLeads((prev) =>
        prev.map((l) => (l.lead_id === lead.lead_id ? lead : l)),
      );
    },
    [dynamicConfigs],
  );

  const deleteLead = useCallback(
    async (leadId: string) => {
      if (!dynamicConfigs?.Leads) throw new Error('Leads config not ready');
      await googleSheetService.deleteEntity(dynamicConfigs.Leads, leadId);
      setLeads((prev) => prev.filter((l) => l.lead_id !== leadId));
    },
    [dynamicConfigs],
  );

  const addOpportunity = useCallback(
    async (opportunity: Omit<Opportunity, 'opportunity_id'>) => {
      if (!dynamicConfigs?.Opportunities)
        throw new Error('Opportunities config not ready');
      const newOpp = await googleSheetService.createEntity(
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
      await googleSheetService.updateEntity(dynamicConfigs.Opportunities, opportunity);
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
      await googleSheetService.deleteEntity(dynamicConfigs.Opportunities, opportunityId);
      setOpportunities((prev) =>
        prev.filter((o) => o.opportunity_id !== opportunityId),
      );
    },
    [dynamicConfigs],
  );

  const addAccount = useCallback(
    async (account: Omit<Account, 'account_id'>) => {
      if (!dynamicConfigs?.Accounts) throw new Error('Accounts config not ready');
      const newAccount = await googleSheetService.createEntity(
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
      await googleSheetService.updateEntity(dynamicConfigs.Accounts, account);
      setAccounts((prev) =>
        prev.map((a) => (a.account_id === account.account_id ? account : a)),
      );
    },
    [dynamicConfigs],
  );

  const deleteAccount = useCallback(
    async (accountId: string) => {
      if (!dynamicConfigs?.Accounts) throw new Error('Accounts config not ready');
      await googleSheetService.deleteEntity(dynamicConfigs.Accounts, accountId);
      setAccounts((prev) => prev.filter((a) => a.account_id !== accountId));
    },
    [dynamicConfigs],
  );

  const addBrainDump = useCallback(
    async (item: Omit<BrainDump, 'braindump_id'>) => {
      if (!dynamicConfigs?.BrainDump)
        throw new Error('BrainDump config not ready');
      const newItem = await googleSheetService.createEntity(
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
      await googleSheetService.updateEntity(dynamicConfigs.BrainDump, item);
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
      await googleSheetService.deleteEntity(dynamicConfigs.BrainDump, itemId);
      setBrainDumps((prev) => prev.filter((bd) => bd.braindump_id !== itemId));
    },
    [dynamicConfigs],
  );

  const addBusinessUnit = useCallback(
    async (bu: Omit<BusinessUnit, 'bu_id'>) => {
      if (!dynamicConfigs?.['Business Units'])
        throw new Error('BusinessUnits config not ready');
      const newBu = await googleSheetService.createEntity(
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
      await googleSheetService.updateEntity(dynamicConfigs['Business Units'], bu);
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
      await googleSheetService.deleteEntity(dynamicConfigs['Business Units'], buId);
      setBusinessUnits((prev) => prev.filter((b) => b.bu_id !== buId));
    },
    [dynamicConfigs],
  );

  const addHub = useCallback(
    async (hub: Omit<Hub, 'hub_id'>) => {
      if (!dynamicConfigs?.Hubs) throw new Error('Hubs config not ready');
      const newHub = await googleSheetService.createEntity(dynamicConfigs.Hubs, hub);
      setHubs((prev) => [...prev, newHub]);
    },
    [dynamicConfigs],
  );

  const updateHub = useCallback(
    async (hub: Hub) => {
      if (!dynamicConfigs?.Hubs) throw new Error('Hubs config not ready');
      await googleSheetService.updateEntity(dynamicConfigs.Hubs, hub);
      setHubs((prev) => prev.map((h) => (h.hub_id === hub.hub_id ? hub : h)));
    },
    [dynamicConfigs],
  );

  const deleteHub = useCallback(
    async (hubId: string) => {
      if (!dynamicConfigs?.Hubs) throw new Error('Hubs config not ready');
      await googleSheetService.deleteEntity(dynamicConfigs.Hubs, hubId);
      setHubs((prev) => prev.filter((h) => h.hub_id !== hubId));
    },
    [dynamicConfigs],
  );

  const addInterface = useCallback(
    async (iface: Omit<Interface, 'interface_id'>) => {
      if (!dynamicConfigs?.Interfaces)
        throw new Error('Interfaces config not ready');
      const newIface = await googleSheetService.createEntity(
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
      await googleSheetService.updateEntity(dynamicConfigs.Interfaces, iface);
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
      await googleSheetService.deleteEntity(dynamicConfigs.Interfaces, ifaceId);
      setInterfaces((prev) => prev.filter((i) => i.interface_id !== ifaceId));
    },
    [dynamicConfigs],
  );

  const addChannel = useCallback(
    async (channel: Omit<Channel, 'channel_id'>) => {
      if (!dynamicConfigs?.Channels) throw new Error('Channels config not ready');
      const newChannel = await googleSheetService.createEntity(
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
      await googleSheetService.updateEntity(dynamicConfigs.Channels, channel);
      setChannels((prev) =>
        prev.map((c) => (c.channel_id === channel.channel_id ? channel : c)),
      );
    },
    [dynamicConfigs],
  );

  const deleteChannel = useCallback(
    async (channelId: string) => {
      if (!dynamicConfigs?.Channels) throw new Error('Channels config not ready');
      await googleSheetService.deleteEntity(dynamicConfigs.Channels, channelId);
      setChannels((prev) => prev.filter((c) => c.channel_id !== channelId));
    },
    [dynamicConfigs],
  );

  const addFlywheel = useCallback(
    async (flywheel: Omit<Flywheel, 'flywheel_id'>) => {
      if (!dynamicConfigs?.Flywheels)
        throw new Error('Flywheels config not ready');
      const newFlywheel = await googleSheetService.createEntity(
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
      await googleSheetService.updateEntity(dynamicConfigs.Flywheels, flywheel);
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
      await googleSheetService.appendEntity(dynamicConfigs['Customer Segments'], segment);
      setCustomerSegments((prev) => [...prev, segment]);
    },
    [dynamicConfigs],
  );

  const updateCustomerSegment = useCallback(
    async (segment: CustomerSegment) => {
      if (!dynamicConfigs?.['Customer Segments'])
        throw new Error('Customer Segments config not ready');
      await googleSheetService.updateEntity(dynamicConfigs['Customer Segments'], segment);
      setCustomerSegments((prev) =>
        prev.map((cs) =>
          cs.segment_id === segment.segment_id ? segment : cs,
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
      async (entity: any) => {
        const config = dynamicConfigs?.[configKey];
        if (!config) throw new Error(`${configKey} config not ready`);
        const newEntity = await googleSheetService.createEntity(config, entity);
        stateSetter((prev) => [...prev, newEntity as T]);
      },
      [dynamicConfigs, configKey, stateSetter],
    );

    const updateEntity = useCallback(
      async (entity: T) => {
        const config = dynamicConfigs?.[configKey];
        if (!config) throw new Error(`${configKey} config not ready`);
        await googleSheetService.updateEntity(config, entity);
        const keyField = config.keyField;
        if (typeof keyField === 'symbol') {
          throw new Error(`Symbol key fields are not supported for ${configKey}`);
        }
        stateSetter((prev) =>
          prev.map((e) => (e[keyField] === entity[keyField] ? entity : e)),
        );
      },
      [dynamicConfigs, configKey, stateSetter],
    );

    const deleteEntity = useCallback(
      async (id: string) => {
        const config = dynamicConfigs?.[configKey];
        if (!config) throw new Error(`${configKey} config not ready`);
        await googleSheetService.deleteEntity(config, id);
        const keyField = config.keyField;
        if (typeof keyField === 'symbol') {
          throw new Error(`Symbol key fields are not supported for ${configKey}`);
        }
        stateSetter((prev) => prev.filter((e) => e[keyField] !== id));
      },
      [dynamicConfigs, configKey, stateSetter],
    );

    return { addEntity, updateEntity, deleteEntity };
  };

  const {
    addEntity: addSystemSegment,
    updateEntity: updateSystemSegment,
    deleteEntity: deleteSystemSegment,
  } = createCrudForSystemEntity<SystemSegment>('SystemSegments', setSystemSegments);
  const {
    addEntity: addSystemFlywheel,
    updateEntity: updateSystemFlywheel,
    deleteEntity: deleteSystemFlywheel,
  } = createCrudForSystemEntity<SystemFlywheel>('SystemFlywheels', setSystemFlywheels);
  const {
    addEntity: addSystemBusinessUnit,
    updateEntity: updateSystemBusinessUnit,
    deleteEntity: deleteSystemBusinessUnit,
  } = createCrudForSystemEntity<SystemBusinessUnit>('SystemBusinessUnits', setSystemBusinessUnits);
  const {
    addEntity: addSystemChannel,
    updateEntity: updateSystemChannel,
    deleteEntity: deleteSystemChannel,
  } = createCrudForSystemEntity<SystemChannel>('SystemChannels', setSystemChannels);
  const {
    addEntity: addSystemInterface,
    updateEntity: updateSystemInterface,
    deleteEntity: deleteSystemInterface,
  } = createCrudForSystemEntity<SystemInterface>('SystemInterfaces', setSystemInterfaces);
  const {
    addEntity: addSystemHub,
    updateEntity: updateSystemHub,
    deleteEntity: deleteSystemHub,
  } = createCrudForSystemEntity<SystemHub>('SystemHubs', setSystemHubs);
  const {
    addEntity: addSystemPerson,
    updateEntity: updateSystemPerson,
    deleteEntity: deleteSystemPerson,
  } = createCrudForSystemEntity<SystemPerson>('SystemPeople', setSystemPeople);
  const {
    addEntity: addSystemStage,
    updateEntity: updateSystemStage,
    deleteEntity: deleteSystemStage,
  } = createCrudForSystemEntity<SystemStage>('SystemStages', setSystemStages);
  const {
    addEntity: addSystemTouchpoint,
    updateEntity: updateSystemTouchpoint,
    deleteEntity: deleteSystemTouchpoint,
  } = createCrudForSystemEntity<SystemTouchpoint>('SystemTouchpoints', setSystemTouchpoints);
  const {
    addEntity: addSystemPlatform,
    updateEntity: updateSystemPlatform,
    deleteEntity: deleteSystemPlatform,
  } = createCrudForSystemEntity<SystemPlatform>('SystemPlatforms', setSystemPlatforms);

  const projects = projectsMemo; // FIX: Assign memoized projects
  const tasks = tasksMemo; // FIX: Assign memoized tasks

  const addProject = useCallback(
    async (project: Omit<Project, 'project_id'>) => {
      if (!dynamicConfigs?.MgmtProjects) throw new Error('MgmtProjects config not ready');

      let hub_id: string | undefined = undefined;
      // FIX: Changed type of bu_id to allow it to be a string or array, or undefined
      const bu_id_array: string[] | undefined = project.business_unit_id;
      const bu_id_string = bu_id_array?.[0]; // Take the first BU if array
      if (bu_id_string) {
        const buIndex = businessUnits.findIndex((bu) => bu.bu_id === bu_id_string);
        if (buIndex > -1) {
          const hub = hubs.find(
            (h: Hub) => // Fix: Type h as Hub for property access
              (h.serves_bu1 && buIndex === 0) ||
              (h.serves_bu2 && buIndex === 1) ||
              (h.serves_bu3 && buIndex === 2) ||
              (h.serves_bu4 && buIndex === 3) ||
              (h.serves_bu5 && buIndex === 4) ||
              (h.serves_bu6 && buIndex === 5)
          );
          if (hub) hub_id = hub.hub_id;
        }
      }

      const mgmtProjectData: Omit<MgmtProject, 'project_id'> = {
        project_name: project.project_name,
        owner_id: project.owner_user_id,
        priority: project.priority,
        status: project.status,
        start_date: project.start_date,
        end_date: project.target_end_date,
        budget: project.budget_planned,
        hub_id: hub_id,
        objective: project.objective,
        // FIX: The MgmtProjectSchema does not directly have 'business_unit_id' as a string array.
        // If it expects a single string, pick the first one. Otherwise, ensure the schema is updated.
        business_unit_impact: bu_id_array ? bu_id_array.join(', ') : undefined, // Convert array to comma-separated string
        channel_ids: project.channels_impacted || [], // Ensure it's an array
        // Add other required fields with defaults or from project, to match MgmtProjectSchema
        program_id: undefined,
        program_name: undefined,
        owner_name: undefined,
        hub_name: undefined,
        dependencies: undefined,
        success_metric: undefined,
        revenue_impact: undefined,
        project_type: undefined,
        segment_impact: undefined,
        platform_id: undefined,
        completion_pct: undefined,
        health_score: undefined,
        actual_end_date: undefined,
        milestones_count: undefined,
        tasks_count: undefined,
        tasks_complete: undefined,
        tasks_in_progress: undefined,
        tasks_blocked: undefined,
        days_to_deadline: undefined,
        budget_spent: undefined,
        budget_variance: undefined,
        velocity_tasks_per_day: undefined,
        is_on_time: undefined,
        budget_original: undefined,
        budget_revised: undefined,
        created_at: undefined,
        created_by: undefined,
        updated_at: undefined,
        updated_by: undefined,
        // FIX: Added 'risk_level' property with a default value.
        risk_level: undefined, 
      };

      const newMgmtProject = await googleSheetService.createEntity(
        dynamicConfigs.MgmtProjects,
        mgmtProjectData as MgmtProject,
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
      const bu_id_array: string[] | undefined = project.business_unit_id;
      const bu_id_string = bu_id_array?.[0];
      if (bu_id_string) {
        const buIndex = businessUnits.findIndex((bu) => bu.bu_id === bu_id_string);
        if (buIndex > -1) {
          const hub = hubs.find(
            (h: Hub) => // Fix: Type h as Hub for property access
              (h.serves_bu1 && buIndex === 0) ||
              (h.serves_bu2 && buIndex === 1) ||
              (h.serves_bu3 && buIndex === 2) ||
              (h.serves_bu4 && buIndex === 3) ||
              (h.serves_bu5 && buIndex === 4) ||
              (h.serves_bu6 && buIndex === 5)
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
        objective: project.objective,
        // FIX: The MgmtProjectSchema does not directly have 'business_unit_id' as a string array.
        // If it expects a single string, pick the first one. Otherwise, ensure the schema is updated.
        business_unit_impact: bu_id_array ? bu_id_array.join(', ') : undefined, // Convert array to comma-separated string
        channel_ids: project.channels_impacted || [], // Ensure it's an array
        risk_level: existing.risk_level, // Ensure risk_level is retained
        // Preserve other existing fields that might not be in the Project type
      };

      await googleSheetService.updateEntity(
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
      await googleSheetService.deleteEntity(dynamicConfigs.MgmtProjects, projectId);
      setMgmtProjects((prev) => prev.filter((p) => p.project_id !== projectId));
    },
    [dynamicConfigs],
  );

  const addTask = useCallback(
    async (task: Omit<Task, 'task_id'>) => {
      if (!dynamicConfigs?.MgmtTasks) throw new Error('MgmtTasks config not ready');

      const mgmtTaskData: Omit<MgmtTask, 'task_id'> = {
        task_name: task.title,
        project_id: task.project_id,
        assignee_ids: task.assignee_user_id,
        status: task.status,
        priority: task.priority,
        effort_hours: task.estimate_hours,
        due_date: task.due_date,
        description: task.description,
        hub_id: task.hub_id,
        dependencies: task.dependency_task_id,
        // Add other required fields with defaults or from task, to match MgmtTaskSchema
        milestone_id: undefined,
        owner_id: undefined,
        owner_name: undefined,
        hub_name: undefined,
        task_category: undefined,
        task_type: undefined,
        actual_completion_date: undefined,
        notes: undefined,
        impact_if_delayed: undefined,
        age_days: undefined,
        created_at: undefined,
        created_by: undefined,
        updated_at: undefined,
        updated_by: undefined,
      };

      const newMgmtTask = await googleSheetService.createEntity(
        dynamicConfigs.MgmtTasks,
        mgmtTaskData as MgmtTask,
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
        assignee_ids: task.assignee_user_id,
        status: task.status,
        priority: task.priority,
        effort_hours: task.estimate_hours,
        due_date: task.due_date,
        description: task.description,
        hub_id: task.hub_id,
        dependencies: task.dependency_task_id,
      };

      await googleSheetService.updateEntity(dynamicConfigs.MgmtTasks, updatedMgmtTask);
      setMgmtTasks((prev) =>
        prev.map((t) => (t.task_id === task.task_id ? updatedMgmtTask : t)),
      );
    },
    [dynamicConfigs, mgmtTasks],
  );

  const deleteTask = useCallback(
    async (taskId: string) => {
      if (!dynamicConfigs?.MgmtTasks) throw new Error('MgmtTasks config not ready');
      await googleSheetService.deleteEntity(dynamicConfigs.MgmtTasks, taskId);
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
      Partners: partners,
      'Cost Structure': costStructure,
      'Revenue Streams': revenueStreams,
      Projects: projectsMemo,
      Tasks: tasksMemo,
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
      partners,
      costStructure,
      revenueStreams,
      projectsMemo,
      tasksMemo,
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
    partners,
    costStructure,
    revenueStreams,
    projects: projectsMemo,
    tasks: tasksMemo,
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