// schemas.ts
import { z } from 'zod';

// --- Reusable Preprocessors ---

// Pre-process a comma or pipe-separated string into an array of strings. Handles empty strings and existing arrays gracefully.
export const stringToArray = z.preprocess(
  (val) => (typeof val === 'string' && val.length > 0 ? val.split(/[,|]/).map(s => s.trim()) : Array.isArray(val) ? val : []),
  z.array(z.string()).optional()
);

// Coerce values to a number, treating empty strings, null, or undefined as undefined. This makes numeric fields optional.
export const optionalNumber = z.preprocess(val => {
    if (val === '' || val === null || val === undefined) return undefined;
    const num = Number(String(val).replace(/[^0-9.-]+/g, ""));
    return isNaN(num) ? undefined : num;
}, z.number().optional());

// Coerce boolean-like values.
export const optionalBoolean = z.preprocess(val => {
    if (val === null || val === undefined) return undefined;
    if (typeof val === 'boolean') return val;
    const str = String(val).toLowerCase();
    return str === 'true' || str === 'yes' || str === '1';
}, z.boolean().optional());


export const optionalString = z.string().optional().nullable();

// --- Zod Schemas for Enums ---
export const StatusSchema = z.enum(['Not Started', 'In Progress', 'Completed', 'On Hold', 'Cancelled', '⚠️ AT RISK', '✅ VALIDATED']);
export const PrioritySchema = z.enum(['Low', 'Medium', 'High', 'Critical', 'P0']);
export const HealthStatusSchema = z.enum(['On Track', 'At Risk', 'Off Track']);
export const LeadStatusSchema = z.enum(['New', 'Contacted', 'Qualified', 'Disqualified']);
export const OpportunityStageSchema = z.enum(['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed - Won', 'Closed - Lost']);

// --- Zod Schema Preprocessors for Enums ---
const statusPreprocessor = z.preprocess(val => {
    if (typeof val !== 'string' || val.trim() === '') return 'Not Started'; // Default for empty
    const lowerVal = val.trim().toLowerCase();
    if (lowerVal.includes('not started')) return 'Not Started';
    if (lowerVal.includes('in progress')) return 'In Progress';
    if (lowerVal.includes('completed')) return 'Completed';
    if (lowerVal.includes('on hold')) return 'On Hold';
    if (lowerVal.includes('cancelled')) return 'Cancelled';
    return val; // Let it fail validation if it's an unknown string
}, StatusSchema);

const priorityPreprocessor = z.preprocess(val => {
    if (typeof val !== 'string' || val.trim() === '') return 'Medium'; // Default for empty
    const lowerVal = val.trim().toLowerCase();
    if (lowerVal === 'low') return 'Low';
    if (lowerVal === 'medium') return 'Medium';
    if (lowerVal === 'high') return 'High';
    if (lowerVal === 'critical') return 'Critical';
    if (lowerVal === 'p0') return 'P0';
    return val; // Let it fail validation
}, PrioritySchema);


// --- Zod Schemas for Entities ---

export const RoleSchema = z.object({
  role_name: z.string(),
  permissions: z.array(z.string()),
});

export const PersonSchema = z.object({
  personId: z.string(),
  fullName: z.string(),
  email: z.string().email(),
  role: optionalString,
  primaryHub: optionalString,
  ownsBusinessUnits: optionalString,
  keyResponsibility: optionalString,
  notes: optionalString,
  // For compatibility with older system
  user_id: z.string().optional(),
  full_name: z.string().optional(),
  department: optionalString,
  role_title: optionalString,
  is_active: optionalBoolean,
  manager_id: optionalString,
  role_name: z.string().optional(),
}).passthrough(); // Allow extra fields that might come from the sheet

