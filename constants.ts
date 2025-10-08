
// FIX: Changed `import type` to `import` because enums are used as values.
import { Priority, Status, HealthStatus, LeadStatus, OpportunityStage } from './types';

export const STATUS_COLORS: Record<Status, string> = {
  [Status.NotStarted]: 'bg-gray-500',
  [Status.InProgress]: 'bg-blue-500',
  [Status.Completed]: 'bg-green-500',
  [Status.OnHold]: 'bg-yellow-500',
  [Status.Cancelled]: 'bg-red-500',
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  [Priority.Low]: 'bg-green-500',
  [Priority.Medium]: 'bg-yellow-500',
  [Priority.High]: 'bg-red-500',
  [Priority.Critical]: 'bg-purple-500',
};

export const HEALTH_STATUS_COLORS: Record<HealthStatus, string> = {
  [HealthStatus.OnTrack]: 'bg-green-500',
  [HealthStatus.AtRisk]: 'bg-yellow-500',
  [HealthStatus.OffTrack]: 'bg-red-500',
};

export const LEAD_STATUS_COLORS: Record<LeadStatus, string> = {
    [LeadStatus.New]: 'bg-blue-500',
    [LeadStatus.Contacted]: 'bg-yellow-500',
    [LeadStatus.Qualified]: 'bg-green-500',
    [LeadStatus.Disqualified]: 'bg-gray-500',
};

export const OPPORTUNITY_STAGE_COLORS: Record<OpportunityStage, string> = {
    [OpportunityStage.Prospecting]: 'bg-gray-500',
    [OpportunityStage.Qualification]: 'bg-blue-500',
    [OpportunityStage.Proposal]: 'bg-purple-500',
    [OpportunityStage.Negotiation]: 'bg-yellow-500',
    [OpportunityStage.ClosedWon]: 'bg-green-500',
    [OpportunityStage.ClosedLost]: 'bg-red-500',
};
