
export enum Priority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Critical = 'Critical'
}

export enum Status {
  NotStarted = 'Not Started',
  InProgress = 'In Progress',
  Completed = 'Completed',
  OnHold = 'On Hold',
  Cancelled = 'Cancelled'
}

export enum HealthStatus {
    OnTrack = 'On Track',
    AtRisk = 'At Risk',
    OffTrack = 'Off Track'
}

export enum LeadStatus {
    New = 'New',
    Contacted = 'Contacted',
    Qualified = 'Qualified',
    Disqualified = 'Disqualified',
}

export enum OpportunityStage {
    Prospecting = 'Prospecting',
    Qualification = 'Qualification',
    Proposal = 'Proposal',
    Negotiation = 'Negotiation',
    ClosedWon = 'Closed Won',
    ClosedLost = 'Closed Lost',
}

export interface Role {
  role_name: string;
  permissions: string[];
}

export interface LogEntry {
  log_id: string;
  timestamp: string;
  log_type: string;
  content: string;
  user_email: string;
  user_name: string;
  priority?: Priority;
  assigned_to?: string;
  context?: string;
  success_criteria?: string;
  status?: Status;
}

export interface Person {
  user_id: string;
  full_name: string;
  email: string;
  department: string;
  role_title: string;
  manager_id?: string;
  is_active: boolean;
  role_name: string;
}

export interface Project {
  project_id: string;
  project_name: string;
  business_unit_id: string;
  owner_user_id: string;
  priority: Priority;
  status: Status;
  start_date: string;
  target_end_date: string;
  budget_planned: number;
  budget_spent: number;
}

export interface Task {
  task_id: string;
  title: string;
  project_id: string;
  assignee_user_id: string;
  status: Status;
  priority: Priority;
  estimate_hours: number;
  due_date: string;
}

export interface BusinessUnit {
    bu_id: string;
    bu_name: string;
    bu_type: string;
    owner_user_id: string;
    health_status: HealthStatus;
    priority_level: Priority;
    primary_flywheel_id: string;
    upsell_flywheel_id?: string;
}

export interface Flywheel {
    flywheel_id: string;
    flywheel_name: string;
    customer_type: string;
    motion: string;
    primary_channels: string[];
    target_revenue: number;
}

export interface Lead {
    lead_id: string;
    date: string;
    full_name: string;
    email: string;
    phone: string;
    brand: string;
    source_channel: string;
    source_campaign_fk?: string;
    created_at: string;
    lead_score?: string;
    status_stage: LeadStatus;
    sdr_owner_fk?: string;
    last_activity_date?: string;
    disqualified_reason?: string;
}

export interface Opportunity {
    opportunity_id: string;
    opportunity_name: string;
    account_id: string;
    stage: OpportunityStage;
    amount: number;
    close_date: string;
    owner_user_id: string;
}

export interface Account {
    account_id: string;
    account_name: string;
    industry: string;
    website: string;
    owner_user_id: string;
}

export interface BrainDump {
  braindump_id: string;
  timestamp: string;
  type: string;
  content: string;
  user_email: string;
  priority: Priority;
}

export interface BuiltInTool {
  tool_id: string;
  Tool: string;
  Category: string;
  Alternate: string;
  Use: string;
}

export interface Agent {
  agent_id: string;
  Use: string;
  Role: string;
  Persona: string;
  Character: string;
  Function: string;
  Prompt: string;
  Guidelines: string;
  References: string;
}

export interface Hub {
  hub_id: string;
  hub_name: string;
  function_category: string;
  owner_user_id: string;
  what_they_enable: string;
  serves_flywheel_ids: string[];
  capacity_constraint: boolean;
  hiring_priority: string;
  monthly_budget: number;
  serves_bu1: boolean;
  serves_bu2: boolean;
  serves_bu3: boolean;
  serves_bu4: boolean;
  serves_bu5: boolean;
  serves_bu6: boolean;
  notes: string;
}

export interface Interface {
    interface_id: string;
    interface_name: string;
    interface_category: string;
    interface_type: string;
    platform_id?: string;
    bu_ids_served: string[];
    flywheel_id: string;
    interface_owner: string;
    monthly_budget: number;
}

export interface Channel {
  channel_id: string;
  channel_type: string;
  channel_name: string;
  interfaces: string;
  focus: string;
}