export const ProjectSchema = z.object({
  project_id: z.string(),
  project_name: z.string(),
  business_unit_id: stringToArray,
  owner_user_id: z.string(),
  priority: PrioritySchema,
  status: StatusSchema,
  start_date: optionalString,
  target_end_date: optionalString,
  budget_planned: optionalNumber,
  budget_spent: optionalNumber,
  objective: optionalString,
  confidence_pct: optionalNumber,
  risk_flag: optionalBoolean,
  risk_note: optionalString,
  channels_impacted: stringToArray,
  touchpoints_impacted: stringToArray,
  hub_dependencies: stringToArray,
  team_members: stringToArray,
  success_metrics: optionalString,
  created_at: optionalString,
  updated_at: optionalString,
});

export const TaskSchema = z.object({
  task_id: z.string(),
  title: z.string(),
  project_id: z.string(),
  assignee_user_id: z.string(),
  status: StatusSchema,
  priority: PrioritySchema,
  estimate_hours: optionalNumber,
  due_date: optionalString,
  description: optionalString,
  logged_hours: optionalNumber,
  channel_id: optionalString,
  touchpoint_id: optionalString,
  hub_id: optionalString,
  dependency_task_id: optionalString,
});

export const BusinessUnitSchema = z.object({
  businessUnitId: z.string(),
  businessUnitName: z.string(),
  coreOffering: optionalString,
  primarySegments: optionalString,
  flywheelId: optionalString,
  volumeRange: optionalString,
  primaryOwner: optionalString,
  nineMonthRevenue: optionalNumber,
  percentRevenue: z.union([z.string(), z.number()]).optional(),
  pricingModel: optionalString,
  notes: optionalString,
  // For compatibility
  bu_id: z.string().optional(),
  bu_name: z.string().optional(),
  owner_person_id: optionalString,
}).passthrough();


export const CustomerSegmentSchema = z.object({
  segmentId: z.string(),
  segmentName: z.string(),
  customerProfile: optionalString,
  flywheelId: optionalString,
  status: optionalString,
  nineMonthRevenue: optionalNumber,
  percentRevenue: z.union([z.string(), z.number()]).optional(),
  aov: optionalNumber,
  jobsToBeDone: optionalString,
  keyPainPoints: optionalString,
  decisionCriteria: optionalString,
  notes: optionalString,
  // For compatibility
  segment_id: z.string().optional(),
  segment_name: z.string().optional(),
  served_by_flywheels_ids: stringToArray,
  Promise: optionalString,
}).passthrough();

export const FlywheelSchema = z.object({
    flywheelId: z.string(),
    flywheelName: z.string(),
    customerStruggleSolved: optionalString,
    acquisitionModel: optionalString,
    serviceModel: optionalString,
    serves: optionalString,
    keyMetrics: optionalString,
    // For compatibility
    flywheel_id: z.string().optional(),
    flywheel_name: z.string().optional(),
    serves_segments: stringToArray,
    owner_person: optionalString,
    validated_aov_inr: optionalNumber,
}).passthrough();


export const AccountSchema = z.object({
  account_id: z.string(),
  account_name: z.string(),
  industry: optionalString,
  website: optionalString,
  owner_user_id: z.string(),
});

export const OpportunitySchema = z.object({
  opportunity_id: z.string(),
  opportunity_name: z.string(),
  account_id: z.string(),
  stage: OpportunityStageSchema,
  amount: optionalNumber.default(0),
  close_date: optionalString,
  owner_user_id: z.string(),
});

export const LeadSchema = z.object({
  lead_id: z.string(),
  date: optionalString,
  full_name: z.string(),
  email: z.string().email(),
  phone: optionalString,
  brand: z.string(),
  source_channel: z.string(),
  created_at: optionalString,
  status_stage: LeadStatusSchema,
  sdr_owner_fk: optionalString,
  last_activity_date: optionalString,
  lead_score: optionalString,
  disqualified_reason: optionalString,
  source_campaign_fk: optionalString,
});

export const BrainDumpSchema = z.object({
  braindump_id: z.string(),
  timestamp: z.string(),
  type: z.string(),
  content: z.string(),
  user_email: z.string().email(),
  priority: PrioritySchema,
});

