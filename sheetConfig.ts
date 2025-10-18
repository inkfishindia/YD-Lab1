// FIX: Add missing type imports for new data models.
import { Person, Project, Task, BusinessUnit, Flywheel, Lead, Opportunity, Account, BrainDump, LogEntry, Role, Hub, Interface, Channel, CustomerSegment, SystemSegment, SystemFlywheel, SystemBusinessUnit, SystemChannel, SystemInterface, SystemHub, SystemPerson, SystemStage, SystemTouchpoint, Program, MgmtProject, Milestone, MgmtTask, MgmtHub, WeeklyUpdate, DecisionLog, SystemPlatform } from './types';
import type { SpreadsheetIds } from './contexts/SpreadsheetConfigContext';

// Defines the structure for a column's mapping and type information
type ColumnConfig = {
  header: string; // The exact header name in the Google Sheet
  type?: 'string' | 'number' | 'boolean' | 'string_array';
};

// Defines the structure for a full sheet configuration
export interface SheetConfig<T> {
  spreadsheetId: string;
  gid: string;
  range: string;
  keyField: keyof T; // A required field to identify a valid row
  columns: { [K in keyof Partial<T>]: ColumnConfig };
}

// --- Centralized Sheet Metadata ---
interface SheetMeta {
  spreadsheetIdKey: keyof SpreadsheetIds;
  gid: string;
  range: string;
}

const sheetMetadata: Record<string, SheetMeta> = {
    'Customer Segments': { spreadsheetIdKey: 'STRATEGY', gid: '1469082015', range: 'Customer Segment & foundation!A2:L' },
    'Roles': { spreadsheetIdKey: 'YDS_APP', gid: '1446257232', range: 'ROLES!A2:B' },
    'People': { spreadsheetIdKey: 'YDC_BASE', gid: '1401300909', range: 'People!A2:K' },
    'Business Units': { spreadsheetIdKey: 'STRATEGY', gid: '0', range: 'BUSINESS UNITS!A2:AC' },
    'Flywheels': { spreadsheetIdKey: 'STRATEGY', gid: '225662612', range: 'Flywheels!A2:X' },
    'Hubs': { spreadsheetIdKey: 'STRATEGY', gid: '1390706317', range: 'HUBS!A2:Q' },
    'Interfaces': { spreadsheetIdKey: 'STRATEGY', gid: '991325109', range: 'Interfaces!A2:P' },
    'Channels': { spreadsheetIdKey: 'STRATEGY', gid: '1547192215', range: 'Channels!A2:E' },
    'Leads': { spreadsheetIdKey: 'PARTNERS', gid: '0', range: 'LEADS!A2:N' },
    'Opportunities': { spreadsheetIdKey: 'PARTNERS', gid: '1309185010', range: 'OPPORTUNITIES!A2:Z' },
    'Accounts': { spreadsheetIdKey: 'PARTNERS', gid: '878063251', range: 'ACCOUNTS!A2:Z' },
    'BrainDump': { spreadsheetIdKey: 'YDS_APP', gid: '0', range: 'BrainDump!A2:F' },
    'Logs': { spreadsheetIdKey: 'YDS_APP', gid: '288121377', range: 'Login!A2:J' },
    'Programs': { spreadsheetIdKey: 'YDS_MANAGEMENT', gid: '0', range: 'PROGRAMS!A2:AV' },
    'MgmtProjects': { spreadsheetIdKey: 'YDS_MANAGEMENT', gid: '719163995', range: 'Project!A2:AH' },
    'Milestones': { spreadsheetIdKey: 'YDS_MANAGEMENT', gid: '246947641', range: 'Milestones!A2:S' },
    'MgmtTasks': { spreadsheetIdKey: 'YDS_MANAGEMENT', gid: '963211628', range: 'task!A2:W' },
    'MgmtHubs': { spreadsheetIdKey: 'YDS_MANAGEMENT', gid: '613303457', range: 'Teams!A2:S' },
    'WeeklyUpdates': { spreadsheetIdKey: 'YDS_MANAGEMENT', gid: '1149179491', range: 'WEEKLY UPDATES (Accountability Cadence)!A2:H' },
    'DecisionLogs': { spreadsheetIdKey: 'YDS_MANAGEMENT', gid: '891153943', range: 'decision log!A2:I' },
    'SystemSegments': { spreadsheetIdKey: 'YDC_BASE', gid: '1781117501', range: 'Segments!A2:CE' },
    'SystemFlywheels': { spreadsheetIdKey: 'YDC_BASE', gid: '294604957', range: 'Flywheels!A2:W' },
    'SystemBusinessUnits': { spreadsheetIdKey: 'YDC_BASE', gid: '1410852755', range: 'BusinessUnits!A2:AD' },
    'SystemChannels': { spreadsheetIdKey: 'YDC_BASE', gid: '2050534733', range: 'Channels!A2:U' },
    'SystemInterfaces': { spreadsheetIdKey: 'YDC_BASE', gid: '1827583571', range: 'Interfaces!A2:S' },
    'SystemHubs': { spreadsheetIdKey: 'YDC_BASE', gid: '1497542620', range: 'Hubs!A2:R' },
    'SystemPeople': { spreadsheetIdKey: 'YDC_BASE', gid: '1401300909', range: 'People!A2:AC' },
    'SystemStages': { spreadsheetIdKey: 'YDC_BASE', gid: '723169112', range: 'Stages!A2:P' },
    'SystemTouchpoints': { spreadsheetIdKey: 'YDC_BASE', gid: '1159260118', range: 'Touchpoints!A2:X' },
    'SystemPlatforms': { spreadsheetIdKey: 'YDC_BASE', gid: '1973686307', range: 'Platforms!A2:H' },
};

