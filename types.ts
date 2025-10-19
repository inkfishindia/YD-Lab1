// types.ts
import { z } from 'zod';
import {
  StatusSchema,
  PrioritySchema,
  HealthStatusSchema,
  LeadStatusSchema,
  OpportunityStageSchema,
  RoleSchema,
  PersonSchema,
  ProjectSchema,
  TaskSchema,
  BusinessUnitSchema,
  CustomerSegmentSchema,
  FlywheelSchema,
  AccountSchema,
  OpportunitySchema,
  LeadSchema,
  BrainDumpSchema,
  LogEntrySchema,
  HubSchema,
  InterfaceSchema,
  ChannelSchema,
  SystemSegmentSchema,
  SystemFlywheelSchema,
  SystemBusinessUnitSchema,
  SystemChannelSchema,
  SystemInterfaceSchema,
  SystemHubSchema,
  SystemPersonSchema,
  SystemStageSchema,
  SystemTouchpointSchema,
  SystemPlatformSchema,
  ProgramSchema,
  MgmtProjectSchema,
  MilestoneSchema,
  MgmtTaskSchema,
  MgmtHubSchema,
  WeeklyUpdateSchema,
  DecisionLogSchema,
  FlywheelStrategySchema,
  SegmentPositioningSchema,
  FunnelStageSchema,
  InterfaceMapSchema,
  AppSheetRowSchema,
  MasterSchemaRowSchema,
} from './schemas';

// Enums derived from Zod schemas
export type Status = z.infer<typeof StatusSchema>;
export const Status = StatusSchema.enum;

export type Priority = z.infer<typeof PrioritySchema>;
export const Priority = PrioritySchema.enum;

export type HealthStatus = z.infer<typeof HealthStatusSchema>;
export const HealthStatus = HealthStatusSchema.enum;

export type LeadStatus = z.infer<typeof LeadStatusSchema>;
export const LeadStatus = LeadStatusSchema.enum;

export type OpportunityStage = z.infer<typeof OpportunityStageSchema>;
export const OpportunityStage = OpportunityStageSchema.enum;

// Entity types derived from Zod schemas
export type Role = z.infer<typeof RoleSchema>;
export type Person = z.infer<typeof PersonSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type Task = z.infer<typeof TaskSchema>;
export type BusinessUnit = z.infer<typeof BusinessUnitSchema>;
export type CustomerSegment = z.infer<typeof CustomerSegmentSchema>;
export type Flywheel = z.infer<typeof FlywheelSchema>;
export type Account = z.infer<typeof AccountSchema>;
export type Opportunity = z.infer<typeof OpportunitySchema>;
export type Lead = z.infer<typeof LeadSchema>;
export type BrainDump = z.infer<typeof BrainDumpSchema>;
export type LogEntry = z.infer<typeof LogEntrySchema>;
export type Hub = z.infer<typeof HubSchema>;
export type Interface = z.infer<typeof InterfaceSchema>;
export type Channel = z.infer<typeof ChannelSchema>;
export type SystemSegment = z.infer<typeof SystemSegmentSchema>;
export type SystemFlywheel = z.infer<typeof SystemFlywheelSchema>;
export type SystemBusinessUnit = z.infer<typeof SystemBusinessUnitSchema>;
export type SystemChannel = z.infer<typeof SystemChannelSchema>;
export type SystemInterface = z.infer<typeof SystemInterfaceSchema>;
export type SystemHub = z.infer<typeof SystemHubSchema>;
export type SystemPerson = z.infer<typeof SystemPersonSchema>;
export type SystemStage = z.infer<typeof SystemStageSchema>;
export type SystemTouchpoint = z.infer<typeof SystemTouchpointSchema>;
export type SystemPlatform = z.infer<typeof SystemPlatformSchema>;
export type Program = z.infer<typeof ProgramSchema>;
export type MgmtProject = z.infer<typeof MgmtProjectSchema>;
export type Milestone = z.infer<typeof MilestoneSchema>;
export type MgmtTask = z.infer<typeof MgmtTaskSchema>;
export type MgmtHub = z.infer<typeof MgmtHubSchema>;
export type WeeklyUpdate = z.infer<typeof WeeklyUpdateSchema>;
export type DecisionLog = z.infer<typeof DecisionLogSchema>;

// This is the single source of truth for entity types used in the System Map.
export type SystemEntityType =
  | 'segment'
  | 'flywheel'
  | 'bu'
  | 'channel'
  | 'hub'
  | 'person'
  | 'interface'
  | 'stage'
  | 'touchpoint';

// Positioning Page types
export type FlywheelStrategy = z.infer<typeof FlywheelStrategySchema>;
export type SegmentPositioning = z.infer<typeof SegmentPositioningSchema>;
export type FunnelStage = z.infer<typeof FunnelStageSchema>;
export type InterfaceMap = z.infer<typeof InterfaceMapSchema>;

// Represents one row in the 'App' sheet for spreadsheet ID configuration.
export type AppSheetRow = z.infer<typeof AppSheetRowSchema>;
// Represents one row in the Master Schema sheet.
export type MasterSchemaRow = z.infer<typeof MasterSchemaRowSchema>;