// This file defines the static structure of the Google Sheets used by the application.
// While some configuration is loaded dynamically, this provides the base schemas and groupings.

import { z } from 'zod';
import * as schemas from './schemas';
import type { SpreadsheetIds } from './contexts/SpreadsheetConfigContext';
import type { SheetConfig } from './services/sheetGateway';

// Helper to create a default column mapping from a Zod schema
const createColumns = <T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
): { [K in keyof T]?: { header: string } } => {
  return Object.keys(schema.shape).reduce((acc, key) => {
    acc[key as keyof T] = { header: key };
    return acc;
  }, {} as { [K in keyof T]?: { header: string } });
};

// A central registry of all sheet configurations, mapping a friendly name to a function that returns its config.
export const allSheetConfigs: Record<
  string,
  (ids: SpreadsheetIds) => SheetConfig<any>
> = {
  // YDS Management
  Programs: (ids) => ({
    spreadsheetId: ids.YDS_MANAGEMENT,
    gid: '0',
    range: 'PROGRAMS!A:AZ',
    keyField: 'program_id',
    schema: schemas.ProgramSchema,
    columns: createColumns(schemas.ProgramSchema),
  }),
  MgmtProjects: (ids) => ({
    spreadsheetId: ids.YDS_MANAGEMENT,
    gid: '719163995',
    range: 'Project!A:AZ',
    keyField: 'project_id',
    schema: schemas.MgmtProjectSchema,
    columns: createColumns(schemas.MgmtProjectSchema),
  }),
  Milestones: (ids) => ({
    spreadsheetId: ids.YDS_MANAGEMENT,
    gid: '246947641',
    range: 'Milestones!A:AZ',
    keyField: 'milestone_id',
    schema: schemas.MilestoneSchema,
    columns: createColumns(schemas.MilestoneSchema),
  }),
  MgmtTasks: (ids) => ({
    spreadsheetId: ids.YDS_MANAGEMENT,
    gid: '963211628',
    range: 'task!A:AZ',
    keyField: 'task_id',
    schema: schemas.MgmtTaskSchema,
    columns: createColumns(schemas.MgmtTaskSchema),
  }),
  MgmtHubs: (ids) => ({
    spreadsheetId: ids.YDS_MANAGEMENT,
    gid: '613303457',
    range: 'Teams!A:AZ',
    keyField: 'team_id',
    schema: schemas.MgmtHubSchema,
    columns: createColumns(schemas.MgmtHubSchema),
  }),
  WeeklyUpdates: (ids) => ({
    spreadsheetId: ids.YDS_MANAGEMENT,
    gid: '1149179491',
    range: "'WEEKLY UPDATES (Accountability Cadence)'!A:Z",
    keyField: 'update_id',
    schema: schemas.WeeklyUpdateSchema,
    columns: createColumns(schemas.WeeklyUpdateSchema),
  }),
  DecisionLogs: (ids) => ({
    spreadsheetId: ids.YDS_MANAGEMENT,
    gid: '891153943',
    range: "'decision log'!A:Z",
    keyField: 'decision_id',
    schema: schemas.DecisionLogSchema,
    columns: createColumns(schemas.DecisionLogSchema),
  }),

  // Strategy (Mapped to YDC Base per user data for GID/SheetName)
  'Business Units': (ids) => ({
    spreadsheetId: ids.STRATEGY,
    gid: '1410852755',
    range: 'BusinessUnits!A:Z',
    keyField: 'bu_id',
    schema: schemas.BusinessUnitSchema,
    columns: createColumns(schemas.BusinessUnitSchema),
  }),
  Flywheels: (ids) => ({
    spreadsheetId: ids.STRATEGY,
    gid: '294604957',
    range: 'Flywheels!A:Z',
    keyField: 'flywheel_id',
    schema: schemas.FlywheelSchema,
    columns: createColumns(schemas.FlywheelSchema),
  }),
  'Customer Segments': (ids) => ({
    spreadsheetId: ids.STRATEGY,
    gid: '1781117501',
    range: 'Segments!A:Z',
    keyField: 'customer_segment',
    schema: schemas.CustomerSegmentSchema,
    columns: createColumns(schemas.CustomerSegmentSchema),
  }),
  // Marketing (Hubs, Interfaces, Channels are often in YDC_BASE or STRATEGY depending on setup)
  Hubs: (ids) => ({
    spreadsheetId: ids.STRATEGY,
    gid: '1497542620',
    range: 'Hubs!A:Z',
    keyField: 'hub_id',
    schema: schemas.HubSchema,
    columns: createColumns(schemas.HubSchema),
  }),
  Interfaces: (ids) => ({
    spreadsheetId: ids.STRATEGY,
    gid: '1827583571',
    range: 'Interfaces!A:Z',
    keyField: 'interface_id',
    schema: schemas.InterfaceSchema,
    columns: createColumns(schemas.InterfaceSchema),
  }),
  Channels: (ids) => ({
    spreadsheetId: ids.STRATEGY,
    gid: '2050534733',
    range: 'Channels!A:Z',
    keyField: 'channel_id',
    schema: schemas.ChannelSchema,
    columns: createColumns(schemas.ChannelSchema),
  }),

  // Partners / Revenue
  Leads: (ids) => ({
    spreadsheetId: ids.PARTNERS,
    gid: '0',
    range: 'Leads!A:Z',
    keyField: 'lead_id',
    schema: schemas.LeadSchema,
    columns: createColumns(schemas.LeadSchema),
  }),
  Opportunities: (ids) => ({
    spreadsheetId: ids.PARTNERS,
    gid: '123',
    range: 'Opportunities!A:Z',
    keyField: 'opportunity_id',
    schema: schemas.OpportunitySchema,
    columns: createColumns(schemas.OpportunitySchema),
  }),
  Accounts: (ids) => ({
    spreadsheetId: ids.PARTNERS,
    gid: '456',
    range: 'Accounts!A:Z',
    keyField: 'account_id',
    schema: schemas.AccountSchema,
    columns: createColumns(schemas.AccountSchema),
  }),

  // YDS App
  BrainDump: (ids) => ({
    spreadsheetId: ids.YDS_APP,
    gid: '0',
    range: 'BrainDump!A:Z',
    keyField: 'braindump_id',
    schema: schemas.BrainDumpSchema,
    columns: createColumns(schemas.BrainDumpSchema),
  }),
  Logs: (ids) => ({
    spreadsheetId: ids.YDS_APP,
    gid: '288121377',
    range: 'Login!A:Z',
    keyField: 'log_id',
    schema: schemas.LogEntrySchema,
    columns: createColumns(schemas.LogEntrySchema),
  }),
  Roles: (ids) => ({
    spreadsheetId: ids.YDS_APP,
    gid: '1446257232',
    range: 'ROLES!A:B',
    keyField: 'role_name',
    schema: schemas.RoleSchema,
    columns: createColumns(schemas.RoleSchema),
  }),

  // YDC Base / System Map
  SystemSegments: (ids) => ({ spreadsheetId: ids.YDC_BASE, gid: '1781117501', range: 'Segments!A:AZ', keyField: 'segment_id', schema: schemas.SystemSegmentSchema, columns: createColumns(schemas.SystemSegmentSchema) }),
  SystemFlywheels: (ids) => ({ spreadsheetId: ids.YDC_BASE, gid: '294604957', range: 'Flywheels!A:AZ', keyField: 'flywheel_id', schema: schemas.SystemFlywheelSchema, columns: createColumns(schemas.SystemFlywheelSchema) }),
  SystemBusinessUnits: (ids) => ({ spreadsheetId: ids.YDC_BASE, gid: '1410852755', range: 'BusinessUnits!A:AZ', keyField: 'bu_id', schema: schemas.SystemBusinessUnitSchema, columns: createColumns(schemas.SystemBusinessUnitSchema) }),
  SystemChannels: (ids) => ({ spreadsheetId: ids.YDC_BASE, gid: '2050534733', range: 'Channels!A:AZ', keyField: 'channel_id', schema: schemas.SystemChannelSchema, columns: createColumns(schemas.SystemChannelSchema) }),
  SystemInterfaces: (ids) => ({ spreadsheetId: ids.YDC_BASE, gid: '1827583571', range: 'Interfaces!A:AZ', keyField: 'interface_id', schema: schemas.SystemInterfaceSchema, columns: createColumns(schemas.SystemInterfaceSchema) }),
  SystemHubs: (ids) => ({ spreadsheetId: ids.YDC_BASE, gid: '1497542620', range: 'Hubs!A:AZ', keyField: 'hub_id', schema: schemas.SystemHubSchema, columns: createColumns(schemas.SystemHubSchema) }),
  SystemPeople: (ids) => ({ spreadsheetId: ids.YDC_BASE, gid: '1401300909', range: 'People!A:AZ', keyField: 'person_id', schema: schemas.SystemPersonSchema, columns: createColumns(schemas.SystemPersonSchema) }),
  SystemStages: (ids) => ({ spreadsheetId: ids.YDC_BASE, gid: '723169112', range: 'Stages!A:AZ', keyField: 'stage_id', schema: schemas.SystemStageSchema, columns: createColumns(schemas.SystemStageSchema) }),
  SystemTouchpoints: (ids) => ({ spreadsheetId: ids.YDC_BASE, gid: '1159260118', range: 'Touchpoints!A:AZ', keyField: 'touchpoint_id', schema: schemas.SystemTouchpointSchema, columns: createColumns(schemas.SystemTouchpointSchema) }),
  SystemPlatforms: (ids) => ({ spreadsheetId: ids.YDC_BASE, gid: '1976934144', range: 'Platforms!A:AZ', keyField: 'platform_id', schema: schemas.SystemPlatformSchema, columns: createColumns(schemas.SystemPlatformSchema) }),
};