export const predefinedRelations: Record<string, Record<string, string>> = {
    'MgmtProjects': {
        owner_id: 'SystemPeople',
        program_id: 'Programs',
        hub_id: 'SystemHubs',
    },
    'MgmtTasks': {
        project_id: 'MgmtProjects',
        milestone_id: 'Milestones',
        owner_id: 'SystemPeople',
        hub_id: 'SystemHubs',
    },
    'Programs': {
        owner_person_id: 'SystemPeople',
        owner_hub_id: 'SystemHubs',
    },
    'SystemBusinessUnits': {
        owner_person: 'SystemPeople',
        primary_flywheel: 'SystemFlywheels',
        serves_segment: 'SystemSegments',
    },
     'SystemFlywheels': {
        owner_person: 'SystemPeople',
    },
    'SystemSegments': {
        owner_person: 'SystemPeople',
    },
    'SystemChannels': {
        responsible_person: 'SystemPeople',
    },
     'SystemInterfaces': {
        responsible_person: 'SystemPeople',
        owned_by_hub: 'SystemHubs',
    },
    'SystemHubs': {
        owner_person: 'SystemPeople',
    },
    'SystemPeople': {
        primary_hub: 'SystemHubs',
    }
};


// --- Configuration creator functions for each data type ---

export const getCustomerSegmentsConfig = (ids: SpreadsheetIds): SheetConfig<CustomerSegment> => {
    const meta = sheetMetadata['Customer Segments'];
    return {
        spreadsheetId: ids[meta.spreadsheetIdKey],
        gid: meta.gid,
        range: meta.range,
        keyField: 'customer_segment',
        columns: {
            customer_segment: { header: 'Customer segment' },
            purpose: { header: 'Purpose' },
            vission: { header: 'Vission' },
            mission: { header: 'Mission' },
            expression: { header: 'Expression' },
            psychological_job_to_be_done: { header: 'Psychological Job-to-be-Done:' },
            behavioral_truth: { header: 'Behavioral Truth' },
            brand_position_for_them: { header: 'Brand Position for Them:' },
            messaging_tone: { header: 'Messaging Tone:' },
            design_pov: { header: 'Design POV' },
            flywheel_id: { header: 'Flywheel_Id' },
        },
    };
};

export const getRolesConfig = (ids: SpreadsheetIds): SheetConfig<Role> => {
    const meta = sheetMetadata['Roles'];
    return {
        spreadsheetId: ids[meta.spreadsheetIdKey],
        gid: meta.gid,
        range: meta.range,
        keyField: 'role_name',
        columns: {
            role_name: { header: 'role' },
            permissions: { header: 'permissions', type: 'string_array' },
        },
    };
};

export const getPeopleConfig = (ids: SpreadsheetIds): SheetConfig<Person> => {
    const meta = sheetMetadata['People'];
    return {
        spreadsheetId: ids[meta.spreadsheetIdKey],
        gid: meta.gid,
        range: meta.range,
        keyField: 'user_id',
        columns: {
            user_id: { header: 'User_Id' },
            full_name: { header: 'full_name' },
            email: { header: 'email' },
            department: { header: 'primary_hub_Name' },
            role_title: { header: 'role' },
            role_name: { header: 'role' },
        },
    };
};

export const getBusinessUnitsConfig = (ids: SpreadsheetIds): SheetConfig<BusinessUnit> => {
    const meta = sheetMetadata['Business Units'];
    return {
        spreadsheetId: ids[meta.spreadsheetIdKey],
        gid: meta.gid,
        range: meta.range,
        keyField: 'bu_id',
        columns: {
            bu_id: { header: 'bu_id' },
            bu_name: { header: 'bu_name' },
            bu_type: { header: 'bu_type' },
            customerType: { header: 'Customer Type' },
            order_volume_range: { header: 'order_volume_range' },
            offering: { header: 'Offering' },
            platform_type: { header: 'platform_type' },
            interface: { header: 'interface' },
            pricing_model: { header: 'pricing_model' },
            primary_flywheel_id: { header: 'primary_flywheel_id' },
            upsell_flywheel_id: { header: 'Upsell_flywheel_id' },
            avg_order_value: { header: 'avg_order_value', type: 'number' },
            target_margin_pct: { header: 'target_margin_pct', type: 'number' },
            tech_build: { header: 'Tech Build' },
            sales_motion: { header: 'Sales Motion' },
            support_type: { header: 'Support Type' },
            pricing_logic: { header: 'Pricing Logic' },
            owner_user_id: { header: 'owner_User_id' },
            current_revenue: { header: 'current_revenue', type: 'number' },
            current_orders: { header: 'current_orders', type: 'number' },
            variance_pct: { header: 'variance_pct' },
            health_status: { header: 'health_status' },
            growth_rate_required: { header: 'growth_rate_required', type: 'number' },
            priority_level: { header: 'priority_level' },
            status: { header: 'status' },
        },
    };
};

export const getFlywheelsConfig = (ids: SpreadsheetIds): SheetConfig<Flywheel> => {
    const meta = sheetMetadata['Flywheels'];
    return {
        spreadsheetId: ids[meta.spreadsheetIdKey],
        gid: meta.gid,
        range: meta.range,
        keyField: 'flywheel_id',
        columns: {
            flywheel_id: { header: 'flywheel_id' },
            flywheel_name: { header: 'flywheel_name' },
            customer_type: { header: 'Customer Type' },
            description: { header: 'description' },
            motion: { header: 'Motion' },
            interface: { header: 'Interface' },
            customer_acquisition_motion: { header: 'customer_acquisition_motion' },
            notes: { header: 'notes' },
            primary_channels: { header: 'primary_channels', type: 'string_array' },
            order_size: { header: 'Order Size' },
            hub_dependencies: { header: 'Hub Dependencies', type: 'string_array' },
            key_metrics: { header: 'Key Metrics', type: 'string_array' },
            revenue_driver: { header: 'Revenue Driver', type: 'number' },
            revenue_model: { header: 'Revenue Model', type: 'number' },
            what_drives_growth: { header: 'What Drives Growth' },
            economics: { header: 'Economics', type: 'string_array' },
            target_revenue: { header: 'target_revenue', type: 'number' },
            target_orders: { header: 'target_orders', type: 'number' },
            avg_cac: { header: 'avg_cac', type: 'number' },
            avg_ltv: { header: 'avg_ltv', type: 'number' },
            conversion_rate_pct: { header: 'conversion_rate_pct', type: 'number' },
        },
    };
};