export const LogEntrySchema = z.object({
  log_id: z.string(),
  timestamp: z.string(),
  log_type: z.string(),
  content: z.string(),
  user_email: z.string().email(),
  user_name: z.string(),
  priority: PrioritySchema,
  assigned_to: z.string(),
  context: z.string(),
  success_criteria: z.string(),
  status: StatusSchema,
});

export const HubSchema = z.object({
  hubId: z.string(),
  hubName: z.string(),
  hubType: optionalString,
  headCount: optionalNumber,
  primaryOwner: optionalString,
  keyActivities: optionalString,
  notes: optionalString,
  // For compatibility
  hub_id: z.string().optional(),
  hub_name: z.string().optional(),
  owner_person: optionalString,
  core_capabilities: optionalString,
  interfaces_owned: stringToArray,
  monthly_capacity_constraint: optionalBoolean,
  hiring_priority: optionalString,
  budget_monthly_inr: optionalNumber,
  note: optionalString,
}).passthrough();

export const InterfaceSchema = z.object({
  interface_id: z.string(),
  interface_name: z.string(),
  interface_type: optionalString,
  serves_flywheels_ids: stringToArray,
  serves_bus_ids: stringToArray,
  responsible_person: optionalString,
  monthly_mau: optionalNumber,
  notes: optionalString,
}).passthrough();

export const ChannelSchema = z.object({
    channelId: z.string(),
    channelName: z.string(), // Added to match mock data and resolve error
    channelType: optionalString,
    platformId: optionalString,
    servesSegments: optionalString,
    flywheelId: optionalString,
    motionType: optionalString,
    notes: optionalString,
    // For compatibility (aliased from the sheet)
    channel_id: z.string().optional(),
    channel_name: z.string().optional(),
    Platform: z.unknown().optional(), // Can be string or string array in source
    Notes: z.unknown().optional(), // Can be string or string array in source
}).passthrough();

export const PartnerSchema = z.object({
    partnerId: z.string(),
    partnerName: z.string(),
    partnerType: optionalString,
    role: optionalString,
    riskLevel: optionalString,
    status: optionalString,
    contractTerms: optionalString,
    notes: optionalString,
});

export const CostStructureSchema = z.object({
    costId: z.string(),
    costCategory: z.string(),
    costType: optionalString,
    monthlyAmount: optionalNumber,
    annualAmount: optionalNumber,
    owner: optionalString,
    notes: optionalString,
});

export const RevenueStreamSchema = z.object({
    revenueStreamId: z.string(),
    businessUnitId: optionalString,
    segmentId: optionalString,
    aov: optionalNumber,
    grossMargin: z.union([z.string(), z.number()]).optional(),
    grossProfitPerOrder: optionalNumber,
    cac: z.union([z.string(), z.number()]).optional(),
    contributionMargin: z.union([z.string(), z.number()]).optional(),
    nineMonthRevenue: optionalNumber,
    estimatedOrders: optionalNumber,
    notes: optionalString,
});

export const SystemSegmentSchema = CustomerSegmentSchema.extend({
  // Adding fields from CSV which may not be in initial CustomerSegmentSchema, or overriding types
  bu_id: optionalString, // From CSV
  owner_person_id: optionalString, // From CSV
  Platforms: optionalString, // From CSV
  Positioning: optionalString, // From CSV
  For: optionalString, // From CSV
  Against: optionalString, // From CSV
  vision: optionalString, // From CSV
  mission: optionalString, // From CSV
  expression: optionalString, // From CSV
  market_category: optionalString, // From CSV
  brand_position: optionalString, // From CSV
  differentiated_value: optionalString, // From CSV
  design_pov: optionalString, // From CSV
  category_entry_points: optionalString, // From CSV
  buying_situations: optionalString, // From CSV
  distinctive_assets: optionalString, // From CSV
  competitive_alt_1: optionalString, // From CSV
  competitive_alt_2: optionalString, // From CSV
  competitive_alt_3: optionalString, // From CSV
  'age group': optionalString, // From CSV
  company_size: optionalString, // From CSV
  psychographic: optionalString, // From CSV
  purchase_trigger_1: optionalString, // From CSV
  purchase_trigger_2: optionalString, // From CSV
  purchase_trigger_3: optionalString, // From CSV
  current_solution_efficiency: optionalString, // From CSV
  our_solution_efficiency: optionalString, // From CSV
  delta_score: optionalString, // From CSV
  adoption_threshold: optionalString, // From CSV
  irreversibility_trigger: optionalString, // From CSV
  old_world_pain: optionalString, // From CSV
  new_world_gain: optionalString, // From CSV
  messaging_tone: optionalString, // From CSV
  ltv_cac_ratio: optionalString, // From CSV
  validated_cac: optionalString, // From CSV
  priority_rank: optionalString, // From CSV
  current_customers: optionalNumber, // From CSV
}).passthrough();

