
import { Person, Project, Task, BusinessUnit, Flywheel, Priority, Status, HealthStatus, Lead, Opportunity, Account, LeadStatus, OpportunityStage, BrainDump, Role, BuiltInTool, Agent, Hub } from '../types';

export const mockRoles: Role[] = [
  { role_name: 'Admin', permissions: ['*:*'] },
  { role_name: 'Manager', permissions: ['*:read', 'projects:write', 'tasks:write', 'people:read', 'partners:write', 'strategy:read'] },
  { role_name: 'Contributor', permissions: ['projects:read', 'tasks:*', 'braindump:*'] },
  { role_name: 'Viewer', permissions: ['*:read'] },
];

export const mockPeople: Person[] = [
  { user_id: 'mock_user_1', full_name: 'Alex Johnson', email: 'alex.j@example.com', department: 'Engineering', role_title: 'Lead Developer', is_active: true, manager_id: '', role_name: 'Admin' },
  { user_id: 'mock_user_2', full_name: 'Maria Garcia', email: 'maria.g@example.com', department: 'Product', role_title: 'Product Manager', is_active: true, manager_id: '', role_name: 'Manager' },
  { user_id: 'mock_user_3', full_name: 'Sam Chen', email: 'sam.c@example.com', department: 'Design', role_title: 'UX Designer', is_active: false, manager_id: 'mock_user_2', role_name: 'Contributor' },
  { user_id: 'mock_user_4', full_name: 'David Lee', email: 'david.l@example.com', department: 'Engineering', role_title: 'Frontend Developer', is_active: true, manager_id: 'mock_user_1', role_name: 'Contributor' },
];

export const mockProjects: Project[] = [
  { project_id: 'mock_proj_1', project_name: 'Q3 Mobile App Relaunch', business_unit_id: 'mock_bu_1', owner_user_id: 'mock_user_2', priority: Priority.High, status: Status.InProgress, start_date: '2024-07-01', target_end_date: '2024-09-30', budget_planned: 50000, budget_spent: 22000 },
  { project_id: 'mock_proj_2', project_name: 'Internal Design System', business_unit_id: 'mock_bu_2', owner_user_id: 'mock_user_1', priority: Priority.Medium, status: Status.Completed, start_date: '2024-04-15', target_end_date: '2024-08-01', budget_planned: 35000, budget_spent: 34500 },
  { project_id: 'mock_proj_3', project_name: 'Data Analytics Dashboard', business_unit_id: 'mock_bu_2', owner_user_id: 'mock_user_1', priority: Priority.Critical, status: Status.OnHold, start_date: '2024-06-01', target_end_date: '2024-10-31', budget_planned: 75000, budget_spent: 15000 },
];

export const mockTasks: Task[] = [
  { task_id: 'mock_task_1', title: 'Finalize login screen UI', project_id: 'mock_proj_1', assignee_user_id: 'mock_user_3', status: Status.InProgress, priority: Priority.High, estimate_hours: 8, due_date: '2024-08-15' },
  { task_id: 'mock_task_2', title: 'API integration for user profiles', project_id: 'mock_proj_1', assignee_user_id: 'mock_user_1', status: Status.InProgress, priority: Priority.Critical, estimate_hours: 24, due_date: '2024-08-20' },
  { task_id: 'mock_task_3', title: 'User acceptance testing plan', project_id: 'mock_proj_1', assignee_user_id: 'mock_user_2', status: Status.NotStarted, priority: Priority.Medium, estimate_hours: 16, due_date: '2024-09-01' },
  { task_id: 'mock_task_4', title: 'Document color palette', project_id: 'mock_proj_2', assignee_user_id: 'mock_user_3', status: Status.Completed, priority: Priority.Low, estimate_hours: 4, due_date: '2024-07-30' },
  { task_id: 'mock_task_5', title: 'Setup CI/CD pipeline for analytics service', project_id: 'mock_proj_3', assignee_user_id: 'mock_user_1', status: Status.OnHold, priority: Priority.High, estimate_hours: 32, due_date: '2024-09-15' },
  { task_id: 'mock_task_6', title: 'Create wireframes for dashboard widgets', project_id: 'mock_proj_3', assignee_user_id: 'mock_user_3', status: Status.NotStarted, priority: Priority.Medium, estimate_hours: 12, due_date: '2024-08-25' },
];

export const mockFlywheels: Flywheel[] = [
    { flywheel_id: 'mock_fw_1', flywheel_name: 'Self-Service Acquisition', customer_type: 'SMB', motion: 'Product-Led Growth', primary_channels: ['SEO', 'Content Marketing'], target_revenue: 1000000 },
    { flywheel_id: 'mock_fw_2', flywheel_name: 'Enterprise Sales Motion', customer_type: 'Enterprise', motion: 'Sales-Led', primary_channels: ['Outbound Sales', 'Partnerships'], target_revenue: 5000000 },
];

export const mockBusinessUnits: BusinessUnit[] = [
    { bu_id: 'mock_bu_1', bu_name: 'Consumer Mobile', bu_type: 'Mobile App', owner_user_id: 'mock_user_2', health_status: HealthStatus.OnTrack, priority_level: Priority.High, primary_flywheel_id: 'mock_fw_1' },
    { bu_id: 'mock_bu_2', bu_name: 'Enterprise Platform', bu_type: 'Web Platform', owner_user_id: 'mock_user_1', health_status: HealthStatus.AtRisk, priority_level: Priority.Medium, primary_flywheel_id: 'mock_fw_2', upsell_flywheel_id: 'mock_fw_1' },
];

