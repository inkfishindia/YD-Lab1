
import {
  Person,
  BusinessUnit,
  Flywheel,
  Priority,
  Status,
  HealthStatus,
  Lead,
  Opportunity,
  Account,
  LeadStatus,
  OpportunityStage,
  BrainDump,
  Role,
  Hub,
  Interface,
  Channel,
  CustomerSegment,
  FlywheelStrategy,
  SegmentPositioning,
  FunnelStage,
  InterfaceMap,
} from '../types';

export const mockRoles: Role[] = [
  { role_name: 'Admin', permissions: ['*:*'] },
  {
    role_name: 'Manager',
    permissions: [
      '*:read',
      'projects:write',
      'tasks:write',
      'people:read',
      'partners:write',
      'strategy:read',
    ],
  },
  { role_name: 'Contributor', permissions: ['projects:read', 'tasks:*', 'braindump:*'] },
  { role_name: 'Viewer', permissions: ['*:read'] },
];

export const mockPeople: Person[] = [
  {
    user_id: 'mock_user_1',
    full_name: 'Alex Johnson',
    email: 'alex.j@example.com',
    department: 'Engineering',
    role_title: 'Lead Developer',
    is_active: true,
    manager_id: '',
    role_name: 'Admin',
    personId: 'mock_user_1', // Added for SystemPerson compatibility
    fullName: 'Alex Johnson', // Added for SystemPerson compatibility
    role: 'Lead Developer', // Added for SystemPerson compatibility
  },
  {
    user_id: 'mock_user_2',
    full_name: 'Maria Garcia',
    email: 'maria.g@example.com',
    department: 'Product',
    role_title: 'Product Manager',
    is_active: true,
    manager_id: '',
    role_name: 'Manager',
    personId: 'mock_user_2', // Added for SystemPerson compatibility
    fullName: 'Maria Garcia', // Added for SystemPerson compatibility
    role: 'Product Manager', // Added for SystemPerson compatibility
  },
  {
    user_id: 'mock_user_3',
    full_name: 'Sam Chen',
    email: 'sam.c@example.com',
    department: 'Design',
    role_title: 'UX Designer',
    is_active: false,
    manager_id: 'mock_user_2',
    role_name: 'Contributor',
    personId: 'mock_user_3', // Added for SystemPerson compatibility
    fullName: 'Sam Chen', // Added for SystemPerson compatibility
    role: 'UX Designer', // Added for SystemPerson compatibility
  },
  {
    user_id: 'mock_user_4',
    full_name: 'David Lee',
    email: 'david.l@example.com',
    department: 'Engineering',
    role_title: 'Frontend Developer',
    is_active: true,
    manager_id: 'mock_user_1',
    role_name: 'Contributor',
    personId: 'mock_user_4', // Added for SystemPerson compatibility
    fullName: 'David Lee', // Added for SystemPerson compatibility
    role: 'Frontend Developer', // Added for SystemPerson compatibility
  },
];