export const SystemFlywheelSchema = FlywheelSchema.extend({
  // Adding fields from CSV or overriding types
  customer_struggle: optionalString, // From CSV
  jtbd_trigger_moment: optionalString, // From CSV
  motion_sequence: optionalString, // From CSV
  serves_bus: stringToArray, // From CSV, assuming it's an array
  acquisition_channels: optionalString, // From CSV, assuming this is a single ID/string
  order_size_range: optionalString, // From CSV
  efficiency_metrics: optionalString, // From CSV, can be string array
  owner_person: optionalString, // From CSV
  owner_person_Name: optionalString, // From CSV
  cac_target: optionalString, // From CSV
  validation_status: optionalString, // From CSV
  '9mo_actual_revenue_inr': optionalNumber, // From CSV
  '9mo_actual_orders': optionalNumber, // From CSV
  validated_aov_inr: optionalNumber, // From CSV
  annual_revenue_target_inr: optionalNumber, // From CSV
  annual_orders_target: optionalNumber, // From CSV
  primary_bottleneck: optionalString, // From CSV
  conversion_rate_pct: optionalNumber, // From CSV
  reorder_rate_6mo_pct: optionalString, // From CSV
  avg_sale_cycle_days: optionalString, // From CSV
}).passthrough();

export const SystemBusinessUnitSchema = BusinessUnitSchema.extend({
  // Adding fields from CSV or overriding types
  bu_type: optionalString, // From CSV
  offering_description: optionalString, // From CSV
  in_form_of: optionalString, // From CSV
  order_volume_range: optionalString, // From CSV
  sales_motion: optionalString, // From CSV
  support_model: optionalString, // From CSV
  pricing_model: optionalString, // From CSV
  pricing_model_name: optionalString, // From CSV
  owner_person_id: optionalString, // From CSV
  owner_rollup_name: optionalString, // From CSV
  serves_segments_ids: stringToArray, // From CSV
  primary_flywheel_id: optionalString, // From CSV
  primary_flywheel_name: optionalString, // From CSV
  upsell_path: optionalString, // From CSV
  monthly_capacity_orders: optionalNumber, // From CSV
  status: optionalString, // From CSV
  target_contribution_margin_pct: optionalString, // From CSV
  validated_aov: optionalNumber, // From CSV
  '9mo_actual_revenue_inr': optionalNumber, // From CSV
  '9mo_actual_orders': optionalNumber, // From CSV
  annual_revenue_target_inr: optionalNumber, // From CSV
  annual_orders_target: optionalNumber, // From CSV
  current_utilization_pct: optionalNumber, // From CSV
  production_sla_hours: optionalNumber, // From CSV
  gross_margin_pct: optionalNumber, // From CSV
  variable_cost_per_order: optionalNumber, // From CSV
  fixed_costs_monthly: optionalNumber, // From CSV
  break_even_orders: optionalNumber, // From CSV
}).passthrough();