export const mockAccounts: Account[] = [
    { account_id: 'mock_acc_1', account_name: 'Innovate Corp', industry: 'Technology', website: 'innovate.com', owner_user_id: 'mock_user_2' },
    { account_id: 'mock_acc_2', account_name: 'HealthWell Inc.', industry: 'Healthcare', website: 'healthwell.com', owner_user_id: 'mock_user_1' },
];

export const mockOpportunities: Opportunity[] = [
    { opportunity_id: 'mock_opp_1', opportunity_name: 'Platform Subscription Deal', account_id: 'mock_acc_1', stage: OpportunityStage.Proposal, amount: 120000, close_date: '2024-12-15', owner_user_id: 'mock_user_2' },
    { opportunity_id: 'mock_opp_2', opportunity_name: 'Consulting Services', account_id: 'mock_acc_2', stage: OpportunityStage.Negotiation, amount: 75000, close_date: '2024-11-30', owner_user_id: 'mock_user_1' },
    { opportunity_id: 'mock_opp_3', opportunity_name: 'Hardware Upgrade', account_id: 'mock_acc_1', stage: OpportunityStage.ClosedWon, amount: 250000, close_date: '2024-07-20', owner_user_id: 'mock_user_2' },
];

export const mockLeads: Lead[] = [
    { lead_id: 'mock_lead_1', date: '2024-08-01', full_name: 'Jane Doe', email: 'jane.d@datasolutions.com', phone: '555-1234', brand: 'Data Solutions LLC', source_channel: 'Webinar', created_at: '2024-08-01T10:00:00Z', status_stage: LeadStatus.Qualified, sdr_owner_fk: 'mock_user_1', last_activity_date: '2024-08-10', lead_score: '85', disqualified_reason: '' },
    { lead_id: 'mock_lead_2', date: '2024-08-02', full_name: 'John Smith', email: 'john.s@creative.com', phone: '555-5678', brand: 'Creative Minds Agency', source_channel: 'Referral', created_at: '2024-08-02T11:00:00Z', status_stage: LeadStatus.Contacted, sdr_owner_fk: 'mock_user_2', last_activity_date: '2024-08-05', lead_score: '60', disqualified_reason: '' },
    { lead_id: 'mock_lead_3', date: '2024-08-03', full_name: 'Emily White', email: 'emily.w@nextgen.com', phone: '555-8765', brand: 'NextGen Retail', source_channel: 'Cold Call', created_at: '2024-08-03T12:00:00Z', status_stage: LeadStatus.New, sdr_owner_fk: 'mock_user_1', last_activity_date: '2024-08-03', lead_score: '40', disqualified_reason: '' },
];

export const mockBrainDumps: BrainDump[] = [
  { braindump_id: 'mock_bd_1', timestamp: '2024-08-15T10:00:00Z', type: 'Idea', content: 'Develop a new AI-powered feature for task prioritization.', user_email: 'alex.j@example.com', priority: Priority.Medium },
  { braindump_id: 'mock_bd_2', timestamp: '2024-08-15T11:30:00Z', type: 'Feedback', content: 'Users are reporting that the mobile app dashboard loads slowly.', user_email: 'maria.g@example.com', priority: Priority.High },
  { braindump_id: 'mock_bd_3', timestamp: '2024-08-16T09:05:00Z', type: 'Note', content: 'Remember to follow up with the marketing team about the Q4 campaign stats.', user_email: 'alex.j@example.com', priority: Priority.Low },
];

export const mockBuiltInTools: BuiltInTool[] = [
  { tool_id: 'tool_1', Tool: 'Gemini', Category: 'Content Generation', Alternate: 'Jasper.ai', Use: 'Product descriptions, ad copy, emails' },
  { tool_id: 'tool_2', Tool: 'Midjourney', Category: 'Image Generation', Alternate: 'DALL-E 3', Use: 'Marketing visuals, concept art' },
];

export const mockAgents: Agent[] = [
  { agent_id: 'agent_1', Use: 'Customer Support', Role: 'Support Agent', Persona: 'Friendly and helpful', Character: 'Empathetic', Function: 'Answer user queries', Prompt: 'You are a helpful customer support agent...', Guidelines: 'Always be polite.', References: 'KB Article #123' },
  { agent_id: 'agent_2', Use: 'Sales Outreach', Role: 'Sales Development Rep', Persona: 'Confident and persuasive', Character: 'Professional', Function: 'Generate leads', Prompt: 'You are a skilled SDR...', Guidelines: 'Follow up twice.', References: 'Sales Playbook v2' },
];

export const mockHubs: Hub[] = [
  {
    hub_id: 'HUB-01',
    hub_name: 'Production',
    function_category: 'Operations',
    owner_user_id: 'mock_user_1',
    what_they_enable: 'Blanks sourcing, printing (DTG/screen/embroidery), quality control, fulfillment, shipping, custom manufacturing',
    serves_flywheel_ids: ['mock_fw_1', 'mock_fw_2'],
    capacity_constraint: false,
    hiring_priority: 'Low',
    monthly_budget: 500000,
    serves_bu1: true,
    serves_bu2: true,
    serves_bu3: true,
    serves_bu4: true,
    serves_bu5: true,
    serves_bu6: true,
    notes: 'Currently at 65% capacity. Need custom artisan for BU4 premium gifting. Quality is strong.',
  },
  {
    hub_id: 'HUB-02',
    hub_name: 'Marketing Creative',
    function_category: 'Marketing',
    owner_user_id: 'mock_user_2',
    what_they_enable: 'Campaign assets, social media content, product photography',
    serves_flywheel_ids: ['mock_fw_1'],
    capacity_constraint: true,
    hiring_priority: 'High',
    monthly_budget: 250000,
    serves_bu1: true,
    serves_bu2: false,
    serves_bu3: false,
    serves_bu4: false,
    serves_bu5: false,
    serves_bu6: false,
    notes: 'Needs a new video editor.',
  }
];