export const mockCustomerSegments: CustomerSegment[] = [
  {
    segmentId: 'SEG-MOCK-1',
    segmentName: 'SMB',
    segment_id: 'SEG-MOCK-1',
    segment_name: 'SMB',
    Promise: 'Your simple growth partner',
    psychological_job: 'Help me feel in control',
    behavioral_truth: 'They value simplicity',
    brand_position: 'Your simple growth partner',
    messaging_tone: 'Encouraging',
    design_pov: 'Clean and intuitive',
    served_by_flywheels_ids: ['mock_fw_1'],
    owner_person_id: 'mock_user_2',
    vision: 'To be the leading platform for SMB growth.',
    mission: 'Empower small businesses with intuitive tools.',
    expression: 'Simplicity and effectiveness.',
    market_category: 'SaaS',
    differentiated_value: 'All-in-one solution with exceptional ease of use.',
    For: 'Small businesses seeking growth.',
    Against: 'Complex enterprise software.',
    category_entry_points: 'Online search, word-of-mouth.',
    buying_situations: 'Scaling operations, needing better efficiency.',
    distinctive_assets: 'User-friendly interface, dedicated support.',
    competitive_alt_1: 'Competitor A',
    competitive_alt_2: 'Competitor B',
    competitive_alt_3: '',
    'age group': '25-55',
    company_size: '1-50 employees',
    psychographic: 'Growth-oriented, tech-savvy but time-constrained.',
    purchase_trigger_1: 'Need to automate tasks.',
    purchase_trigger_2: 'Struggling with multiple disjointed tools.',
    purchase_trigger_3: '',
    current_solution_efficiency: 'Low',
    our_solution_efficiency: 'High',
    delta_score: 'Significant improvement',
    adoption_threshold: 'Easy setup in <1 hour.',
    irreversibility_trigger: 'Deep integration into daily workflow.',
    old_world_pain: 'Wasting time on manual tasks.',
    new_world_gain: 'More time for strategic growth.',
    strategic_notes: 'Focus on frictionless onboarding.',
    Platforms: 'Web, Mobile',
    revenue_9mo_actual_inr: 5000000,
    current_customers: 500,
    ltv_cac_ratio: '3:1',
    validated_cac: '500',
    validated_aov: 1000,
    priority_rank: 'High',
    customer_profile: 'Small business owners and managers looking for efficient tools.',
    nineMonthRevenue: 5000000,
    percentRevenue: '50%',
    status: 'ACTIVE',
    bu_id: 'mock_bu_1', // Added for SystemSegment compatibility
  },
  {
    segmentId: 'SEG-MOCK-2',
    segmentName: 'Enterprise',
    segment_id: 'SEG-MOCK-2',
    segment_name: 'Enterprise',
    Promise: 'The secure, scalable choice',
    psychological_job: 'Make my team look good',
    behavioral_truth: 'They need security and support',
    brand_position: 'The secure, scalable choice',
    messaging_tone: 'Confident',
    design_pov: 'Data-dense and powerful',
    served_by_flywheels_ids: ['mock_fw_2'],
    owner_person_id: 'mock_user_1',
    vision: 'To be the trusted enterprise solution.',
    mission: 'Provide secure and scalable platforms.',
    expression: 'Reliability and performance.',
    market_category: 'Enterprise Software',
    differentiated_value: 'Robust security and unparalleled scalability.',
    For: 'Large corporations with complex needs.',
    Against: 'Fragile, non-compliant systems.',
    category_entry_points: 'Direct sales, industry events.',
    buying_situations: 'Digital transformation, compliance requirements.',
    distinctive_assets: 'Enterprise-grade security, dedicated support teams.',
    competitive_alt_1: 'Enterprise Suite X',
    competitive_alt_2: 'Legacy System Y',
    competitive_alt_3: '',
    'age group': '30-60',
    company_size: '500+ employees',
    psychographic: 'Risk-averse, value stability and integration.',
    purchase_trigger_1: 'Security breach concerns.',
    purchase_trigger_2: 'Inefficient scaling.',
    purchase_trigger_3: '',
    current_solution_efficiency: 'Moderate',
    our_solution_efficiency: 'High',
    delta_score: 'Significant improvement',
    adoption_threshold: 'Seamless integration with existing systems.',
    irreversibility_trigger: 'Company-wide deployment and training.',
    old_world_pain: 'Dealing with insecure, siloed data.',
    new_world_gain: 'Consolidated, secure, and efficient operations.',
    strategic_notes: 'Prioritize security features and compliance.',
    Platforms: 'Web, API',
    revenue_9mo_actual_inr: 10000000,
    current_customers: 50,
    ltv_cac_ratio: '5:1',
    validated_cac: '5000',
    validated_aov: 25000,
    priority_rank: 'High',
    customer_profile: 'Large organizations with complex IT needs and strict security requirements.',
    nineMonthRevenue: 10000000,
    percentRevenue: '50%',
    status: 'ACTIVE',
    bu_id: 'mock_bu_2', // Added for SystemSegment compatibility
  },
];