export const getHubsConfig = (ids: SpreadsheetIds): SheetConfig<Hub> => {
    const meta = sheetMetadata['Hubs'];
    return {
        spreadsheetId: ids[meta.spreadsheetIdKey],
        gid: meta.gid,
        range: meta.range,
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
    };
};

export const getInterfacesConfig = (ids: SpreadsheetIds): SheetConfig<Interface> => {
    const meta = sheetMetadata['Interfaces'];
    return {
        spreadsheetId: ids[meta.spreadsheetIdKey],
        gid: meta.gid,
        range: meta.range,
        keyField: 'interface_id',
        columns: {
            interface_id: { header: 'Interface_id' },
            interface_name: { header: 'Interface_name' },
            channel_id: { header: 'Channel id' },
            interface_goal: { header: 'Interface_goal' },
            interface_category: { header: 'Interface_category' },
            interface_type: { header: 'Interface_type' },
            platform_id: { header: 'platform_id' },
            bu_ids_served: { header: 'bu_ids_served', type: 'string_array' },
            flywheel_id: { header: 'flywheel_id' },
            interface_owner: { header: 'Interface_owner' },
            monthly_budget: { header: 'monthly_budget', type: 'number' },
            cost_model: { header: 'cost_model', type: 'number' },
            avg_cac: { header: 'avg_cac', type: 'number' },
            avg_conversion_rate: { header: 'avg_conversion_rate', type: 'number' },
            interface_status: { header: 'Interface_status' },
            notes: { header: 'notes' },
        },
    };
};

export const getChannelsConfig = (ids: SpreadsheetIds): SheetConfig<Channel> => {
    const meta = sheetMetadata['Channels'];
    return {
        spreadsheetId: ids[meta.spreadsheetIdKey],
        gid: meta.gid,
        range: meta.range,
        keyField: 'channel_id',
        columns: {
            channel_id: { header: 'Channel id' },
            channel_type: { header: 'Channel type' },
            channel_name: { header: 'Channel name' },
            interfaces: { header: 'Interfaces' },
            focus: { header: 'Focus' },
        },
    };
};