// Group configurations by spreadsheet for easier management and health checks
// FIX: Explicitly typed `groupedSheetConfigs` to ensure `spreadsheetIdKey` is correctly inferred as `keyof SpreadsheetIds` instead of a generic `string`, resolving the type error in SpreadsheetConfigContext.
export const groupedSheetConfigs: Record<
  string,
  {
    spreadsheetIdKey: keyof SpreadsheetIds;
    configs: Record<string, (ids: SpreadsheetIds) => SheetConfig<any>>;
  }
> = {
  'YDS Management': {
    spreadsheetIdKey: 'YDS_MANAGEMENT',
    configs: {
      Programs: allSheetConfigs.Programs,
      MgmtProjects: allSheetConfigs.MgmtProjects,
      Milestones: allSheetConfigs.Milestones,
      MgmtTasks: allSheetConfigs.MgmtTasks,
      MgmtHubs: allSheetConfigs.MgmtHubs,
      WeeklyUpdates: allSheetConfigs.WeeklyUpdates,
      DecisionLogs: allSheetConfigs.DecisionLogs,
    },
  },
  Strategy: {
    spreadsheetIdKey: 'STRATEGY',
    configs: {
      'Business Units': allSheetConfigs['Business Units'],
      Flywheels: allSheetConfigs.Flywheels,
      'Customer Segments': allSheetConfigs['Customer Segments'],
      Hubs: allSheetConfigs.Hubs,
      Interfaces: allSheetConfigs.Interfaces,
      Channels: allSheetConfigs.Channels,
    },
  },
  'Partners & Revenue': {
    spreadsheetIdKey: 'PARTNERS',
    configs: {
      Leads: allSheetConfigs.Leads,
      Opportunities: allSheetConfigs.Opportunities,
      Accounts: allSheetConfigs.Accounts,
    },
  },
  'YDS App': {
    spreadsheetIdKey: 'YDS_APP',
    configs: {
      BrainDump: allSheetConfigs.BrainDump,
      Logs: allSheetConfigs.Logs,
      Roles: allSheetConfigs.Roles,
    },
  },
  'YDC Base (System)': {
    spreadsheetIdKey: 'YDC_BASE',
    configs: {
      SystemSegments: allSheetConfigs.SystemSegments,
      SystemFlywheels: allSheetConfigs.SystemFlywheels,
      SystemBusinessUnits: allSheetConfigs.SystemBusinessUnits,
      SystemChannels: allSheetConfigs.SystemChannels,
      SystemInterfaces: allSheetConfigs.SystemInterfaces,
      SystemHubs: allSheetConfigs.SystemHubs,
      SystemPeople: allSheetConfigs.SystemPeople,
      SystemStages: allSheetConfigs.SystemStages,
      SystemTouchpoints: allSheetConfigs.SystemTouchpoints,
      SystemPlatforms: allSheetConfigs.SystemPlatforms,
    },
  },
};

// Defines foreign key relationships between different sheets/tables for data integrity checks
export const predefinedRelations: Record<string, Record<string, string>> = {
  MgmtProjects: {
    program_id: 'Programs',
    owner_id: 'SystemPeople',
    hub_id: 'SystemHubs',
  },
  Milestones: {
    project_id: 'MgmtProjects',
    owner_id: 'SystemPeople',
  },
  MgmtTasks: {
    project_id: 'MgmtProjects',
    milestone_id: 'Milestones',
    owner_id: 'SystemPeople',
    hub_id: 'SystemHubs',
    assignee_User_id: 'SystemPeople',
  },
  SystemBusinessUnits: {
    owner_person: 'SystemPeople',
    primary_flywheel: 'SystemFlywheels',
    serves_segment: 'SystemSegments',
  },
  SystemFlywheels: {
    owner_person: 'SystemPeople',
  },
  SystemSegments: {
    owner_person: 'SystemPeople',
  },
};