export const mockFlywheels: Flywheel[] = [
  {
    flywheelId: 'mock_fw_1',
    flywheelName: 'Self-Service Acquisition',
    flywheel_id: 'mock_fw_1',
    flywheel_name: 'Self-Service Acquisition',
    serves_segments: ['SEG-MOCK-1'], // Corrected to match schema `string[]`
    motion_sequence: 'Product-Led Growth',
    acquisition_channels: ['CH_1', 'CH_2'], // Changed to string[] to match SystemFlywheelSchema
    annual_revenue_target_inr: 1000000,
    primary_bottleneck: 'Users sign up and convert on their own.',
    efficiency_metrics: ['Sign-ups', 'Conversion Rate'], // Changed to string[] for SystemFlywheelSchema
    owner_person: 'mock_user_2',
    owner_person_Name: 'Maria Garcia', // For compatibility in system map
    order_size_range: 'Small',
    cac_target: '50',
    validated_aov_inr: 1432,
    serves_bus: ['mock_bu_1'], // Corrected to match schema `string[]`
    description: 'Focuses on attracting and converting SMBs through an intuitive product experience.',
    interface: 'Web App',
    customer_struggle_solved: 'Complexity of existing tools.',
    acquisition_model: 'PLG',
    service_model: 'Self-serve support',
    serves: 'SMB Segment',
    key_metrics: 'Trial conversions, DAU',
    '9mo_actual_revenue_inr': 750000,
    '9mo_actual_orders': 7500,
    jtbd_trigger_moment: 'Need for quick setup.',
    conversion_rate_pct: 1.5,
    validation_status: 'VALIDATED',
    customer_struggle: 'Complexity of existing tools.',
  },
  {
    flywheelId: 'mock_fw_2',
    flywheelName: 'Enterprise Sales Motion',
    flywheel_id: 'mock_fw_2',
    flywheel_name: 'Enterprise Sales Motion',
    serves_segments: ['SEG-MOCK-2'], // Corrected to match schema `string[]`
    motion_sequence: 'Sales-Led',
    acquisition_channels: ['CH_3'], // Changed to string[] to match SystemFlywheelSchema
    annual_revenue_target_inr: 5000000,
    primary_bottleneck: 'High-touch sales process for large accounts.',
    efficiency_metrics: ['SQLs', 'Close Rate'], // Changed to string[] for SystemFlywheelSchema
    owner_person: 'mock_user_1',
    owner_person_Name: 'Alex Johnson', // For compatibility in system map
    order_size_range: 'Large',
    cac_target: '5000',
    validated_aov_inr: 50000,
    serves_bus: ['mock_bu_2'], // Corrected to match schema `string[]`
    description: 'Targets large enterprises with a dedicated sales team and bespoke solutions.',
    interface: 'Direct Sales',
    customer_struggle_solved: 'Lack of tailored solutions for complex needs.',
    acquisition_model: 'SLG',
    service_model: 'Dedicated account management',
    serves: 'Enterprise Segment',
    key_metrics: 'Deal velocity, ACV',
    '9mo_actual_revenue_inr': 3200000,
    '9mo_actual_orders': 64,
    jtbd_trigger_moment: 'Compliance requirements.',
    conversion_rate_pct: 0.5,
    validation_status: 'VALIDATED',
    customer_struggle: 'Lack of tailored solutions for complex needs.',
  },
];

