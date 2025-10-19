// FIX: Changed `import type` to `import` because enums are used as values.
import {
  HealthStatus,
  LeadStatus,
  OpportunityStage,
  Priority,
  Status,
} from './types';

// FIX: Use bracket notation for enum members with spaces.
export const STATUS_COLORS: Record<Status, string> = {
  [Status['Not Started']]: 'bg-gray-700 text-gray-300',
  [Status['In Progress']]: 'bg-blue-800/50 text-blue-300',
  [Status.Completed]: 'bg-green-800/50 text-green-300',
  [Status['On Hold']]: 'bg-yellow-800/50 text-yellow-300',
  [Status.Cancelled]: 'bg-red-800/50 text-red-300',
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  [Priority.Low]: 'bg-green-800/50 text-green-300',
  [Priority.Medium]: 'bg-yellow-800/50 text-yellow-300',
  [Priority.High]: 'bg-red-800/50 text-red-300',
  [Priority.Critical]: 'bg-purple-800/50 text-purple-300',
};

// FIX: Use bracket notation for enum members with spaces.
export const HEALTH_STATUS_COLORS: Record<HealthStatus, string> = {
  [HealthStatus['On Track']]: 'bg-green-800/50 text-green-300',
  [HealthStatus['At Risk']]: 'bg-yellow-800/50 text-yellow-300',
  [HealthStatus['Off Track']]: 'bg-red-800/50 text-red-300',
};

export const LEAD_STATUS_COLORS: Record<LeadStatus, string> = {
  [LeadStatus.New]: 'bg-blue-800/50 text-blue-300',
  [LeadStatus.Contacted]: 'bg-yellow-800/50 text-yellow-300',
  [LeadStatus.Qualified]: 'bg-green-800/50 text-green-300',
  [LeadStatus.Disqualified]: 'bg-gray-700 text-gray-300',
};

// FIX: Use bracket notation for enum members with spaces.
export const OPPORTUNITY_STAGE_COLORS: Record<OpportunityStage, string> = {
  [OpportunityStage.Prospecting]: 'bg-gray-700 text-gray-300',
  [OpportunityStage.Qualification]: 'bg-blue-800/50 text-blue-300',
  [OpportunityStage.Proposal]: 'bg-purple-800/50 text-purple-300',
  [OpportunityStage.Negotiation]: 'bg-yellow-800/50 text-yellow-300',
  [OpportunityStage['Closed - Won']]: 'bg-green-800/50 text-green-300',
  [OpportunityStage['Closed - Lost']]: 'bg-red-800/50 text-red-300',
};

export const SYSTEM_STATUS_COLORS: Record<string, string> = {
  // Validation Status
  VALIDATED: 'bg-green-500',
  EMERGING: 'bg-yellow-500',
  DEPRECATED: 'bg-gray-600',

  // General Status
  Active: 'bg-green-500',
  Live: 'bg-green-500',
  'On Track': 'bg-green-500',
  'In Development': 'bg-blue-500',
  Planning: 'bg-blue-500',
  Inactive: 'bg-gray-600',
  'At Risk': 'bg-yellow-500',
  Planned: 'bg-yellow-500',

  // Severity/Priority
  Critical: 'bg-purple-500',
  High: 'bg-red-500',
  Medium: 'bg-yellow-500',
  Low: 'bg-green-500',

  // Binary status
  Yes: 'bg-red-500',
};