export const getLeadsConfig = (ids: SpreadsheetIds): SheetConfig<Lead> => {
    const meta = sheetMetadata['Leads'];
    return {
        spreadsheetId: ids[meta.spreadsheetIdKey],
        gid: meta.gid,
        range: meta.range,
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
};

export const getOpportunitiesConfig = (ids: SpreadsheetIds): SheetConfig<Opportunity> => {
    const meta = sheetMetadata['Opportunities'];
    return {
        spreadsheetId: ids[meta.spreadsheetIdKey],
        gid: meta.gid,
        range: meta.range,
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
};

export const getAccountsConfig = (ids: SpreadsheetIds): SheetConfig<Account> => {
    const meta = sheetMetadata['Accounts'];
    return {
        spreadsheetId: ids[meta.spreadsheetIdKey],
        gid: meta.gid,
        range: meta.range,
        keyField: 'account_id',
        columns: {
            account_id: { header: 'account_id' },
            account_name: { header: 'account_name' },
            industry: { header: 'industry' },
            website: { header: 'website' },
            owner_user_id: { header: 'owner_user_id' },
        },
    };
};

export const getBrainDumpConfig = (ids: SpreadsheetIds): SheetConfig<BrainDump> => {
    const meta = sheetMetadata['BrainDump'];
    return {
        spreadsheetId: ids[meta.spreadsheetIdKey],
        gid: meta.gid,
        range: meta.range,
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
};

export const getLogConfig = (ids: SpreadsheetIds): SheetConfig<LogEntry> => {
    const meta = sheetMetadata['Logs'];
    return {
        spreadsheetId: ids[meta.spreadsheetIdKey],
        gid: meta.gid,
        range: meta.range,
        keyField: 'log_id',
        columns: {
            log_id: { header: 'log_id' },
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
};

// --- YDS Management System Configs ---
export const getProgramsConfig = (ids: SpreadsheetIds): SheetConfig<Program> => {
    const meta = sheetMetadata['Programs'];
    return {
        spreadsheetId: ids[meta.spreadsheetIdKey],
        gid: meta.gid,
        range: meta.range,
        keyField: 'program_id',
        columns: {
            program_id: { header: 'program_id' },
            program_name: { header: 'program_name' },
            flywheel_id: { header: 'flywheel_id' },
            status: { header: 'status' },
            priority: { header: 'priority' },
            owner_person_id: { header: 'owner_person_id' },
            owner_hub_id: { header: 'owner_hub_id' },
            contributing_hub_ids: { header: 'contributing_hub_ids' },
            serves_segment_ids: { header: 'serves_segment_ids' },
            linked_business_unit_ids: { header: 'linked_business_unit_ids' },
            customer_problem: { header: 'customer_problem' },
            our_solution: { header: 'our_solution' },
            why_now: { header: 'why_now' },
            timeline_start: { header: 'timeline_start' },
            timeline_end: { header: 'timeline_end' },
            success_metric: { header: 'success_metric' },
            target_value: { header: 'target_value', type: 'number' },
            current_value: { header: 'current_value', type: 'number' },
            days_total: { header: 'days_total', type: 'number' },
            days_elapsed: { header: 'days_elapsed', type: 'number' },
            days_remaining: { header: 'days_remaining', type: 'number' },
            timeline_progress_pct: { header: 'timeline_progress_pct', type: 'number' },
            metric_progress_pct: { header: 'metric_progress_pct', type: 'number' },
            budget_total: { header: 'budget_total', type: 'number' },
            budget_spent: { header: 'budget_spent', type: 'number' },
            budget_remaining: { header: 'budget_remaining', type: 'number' },
            budget_burn_rate_pct: { header: 'budget_burn_rate_pct', type: 'number' },
            risk_level: { header: 'risk_level' },
            health_status: { header: 'health_status' },
            blockers: { header: 'blockers' },
            next_milestone: { header: 'next_milestone' },
            next_milestone_date: { header: 'next_milestone_date' },
            days_to_next_milestone: { header: 'days_to_next_milestone', type: 'number' },
            dependent_program_ids: { header: 'dependent_program_ids' },
            platform_ids: { header: 'platform_ids' },
            channel_ids: { header: 'channel_ids' },
            projects_count: { header: 'projects_count', type: 'number' },
            projects_active: { header: 'projects_active', type: 'number' },
            projects_blocked: { header: 'projects_blocked', type: 'number' },
            projects_complete: { header: 'projects_complete', type: 'number' },
            program_completion_pct: { header: 'program_completion_pct', type: 'number' },
            tasks_total: { header: 'tasks_total', type: 'number' },
            tasks_complete: { header: 'tasks_complete', type: 'number' },
            tasks_blocked: { header: 'tasks_blocked', type: 'number' },
            created_date: { header: 'created_date' },
            last_updated: { header: 'last_updated' },
            updated_by_person_id: { header: 'updated_by_person_id' },
            notes: { header: 'notes' },
        },
    };
};

export const getMgmtProjectsConfig = (ids: SpreadsheetIds): SheetConfig<MgmtProject> => {
    const meta = sheetMetadata['MgmtProjects'];
    return {
        spreadsheetId: ids[meta.spreadsheetIdKey],
        gid: meta.gid,
        range: meta.range,
        keyField: 'project_id',
        columns: {
            project_id: { header: 'project_id' },
            project_name: { header: 'project_name' },
            program_id: { header: 'program_id' },
            program_name: { header: 'program_name' },
            owner_id: { header: 'owner_id' },
            owner_name: { header: 'owner_name' },
            hub_id: { header: 'hub_id' },
            hub_name: { header: 'hub_name' },
            status: { header: 'status' },
            priority: { header: 'priority' },
            start_date: { header: 'start_date' },
            end_date: { header: 'end_date' },
            budget: { header: 'budget', type: 'number' },
            dependencies: { header: 'dependencies' },
            success_metric: { header: 'success_metric' },
            revenue_impact: { header: 'revenue_impact' },
            project_type: { header: 'project_type' },
            business_unit_impact: { header: 'business_unit_impact' },
            segment_impact: { header: 'segment_impact' },
            platform_id: { header: 'platform_id' },
            channel_ids: { header: 'channel_ids' },
            completion_pct: { header: 'completion_pct', type: 'number' },
            health_score: { header: 'health_score' },
            actual_end_date: { header: 'actual_end_date' },
            milestones_count: { header: 'milestones_count', type: 'number' },
            tasks_count: { header: 'tasks_count', type: 'number' },
            tasks_complete: { header: 'tasks_complete', type: 'number' },
            tasks_in_progress: { header: 'tasks_in_progress', type: 'number' },
            tasks_blocked: { header: 'tasks_blocked', type: 'number' },
            days_to_deadline: { header: 'days_to_deadline' },
            budget_spent: { header: 'budget_spent', type: 'number' },
            budget_variance: { header: 'budget_variance', type: 'number' },
            velocity_tasks_per_day: { header: 'velocity_tasks_per_day', type: 'number' },
            is_on_time: { header: 'is_on_time' },
        },
    };
};

export const getMilestonesConfig = (ids: SpreadsheetIds): SheetConfig<Milestone> => {
    const meta = sheetMetadata['Milestones'];
    return {
        spreadsheetId: ids[meta.spreadsheetIdKey],
        gid: meta.gid,
        range: meta.range,
        keyField: 'milestone_id',
        columns: {
            milestone_id: { header: 'milestone_id' },
            project_id: { header: 'project_id' },
            milestone_name: { header: 'milestone_name' },
            owner: { header: 'owner' },
            start_date: { header: 'start_date' },
            target_date: { header: 'target_date' },
            status: { header: 'status' },
            completion_pct: { header: 'completion_%', type: 'number' },
            blocker: { header: 'Task_blocker' },
            owner_id: { header: 'owner_id' },
            owner_name: { header: 'owner_name' },
            Tasks_Count: { header: 'Tasks_Count' },
            Tasks_Complete: { header: 'Tasks_Complete', type: 'number' },
            'Calc_Completion_%': { header: 'Calc_Completion_%', type: 'number' },
            Days_to_Target: { header: 'Days_to_Target' },
            milestone_type: { header: 'milestone_type' },
            blocker_type: { header: 'blocker_type' },
            dependent_milestone_ids: { header: 'dependent_milestone_ids' },
            actual_completion_date: { header: 'actual_completion_date' },
        },
    };
};

export const getMgmtTasksConfig = (ids: SpreadsheetIds): SheetConfig<MgmtTask> => {
    const meta = sheetMetadata['MgmtTasks'];
    return {
        spreadsheetId: ids[meta.spreadsheetIdKey],
        gid: meta.gid,
        range: meta.range,
        keyField: 'task_id',
        columns: {
            task_id: { header: 'task_id' },
            project_id: { header: 'project_id' },
            milestone_id: { header: 'milestone_id' },
            task_name: { header: 'task_name' },
            owner_id: { header: 'owner_id' },
            owner_name: { header: 'owner_name' },
            hub_id: { header: 'hub_id' },
            hub_name: { header: 'hub_name' },
            description: { header: 'description' },
            priority: { header: 'priority' },
            status: { header: 'status' },
            effort_hours: { header: 'effort_hours', type: 'number' },
            due_date: { header: 'due_date' },
            dependencies: { header: 'dependencies' },
            assignee_ids: { header: 'assignee_ids' },
            task_category: { header: 'task_category' },
            task_type: { header: 'task_type' },
            actual_completion_date: { header: 'actual_completion_date' },
            notes: { header: 'notes' },
            impact_if_delayed: { header: 'impact_if_delayed' },
        },
    };
};

export const getMgmtHubsConfig = (ids: SpreadsheetIds): SheetConfig<MgmtHub> => {
    const meta = sheetMetadata['MgmtHubs'];
    return {
        spreadsheetId: ids[meta.spreadsheetIdKey],
        gid: meta.gid,
        range: meta.range,
        keyField: 'hub_id',
        columns: {
            team_id: { header: 'team_id' },
            team_name: { header: 'team_name' },
            hub_id: { header: 'hub_id' },
            agency_function: { header: 'agency_function' },
            primary_kpi: { header: 'primary_kpi' },
            budget_monthly: { header: 'budget_monthly', type: 'number' },
            headcount: { header: 'headcount', type: 'number' },
        },
    };
};

export const getWeeklyUpdatesConfig = (ids: SpreadsheetIds): SheetConfig<WeeklyUpdate> => {
    const meta = sheetMetadata['WeeklyUpdates'];
    return {
        spreadsheetId: ids[meta.spreadsheetIdKey],
        gid: meta.gid,
        range: meta.range,
        keyField: 'update_id',
        columns: {
            update_id: { header: 'update_id' },
            project_id: { header: 'project_id' },
            week_ending: { header: 'week_ending' },
            owner: { header: 'owner' },
            status_color: { header: 'status_color' },
            progress_summary: { header: 'progress_summary' },
            blockers: { header: 'blockers' },
            decisions_needed: { header: 'decisions_needed' },
        },
    };
};

export const getDecisionLogsConfig = (ids: SpreadsheetIds): SheetConfig<DecisionLog> => {
    const meta = sheetMetadata['DecisionLogs'];
    return {
        spreadsheetId: ids[meta.spreadsheetIdKey],
        gid: meta.gid,
        range: meta.range,
        keyField: 'decision_id',
        columns: {
            decision_id: { header: 'decision_id' },
            date: { header: 'date' },
            decision_maker: { header: 'decision_maker' },
            project_id: { header: 'project_id' },
            decision: { header: 'decision' },
            rationale: { header: 'rationale' },
            alternatives_considered: { header: 'alternatives_considered' },
            impact: { header: 'impact' },
        },
    };
};

// --- System Map Configs ---
export const getSystemSegmentsConfig = (ids: SpreadsheetIds): SheetConfig<SystemSegment> => {
  const meta = sheetMetadata['SystemSegments'];
  return {
    spreadsheetId: ids[meta.spreadsheetIdKey],
    gid: meta.gid,
    range: meta.range,
    keyField: 'segment_id',
    columns: {
      segment_id: { header: 'segment_id' },
      segment_name: { header: 'segment_name' },
      customer_facing: { header: 'customer_facing' },
      Positioning: { header: 'Positioning' },
      For: { header: 'For' },
      Against: { header: 'Against' },
      Promise: { header: 'Promise' },
      priority_rank: { header: 'priority_rank' },
      customer_profile: { header: 'customer_profile' },
      psychological_job: { header: 'psychological_job' },
      served_by_flywheels: { header: 'served_by_flywheels_ids', type: 'string_array' },
      Platforms: { header: 'Platforms' },
      behavioral_truth: { header: 'behavioral_truth' },
      validated_aov: { header: 'validated_aov', type: 'number' },
      annual_orders: { header: 'annual_orders', type: 'number' },
      contribution_margin_pct: { header: 'contribution_margin_pct' },
      validated_cac: { header: 'validated_cac' },
      annual_ltv: { header: 'annual_ltv', type: 'number' },
      ltv_cac_ratio: { header: 'ltv_cac_ratio' },
      validation_status: { header: 'validation_status' },
      owner_person: { header: 'owner_person_id' },
      owner_person_Name: { header: 'owner_person_name' },
      strategic_notes: { header: 'strategic_notes' },
      revenue_9mo_actual_inr: { header: 'revenue_9mo_actual_inr', type: 'number' },
      '9mo_actual_orders': { header: '9mo_actual_orders', type: 'number' },
      annual_revenue_projected_inr: { header: 'annual_revenue_projected_inr', type: 'number' },
      current_customers: { header: 'current_customers', type: 'number' },
      avg_orders_per_customer: { header: 'avg_orders_per_customer', type: 'number' },
      revenue_share_pct: { header: 'revenue_share', type: 'number' },
      growth_rate_target: { header: 'growth_rate_target', type: 'number' },
      served_by_bus: { header: 'bu_id', type: 'string_array' },
      includes_legacy_segments: { header: 'includes_legacy_segments' },
      identity: { header: 'identity' },
      vision: { header: 'vision' },
      mission: { header: 'mission' },
      expression: { header: 'expression' },
      messaging_tone: { header: 'messaging_tone' },
      old_world_pain: { header: 'old_world_pain' },
      new_world_gain: { header: 'new_world_gain' },
      brand_position: { header: 'brand_position' },
      competitive_alt_1: { header: 'competitive_alt_1' },
      competitive_alt_2: { header: 'competitive_alt_2' },
      competitive_alt_3: { header: 'competitive_alt_3' },
      differentiated_value: { header: 'differentiated_value' },
      market_category: { header: 'market_category' },
      design_pov: { header: 'design_pov' },
      category_entry_points: { header: 'category_entry_points' },
      buying_situations: { header: 'buying_situations' },
      distinctive_assets: { header: 'distinctive_assets' },
      age_min: { header: 'age_group', type: 'number' }, // Note: Header is 'age group', might need mapping
      age_max: { header: 'age group', type: 'number' },
      company_size: { header: 'company_size' },
      psychographic: { header: 'psychographic' },
      purchase_trigger_1: { header: 'purchase_trigger_1' },
      purchase_trigger_2: { header: 'purchase_trigger_2' },
      purchase_trigger_3: { header: 'purchase_trigger_3' },
      current_solution_efficiency: { header: 'current_solution_efficiency', type: 'number' },
      our_solution_efficiency: { header: 'our_solution_efficiency', type: 'number' },
      delta_score: { header: 'delta_score', type: 'number' },
      adoption_threshold: { header: 'adoption_threshold' },
      irreversibility_trigger: { header: 'irreversibility_trigger' },
    }
  }
};

export const getSystemFlywheelsConfig = (ids: SpreadsheetIds): SheetConfig<SystemFlywheel> => {
    const meta = sheetMetadata['SystemFlywheels'];
    return {
        spreadsheetId: ids[meta.spreadsheetIdKey],
        gid: meta.gid,
        range: meta.range,
        keyField: 'flywheel_id',
        columns: {
            flywheel_id: { header: 'flywheel_id' },
            flywheel_name: { header: 'flywheel_name' },
            customer_struggle: { header: 'customer_struggle' },
            jtbd_trigger_moment: { header: 'jtbd_trigger_moment' },
            motion_sequence: { header: 'motion_sequence' },
            serves_segments: { header: 'serves_segments' },
            serves_bus: { header: 'serves_bus' },
            acquisition_channels: { header: 'acquisition_channels', type: 'string' },
            order_size_range: { header: 'order_size_range' },
            efficiency_metrics: { header: 'efficiency_metrics' },
            owner_person: { header: 'owner_person' },
            owner_person_Name: { header: 'owner_person_Name' },
            cac_target: { header: 'cac_target', type: 'number' },
            validation_status: { header: 'validation_status' },
            '9mo_actual_revenue_inr': { header: '9mo_actual_revenue_inr', type: 'number' },
            '9mo_actual_orders': { header: '9mo_actual_orders', type: 'number' },
            validated_aov_inr: { header: 'validated_aov_inr', type: 'number' },
            annual_revenue_target_inr: { header: 'annual_revenue_target_inr', type: 'number' },
            annual_orders_target: { header: 'annual_orders_target', type: 'number' },
            primary_bottleneck: { header: 'primary_bottleneck' },
            conversion_rate_pct: { header: 'conversion_rate_pct', type: 'number' },
            reorder_rate_6mo_pct: { header: 'reorder_rate_6mo_pct' },
            avg_sale_cycle_days: { header: 'avg_sale_cycle_days' },
        }
    };
};

export const getSystemBusinessUnitsConfig = (ids: SpreadsheetIds): SheetConfig<SystemBusinessUnit> => {
    const meta = sheetMetadata['SystemBusinessUnits'];
    return {
        spreadsheetId: ids[meta.spreadsheetIdKey],
        gid: meta.gid,
        range: meta.range,
        keyField: 'bu_id',
        columns: {
            bu_id: { header: 'bu_id' },
            bu_name: { header: 'bu_name' },
            bu_type: { header: 'bu_type' },
            in_form_of: { header: 'in_form_of' },
            serves_segment: { header: 'serves_segments_ids' },
            offering_description: { header: 'offering_description' },
            order_volume_range: { header: 'order_volume_range' },
            validated_aov: { header: 'validated_aov', type: 'number' },
            target_contribution_margin: { header: 'target_contribution_margin_pct', type: 'number' },
            primary_flywheel: { header: 'primary_flywheel_id' },
            primary_flywheel_Name: { header: 'primary_flywheel_name' },
            upsell_path: { header: 'upsell_path' },
            pricing_model: { header: 'pricing_model' },
            pricing_model_Name: { header: 'pricing_model_name' },
            owner_person: { header: 'owner_person_id' },
            owner_rollup_name: { header: 'owner_rollup_name' },
            monthly_capacity_orders: { header: 'monthly_capacity_orders', type: 'number' },
            current_status: { header: 'status' },
            '9mo_actual_revenue_inr': { header: '9mo_actual_revenue_inr', type: 'number' },
            '9mo_actual_orders': { header: '9mo_actual_orders', type: 'number' },
            annual_revenue_target_inr: { header: 'annual_revenue_target_inr', type: 'number' },
            annual_orders_target: { header: 'annual_orders_target', type: 'number' },
            current_utilization_pct: { header: 'current_utilization_pct', type: 'number' },
            sales_motion: { header: 'sales_motion' },
            support_model: { header: 'support_model' },
            production_sla_hours: { header: 'production_sla_hours' },
            gross_margin_pct: { header: 'gross_margin_pct', type: 'number' },
            variable_cost_per_order: { header: 'variable_cost_per_order', type: 'number' },
            fixed_costs_monthly: { header: 'fixed_costs_monthly', type: 'number' },
            break_even_orders: { header: 'break_even_orders', type: 'number' },
        }
    };
};

export const getSystemChannelsConfig = (ids: SpreadsheetIds): SheetConfig<SystemChannel> => {
    const meta = sheetMetadata['SystemChannels'];
    return {
        spreadsheetId: ids[meta.spreadsheetIdKey],
        gid: meta.gid,
        range: meta.range,
        keyField: 'channel_id',
        columns: {
            channel_id: { header: 'channel_id' },
            channel_name: { header: 'channel_name' },
            channel_type: { header: 'channel_type' },
            serves_flywheels: { header: 'serves_flywheels' },
            serves_bus: { header: 'serves_bus' },
            'Segment arrayed': { header: 'segments_arrayed' },
            'Segment selected': { header: 'segment_id' },
            monthly_budget_inr: { header: 'monthly_budget_inr', type: 'number' },
            cac_target: { header: 'cac_target', type: 'number' },
            current_cac: { header: 'current_cac', type: 'number' },
            cac_gap: { header: 'cac_gap', type: 'number' },
            conversion_rate_pct: { header: 'conversion_rate_pct', type: 'number' },
            responsible_person: { header: 'responsible_person' },
            responsible_person_Name: { header: 'responsible_person_Name' },
            status: { header: 'status' },
            Monthly_Volume: { header: 'Monthly_Volume', type: 'number' },
            Annual_Revenue: { header: 'Annual_Revenue' },
            Platform: { header: 'Platform' },
            Notes: { header: 'Notes' },
            LTV: { header: 'LTV' },
            ROI: { header: 'ROI' },
        }
    };
};

export const getSystemInterfacesConfig = (ids: SpreadsheetIds): SheetConfig<SystemInterface> => {
    const meta = sheetMetadata['SystemInterfaces'];
    return {
        spreadsheetId: ids[meta.spreadsheetIdKey],
        gid: meta.gid,
        range: meta.range,
        keyField: 'interface_id',
        columns: {
            interface_id: { header: 'interface_id' },
            interface_name: { header: 'interface_name' },
            interface_type: { header: 'interface_type' },
            primary_user: { header: 'primary_user' },
            serves_flywheels: { header: 'serves_flywheels_ids' },
            serves_bus: { header: 'serves_bus_ids' },
            tech_stack: { header: 'tech_stack' },
            owned_by_hub: { header: 'owned_by_hub' },
            owned_by_hub_Name: { header: 'owned_by_hub_name' },
            responsible_person: { header: 'responsible_person' },
            priority_level: { header: 'priority_level' },
            build_status: { header: 'build_status' },
            monthly_mau: { header: 'monthly_mau', type: 'number' },
            integration_points: { header: 'integration_points' },
            critical_to_operation: { header: 'critical_to_operation' },
            bottleneck_risk: { header: 'bottleneck_risk' },
            annual_volume: { header: 'annual_volume', type: 'number' },
            notes: { header: 'notes' },
            channel_id: { header: 'channel_id' },
        }
    };
};

export const getSystemHubsConfig = (ids: SpreadsheetIds): SheetConfig<SystemHub> => {
    const meta = sheetMetadata['SystemHubs'];
    return {
        spreadsheetId: ids[meta.spreadsheetIdKey],
        gid: meta.gid,
        range: meta.range,
        keyField: 'hub_id',
        columns: {
            hub_id: { header: 'hub_id' },
            hub_name: { header: 'hub_name' },
            hub_type: { header: 'hub_type' },
            owner_person: { header: 'owner_person' },
            owner_person_Name: { header: 'owner_person_name' },
            core_capabilities: { header: 'core_capabilities' },
            team_size: { header: 'team_size', type: 'number' },
            monthly_capacity_constraint: { header: 'monthly_capacity_constraint' },
            current_utilization_pct: { header: 'current_utilization_pct', type: 'number' },
            budget_monthly_inr: { header: 'budget_monthly_inr', type: 'number' },
            status: { header: 'status' },
            revenue_attribution_monthly: { header: 'revenue_attribution_monthly', type: 'number' },
            cost_center_or_profit: { header: 'cost_center_or_profit' },
            interfaces_owned: { header: 'interfaces_owned' },
            channels_owned: { header: 'channels_owned' },
            primary_bottleneck: { header: 'primary_bottleneck' },
            scale_trigger_point: { header: 'scale_trigger_point' },
            Note: { header: 'note' },
        }
    };
};

export const getSystemPeopleConfig = (ids: SpreadsheetIds): SheetConfig<SystemPerson> => {
    const meta = sheetMetadata['SystemPeople'];
    return {
        spreadsheetId: ids[meta.spreadsheetIdKey],
        gid: meta.gid,
        range: meta.range,
        keyField: 'person_id',
        columns: {
            person_id: { header: 'user_id' },
            full_name: { header: 'full_name' },
            role: { header: 'role' },
            primary_hub: { header: 'primary_hub' },
            primary_hub_Name: { header: 'primary_hub_name' },
            owns_flywheels: { header: 'owns_flywheels_ids' },
            owns_segments: { header: 'owns_segments_ids' },
            owns_bus: { header: 'owns_bus_ids' },
            annual_comp_inr: { header: 'annual_comp_inr', type: 'number' },
            capacity_utilization_pct: { header: 'capacity_utilization_pct', type: 'number' },
            primary_okrs: { header: 'primary_okrs' },
            email: { header: 'email' },
            phone: { header: 'phone' },
            department: { header: 'department' },
            role_title: { header: 'role_title' },
            manager_id: { header: 'manager_id' },
            employment_type: { header: 'employment_type' },
            weekly_hours_capacity: { header: 'weekly_hours_capacity', type: 'number' },
            location: { header: 'location' },
            notes: { header: 'notes' },
        }
    };
};

export const getSystemStagesConfig = (ids: SpreadsheetIds): SheetConfig<SystemStage> => {
    const meta = sheetMetadata['SystemStages'];
    return {
        spreadsheetId: ids[meta.spreadsheetIdKey],
        gid: meta.gid,
        range: meta.range,
        keyField: 'stage_id',
        columns: {
            stage_id: { header: 'stage_id' },
            stage_name: { header: 'stage_name' },
            flywheel: { header: 'flywheel' },
            stage_order: { header: 'stage_order', type: 'number' },
            stage_type: { header: 'stage_type' },
            serves_segments: { header: 'serves_segments' },
            expected_conversion_rate: { header: 'expected_conversion_rate', type: 'number' },
            current_conversion_rate: { header: 'current_conversion_rate', type: 'number' },
            benchmark_time: { header: 'benchmark_time' },
            current_time: { header: 'current_time' },
            critical_to_revenue: { header: 'critical_to_revenue' },
            cumulative_conversion: { header: 'cumulative_conversion', type: 'number' },
            monthly_volume_in: { header: 'monthly_volume_in', type: 'number' },
            monthly_volume_out: { header: 'monthly_volume_out', type: 'number' },
            revenue_per_stage: { header: 'revenue_per_stage', type: 'number' },
            stage_description: { header: 'stage_description' },
        }
    };
};

export const getSystemTouchpointsConfig = (ids: SpreadsheetIds): SheetConfig<SystemTouchpoint> => {
    const meta = sheetMetadata['SystemTouchpoints'];
    return {
        spreadsheetId: ids[meta.spreadsheetIdKey],
        gid: meta.gid,
        range: meta.range,
        keyField: 'touchpoint_id',
        columns: {
            touchpoint_id: { header: 'touchpoint_id' },
            touchpoint_name: { header: 'touchpoint_name' },
            stage: { header: 'stage_id' },
            flywheel: { header: 'flywheel_id' },
            customer_action: { header: 'customer_action' },
            serves_segments: { header: 'serves_segments' },
            channel: { header: 'channel_id' },
            interface: { header: 'interface_id' },
            responsible_hub: { header: 'responsible_hub_id' },
            responsible_person: { header: 'responsible_person_id' },
            success_metric: { header: 'success_metric' },
            target_value: { header: 'target_value', type: 'number' },
            current_value: { header: 'current_value', type: 'number' },
            gap_severity: { header: 'gap_severity' },
            conversion_to_next: { header: 'conversion_to_next', type: 'number' },
            drop_off_rate: { header: 'drop_off_rate', type: 'number' },
            revenue_impact: { header: 'revenue_impact', type: 'number' },
            avg_time_in_stage: { header: 'avg_time_in_stage' },
            monthly_volume: { header: 'monthly_volume', type: 'number' },
            friction_points: { header: 'friction_points' },
            intervention_cost: { header: 'intervention_cost', type: 'number' },
            roi_score: { header: 'roi_score', type: 'number' },
            optimization_priority: { header: 'optimization_priority' },
            current_status: { header: 'current_status' },
        }
    };
};

export const getSystemPlatformsConfig = (ids: SpreadsheetIds): SheetConfig<SystemPlatform> => {
    const meta = sheetMetadata['SystemPlatforms'];
    return {
        spreadsheetId: ids[meta.spreadsheetIdKey],
        gid: meta.gid,
        range: meta.range,
        keyField: 'platform_id',
        columns: {
            platform_id: { header: 'platform_id' },
            platform_name: { header: 'platform_name' },
            platform_type: { header: 'platform_type' },
            owner_hub: { header: 'owner_hub' },
            primary_segments: { header: 'primary_segments' },
            secondary_segments: { header: 'Scondary_segments' },
            platform_icon: { header: 'platform_icon_url' },
            platform_link: { header: 'platform_link_url' },
        }
    };
};

// A flat map of all configurations for easy iteration during data fetching
export const allSheetConfigs: Record<string, (ids: SpreadsheetIds) => SheetConfig<any>> = {
    'Customer Segments': getCustomerSegmentsConfig,
    'Roles': getRolesConfig,
    'People': getPeopleConfig,
    'Business Units': getBusinessUnitsConfig,
    'Flywheels': getFlywheelsConfig,
    'Hubs': getHubsConfig,
    'Interfaces': getInterfacesConfig,
    'Channels': getChannelsConfig,
    'Leads': getLeadsConfig,
    'Opportunities': getOpportunitiesConfig,
    'Accounts': getAccountsConfig,
    'BrainDump': getBrainDumpConfig,
    'Logs': getLogConfig,
    'SystemSegments': getSystemSegmentsConfig,
    'SystemFlywheels': getSystemFlywheelsConfig,
    'SystemBusinessUnits': getSystemBusinessUnitsConfig,
    'SystemChannels': getSystemChannelsConfig,
    'SystemInterfaces': getSystemInterfacesConfig,
    'SystemHubs': getSystemHubsConfig,
    'SystemPeople': getSystemPeopleConfig,
    'SystemStages': getSystemStagesConfig,
    'SystemTouchpoints': getSystemTouchpointsConfig,
    'SystemPlatforms': getSystemPlatformsConfig,
    'Programs': getProgramsConfig,
    'MgmtProjects': getMgmtProjectsConfig,
    'Milestones': getMilestonesConfig,
    'MgmtTasks': getMgmtTasksConfig,
    'MgmtHubs': getMgmtHubsConfig,
    'WeeklyUpdates': getWeeklyUpdatesConfig,
    'DecisionLogs': getDecisionLogsConfig,
};

// A nested structure for organizing the health-check UI by spreadsheet
export const groupedSheetConfigs = {
    'YD - App': {
        spreadsheetIdKey: 'YDS_APP' as keyof SpreadsheetIds,
        configs: { 'BrainDump': getBrainDumpConfig, 'Logs': getLogConfig, 'Roles': getRolesConfig }
    },
    'YD - Strategy': {
        spreadsheetIdKey: 'STRATEGY' as keyof SpreadsheetIds,
        configs: { 'Customer Segments': getCustomerSegmentsConfig, 'Flywheels': getFlywheelsConfig, 'Business Units': getBusinessUnitsConfig, 'Interfaces': getInterfacesConfig, 'Channels': getChannelsConfig, 'Hubs': getHubsConfig }
    },
    'Partners': {
        spreadsheetIdKey: 'PARTNERS' as keyof SpreadsheetIds,
        configs: { 'Leads': getLeadsConfig, 'Opportunities': getOpportunitiesConfig, 'Accounts': getAccountsConfig }
    },
    'YDC - Base': {
        spreadsheetIdKey: 'YDC_BASE' as keyof SpreadsheetIds,
        configs: { 
            'SystemPeople': getSystemPeopleConfig,
            'SystemSegments': getSystemSegmentsConfig,
            'SystemFlywheels': getSystemFlywheelsConfig,
            'SystemBusinessUnits': getSystemBusinessUnitsConfig,
            'SystemChannels': getSystemChannelsConfig,
            'SystemInterfaces': getSystemInterfacesConfig,
            'SystemHubs': getSystemHubsConfig,
            'SystemStages': getSystemStagesConfig,
            'SystemTouchpoints': getSystemTouchpointsConfig,
            'SystemPlatforms': getSystemPlatformsConfig,
        }
    },
    'YDS Management': {
        spreadsheetIdKey: 'YDS_MANAGEMENT' as keyof SpreadsheetIds,
        configs: {
            'Programs': getProgramsConfig,
            'MgmtProjects': getMgmtProjectsConfig,
            'Milestones': getMilestonesConfig,
            'MgmtTasks': getMgmtTasksConfig,
            'MgmtHubs': getMgmtHubsConfig,
            'WeeklyUpdates': getWeeklyUpdatesConfig,
            'DecisionLogs': getDecisionLogsConfig,
        }
    }
};