export const mockBusinessUnits: BusinessUnit[] = [
  {
    businessUnitId: 'mock_bu_1',
    businessUnitName: 'Consumer Mobile',
    bu_id: 'mock_bu_1',
    bu_name: 'Consumer Mobile',
    bu_type: 'Mobile App',
    owner_person_id: 'mock_user_2',
    primary_flywheel_id: 'mock_fw_1',
    serves_segments_ids: ['SEG-MOCK-1'],
    order_volume_range: '1-10',
    offering_description: 'Mobile App for iOS/Android',
    pricing_model_name: 'Subscription',
    validated_aov: 99,
    sales_motion: 'PLG',
    support_model: 'Email',
    current_revenue: 750000,
    current_orders: 7500,
    status: 'Active',
    // Additional BMC/System Map fields
    in_form_of: 'Native iOS/Android Application',
    pricing_model: 'Subscription',
    current_utilization_pct: 80,
    annual_revenue_target_inr: 1000000,
    '9mo_actual_revenue_inr': 750000,
    coreOffering: 'Mobile App for iOS/Android', // Added for BusinessUnitSchema compatibility
    primarySegments: 'SEG-MOCK-1', // Added for BusinessUnitSchema compatibility
    flywheelId: 'mock_fw_1', // Added for BusinessUnitSchema compatibility
    volumeRange: '1-10', // Added for BusinessUnitSchema compatibility
    primaryOwner: 'Maria Garcia', // Added for BusinessUnitSchema compatibility
    nineMonthRevenue: 750000, // Added for BusinessUnitSchema compatibility
    percentRevenue: '75%', // Added for BusinessUnitSchema compatibility
    notes: 'Consumer-focused mobile application.', // Added for BusinessUnitSchema compatibility
  },
  {
    businessUnitId: 'mock_bu_2',
    businessUnitName: 'Enterprise Platform',
    bu_id: 'mock_bu_2',
    bu_name: 'Enterprise Platform',
    bu_type: 'Web Platform',
    owner_person_id: 'mock_user_1',
    primary_flywheel_id: 'mock_fw_2',
    upsell_path: 'mock_fw_1',
    serves_segments_ids: ['SEG-MOCK-2'],
    order_volume_range: '100+',
    offering_description: 'Web Platform for large accounts',
    pricing_model_name: 'Contract',
    validated_aov: 50000,
    sales_motion: 'SLG',
    support_model: 'Dedicated',
    current_revenue: 3200000,
    current_orders: 64,
    status: 'Active',
    // Additional BMC/System Map fields
    in_form_of: 'SaaS Web Platform',
    pricing_model: 'Contract',
    current_utilization_pct: 60,
    annual_revenue_target_inr: 5000000,
    '9mo_actual_revenue_inr': 3200000,
    coreOffering: 'Web Platform for large accounts', // Added for BusinessUnitSchema compatibility
    primarySegments: 'SEG-MOCK-2', // Added for BusinessUnitSchema compatibility
    flywheelId: 'mock_fw_2', // Added for BusinessUnitSchema compatibility
    volumeRange: '100+', // Added for BusinessUnitSchema compatibility
    primaryOwner: 'Alex Johnson', // Added for BusinessUnitSchema compatibility
    nineMonthRevenue: 3200000, // Added for BusinessUnitSchema compatibility
    percentRevenue: '60%', // Added for BusinessUnitSchema compatibility
    notes: 'Enterprise-grade web platform solution.', // Added for BusinessUnitSchema compatibility
  },
];

export const mockAccounts: Account[] = [
  {
    account_id: 'mock_acc_1',
    account_name: 'Innovate Corp',
    industry: 'Technology',
    website: 'innovate.com',
    owner_user_id: 'mock_user_2',
  },
  {
    account_id: 'mock_acc_2',
    account_name: 'HealthWell Inc.',
    industry: 'Healthcare',
    website: 'healthwell.com',
    owner_user_id: 'mock_user_1',
  },
];

export const mockOpportunities: Opportunity[] = [
  {
    opportunity_id: 'mock_opp_1',
    opportunity_name: 'Platform Subscription Deal',
    account_id: 'mock_acc_1',
    stage: OpportunityStage.Proposal,
    amount: 120000,
    close_date: '2024-12-15',
    owner_user_id: 'mock_user_2',
  },
  {
    opportunity_id: 'mock_opp_2',
    opportunity_name: 'Consulting Services',
    account_id: 'mock_acc_2',
    stage: OpportunityStage.Negotiation,
    amount: 75000,
    close_date: '2024-11-30',
    owner_user_id: 'mock_user_1',
  },
  {
    opportunity_id: 'mock_opp_3',
    opportunity_name: 'Hardware Upgrade',
    account_id: 'mock_acc_1',
    stage: OpportunityStage['Closed - Won'],
    amount: 250000,
    close_date: '2024-07-20',
    owner_user_id: 'mock_user_2',
  },
];