export const SystemChannelSchema = ChannelSchema.extend({
  // Adding fields from CSV or overriding types
  channel_type: optionalString, // From CSV
  serves_primary_platform_ids: stringToArray, // From CSV
  serves_bus: stringToArray, // From CSV
  serves_flywheels: stringToArray, // From CSV
  segments_arrayed: optionalString, // From CSV
  Platform: optionalString, // From CSV
  segment_id: optionalString, // From CSV
  monthly_budget_inr: optionalNumber, // From CSV
  cac_target: optionalString, // From CSV
  current_cac: optionalNumber, // From CSV
  cac_gap: optionalString, // From CSV
  conversion_rate_pct: optionalNumber, // From CSV
  responsible_person: optionalString, // From CSV
  responsible_person_Name: optionalString, // From CSV
  status: optionalString, // From CSV
  Monthly_Volume: optionalNumber, // From CSV
  Annual_Revenue: optionalNumber, // From CSV
  Notes: optionalString, // From CSV
  LTV: optionalString, // From CSV
  ROI: optionalString, // From CSV
}).passthrough();

export const SystemInterfaceSchema = InterfaceSchema.extend({
  // Adding fields from CSV or overriding types
  interface_type: optionalString, // From CSV
  primary_user: optionalString, // From CSV
  serves_flywheels_ids: stringToArray, // From CSV
  serves_bus_ids: stringToArray, // From CSV
  tech_stack: optionalString, // From CSV
  owned_by_hub: optionalString, // From CSV
  owned_by_hub_name: optionalString, // From CSV
  responsible_person: optionalString, // From CSV
  priority_level: optionalString, // From CSV
  build_status: optionalString, // From CSV
  monthly_mau: optionalNumber, // From CSV
  integration_points: optionalString, // From CSV
  critical_to_operation: optionalString, // From CSV
  bottleneck_risk: optionalString, // From CSV
  annual_volume: optionalNumber, // From CSV
  notes: optionalString, // From CSV
}).passthrough();

export const SystemHubSchema = HubSchema.extend({
  // Adding fields from CSV or overriding types
  hub_type: optionalString, // From CSV
  owner_person: optionalString, // From CSV
  owner_person_name: optionalString, // From CSV
  core_capabilities: optionalString, // From CSV
  team_size: optionalNumber, // From CSV
  monthly_capacity_constraint: optionalString, // From CSV (assuming text like "26500 users/month")
  current_utilization_pct: optionalNumber, // From CSV
  budget_monthly_inr: optionalNumber, // From CSV
  status: optionalString, // From CSV
  revenue_attribution_monthly: optionalNumber, // From CSV
  cost_center_or_profit: optionalString, // From CSV
  interfaces_owned: stringToArray, // From CSV
  channels_owned: stringToArray, // From CSV
  primary_bottleneck: optionalString, // From CSV
  scale_trigger_point: optionalString, // From CSV
  note: optionalString, // From CSV
}).passthrough();

export const SystemPersonSchema = z.object({
  user_id: z.string(), // The primary key
  full_name: optionalString,
  email: z.string().email().optional(), // Made optional for cases where it's derived later
  role: optionalString,
  primary_hub: optionalString,
  owns_business_units_ids: stringToArray,
  owns_channels_ids: stringToArray,
  owns_flywheels_ids: stringToArray,
  owns_interfaces_ids: stringToArray,
  owns_platforms_ids: stringToArray,
  owns_segments_ids: stringToArray,
  owns_stages_ids: stringToArray,
  owns_touchpoints_ids: stringToArray,
  annual_comp_inr: optionalNumber,
  capacity_utilization_pct: optionalNumber,
  primary_okrs: optionalString,
  // Additions from CSV that may overlap or augment:
  // owner_person_name is often the full_name
  // role_title can map to role
  primary_hub_name: optionalString, // From CSV
  phone: optionalString, // From CSV
  department: optionalString, // From CSV
  role_title: optionalString, // From CSV
  manager_id: optionalString, // From CSV
  employment_type: optionalString, // From CSV
  weekly_hours_capacity: optionalNumber, // From CSV
  location: optionalString, // From CSV
  notes: optionalString, // From CSV
}).passthrough(); // Allow extra fields for flexibility

