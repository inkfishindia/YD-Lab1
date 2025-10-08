
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