export const mockLeads: Lead[] = [
  {
    lead_id: 'mock_lead_1',
    date: '2024-08-01',
    full_name: 'Jane Doe',
    email: 'jane.d@datasolutions.com',
    phone: '555-1234',
    brand: 'Data Solutions LLC',
    source_channel: 'Webinar',
    created_at: '2024-08-01T10:00:00Z',
    status_stage: LeadStatus.Qualified,
    sdr_owner_fk: 'mock_user_1',
    last_activity_date: '2024-08-10',
    lead_score: '85',
    disqualified_reason: '',
  },
  {
    lead_id: 'mock_lead_2',
    date: '2024-08-02',
    full_name: 'John Smith',
    email: 'john.s@creative.com',
    phone: '555-5678',
    brand: 'Creative Minds Agency',
    source_channel: 'Referral',
    created_at: '2024-08-02T11:00:00Z',
    status_stage: LeadStatus.Contacted,
    sdr_owner_fk: 'mock_user_2',
    last_activity_date: '2024-08-05',
    lead_score: '60',
    disqualified_reason: '',
  },
  {
    lead_id: 'mock_lead_3',
    date: '2024-08-03',
    full_name: 'Emily White',
    email: 'emily.w@nextgen.com',
    phone: '555-8765',
    brand: 'NextGen Retail',
    source_channel: 'Cold Call',
    created_at: '2024-08-03T12:00:00Z',
    status_stage: LeadStatus.New,
    sdr_owner_fk: 'mock_user_1',
    last_activity_date: '2024-08-03',
    lead_score: '40',
    disqualified_reason: '',
  },
];

export const mockBrainDumps: BrainDump[] = [
  {
    braindump_id: 'mock_bd_1',
    timestamp: '2024-08-15T10:00:00Z',
    type: 'Idea',
    content: 'Develop a new AI-powered feature for task prioritization.',
    user_email: 'alex.j@example.com',
    priority: Priority.Medium,
  },
  {
    braindump_id: 'mock_bd_2',
    timestamp: '2024-08-15T11:30:00Z',
    type: 'Feedback',
    content: 'Users are reporting that the mobile app dashboard loads slowly.',
    user_email: 'maria.g@example.com',
    priority: Priority.High,
  },
  {
    braindump_id: 'mock_bd_3',
    timestamp: '2024-08-16T09:05:00Z',
    type: 'Note',
    content:
      'Remember to follow up with the marketing team about the Q4 campaign stats.',
    user_email: 'alex.j@example.com',
    priority: Priority.Low,
  },
];

export const mockHubs: Hub[] = [
  {
    hubId: 'HUB-01',
    hubName: 'Production',
    hub_id: 'HUB-01',
    hub_name: 'Production',
    hub_type: 'Operations',
    owner_person: 'mock_user_1',
    primaryOwner: 'Alex Johnson', // Added for Hub compatibility
    core_capabilities:
      'Blanks sourcing, printing (DTG/screen/embroidery), quality control, fulfillment, shipping, custom manufacturing',
    interfaces_owned: ['mock_if_1', 'mock_if_2'],
    monthly_capacity_constraint: true,
    capacity_constraint: true, // Added for Hub compatibility
    hiring_priority: 'Low',
    budget_monthly_inr: 500000,
    note:
      'Currently at 65% capacity. Need custom artisan for BU4 premium gifting. Quality is strong.',
    notes: 'Currently at 65% capacity. Need custom artisan for BU4 premium gifting. Quality is strong.', // Added for Hub compatibility
    function_category: 'Operations', // Added for SystemHub compatibility
    cost_center_or_profit: 'Cost Center', // Added for SystemHub compatibility
    team_size: 15,
    current_utilization_pct: 65,
    revenue_attribution_monthly: 0,
    primary_bottleneck: 'Custom artisan sourcing for premium items.',
    scale_trigger_point: 'Automation of embroidery setup.',
    what_they_enable: 'Physical product creation and delivery.',
    serves_bu1: true,
    serves_bu2: false,
    serves_bu3: false,
    serves_bu4: false,
    serves_bu5: false,
    serves_bu6: false,
  },
  {
    hubId: 'HUB-02',
    hubName: 'Marketing Creative',
    hub_id: 'HUB-02',
    hub_name: 'Marketing Creative',
    hub_type: 'Marketing',
    owner_person: 'mock_user_2',
    primaryOwner: 'Maria Garcia', // Added for Hub compatibility
    core_capabilities: 'Campaign assets, social media content, product photography',
    interfaces_owned: ['mock_if_1'],
    monthly_capacity_constraint: true,
    capacity_constraint: true, // Added for Hub compatibility
    hiring_priority: 'High',
    budget_monthly_inr: 250000,
    note: 'Needs a new video editor.',
    notes: 'Needs a new video editor.', // Added for Hub compatibility
    function_category: 'Marketing', // Added for SystemHub compatibility
    cost_center_or_profit: 'Cost Center', // Added for SystemHub compatibility
    team_size: 8,
    current_utilization_pct: 85,
    revenue_attribution_monthly: 0,
    primary_bottleneck: 'Video content production speed.',
    scale_trigger_point: 'Hiring 2 more video editors.',
    what_they_enable: 'Visual and textual marketing collateral.',
    serves_bu1: false,
    serves_bu2: true,
    serves_bu3: false,
    serves_bu4: false,
    serves_bu5: false,
    serves_bu6: false,
  },
];