export const SystemStageSchema = z.object({
  stage_id: z.string(),
  stage_name: z.string(),
  flywheel: optionalString,
  stage_order: optionalNumber,
  stage_type: optionalString,
  serves_segments: optionalString,
  expected_conversion_rate: optionalNumber,
  current_conversion_rate: optionalNumber,
  benchmark_time: optionalString,
  current_time: optionalString,
  critical_to_revenue: optionalString,
  cumulative_conversion: optionalNumber,
  monthly_volume_in: optionalNumber,
  monthly_volume_out: optionalNumber,
  revenue_per_stage: optionalNumber,
  stage_description: optionalString,
}).passthrough();

export const SystemTouchpointSchema = z.object({
  touchpoint_id: z.string(),
  touchpoint_name: z.string(),
  stage_id: optionalString,
  flywheel_id: optionalString,
  customer_action: optionalString,
  serves_segments: optionalString,
  channel_id: optionalString,
  interface_id: optionalString,
  responsible_hub_id: optionalString,
  responsible_person_id: optionalString,
  success_metric: optionalString,
  target_value: optionalNumber,
  current_value: optionalNumber,
  gap_severity: optionalString,
  conversion_to_next: optionalNumber,
  drop_off_rate: optionalNumber,
  revenue_impact: optionalNumber,
  avg_time_in_stage: optionalString,
  monthly_volume: optionalNumber,
  friction_points: optionalString,
  intervention_cost: optionalNumber,
  roi_score: optionalNumber,
  current_status: optionalString,
}).passthrough();

export const SystemPlatformSchema = z.object({
    platformId: z.string(),
    platformName: z.string(),
    platformType: optionalString,
    purpose: optionalString,
    status: optionalString,
    owner: optionalString,
    notes: optionalString,
    // For compatibility
    platform_id: z.string().optional(),
    platform_name: z.string().optional(),
    platform_icon_url: optionalString,
    platform_link_url: optionalString,
}).passthrough();

export const ProgramSchema = z.object({
  program_id: z.string(),
  program_name: z.string(),
  serves_segment_ids: stringToArray,
  flywheel_id: optionalString,
  status: z.string(),
  priority: z.string(),
  owner_person_id: optionalString,
  owner_person_name: optionalString,
  owner_hub_id: optionalString,
  contributing_hub_ids: stringToArray,
  linked_business_unit_ids: stringToArray,
  customer_problem: optionalString,
  our_solution: optionalString,
  why_now: optionalString,
  timeline_start: optionalString,
  timeline_end: optionalString,
  success_metric: optionalString,
  target_value: optionalNumber,
  current_value: optionalNumber,
  metric_progress_pct: optionalNumber,
  budget_total: optionalNumber,
  budget_spent: optionalNumber,
  budget_remaining: optionalNumber,
  risk_level: optionalString,
  health_status: optionalString,
  blockers: optionalString,
  next_milestone: optionalString,
  next_milestone_date: optionalString,
  days_to_next_milestone: optionalNumber,
  dependent_program_ids: stringToArray,
  platform_ids: stringToArray,
  channel_ids: stringToArray,
  created_date: optionalString,
  last_updated: optionalString,
  updated_by_person_id: optionalString,
  notes: optionalString,
  days_total: optionalNumber,
  days_elapsed: optionalNumber,
  days_remaining: optionalNumber,
  timeline_progress_pct: optionalNumber,
  budget_variance: optionalNumber,
  velocity_score: optionalNumber,
  weekly_burn_rate: optionalNumber,
  runway_days: optionalNumber,
  on_track_indicator: optionalString,
  budget_burn_rate_pct: optionalNumber,
  projects_count: optionalNumber,
  projects_active: optionalNumber,
  projects_blocked: optionalNumber,
  projects_complete: optionalNumber,
  program_completion_pct: optionalNumber,
  tasks_total: optionalNumber,
  tasks_complete: optionalNumber,
  tasks_blocked: optionalNumber,
  budget_original: optionalNumber,
  budget_revised1: optionalNumber,
  created_at: optionalString,
  created_by: optionalString,
  updated_at: optionalString,
  updated_by: optionalString,
  objective: optionalString, // Keep for form compatibility
});

