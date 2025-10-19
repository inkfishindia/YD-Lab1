// types.ts

export enum Status {
  NotStarted = 'Not Started',
  InProgress = 'In Progress',
  Completed = 'Completed',
  OnHold = 'On Hold',
  Cancelled = 'Cancelled',
}

export enum Priority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Critical = 'Critical',
}

export enum HealthStatus {
  OnTrack = 'On Track',
  AtRisk = 'At Risk',
  OffTrack = 'Off Track',
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
  ClosedWon = 'Closed - Won',
  ClosedLost = 'Closed - Lost',
}

export interface Role {
  role_name: string;
  permissions: string[];
}

export interface Person {
  user_id: string;
  full_name: string;
  email: string;
  department: string;
  role_title: string;
  is_active?: boolean;
  manager_id?: string;
  role_name: string;
}

export interface Project {
  project_id: string;
  project_name: string;
  business_unit_id: string[];
  owner_user_id: string;
  priority: Priority;
  status: Status;
  start_date: string;
  target_end_date: string;
  budget_planned: number;
  budget_spent: number;
  // from form
  objective?: string;
  confidence_pct?: number;
  risk_flag?: boolean;
  risk_note?: string;
  channels_impacted?: string[];
  touchpoints_impacted?: string[];
  hub_dependencies?: string[];
  team_members?: string[];
  success_metrics?: string;
  created_at?: string;
  updated_at?: string;
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
  // from form
  description?: string;
  logged_hours?: number;
  channel_id?: string;
  touchpoint_id?: string;
  hub_id?: string;
  dependency_task_id?: string;
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
  customerType: string;
  order_volume_range: string;
  offering: string;
  platform_type: string;
  interface: string;
  pricing_model: string;
  avg_order_value: number;
  target_margin_pct: number;
  tech_build: string;
  sales_motion: string;
  support_type: string;
  pricing_logic: string;
  current_revenue: number;
  current_orders: number;
  variance_pct: string;
  growth_rate_required: number;
  status: string;
}

export interface CustomerSegment {
  customer_segment: string;
  purpose: string;
  vission: string;
  mission: string;
  expression: string;
  psychological_job_to_be_done: string;
  behavioral_truth: string;
  brand_position_for_them: string;
  messaging_tone: string;
  design_pov: string;
  flywheel_id: string;
}

export interface Flywheel {
  flywheel_id: string;
  flywheel_name: string;
  customer_type: string;
  motion: string;
  primary_channels: string[];
  target_revenue: number;
  description: string;
  interface: string;
  customer_acquisition_motion: string;
  notes: string;
  order_size: string;
  hub_dependencies: string[];
  key_metrics: string[];
  revenue_driver: number;
  revenue_model: number;
  what_drives_growth: string;
  economics: string[];
  target_orders: number;
  avg_cac: number;
  avg_ltv: number;
  conversion_rate_pct: number;
}