export const mockInterfaces: Interface[] = [
  {
    interface_id: 'mock_if_1',
    interface_name: 'SEO & Blog',
    interface_type: 'Inbound',
    serves_flywheels_ids: ['mock_fw_1'],
    serves_bus_ids: ['mock_bu_1'],
    responsible_person: 'mock_user_2',
    monthly_mau: 15000,
    notes: 'Content is performing well.',
    interface_category: 'Marketing', // Added for SystemInterface compatibility
    build_status: 'Active', // Added for SystemInterface compatibility
    monthly_budget: 10000,
    annual_volume: 180000,
    cost_model: 'CPM',
    avg_cac: 0.5,
    avg_conversion_rate: 0.02,
    tech_stack: 'CH_1',
    owned_by_hub: 'HUB-02', // Added for SystemInterface compatibility
  },
  {
    interface_id: 'mock_if_2',
    interface_name: 'Enterprise Outbound',
    interface_type: 'Outbound',
    serves_flywheels_ids: ['mock_fw_2'],
    serves_bus_ids: ['mock_bu_2'],
    responsible_person: 'mock_user_1',
    monthly_mau: 250,
    notes: '',
    interface_category: 'Sales', // Added for SystemInterface compatibility
    build_status: 'Active', // Added for SystemInterface compatibility
    monthly_budget: 5000,
    annual_volume: 3000,
    cost_model: 'CPL',
    avg_cac: 20,
    avg_conversion_rate: 0.05,
    tech_stack: 'CH_3',
    owned_by_hub: 'HUB-01', // Added for SystemInterface compatibility
  },
  {
    interface_id: 'mock_if_3',
    interface_name: 'Partnership Program',
    interface_type: 'Hybrid',
    serves_flywheels_ids: ['mock_fw_2'],
    serves_bus_ids: ['mock_bu_1', 'mock_bu_2'],
    responsible_person: 'mock_user_2',
    monthly_mau: 1000,
    notes: '',
    interface_category: 'Business Development', // Added for SystemInterface compatibility
    build_status: 'Active', // Added for SystemInterface compatibility
    monthly_budget: 7500,
    annual_volume: 12000,
    cost_model: 'CPA',
    avg_cac: 10,
    avg_conversion_rate: 0.03,
    tech_stack: '',
    owned_by_hub: 'HUB-02', // Added for SystemInterface compatibility
  },
];

