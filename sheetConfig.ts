
import type { Person, Project, Task, BusinessUnit, Flywheel, Lead, Opportunity, Account, BrainDump, LogEntry, Role, BuiltInTool, Agent, Hub, Interface, Channel } from './types';
import type { SpreadsheetIds } from './contexts/SpreadsheetConfigContext';

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

// --- Configuration creator functions for each data type ---

export const getRolesConfig = (ids: SpreadsheetIds): SheetConfig<Role> => ({
  spreadsheetId: ids.EXECUTION,
  range: 'ROLES!A2:B',
  keyField: 'role_name',
  columns: {
    role_name: { header: 'role_name' },
    permissions: { header: 'permissions', type: 'string_array' },
  },
});

export const getPeopleConfig = (ids: SpreadsheetIds): SheetConfig<Person> => ({
  spreadsheetId: ids.EXECUTION,
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
    role_name: { header: 'role_name' },
  },
});

export const getProjectsConfig = (ids: SpreadsheetIds): SheetConfig<Project> => ({
  spreadsheetId: ids.EXECUTION,
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
});

export const getTasksConfig = (ids: SpreadsheetIds): SheetConfig<Task> => ({
  spreadsheetId: ids.EXECUTION,
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
});

export const getBusinessUnitsConfig = (ids: SpreadsheetIds): SheetConfig<BusinessUnit> => ({
  spreadsheetId: ids.STRATEGY,
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
});

export const getFlywheelsConfig = (ids: SpreadsheetIds): SheetConfig<Flywheel> => ({
  spreadsheetId: ids.STRATEGY,
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
});

export const getHubsConfig = (ids: SpreadsheetIds): SheetConfig<Hub> => ({
  spreadsheetId: ids.STRATEGY,
  range: 'HUBS!A2:Q',
  keyField: 'hub_id',
  columns: {
    hub_id: { header: 'hub_id' },
    hub_name: { header: 'hub_name' },
    function_category: { header: 'function_category' },
    owner_user_id: { header: 'owner_User_id' },
    what_they_enable: { header: 'what_they_enable' },
    serves_flywheel_ids: { header: 'Serves', type: 'string_array' },
    capacity_constraint: { header: 'capacity_constraint', type: 'boolean' },
    hiring_priority: { header: 'hiring_priority' },
    monthly_budget: { header: 'monthly_budget', type: 'number' },
    serves_bu1: { header: 'BU1', type: 'boolean' },
    serves_bu2: { header: 'BU2', type: 'boolean' },
    serves_bu3: { header: 'BU3', type: 'boolean' },
    serves_bu4: { header: 'BU4', type: 'boolean' },
    serves_bu5: { header: 'BU5', type: 'boolean' },
    serves_bu6: { header: 'BU6', type: 'boolean' },
    notes: { header: 'notes' },
  },
});

export const getInterfacesConfig = (ids: SpreadsheetIds): SheetConfig<Interface> => ({
    spreadsheetId: ids.STRATEGY,
    range: 'interfaces!A2:I',
    keyField: 'interface_id',
    columns: {
        interface_id: { header: 'Interface_id' },
        interface_name: { header: 'Interface_name' },
        interface_category: { header: 'Interface_category' },
        interface_type: { header: 'Interface_type' },
        platform_id: { header: 'Channel id' },
        bu_ids_served: { header: 'bu_ids_served', type: 'string_array' },
        flywheel_id: { header: 'flywheel_id' },
        interface_owner: { header: 'interface_owner' },
        monthly_budget: { header: 'monthly_budget', type: 'number' },
    },
});

export const getChannelsConfig = (ids: SpreadsheetIds): SheetConfig<Channel> => ({
  spreadsheetId: ids.STRATEGY,
  range: 'Channels!A2:E',
  keyField: 'channel_id',
  columns: {
    channel_id: { header: 'Channel id' },
    channel_type: { header: 'Channel type' },
    channel_name: { header: 'Channel name' },
    interfaces: { header: 'Interfaces' },
    focus: { header: 'Focus' },
  },
});

export const getLeadsConfig = (ids: SpreadsheetIds): SheetConfig<Lead> => ({
  spreadsheetId: ids.PARTNERS,
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
});

export const getOpportunitiesConfig = (ids: SpreadsheetIds): SheetConfig<Opportunity> => ({
  spreadsheetId: ids.PARTNERS,
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
});

export const getAccountsConfig = (ids: SpreadsheetIds): SheetConfig<Account> => ({
  spreadsheetId: ids.PARTNERS,
  range: 'ACCOUNTS!A2:Z',
  keyField: 'account_id',
  columns: {
    account_id: { header: 'account_id' },
    account_name: { header: 'account_name' },
    industry: { header: 'industry' },
    website: { header: 'website' },
    owner_user_id: { header: 'owner_user_id' },
  },
});

export const getBrainDumpConfig = (ids: SpreadsheetIds): SheetConfig<BrainDump> => ({
  spreadsheetId: ids.YDS_APP,
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
});

export const getLogConfig = (ids: SpreadsheetIds): SheetConfig<LogEntry> => ({
  spreadsheetId: ids.YDS_APP,
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
});

export const getBuiltInToolsConfig = (ids: SpreadsheetIds): SheetConfig<BuiltInTool> => ({
  spreadsheetId: ids.MANIFEST,
  range: 'Built in tools!A2:E',
  keyField: 'tool_id',
  columns: {
    tool_id: { header: 'tool_id' },
    Tool: { header: 'Tool' },
    Category: { header: 'Category' },
    Alternate: { header: 'Alternate' },
    Use: { header: 'Use' },
  },
});

export const getAgentsConfig = (ids: SpreadsheetIds): SheetConfig<Agent> => ({
  spreadsheetId: ids.MANIFEST,
  range: 'Agents!A2:I',
  keyField: 'agent_id',
  columns: {
    agent_id: { header: 'agent_id' },
    Use: { header: 'Use' },
    Role: { header: 'Role' },
    Persona: { header: 'Persona' },
    Character: { header: 'Character' },
    Function: { header: 'Function' },
    Prompt: { header: 'Prompt' },
    Guidelines: { header: 'Guidelines' },
    References: { header: 'References' },
  },
});