export const MgmtProjectSchema = z.object({
  project_id: z.string(),
  project_name: z.string(),
  program_id: optionalString,
  program_name: optionalString,
  owner_id: optionalString,
  owner_name: optionalString,
  hub_id: optionalString,
  hub_name: optionalString,
  status: statusPreprocessor,
  priority: priorityPreprocessor,
  start_date: optionalString,
  end_date: optionalString,
  budget: optionalNumber,
  dependencies: optionalString,
  success_metric: optionalString,
  revenue_impact: optionalString,
  project_type: optionalString,
  business_unit_impact: optionalString,
  segment_impact: optionalString,
  platform_id: optionalString,
  channel_ids: stringToArray,
  completion_pct: optionalNumber,
  health_score: optionalNumber,
  actual_end_date: optionalString,
  milestones_count: optionalNumber,
  tasks_count: optionalNumber,
  tasks_complete: optionalNumber,
  tasks_in_progress: optionalNumber,
  tasks_blocked: optionalNumber,
  days_to_deadline: optionalNumber,
  budget_spent: optionalNumber,
  budget_variance: optionalNumber,
  velocity_tasks_per_day: optionalNumber,
  is_on_time: optionalString,
  budget_original: optionalNumber,
  budget_revised: optionalNumber,
  created_at: optionalString,
  created_by: optionalString,
  updated_at: optionalString,
  updated_by: optionalString,
  objective: optionalString, // Keep for form compatibility
});

export const MilestoneSchema = z.object({
  milestone_id: z.string(),
  project_id: optionalString,
  milestone_name: z.string(),
  owner: optionalString,
  start_date: optionalString,
  target_date: optionalString,
  status: z.string(),
  'completion_%': optionalNumber,
  task_blocker: optionalString,
  owner_id: optionalString,
  owner_name: optionalString,
  Tasks_Count: optionalString,
  Tasks_Complete: optionalNumber,
  'Calc_Completion_%': optionalNumber,
  Days_to_Target: optionalString,
  milestone_type: optionalString,
  blocker_type: optionalString,
  dependent_milestone_ids: optionalString,
  actual_completion_date: optionalString,
  created_at: optionalString,
  created_by: optionalString,
  updated_at: optionalString,
  updated_by: optionalString,
}).passthrough(); // Passthrough to allow 'Task_blocker' if it exists in data

export const MgmtTaskSchema = z.object({
  task_id: z.string(),
  project_id: optionalString,
  milestone_id: optionalString,
  task_name: z.string(),
  owner_id: optionalString,
  owner_name: optionalString,
  hub_id: optionalString,
  hub_name: optionalString,
  description: optionalString,
  priority: priorityPreprocessor,
  status: statusPreprocessor,
  effort_hours: optionalNumber,
  due_date: optionalString,
  dependencies: optionalString,
  assignee_ids: optionalString,
  task_category: optionalString,
  task_type: optionalString,
  actual_completion_date: optionalNumber,
  notes: optionalString,
  impact_if_delayed: optionalString,
  age_days: optionalNumber,
  created_at: optionalString,
  created_by: optionalString,
  updated_at: optionalString,
  updated_by: optionalString,
});

export const MgmtHubSchema = z.object({
  team_id: z.string(),
  team_name: z.string(),
  hub_id: z.string(),
  agency_function: optionalString,
  primary_kpi: optionalString,
  budget_monthly: optionalNumber,
  headcount: optionalNumber,
});