export const mockChannels: Channel[] = [
  {
    channelId: 'CH_1',
    channelName: 'Website', // FIX: Added missing channelName
    channel_id: 'CH_1',
    channel_name: 'Website',
    channel_type: 'Owned',
    Platform: 'Web',
    Notes: 'Lead Gen & SEO',
    serves_flywheels: ['mock_fw_1'],
    serves_bus: ['mock_bu_1'],
    responsible_person: 'mock_user_2',
    focus: 'Acquisition',
    interfaces: 'mock_if_1',
    monthly_budget_inr: 50000,
    current_cac: 10,
  },
  {
    channelId: 'CH_2',
    channelName: 'Facebook Ads', // FIX: Added missing channelName
    channel_id: 'CH_2',
    channel_name: 'Facebook Ads',
    channel_type: 'Paid Social',
    Platform: 'Meta',
    Notes: 'Brand Awareness',
    serves_flywheels: ['mock_fw_1'],
    serves_bus: ['mock_bu_1'],
    responsible_person: 'mock_user_2',
    focus: 'Awareness',
    interfaces: '',
    monthly_budget_inr: 20000,
    current_cac: 50,
  },
  {
    channelId: 'CH_3',
    channelName: 'Google Ads', // FIX: Added missing channelName
    channel_id: 'CH_3',
    channel_name: 'Google Ads',
    channel_type: 'Paid Search',
    Platform: 'Google',
    Notes: 'Direct Conversions',
    serves_flywheels: ['mock_fw_2'],
    serves_bus: ['mock_bu_2'],
    responsible_person: 'mock_user_1',
    focus: 'Conversion',
    interfaces: 'mock_if_2',
    monthly_budget_inr: 30000,
    current_cac: 30,
  },
];

export const mockFlywheelStrategies: FlywheelStrategy[] = [
  {
    flywheelId: 'mock_fw_1',
    flywheelName: 'Self-Service Acquisition',
    strategicRank: 1,
    positioningWeOwn: 'The simplest tool for SMBs to get started.',
    bottleneckProblem: 'High drop-off during user onboarding.',
    servesSegments: 'SEG-MOCK-1',
    strategicAction: 'Redesign onboarding flow to be more guided.',
    velocityCompounding: 'Weekly new sign-ups',
    fixInvestment: '1 Designer, 2 Engineers for 1 Quarter',
    killCriteria: 'If activation rate does not improve by 15% in 3 months.',
  },
];

export const mockSegmentPositionings: SegmentPositioning[] = [
  {
    segment: 'SEG-MOCK-1',
    segmentName: 'Small-to-Medium Business',
    tagline: 'Growth, simplified.',
    ourPov:
      'SMBs are underserved by complex enterprise tools. They need simple, powerful software that delivers value immediately.',
    shiftFrom: 'Confusing, feature-packed platforms.',
    shiftTo: 'An intuitive, outcome-focused experience.',
  },
];

export const mockFunnelStages: FunnelStage[] = [
  {
    stageId: 'st_1',
    flywheelId: 'mock_fw_1',
    stage: 'Awareness',
    hubName: 'Marketing Creative',
    ownerName: 'Maria Garcia',
    currentConv: '2.1%',
    targetConv: '3.0%',
    bottleneck: 'Low CTR on social ads.',
    interfaceChannel: 'mock_if_1/CH_1',
  },
  {
    stageId: 'st_2',
    flywheelId: 'mock_fw_1',
    stage: 'Activation',
    hubName: 'Product Dev',
    ownerName: 'Alex Johnson',
    currentConv: '15%',
    targetConv: '20%',
    bottleneck: 'Complex setup process.',
    interfaceChannel: 'Web App',
  },
];

export const mockInterfaceMaps: InterfaceMap[] = [
  {
    flywheel: 'Self-Service Acquisition',
    interfaceId: 'mock_if_1',
    interfaceName: 'SEO & Blog',
    channelName: 'Website',
    hubName: 'Marketing Creative',
    ownerName: 'Maria Garcia',
    status: 'Active',
    channelId: 'CH_1',
  },
  {
    flywheel: 'Self-Service Acquisition',
    interfaceId: 'mock_if_3',
    interfaceName: 'Partnership Program',
    channelName: 'Referral Network',
    hubName: 'Business Dev',
    ownerName: 'Maria Garcia',
    status: 'Active',
    channelId: 'CH_4',
  },
];