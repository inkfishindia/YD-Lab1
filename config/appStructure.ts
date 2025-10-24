// config/appStructure.ts
import * as schemas from '../schemas';

// This is the new single source of truth for the application's data structure requirements.
// It defines each data table the app knows about, its Zod schema for validation, and its primary key.
export const appStructure = {
  // YDS Management
  Programs: { schema: schemas.ProgramSchema, keyField: 'program_id' },
  MgmtProjects: { schema: schemas.MgmtProjectSchema, keyField: 'project_id' },
  Milestones: { schema: schemas.MilestoneSchema, keyField: 'milestone_id' },
  MgmtTasks: { schema: schemas.MgmtTaskSchema, keyField: 'task_id' },
  MgmtHubs: { schema: schemas.MgmtHubSchema, keyField: 'team_id' },
  WeeklyUpdates: { schema: schemas.WeeklyUpdateSchema, keyField: 'update_id' },
  DecisionLogs: { schema: schemas.DecisionLogSchema, keyField: 'decision_id' },

  // Strategy
  'Business Units': { schema: schemas.BusinessUnitSchema, keyField: 'businessUnitId' },
  Flywheels: { schema: schemas.FlywheelSchema, keyField: 'flywheelId' },
  'Customer Segments': { schema: schemas.CustomerSegmentSchema, keyField: 'segmentId' },
  
  // Marketing
  Hubs: { schema: schemas.HubSchema, keyField: 'hubId' },
  Interfaces: { schema: schemas.InterfaceSchema, keyField: 'interface_id' },
  Channels: { schema: schemas.ChannelSchema, keyField: 'channelId' },

  // Partners / Revenue
  Leads: { schema: schemas.LeadSchema, keyField: 'lead_id' },
  Opportunities: { schema: schemas.OpportunitySchema, keyField: 'opportunity_id' },
  Accounts: { schema: schemas.AccountSchema, keyField: 'account_id' },
  Partners: { schema: schemas.PartnerSchema, keyField: 'partnerId' },
  'Cost Structure': { schema: schemas.CostStructureSchema, keyField: 'costId' },
  'Revenue Streams': { schema: schemas.RevenueStreamSchema, keyField: 'revenueStreamId' },

  // YDS App
  BrainDump: { schema: schemas.BrainDumpSchema, keyField: 'braindump_id' },
  Logs: { schema: schemas.LogEntrySchema, keyField: 'log_id' },
  Roles: { schema: schemas.RoleSchema, keyField: 'role_name' },

  // System Map
  SystemSegments: { schema: schemas.SystemSegmentSchema, keyField: 'segment_id' },
  SystemFlywheels: { schema: schemas.SystemFlywheelSchema, keyField: 'flywheel_id' },
  SystemBusinessUnits: { schema: schemas.SystemBusinessUnitSchema, keyField: 'bu_id' },
  SystemChannels: { schema: schemas.SystemChannelSchema, keyField: 'channel_id' },
  SystemInterfaces: { schema: schemas.SystemInterfaceSchema, keyField: 'interface_id' },
  SystemHubs: { schema: schemas.SystemHubSchema, keyField: 'hub_id' },
  SystemPeople: { schema: schemas.SystemPersonSchema, keyField: 'user_id' },
  SystemStages: { schema: schemas.SystemStageSchema, keyField: 'stage_id' },
  SystemTouchpoints: { schema: schemas.SystemTouchpointSchema, keyField: 'touchpoint_id' },
  SystemPlatforms: { schema: schemas.SystemPlatformSchema, keyField: 'platform_id' },
};

export type AppTable = keyof typeof appStructure;