export const WeeklyUpdateSchema = z.object({
  update_id: z.string(),
  project_id: z.string(),
  week_ending: z.string(),
  owner: z.string(),
  status_color: z.string(),
  progress_summary: z.string(),
  blockers: optionalString,
  decisions_needed: optionalString,
});

export const DecisionLogSchema = z.object({
  decision_id: z.string(),
  date: z.string(),
  decision_maker: z.string(),
  project_id: z.string(),
  decision: z.string(),
  rationale: z.string(),
  alternatives_considered: optionalString,
  impact: z.string(),
});

export const FlywheelStrategySchema = z.object({
  flywheelId: z.string(),
  flywheelName: z.string(),
  strategicRank: optionalNumber,
  positioningWeOwn: optionalString,
  bottleneckProblem: optionalString,
  servesSegments: optionalString,
  strategicAction: optionalString,
  velocityCompounding: optionalString,
  fixInvestment: optionalString,
  killCriteria: optionalString,
});

export const SegmentPositioningSchema = z.object({
  segment: z.string(),
  segmentName: z.string(),
  tagline: optionalString,
  ourPov: optionalString,
  shiftFrom: optionalString,
  shiftTo: optionalString,
});

export const FunnelStageSchema = z.object({
  stageId: z.string(),
  flywheelId: z.string(),
  stage: z.string(),
  hubName: optionalString,
  ownerName: optionalString,
  currentConv: optionalString,
  targetConv: optionalString,
  bottleneck: optionalString,
  interfaceChannel: optionalString,
});

export const InterfaceMapSchema = z.object({
  flywheel: z.string(),
  interfaceId: z.string(),
  interfaceName: z.string(),
  channelName: optionalString,
  hubName: optionalString,
  ownerName: optionalString,
  status: optionalString,
  channelId: optionalString,
});

export const AppSheetRowSchema = z.object({
  _rowIndex: z.number().optional(), // Internal helper
  spreadsheet_name: optionalString,
  spreadsheet_code: optionalString,
  spreadsheet_id: optionalString,
  sheet_name: optionalString,
  table_alias: optionalString,
  sheet_id: optionalString, // Explicitly add sheet_id as it is derived from 'gid' in the sheet
  header: optionalString, // Added from user's provided App sheet columns
}).catchall(z.any());

export const MasterSchemaRowSchema = z.object({
  _rowIndex: z.number().optional(), // Internal helper for updates
  // Core fields for the application's configuration
  table_alias: optionalString, // Changed to optional for better parsing of partial data, existing logic handles presence
  app_field: optionalString, // Changed to optional for better parsing of partial data
  header: optionalString, // User-provided list explicitly includes 'header'

  // New fields provided by the user for comprehensive schema definition
  spreadsheet_id: optionalString,
  spreadsheet_name: optionalString,
  sheet_name: optionalString,
  gid: optionalString, // Matches the new header name
  A1_Column_Range: optionalString, // New field
  Named_Range_Name: optionalString, // New field
  col_index: optionalNumber,
  'Column Letter': optionalString, // New field
  sample_value: optionalString,
  Protection_Status: optionalString, // New field
  Data_Type: z.enum(['STRING', 'NUMBER', 'BLANK', 'STRING_ARRAY']).optional(), // Explicit enum type based on CSV
  Contains_Formula: optionalBoolean, // New field
  Data_Validation: optionalString, // New field
  Column_aliases: optionalString, // New field

  // Existing/retained fields for compatibility or specific app use (some may overlap with new user-provided headers)
  key_field: optionalString, 
  named_data_range: optionalString,
  range: optionalString,
  sheet_type: optionalString,
  system_role: optionalString,
  data_tier: optionalString,
  description: optionalString,
  detected_type: optionalBoolean, // Fixed to be optionalBoolean as per schema.ts context
  has_formula: optionalBoolean,
  is_pk: z.preprocess(val => String(val).toUpperCase() === 'TRUE', z.boolean()).optional(),
  fk_ref: optionalString,
  snapshot_ts: optionalString, // Re-added this property
}).catchall(z.any());