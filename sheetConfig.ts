
import type { Person, Project, Task, BusinessUnit, Flywheel, Lead, Opportunity, Account, BrainDump, LogEntry } from './types';

// Central hub for all spreadsheet IDs
export const SPREADSHEET_IDS = {
  EXECUTION: '156rACoJheFPD4lftBrvVqXScxDp1y8d3msB1tFWbEAc',
  STRATEGY: '1iJ3SoeZiaeBbGm8KIwRYtEKwZQ88FPvQ17o2Xwo-AJc',
  PARTNERS: '1TEcuV4iL_xgf5CYKt7Q_uBt-6T7TejcAlAIKaunQxSs',
  YDS_APP: '1wvjgA8ESxxn_hl86XeL_gOecDjSYPgSo6qyzewP-oJw',
};

// Defines the structure for a column's mapping and type information
type ColumnConfig = {
  header: string; // The exact header name in the Google Sheet
  type?: 'string' | 'number' | 'boolean' | 'string_array';
};

// Defines the structure for a full sheet configuration
export interface SheetConfig<T> {
  spreadsheetId: string;
  range: string;
  keyField: keyof T; // A required field to identify a valid row
  columns: { [K in keyof Partial<T>]: ColumnConfig };
}

// --- Configuration for each data type ---

export const peopleConfig: SheetConfig<Person> = {
  spreadsheetId: SPREADSHEET_IDS.EXECUTION,
  range: 'PEOPLE & CAPACITY!A2:AD',
  keyField: 'user_id',
  columns: {
    user_id: { header: 'User_id' },
    full_name: { header: 'full_name' },
    email: { header: 'email' },
    department: { header: 'department' },
    role_title: { header: 'role_title' },
    manager_id: { header: 'manager_id' },
    is_active: { header: 'is_active', type: 'boolean' },
  },
};

export const projectsConfig: SheetConfig<Project> = {
  spreadsheetId: SPREADSHEET_IDS.EXECUTION,
  range: 'PROJECTS!A2:Z',
  keyField: 'project_id',
  columns: {
    project_id: { header: 'project_id' },
    project_name: { header: 'Project Name' },
    business_unit_id: { header: 'business_unit_id' },
    owner_user_id: { header: 'owner_User_id' },
    priority: { header: 'priority' },
    status: { header: 'Status' },
    start_date: { header: 'start_date' },
    target_end_date: { header: 'target_end_date' },
    budget_planned: { header: 'budget_planned', type: 'number' },
    budget_spent: { header: 'budget_spent', type: 'number' },
  },
};

export const tasksConfig: SheetConfig<Task> = {
  spreadsheetId: SPREADSHEET_IDS.EXECUTION,
  range: 'TASKS!A2:AA',
  keyField: 'task_id',
  columns: {
    task_id: { header: 'task_id' },
    title: { header: 'title' },
    project_id: { header: 'Project id' },
    assignee_user_id: { header: 'assignee_User_id' },
    status: { header: 'status' },
    priority: { header: 'priority' },
    estimate_hours: { header: 'estimate_hours', type: 'number' },
    due_date: { header: 'due_date' },
  },
};

export const businessUnitsConfig: SheetConfig<BusinessUnit> = {
  spreadsheetId: SPREADSHEET_IDS.STRATEGY,
  range: 'BUSINESS UNITS!A2:AC',
  keyField: 'bu_id',
  columns: {
    bu_id: { header: 'bu_id' },
    bu_name: { header: 'bu_name' },
    bu_type: { header: 'bu_type' },
    owner_user_id: { header: 'owner_User_id' },
    health_status: { header: 'health_status' },
    priority_level: { header: 'priority_level' },
    primary_flywheel_id: { header: 'primary_flywheel_id' },
    upsell_flywheel_id: { header: 'Upsell_flywheel_id' },
  },
};

export const flywheelsConfig: SheetConfig<Flywheel> = {
  spreadsheetId: SPREADSHEET_IDS.STRATEGY,
  range: 'Flywheel!A2:X',
  keyField: 'flywheel_id',
  columns: {
    flywheel_id: { header: 'flywheel_id' },
    flywheel_name: { header: 'flywheel_name' },
    customer_type: { header: 'Customer Type' },
    motion: { header: 'Motion' },
    primary_channels: { header: 'primary_channels', type: 'string_array' },
    target_revenue: { header: 'target_revenue', type: 'number' },
  },
};

export const leadsConfig: SheetConfig<Lead> = {
  spreadsheetId: SPREADSHEET_IDS.PARTNERS,
  range: 'LEADS!A2:N',
  keyField: 'lead_id',
  columns: {
    lead_id: { header: 'lead_id' },
    date: { header: 'Date' },
    full_name: { header: 'full_name' },
    email: { header: 'email' },
    phone: { header: 'phone' },
    brand: { header: 'Brand' },
    source_channel: { header: 'source_channel' },
    source_campaign_fk: { header: 'source_campaign_fk' },
    created_at: { header: 'created_at' },
    lead_score: { header: 'lead_score' },
    status_stage: { header: 'status_stage' },
    sdr_owner_fk: { header: 'sdr_owner_fk' },
    last_activity_date: { header: 'last_activity_date' },
    disqualified_reason: { header: 'disqualified_reason' },
  },
};

export const opportunitiesConfig: SheetConfig<Opportunity> = {
  spreadsheetId: SPREADSHEET_IDS.PARTNERS,
  range: 'OPPORTUNITIES!A2:Z',
  keyField: 'opportunity_id',
  columns: {
    opportunity_id: { header: 'opportunity_id' },
    opportunity_name: { header: 'opportunity_name' },
    account_id: { header: 'account_id' },
    stage: { header: 'stage' },
    amount: { header: 'amount', type: 'number' },
    close_date: { header: 'close_date' },
    owner_user_id: { header: 'owner_user_id' },
  },
};

export const accountsConfig: SheetConfig<Account> = {
  spreadsheetId: SPREADSHEET_IDS.PARTNERS,
  range: 'ACCOUNTS!A2:Z',
  keyField: 'account_id',
  columns: {
    account_id: { header: 'account_id' },
    account_name: { header: 'account_name' },
    industry: { header: 'industry' },
    website: { header: 'website' },
    owner_user_id: { header: 'owner_user_id' },
  },
};

export const braindumpConfig: SheetConfig<BrainDump> = {
  spreadsheetId: SPREADSHEET_IDS.YDS_APP,
  range: 'BrainDump!A2:F',
  keyField: 'braindump_id',
  columns: {
    braindump_id: { header: 'braindump_id' },
    timestamp: { header: 'Timestamp' },
    type: { header: 'Type' },
    content: { header: 'Content' },
    user_email: { header: 'UserEmail' },
    priority: { header: 'Priority' },
  },
};

export const logConfig: SheetConfig<LogEntry> = {
  spreadsheetId: SPREADSHEET_IDS.YDS_APP,
  range: 'Login!A2:J',
  keyField: 'log_id',
  columns: {
    timestamp: { header: 'Timestamp' },
    log_type: { header: 'Log Type' },
    content: { header: 'Content / Task' },
    user_email: { header: 'User Email' },
    user_name: { header: 'User Name' },
    priority: { header: 'Priority' },
    assigned_to: { header: 'Assigned To' },
    context: { header: 'Context' },
    success_criteria: { header: 'Success Criteria' },
    status: { header: 'Status' },
  },
};