export interface Account {
  account_id: string;
  account_name: string;
  industry: string;
  website: string;
  owner_user_id: string;
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

export interface Lead {
  lead_id: string;
  date: string;
  full_name: string;
  email: string;
  phone: string;
  brand: string;
  source_channel: string;
  created_at: string;
  status_stage: LeadStatus;
  sdr_owner_fk: string;
  last_activity_date: string;
  lead_score: string;
  disqualified_reason: string;
  source_campaign_fk?: string;
}

export interface BrainDump {
  braindump_id: string;
  timestamp: string;
  type: string;
  content: string;
  user_email: string;
  priority: Priority;
}

export interface LogEntry {
  log_id: string;
  timestamp: string;
  log_type: string;
  content: string;
  user_email: string;
  user_name: string;
  priority: Priority;
  assigned_to: string;
  context: string;
  success_criteria: string;
  status: Status;
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
  flywheel_id: string;
  bu_ids_served: string[];
  interface_owner: string;
  monthly_budget: number;
  channel_id: string;
  interface_goal: string;
  cost_model: number;
  avg_cac: number;
  avg_conversion_rate: number;
  interface_status: string;
  notes: string;
  platform_id?: string;
}

export interface Channel {
  channel_id: string;
  channel_type: string;
  channel_name: string;
  interfaces: string;
  focus: string;
}

// from sheetConfig
export interface SystemSegment {
  segment_id: string;
  segment_name: string;
  customer_facing?: string;
  Positioning?: string;
  For?: string;
  Against?: string;
  Promise?: string;
  priority_rank?: string;
  customer_profile?: string;
  psychological_job?: string;
  served_by_flywheels?: string;
  Platforms?: string;
  behavioral_truth?: string;
  validated_aov?: number;
  annual_orders?: number;
  contribution_margin_pct?: string;
  validated_cac?: string;
  annual_ltv?: number;
  ltv_cac_ratio?: string;
  validation_status?: string;
  owner_person?: string;
  owner_person_Name?: string;
  strategic_notes?: string;
  revenue_9mo_actual_inr?: number;
  '9mo_actual_orders'?: number;
  annual_revenue_projected_inr?: number;
  current_customers?: number;
  avg_orders_per_customer?: number;
  revenue_share_pct?: number;
  growth_rate_target?: number;
  served_by_bus?: string;
  includes_legacy_segments?: string;
  identity?: string;
  vision?: string;
  mission?: string;
  expression?: string;
  messaging_tone?: string;
  old_world_pain?: string;
  new_world_gain?: string;
  brand_position?: string;
  competitive_alt_1?: string;
  competitive_alt_2?: string;
  competitive_alt_3?: string;
  differentiated_value?: string;
  market_category?: string;
  design_pov?: string;
  category_entry_points?: string;
  buying_situations?: string;
  distinctive_assets?: string;
  age_min?: number;
  age_max?: number;
  company_size?: string;
  psychographic?: string;
  purchase_trigger_1?: string;
  purchase_trigger_2?: string;
  purchase_trigger_3?: string;
  current_solution_efficiency?: number;
  our_solution_efficiency?: number;
  delta_score?: number;
  adoption_threshold?: string;
  irreversibility_trigger?: string;
}

export interface SystemFlywheel {
  flywheel_id: string;
  flywheel_name: string;
  customer_struggle?: string;
  jtbd_trigger_moment?: string;
  motion_sequence?: string;
  serves_segments?: string;
  serves_bus?: string;
  acquisition_channels?: string;
  order_size_range?: string;
  efficiency_metrics?: string;
  owner_person?: string;
  owner_person_Name?: string;
  cac_target?: number;
  validation_status?: string;
  '9mo_actual_revenue_inr'?: number;
  '9mo_actual_orders'?: number;
  validated_aov_inr?: number;
  annual_revenue_target_inr?: number;
  annual_orders_target?: number;
  primary_bottleneck?: string;
  conversion_rate_pct?: number;
  reorder_rate_6mo_pct?: string;
  avg_sale_cycle_days?: string;
}

export interface SystemBusinessUnit {
  bu_id: string;
  bu_name: string;
  bu_type?: string;
  in_form_of?: string;
  serves_segment?: string;
  offering_description?: string;
  order_volume_range?: string;
  validated_aov?: number;
  target_contribution_margin?: number;
  primary_flywheel?: string;
  primary_flywheel_Name?: string;
  upsell_path?: string;
  pricing_model?: string;
  pricing_model_Name?: string;
  owner_person?: string;
  owner_rollup_name?: string;
  monthly_capacity_orders?: number;
  current_status?: string;
  '9mo_actual_revenue_inr'?: number;
  '9mo_actual_orders'?: number;
  annual_revenue_target_inr?: number;
  annual_orders_target?: number;
  current_utilization_pct?: number;
  sales_motion?: string;
  support_model?: string;
  production_sla_hours?: string;
  gross_margin_pct?: number;
  variable_cost_per_order?: number;
  fixed_costs_monthly?: number;
  break_even_orders?: number;
}

export interface SystemChannel {
  channel_id: string;
  channel_name: string;
  channel_type?: string;
  serves_flywheels?: string;
  serves_bus?: string;
  'Segment arrayed'?: string;
  'Segment selected'?: string;
  monthly_budget_inr?: number;
  cac_target?: number;
  current_cac?: number;
  cac_gap?: number;
  conversion_rate_pct?: number;
  responsible_person?: string;
  responsible_person_Name?: string;
  status?: string;
  Monthly_Volume?: number;
  Annual_Revenue?: string;
  Platform?: string;
  Notes?: string;
  LTV?: string;
  ROI?: string;
}

export interface SystemInterface {
  interface_id: string;
  interface_name: string;
  interface_type?: string;
  primary_user?: string;
  serves_flywheels?: string;
  serves_bus?: string;
  tech_stack?: string;
  owned_by_hub?: string;
  owned_by_hub_Name?: string;
  responsible_person?: string;
  priority_level?: string;
  build_status?: string;
  monthly_mau?: number;
  integration_points?: string;
  critical_to_operation?: string;
  bottleneck_risk?: string;
  annual_volume?: number;
  notes?: string;
  channel_id?: string;
}

export interface SystemHub {
  hub_id: string;
  hub_name: string;
  hub_type?: string;
  owner_person?: string;
  owner_person_Name?: string;
  core_capabilities?: string;
  team_size?: number;
  monthly_capacity_constraint?: string;
  current_utilization_pct?: number;
  budget_monthly_inr?: number;
  status?: string;
  revenue_attribution_monthly?: number;
  cost_center_or_profit?: string;
  interfaces_owned?: string;
  channels_owned?: string;
  primary_bottleneck?: string;
  scale_trigger_point?: string;
  Note?: string;
}

export interface SystemPerson {
  person_id: string;
  full_name: string;
  role?: string;
  primary_hub?: string;
  primary_hub_Name?: string;
  owns_flywheels?: string;
  owns_segments?: string;
  owns_bus?: string;
  annual_comp_inr?: number;
  capacity_utilization_pct?: number;
  primary_okrs?: string;
  email?: string;
  phone?: string;
  department?: string;
  role_title?: string;
  manager_id?: string;
  employment_type?: string;
  weekly_hours_capacity?: number;
  location?: string;
  notes?: string;
}

export interface SystemStage {
  stage_id: string;
  stage_name: string;
  flywheel?: string;
  stage_order?: number;
  stage_type?: string;
  serves_segments?: string;
  expected_conversion_rate?: number;
  current_conversion_rate?: number;
  benchmark_time?: string;
  current_time?: string;
  critical_to_revenue?: string;
  cumulative_conversion?: number;
  monthly_volume_in?: number;
  monthly_volume_out?: number;
  revenue_per_stage?: number;
  stage_description?: string;
}

export interface SystemTouchpoint {
  touchpoint_id: string;
  touchpoint_name: string;
  stage?: string;
  flywheel?: string;
  customer_action?: string;
  serves_segments?: string;
  channel?: string;
  interface?: string;
  responsible_hub?: string;
  responsible_person?: string;
  success_metric?: string;
  target_value?: number;
  current_value?: number;
  gap_severity?: string;
  conversion_to_next?: number;
  drop_off_rate?: number;
  revenue_impact?: number;
  avg_time_in_stage?: string;
  monthly_volume?: number;
  friction_points?: string;
  intervention_cost?: number;
  roi_score?: number;
  optimization_priority?: string;
  current_status?: string;
}

export interface SystemPlatform {
  platform_id: string;
  platform_name: string;
  platform_type: string;
  owner_hub: string;
  primary_segments: string;
  secondary_segments: string;
  platform_icon: string;
  platform_link: string;
}

export interface Program {
  program_id: string;
  program_name: string;
  flywheel_id: string;
  status: string;
  priority: string;
  owner_person_id: string;
  owner_hub_id: string;
  contributing_hub_ids: string;
  serves_segment_ids: string;
  linked_business_unit_ids: string;
  customer_problem: string;
  our_solution: string;
  why_now: string;
  timeline_start: string;
  timeline_end: string;
  success_metric: string;
  target_value: number;
  current_value: number;
  days_total: number;
  days_elapsed: number;
  days_remaining: number;
  timeline_progress_pct: number;
  metric_progress_pct: number;
  budget_total: number;
  budget_spent: number;
  budget_remaining: number;
  budget_burn_rate_pct: number;
  risk_level: string;
  health_status: string;
  blockers: string;
  next_milestone: string;
  next_milestone_date: string;
  days_to_next_milestone: number;
  dependent_program_ids: string;
  platform_ids: string;
  channel_ids: string;
  projects_count: number;
  projects_active: number;
  projects_blocked: number;
  projects_complete: number;
  program_completion_pct: number;
  tasks_total: number;
  tasks_complete: number;
  tasks_blocked: number;
  created_date: string;
  last_updated: string;
  updated_by_person_id: string;
  notes: string;
  owner_person_name?: string; // Not in sheet config, but useful
}

export interface MgmtProject {
  project_id: string;
  project_name: string;
  program_id: string;
  program_name: string;
  owner_id: string;
  owner_name: string;
  hub_id: string;
  hub_name: string;
  status: string;
  priority: string;
  start_date: string;
  end_date: string;
  budget: number;
  dependencies: string;
  success_metric: string;
  revenue_impact: string;
  project_type: string;
  business_unit_impact: string;
  segment_impact: string;
  platform_id: string;
  channel_ids: string;
  completion_pct: number;
  health_score: string;
  actual_end_date: string;
  milestones_count: number;
  tasks_count: number;
  tasks_complete: number;
  tasks_in_progress: number;
  tasks_blocked: number;
  days_to_deadline: string;
  budget_spent: number;
  budget_variance: number;
  velocity_tasks_per_day: number;
  is_on_time: string;
  objective?: string; // From old project type
}

export interface Milestone {
  milestone_id: string;
  project_id: string;
  milestone_name: string;
  owner: string;
  start_date: string;
  target_date: string;
  status: string;
  completion_pct: number;
  blocker: string;
  owner_id: string;
  owner_name: string;
  Tasks_Count: string;
  Tasks_Complete: number;
  'Calc_Completion_%': number;
  Days_to_Target: string;
  milestone_type: string;
  blocker_type: string;
  dependent_milestone_ids: string;
  actual_completion_date: string;
}

export interface MgmtTask {
  task_id: string;
  project_id: string;
  milestone_id: string;
  task_name: string;
  owner_id: string;
  owner_name: string;
  hub_id: string;
  hub_name: string;
  description: string;
  priority: string;
  status: string;
  effort_hours: number;
  due_date: string;
  dependencies: string;
  assignee_ids: string;
  task_category: string;
  task_type: string;
  actual_completion_date: string;
  notes: string;
  impact_if_delayed: string;
  assignee_User_id?: string; // from mapping in data context
}

export interface MgmtHub {
  team_id: string;
  team_name: string;
  hub_id: string;
  agency_function: string;
  primary_kpi: string;
  budget_monthly: number;
  headcount: number;
}

export interface WeeklyUpdate {
  update_id: string;
  project_id: string;
  week_ending: string;
  owner: string;
  status_color: string;
  progress_summary: string;
  blockers: string;
  decisions_needed: string;
}

export interface DecisionLog {
  decision_id: string;
  date: string;
  decision_maker: string;
  project_id: string;
  decision: string;
  rationale: string;
  alternatives_considered: string;
  impact: string;
}

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
// FIX: Add missing types for PositioningPage
export interface FlywheelStrategy {
  flywheelId: string;
  flywheelName: string;
  strategicRank: number;
  positioningWeOwn: string;
  bottleneckProblem: string;
  servesSegments: string;
  strategicAction: string;
  velocityCompounding: string;
  fixInvestment: string;
  killCriteria: string;
}

export interface SegmentPositioning {
  segment: string;
  segmentName: string;
  tagline: string;
  ourPov: string;
  shiftFrom: string;
  shiftTo: string;
}

export interface FunnelStage {
  stageId: string;
  flywheelId: string;
  stage: string;
  hubName: string;
  ownerName: string;
  currentConv: string;
  targetConv: string;
  bottleneck: string;
  interfaceChannel: string;
}

export interface InterfaceMap {
  flywheel: string;
  interfaceId: string;
  interfaceName: string;
  channelName: string;
  hubName: string;
  ownerName: string;
  status: string;
  channelId: string;
}

// Represents one row in the Master Schema sheet.
export interface MasterSchemaRow {
  [key: string]: any; // Allow other properties from the sheet
  _rowIndex: number; // Internal: the 1-based index of the row in the sheet
  spreadsheet_name: string;
  table_alias: string;
  app_field: string;
  header: string;
  data_type: 'string' | 'number' | 'boolean' | 'string_array';
  fk_reference?: string;
}
