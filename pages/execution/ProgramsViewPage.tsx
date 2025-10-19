import React, { useState, useMemo, useCallback } from 'react';

import {
  CloseIcon,
  TargetIcon,
  ExclamationTriangleIcon,
  FolderIcon,
  ClipboardCheckIcon,
  UsersIcon,
  MegaphoneIcon,
  Squares2X2Icon,
} from '../../components/Icons';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Tooltip from '../../components/ui/Tooltip';
import { PRIORITY_COLORS, STATUS_COLORS } from '../../constants';
import { useData } from '../../contexts/DataContext';
import type {
  MgmtProject,
  MgmtTask,
  Milestone,
  Priority,
  Program,
  SystemChannel,
  SystemHub,
  SystemPerson,
  SystemPlatform,
  SystemSegment,
} from '../../types';

// --- SKELETON COMPONENTS ---

const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`bg-gray-800 animate-pulse rounded-lg ${className}`} />
);

const RowSkeleton: React.FC = () => (
  <div className="flex-shrink-0">
    <div className="h-6 bg-gray-800 rounded w-48 mx-auto mb-2 animate-pulse"></div>
    <div className="w-24 h-px bg-gray-800 mx-auto my-2 animate-pulse"></div>
    <div className="h-4 bg-gray-800 rounded w-1/3 mx-auto mb-4 animate-pulse"></div>
    <div className="flex gap-3 overflow-x-auto pb-3 -mx-1 px-1">
      {[...Array(5)].map((_, i) => (
        <SkeletonCard key={i} className="w-64 h-[70px] flex-shrink-0" />
      ))}
    </div>
  </div>
);

const ProgramColumnSkeleton: React.FC = () => (
  <div className="bg-gray-900 border border-gray-800 rounded-xl w-[340px] flex-shrink-0 h-full flex flex-col animate-pulse">
    <div className="p-3 border-b border-gray-800 flex-shrink-0">
      <div className="h-5 bg-gray-700 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-gray-700 rounded w-1/2 mb-3"></div>
      <div className="h-2 bg-gray-700 rounded w-1/4 mb-2"></div>
      <div className="h-2 bg-gray-700 rounded"></div>
    </div>
    <div className="flex-1 overflow-y-auto p-2 space-y-2">
      <SkeletonCard className="h-20" />
      <SkeletonCard className="h-20" />
      <SkeletonCard className="h-20" />
    </div>
  </div>
);

const TaskListSkeleton: React.FC = () => (
  <div className="flex flex-col bg-gray-900 border border-gray-800 rounded-xl h-full animate-pulse">
    <div className="p-3 border-b border-gray-800">
      <div className="h-6 bg-gray-700 rounded w-1/3"></div>
    </div>
    <div className="flex-1 overflow-y-auto p-2 space-y-2">
      <SkeletonCard className="h-[76px]" />
      <SkeletonCard className="h-[76px]" />
      <SkeletonCard className="h-[76px]" />
      <SkeletonCard className="h-[76px]" />
    </div>
  </div>
);

// --- TYPE DEFINITIONS ---
type ItemType =
  | 'program'
  | 'project'
  | 'milestone'
  | 'task'
  | 'person'
  | 'segment'
  | 'platform'
  | 'channel'
  | 'hub';
type StructuredProject = MgmtProject & {
  milestones: (Milestone & { tasks: MgmtTask[] })[];
};
type StructuredProgram = Program & { projects: StructuredProject[] };

// --- HELPER FUNCTIONS ---
const idStringIncludes = (idString: string | undefined, id: string) =>
  idString ? idString.split(/[,|]/).map((s) => s.trim()).includes(id) : false;

const segmentTooltipContent = (segment: SystemSegment) => (
  <div className="text-xs">
    <p className="font-bold text-gray-300">Profile</p>
    <p>{segment.customer_profile}</p>
    <p className="font-bold text-gray-300 mt-2">Psychological Job</p>
    <p>{segment.psychological_job}</p>
    <p className="font-bold text-gray-300 mt-2">Vision</p>
    <p>{segment.vision}</p>
  </div>
);

const formatNumber = (
  num: number | undefined | null,
  style: 'currency' | 'percent' | 'decimal' = 'decimal',
): string => {
  if (num === undefined || num === null || isNaN(num)) return 'N/A';

  if (style === 'currency') {
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `₹${(num / 1000).toFixed(1)}k`;
    return `₹${num.toLocaleString()}`;
  }

  if (style === 'percent') {
    const value = num > 1 ? num : num * 100; // Handle both 25 and 0.25 as 25%
    return `${value.toFixed(0)}%`;
  }

  return num.toLocaleString();
};

const getHealthColor = (status: string | undefined): string => {
  switch (status) {
    case 'On Track':
      return 'bg-green-500';
    case 'At Risk':
      return 'bg-yellow-500';
    case 'Behind':
    case 'Off Track':
      return 'bg-red-500';
    default:
      return 'bg-gray-600';
  }
};

// --- UI SUB-COMPONENTS ---

const SegmentRow: React.FC<{
  segments: SystemSegment[];
  selectedId: string | null;
  onSelect: (type: ItemType, id: string) => void;
  onTooltip: (e: React.MouseEvent, content: React.ReactNode) => void;
  onClearTooltip: () => void;
  platforms: SystemPlatform[];
}> = ({ segments, selectedId, onSelect, onTooltip, onClearTooltip, platforms }) => (
  <div className="flex gap-3 overflow-x-auto pb-3 -mx-1 px-1">
    {segments.map((segment) => {
      const isSelected = selectedId === segment.segment_id;
      const hasCriticalDecision =
        segment.strategic_notes?.toUpperCase().includes('CRITICAL DECISION');
      const priority = (segment.priority_rank as Priority) || 'Medium';
      const relatedPlatforms = (() => {
        if (!segment.Platforms) return [];
        const platformIds = segment.Platforms.split(/[,|]/).map((id) =>
          id.trim(),
        );
        return platforms.filter((p) => platformIds.includes(p.platform_id));
      })();

      return (
        <div
          key={segment.segment_id}
          onClick={() => onSelect('segment', segment.segment_id)}
          title="Click to filter and see details"
          className={`flex flex-col flex-shrink-0 w-72 p-3 rounded-lg cursor-pointer transition-colors border ${
            isSelected
              ? 'bg-blue-900/50 border-blue-500'
              : 'bg-gray-800 border-gray-700 hover:bg-gray-700 hover:border-gray-600'
          }`}
        >
          <div className="flex-grow">
            <div className="flex justify-between items-start gap-2">
              <h4
                onMouseEnter={(e) => onTooltip(e, segmentTooltipContent(segment))}
                onMouseLeave={onClearTooltip}
                className="font-semibold text-white flex items-center gap-2 text-base"
              >
                <TargetIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="truncate">{segment.segment_name}</span>
              </h4>
              <div className="flex items-center gap-2 flex-shrink-0">
                {hasCriticalDecision && (
                  <span title="Critical decision required">
                    <ExclamationTriangleIcon className="w-4 h-4 text-yellow-400" />
                  </span>
                )}
                <Badge
                  text={segment.priority_rank || 'N/A'}
                  colorClass={PRIORITY_COLORS[priority]}
                  size="sm"
                />
              </div>
            </div>

            {segment.Promise && (
              <p className="text-sm text-center text-gray-300 italic mt-2">
                "{segment.Promise}"
              </p>
            )}
          </div>

          {relatedPlatforms.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-700/50 flex items-center gap-2.5">
              {relatedPlatforms.map((platform) => (
                <a
                  key={platform.platform_id}
                  href={platform.platform_link || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={platform.platform_name}
                  className="block"
                  onClick={(e) => e.stopPropagation()}
                >
                  {platform.platform_icon && (
                    <img
                      src={platform.platform_icon}
                      alt={platform.platform_name}
                      className="w-5 h-5 rounded-sm object-contain hover:scale-110 transition-transform"
                    />
                  )}
                </a>
              ))}
            </div>
          )}
        </div>
      );
    })}
  </div>
);

const PlatformRow: React.FC<{
  platforms: SystemPlatform[];
  selectedId: string | null;
  onSelect: (type: ItemType, id: string) => void;
}> = ({ platforms, selectedId, onSelect }) => (
  <div className="flex gap-3 overflow-x-auto pt-1 pb-3 -mx-1 px-1">
    {platforms.map((platform) => {
      const isSelected = selectedId === platform.platform_id;
      return (
        <div
          key={platform.platform_id}
          onClick={() => onSelect('platform', platform.platform_id)}
          title="Click to filter and see details"
          className={`flex items-center gap-3 flex-shrink-0 px-4 py-2 rounded-lg transition-colors border cursor-pointer ${
            isSelected
              ? 'bg-blue-600 border-blue-500 text-white'
              : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
          }`}
        >
          {platform.platform_icon && (
            <img src={platform.platform_icon} alt="" className="w-5 h-5 rounded-sm object-contain" />
          )}
          <p className="text-sm font-semibold">{platform.platform_name}</p>
        </div>
      );
    })}
  </div>
);

const ChannelRow: React.FC<{
  channels: SystemChannel[];
  selectedId: string | null;
  onSelect: (type: ItemType, id: string) => void;
}> = ({ channels, selectedId, onSelect }) => (
  <div className="flex gap-3 overflow-x-auto pt-1 pb-3 -mx-1 px-1">
    {channels.map((channel) => {
      const isSelected = selectedId === channel.channel_id;
      return (
        <div
          key={channel.channel_id}
          onClick={() => onSelect('channel', channel.channel_id)}
          title="Click to filter and see details"
          className={`flex items-center gap-3 flex-shrink-0 px-4 py-2 rounded-lg transition-colors border cursor-pointer ${
            isSelected
              ? 'bg-blue-600 border-blue-500 text-white'
              : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
          }`}
        >
          <MegaphoneIcon className="w-5 h-5" />
          <div>
            <p className="text-sm font-semibold">{channel.channel_name}</p>
            <p className="text-xs text-gray-400">{channel.channel_type}</p>
          </div>
        </div>
      );
    })}
  </div>
);

const HubsAndPeopleSection: React.FC<{
  hubs: SystemHub[];
  people: SystemPerson[];
  selection: { type: ItemType; id: string } | null;
  onSelect: (type: ItemType, id: string) => void;
  isFiltered: boolean;
  highlightedHubIds: Set<string>;
  highlightedPersonIds: Set<string>;
}> = ({
  hubs,
  people,
  selection,
  onSelect,
  isFiltered,
  highlightedHubIds,
  highlightedPersonIds,
}) => {
  const hubOrder = [
    'Digital Platform',
    'Production & Fulfillment',
    'Sales & Business Dev',
    'Marketing & Growth',
  ];
  const sortedHubs = useMemo(
    () =>
      [...hubs].sort((a, b) => {
        const aIndex = hubOrder.indexOf(a.hub_name);
        const bIndex = hubOrder.indexOf(b.hub_name);
        if (aIndex === -1 && bIndex === -1)
          return a.hub_name.localeCompare(b.hub_name);
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
      }),
    [hubs],
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-min">
      {sortedHubs.map((hub) => {
        const relatedPeople = people.filter((p) => p.primary_hub === hub.hub_id);
        const isHubSelected = selection?.type === 'hub' && selection.id === hub.hub_id;
        const isHubHighlighted = highlightedHubIds.has(hub.hub_id);
        const isHubDimmed = isFiltered && !isHubHighlighted;

        return (
          <div
            key={hub.hub_id}
            className={`bg-gray-900 border rounded-lg flex flex-col transition-opacity duration-300 ${
              isHubDimmed ? 'opacity-30' : ''
            } ${isHubSelected ? 'border-accent-green' : 'border-gray-800'}`}
          >
            {/* Hub Header */}
            <div
              onClick={() => onSelect('hub', hub.hub_id)}
              className="p-4 bg-gray-800/40 rounded-t-lg border-b border-gray-800 cursor-pointer group relative"
            >
              <h3 className="font-bold text-lg text-accent-green flex items-center gap-2">
                <Squares2X2Icon className="w-5 h-5" />
                {hub.hub_name}
              </h3>
              <p className="text-sm text-gray-400 italic mt-1">{hub.hub_type}</p>
            </div>
            {/* People Grid */}
            <div className="p-2 grid grid-cols-2 gap-1 flex-1 items-start content-start">
              {relatedPeople.map((person) => {
                const isPersonSelected =
                  selection?.type === 'person' && selection.id === person.person_id;
                const isPersonHighlighted = highlightedPersonIds.has(
                  person.person_id,
                );
                const isPersonDimmed = isFiltered && !isPersonHighlighted;

                return (
                  <div
                    key={person.person_id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect('person', person.person_id);
                    }}
                    className={`p-2 rounded-md cursor-pointer transition-colors ${
                      isPersonDimmed ? 'opacity-30' : ''
                    } ${
                      isPersonSelected ? 'bg-blue-900/50' : 'hover:bg-gray-800'
                    }`}
                  >
                    <h4 className="font-semibold text-white text-sm truncate">
                      {person.full_name}
                    </h4>
                    <p className="text-xs text-gray-400 truncate">
                      {person.role}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const ProjectCard: React.FC<{
  project: MgmtProject & { milestones: (Milestone & { tasks: MgmtTask[] })[] };
  isDimmed: boolean;
  onClick: () => void;
  onTooltip: (e: React.MouseEvent, content: React.ReactNode) => void;
  onClearTooltip: () => void;
}> = ({ project, isDimmed, onClick, onTooltip, onClearTooltip }) => {
  const tooltipContent = (
    <div className="text-xs max-w-xs">
      <p className="font-bold text-base text-white mb-2">{project.project_name}</p>
      {project.objective && (
        <div>
          <p className="font-semibold text-gray-400">Objective:</p>
          <p>{project.objective}</p>
        </div>
      )}
      {project.success_metric && (
        <div className="mt-2">
          <p className="font-semibold text-gray-400">Success Metric:</p>
          <p>{project.success_metric}</p>
        </div>
      )}
    </div>
  );
  const totalTasks = project.tasks_count || 0;
  const completedTasks = project.tasks_complete || 0;
  const completionPct = project.completion_pct || 0;

  return (
    <div
      onClick={onClick}
      onMouseEnter={(e) => onTooltip(e, tooltipContent)}
      onMouseLeave={onClearTooltip}
      className={`p-3 rounded-lg cursor-pointer transition-all duration-300 bg-gray-800 hover:bg-gray-700 border border-gray-700/50 ${
        isDimmed ? 'opacity-30' : ''
      }`}
    >
      <div className="flex justify-between items-start">
        <h4 className="font-semibold text-white truncate pr-2 text-sm">
          {project.project_name}
        </h4>
        <Badge
          text={project.status}
          colorClass={STATUS_COLORS[project.status as keyof typeof STATUS_COLORS]}
          size="sm"
        />
      </div>
      <div className="flex justify-between items-center mt-1 text-xs text-gray-400">
        <span>{project.owner_name}</span>
        <span>{project.end_date}</span>
      </div>
      <div className="mt-2 text-xs text-gray-500">
        {totalTasks} Tasks ({completedTasks} Done)
      </div>
      <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1">
        <div
          className="bg-blue-500 h-1.5 rounded-full"
          style={{ width: `${completionPct}%` }}
        ></div>
      </div>
    </div>
  );
};

const ProgramColumn: React.FC<{
  program: StructuredProgram;
  isDimmed: boolean;
  highlightedProjIds: Set<string>;
  onCardClick: (type: ItemType, item: any) => void;
  onTooltip: (e: React.MouseEvent, content: React.ReactNode) => void;
  onClearTooltip: () => void;
}> = ({
  program,
  isDimmed,
  highlightedProjIds,
  onCardClick,
  onTooltip,
  onClearTooltip,
}) => {
  const programTooltipContent = (
    <div className="text-xs max-w-xs">
      <p className="font-bold text-base text-white mb-2">{program.program_name}</p>
      {program.customer_problem && (
        <div>
          <p className="font-semibold text-gray-400">Problem:</p>
          <p>{program.customer_problem}</p>
        </div>
      )}
      {program.our_solution && (
        <div className="mt-2">
          <p className="font-semibold text-gray-400">Solution:</p>
          <p>{program.our_solution}</p>
        </div>
      )}
      {program.blockers && (
        <div className="mt-2">
          <p className="font-semibold text-red-400">Blockers:</p>
          <p className="text-red-300">{program.blockers}</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl w-[340px] flex-shrink-0 flex flex-col">
      <div
        className={`p-3 border-b border-gray-800 flex-shrink-0 cursor-pointer transition-opacity duration-300 ${
          isDimmed ? 'opacity-50' : ''
        }`}
        onClick={() => onCardClick('program', program)}
        onMouseEnter={(e) => onTooltip(e, programTooltipContent)}
        onMouseLeave={onClearTooltip}
      >
        <div className="flex justify-between items-start">
          <h3 className="text-base font-semibold text-white">
            {program.program_name}
          </h3>
          <Badge
            text={program.priority || ''}
            colorClass={PRIORITY_COLORS[program.priority as Priority]}
            size="sm"
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">{program.owner_person_name}</p>

        <div className="mt-3 space-y-1.5">
          <div>
            <div className="text-xs text-gray-500 flex justify-between">
              <span>Timeline</span>
              <span>{program.days_remaining} days left</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className={`${getHealthColor(
                  program.health_status,
                )} h-2 rounded-full`}
                style={{ width: `${program.timeline_progress_pct || 0}%` }}
              ></div>
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 flex justify-between">
              <span>{program.success_metric}</span>
              <span>
                {formatNumber(program.current_value)}/
                {formatNumber(program.target_value)}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${program.metric_progress_pct || 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
      <div className="p-2 space-y-2">
        {program.projects.map((proj) => (
          <ProjectCard
            key={proj.project_id}
            project={proj}
            onClick={() => onCardClick('project', proj)}
            onTooltip={onTooltip}
            onClearTooltip={onClearTooltip}
            isDimmed={!highlightedProjIds.has(proj.project_id)}
          />
        ))}
      </div>
    </div>
  );
};

const TaskCard: React.FC<{
  task: MgmtTask;
  onClick: () => void;
  isDimmed: boolean;
}> = ({ task, onClick, isDimmed }) => (
  <div
    onClick={onClick}
    className={`p-3 bg-gray-800 rounded-lg border border-gray-700/50 cursor-pointer hover:bg-gray-700 transition-opacity duration-300 ${
      isDimmed ? 'opacity-30' : ''
    }`}
  >
    <p className="font-medium text-white text-sm">{task.task_name}</p>
    <div className="flex justify-between items-center mt-2 text-xs">
      <Badge
        text={task.status}
        colorClass={STATUS_COLORS[task.status as keyof typeof STATUS_COLORS]}
        size="sm"
      />
      <span className="text-gray-400">{task.owner_name}</span>
      <span className="text-gray-400">{task.due_date}</span>
    </div>
  </div>
);

const TaskList: React.FC<{
  tasks: MgmtTask[];
  onCardClick: (type: ItemType, item: MgmtTask) => void;
  showPrompt: boolean;
  isFiltered: boolean;
  highlightedTaskIds: Set<string>;
}> = ({ tasks, onCardClick, showPrompt, isFiltered, highlightedTaskIds }) => (
  <div className="flex flex-col bg-gray-900 border border-gray-800 rounded-xl h-full">
    <div className="p-3 border-b border-gray-800">
      <h2 className="text-lg font-semibold text-white flex items-center gap-2">
        <ClipboardCheckIcon className="w-5 h-5" /> Tasks
      </h2>
    </div>
    <div className="flex-1 overflow-y-auto p-2 space-y-2">
      {tasks.length > 0 ? (
        tasks.map((task) => {
          const isDimmed = isFiltered && !highlightedTaskIds.has(task.task_id);
          return (
            <TaskCard
              key={task.task_id}
              task={task}
              onClick={() => onCardClick('task', task)}
              isDimmed={isDimmed}
            />
          );
        })
      ) : (
        showPrompt && (
          <div className="text-center text-gray-500 p-8 h-full flex items-center justify-center">
            Select an item to see related tasks.
          </div>
        )
      )}
    </div>
  </div>
);

const DetailContent: React.FC<{
  type: ItemType | null;
  item: any | null;
  onSelect: (type: ItemType, id: string) => void;
}> = ({ type, item, onSelect }) => {
  const { systemPeople, mgmtProjects, milestones, mgmtTasks, systemHubs } = useData();
  if (!item) return <p className="text-gray-500">No item selected.</p>;

  const renderField = (label: string, value: any, className?: string) =>
    value ? (
      <p className={className}>
        <strong className="text-gray-400 w-28 inline-block">{label}:</strong>{' '}
        {String(value)}
      </p>
    ) : null;

  const DetailSection: React.FC<{ title: string; children: React.ReactNode }> =
    ({ title, children }) => {
      const hasContent = React.Children.toArray(children).some(
        (child) => child || child === 0,
      );
      if (!hasContent) return null;
      return (
        <div className="pt-3 mt-3 border-t border-gray-700">
          <h4 className="font-semibold text-white mb-2">{title}</h4>
          <div className="space-y-2">{children}</div>
        </div>
      );
    };

  const RelatedItem: React.FC<{
    icon: React.ElementType;
    name: string;
    detail: string;
    onClick: () => void;
  }> = ({ icon: Icon, name, detail, onClick }) => (
    <div
      onClick={onClick}
      className="bg-gray-800/50 p-2 rounded-md flex items-center gap-3 border border-gray-700/50 cursor-pointer hover:bg-gray-700 hover:border-blue-600 transition-colors"
    >
      <Icon className="w-5 h-5 text-gray-400 flex-shrink-0" />
      <div className="flex-grow overflow-hidden">
        <p className="text-sm text-white truncate">{name}</p>
        <p className="text-xs text-gray-400 truncate">{detail}</p>
      </div>
    </div>
  );

  switch (type) {
    case 'program': {
      const prog = item as Program;
      const progOwner = systemPeople.find((p) => p.person_id === prog.owner_person_id);
      const relatedProjects = mgmtProjects.filter(
        (p) => p.program_id === prog.program_id,
      );
      return (
        <div className="space-y-2 text-sm text-gray-300">
          <h3 className="text-xl font-bold text-white mb-2">{prog.program_name}</h3>
          {renderField('Owner', progOwner?.full_name)}
          {renderField('Status', prog.status)}
          {renderField('Priority', prog.priority)}
          <DetailSection title="Problem">{prog.customer_problem}</DetailSection>
          <DetailSection title="Solution">{prog.our_solution}</DetailSection>
          <DetailSection title="Why Now?">{prog.why_now}</DetailSection>
          <DetailSection title="Key Info">
            {renderField('Success Metric', prog.success_metric)}
            {renderField('Target Value', formatNumber(prog.target_value))}
            {renderField('Current Value', formatNumber(prog.current_value))}
          </DetailSection>
          <DetailSection title="Financials">
            {renderField('Total Budget', formatNumber(prog.budget_total, 'currency'))}
            {renderField('Budget Spent', formatNumber(prog.budget_spent, 'currency'))}
            {renderField(
              'Burn Rate',
              formatNumber(prog.budget_burn_rate_pct, 'percent'),
            )}
          </DetailSection>
          <DetailSection title="Health & Status">
            {renderField(
              'Health',
              prog.health_status,
              `font-semibold ${getHealthColor(prog.health_status)?.replace(
                'bg-',
                'text-',
              )}`,
            )}
            {renderField('Risk Level', prog.risk_level)}
            {renderField('Blockers', prog.blockers, 'text-red-400')}
            {renderField(
              'Next Milestone',
              `${prog.next_milestone} (${prog.next_milestone_date})`,
            )}
          </DetailSection>
          <DetailSection title="Projects">
            {relatedProjects.map((p) => (
              <RelatedItem
                key={p.project_id}
                icon={FolderIcon}
                name={p.project_name}
                detail={p.status}
                onClick={() => onSelect('project', p.project_id)}
              />
            ))}
          </DetailSection>
        </div>
      );
    }
    case 'project': {
      const proj = item as MgmtProject;
      const projOwner = systemPeople.find((p) => p.person_id === proj.owner_id);
      const relatedMilestones = milestones.filter(
        (m) => m.project_id === proj.project_id,
      );
      return (
        <div className="space-y-2 text-sm text-gray-300">
          <h3 className="text-xl font-bold text-white mb-2">{proj.project_name}</h3>
          {renderField('Owner', projOwner?.full_name)}
          {renderField('Status', proj.status)}
          {renderField('Priority', proj.priority)}
          {renderField('Timeline', `${proj.start_date} to ${proj.end_date}`)}
          <DetailSection title="Objective">{proj.objective}</DetailSection>
          <DetailSection title="Financials">
            {renderField('Budget', formatNumber(proj.budget, 'currency'))}
            {renderField('Spent', formatNumber(proj.budget_spent, 'currency'))}
            {renderField('Variance', formatNumber(proj.budget_variance, 'currency'))}
          </DetailSection>
          <DetailSection title="Progress">
            {renderField('Health', proj.health_score)}
            {renderField('On Time', proj.is_on_time)}
            {renderField('Completion', formatNumber(proj.completion_pct, 'percent'))}
            {renderField(
              'Velocity',
              `${proj.velocity_tasks_per_day?.toFixed(2)} tasks/day`,
            )}
          </DetailSection>
          <DetailSection title="Milestones">
            {relatedMilestones.map((m) => (
              <RelatedItem
                key={m.milestone_id}
                icon={TargetIcon}
                name={m.milestone_name}
                detail={m.status}
                onClick={() => onSelect('milestone', m.milestone_id)}
              />
            ))}
          </DetailSection>
        </div>
      );
    }
    case 'milestone': {
      const mile = item as Milestone;
      const relatedTasks = mgmtTasks.filter(
        (t) => t.milestone_id === mile.milestone_id,
      );
      return (
        <div className="space-y-2 text-sm text-gray-300">
          <h3 className="text-xl font-bold text-white mb-2">{mile.milestone_name}</h3>
          {renderField('Owner', mile.owner_name)}
          {renderField('Status', mile.status)}
          {renderField('Target Date', mile.target_date)}
          {renderField('Blocker', mile.blocker, 'text-red-400')}
          <DetailSection title="Tasks">
            {relatedTasks.map((t) => (
              <RelatedItem
                key={t.task_id}
                icon={ClipboardCheckIcon}
                name={t.task_name}
                detail={t.status}
                onClick={() => onSelect('task', t.task_id)}
              />
            ))}
          </DetailSection>
        </div>
      );
    }
    case 'task': {
      const task = item as MgmtTask;
      const assignee = systemPeople.find((p) => p.person_id === task.assignee_ids);
      return (
        <div className="space-y-2 text-sm text-gray-300">
          <h3 className="text-xl font-bold text-white mb-2">{task.task_name}</h3>
          {renderField('Assignee', assignee?.full_name)}
          {renderField('Status', task.status)}
          {renderField('Priority', task.priority)}
          {renderField('Due Date', task.due_date)}
          {renderField('Effort', `${task.effort_hours}h`)}
          <DetailSection title="Description">{task.description}</DetailSection>
          <DetailSection title="Notes">{task.notes}</DetailSection>
        </div>
      );
    }
    case 'person': {
      const person = item as SystemPerson;
      const primaryHub = systemHubs.find((h) => h.hub_id === person.primary_hub);
      return (
        <div className="space-y-2 text-sm text-gray-300">
          <h3 className="text-xl font-bold text-white mb-2">{person.full_name}</h3>
          {renderField('Role', person.role)}
          {renderField('Hub', primaryHub?.hub_name)}
          {renderField('Email', person.email)}
        </div>
      );
    }
    case 'segment': {
      const segment = item as SystemSegment;
      return (
        <div className="space-y-2 text-sm text-gray-300">
          <h3 className="text-xl font-bold text-white mb-2">
            {segment.segment_name}
          </h3>
          {renderField('Promise', segment.Promise)}
          {renderField('Vision', segment.vision)}
          <DetailSection title="Customer Profile">
            {segment.customer_profile}
          </DetailSection>
        </div>
      );
    }
    case 'platform': {
      const platform = item as SystemPlatform;
      const platformOwnerHub = systemHubs.find(
        (h) => h.hub_id === platform.owner_hub,
      );
      return (
        <div className="space-y-2 text-sm text-gray-300">
          <h3 className="text-xl font-bold text-white mb-2">
            {platform.platform_name}
          </h3>
          {renderField('Type', platform.platform_type)}
          {platformOwnerHub && (
            <DetailSection title="Owner Hub">
              <RelatedItem
                icon={Squares2X2Icon}
                name={platformOwnerHub.hub_name}
                detail={platformOwnerHub.hub_type}
                onClick={() => onSelect('hub', platformOwnerHub.hub_id)}
              />
            </DetailSection>
          )}
        </div>
      );
    }
    case 'channel': {
      const channel = item as SystemChannel;
      const channelOwner = systemPeople.find(
        (p) => p.person_id === channel.responsible_person,
      );
      return (
        <div className="space-y-2 text-sm text-gray-300">
          <h3 className="text-xl font-bold text-white mb-2">
            {channel.channel_name}
          </h3>
          {renderField('Owner', channelOwner?.full_name)}
          {renderField('Type', channel.channel_type)}
        </div>
      );
    }
    case 'hub': {
      const hub = item as SystemHub;
      const hubOwner = systemPeople.find((p) => p.person_id === hub.owner_person);
      return (
        <div className="space-y-2 text-sm text-gray-300">
          <h3 className="text-xl font-bold text-white mb-2">{hub.hub_name}</h3>
          {renderField('Owner', hubOwner?.full_name)}
          {renderField('Type', hub.hub_type)}
          <DetailSection title="Core Capabilities">
            {hub.core_capabilities}
          </DetailSection>
        </div>
      );
    }
    default:
      return (
        <pre className="text-xs text-gray-300 whitespace-pre-wrap">
          {JSON.stringify(item, null, 2)}
        </pre>
      );
  }
};

const DetailPane: React.FC<{
  detail: { isOpen: boolean; type: ItemType | null; item: any | null };
  onClose: () => void;
  onSelect: (type: ItemType, id: string) => void;
}> = ({ detail, onClose, onSelect }) => (
  <div
    className={`fixed top-16 right-0 h-[calc(100%-4rem)] bg-gray-950 border-l border-gray-800 shadow-2xl z-40 transition-transform duration-300 ease-in-out ${
      detail.isOpen ? 'translate-x-0' : 'translate-x-full'
    }`}
    style={{ width: '400px' }}
  >
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-800 flex justify-between items-center flex-shrink-0">
        <h2 className="text-lg font-semibold text-white capitalize">
          {detail.type} Details
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          <CloseIcon className="w-6 h-6" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <DetailContent type={detail.type} item={detail.item} onSelect={onSelect} />
      </div>
    </div>
  </div>
);

// --- MAIN PAGE COMPONENT ---

const ProgramsViewPage: React.FC = () => {
  const {
    programs,
    mgmtProjects,
    milestones,
    mgmtTasks,
    systemPeople,
    systemSegments,
    systemPlatforms,
    systemChannels,
    systemHubs,
    loading,
  } = useData();

  const [selection, setSelection] = useState<{ type: ItemType; id: string } | null>(
    null,
  );
  const [detailPane, setDetailPane] = useState<{
    isOpen: boolean;
    type: ItemType | null;
    item: any | null;
  }>({ isOpen: false, type: null, item: null });
  const [activeTooltip, setActiveTooltip] = useState<{
    content: React.ReactNode;
    targetRect: DOMRect | null;
  }>({ content: null, targetRect: null });

  const handleClosePane = useCallback(() => {
    setDetailPane((d) => ({ ...d, isOpen: false }));
  }, []);

  const handleSelect = useCallback(
    (type: ItemType, id: string) => {
      const isDeselecting = selection?.type === type && selection.id === id;
      setSelection(isDeselecting ? null : { type, id });

      if (isDeselecting) {
        if (
          detailPane.isOpen &&
          detailPane.type === type &&
          detailPane.item &&
          detailPane.item[`${type}_id`] === id
        ) {
          handleClosePane();
        }
      } else {
        // Find the full item object to show in the detail pane
        let itemToShow = null;
        switch (type) {
          case 'segment':
            itemToShow = systemSegments.find((i) => i.segment_id === id);
            break;
          case 'platform':
            itemToShow = systemPlatforms.find((i) => i.platform_id === id);
            break;
          case 'channel':
            itemToShow = systemChannels.find((i) => i.channel_id === id);
            break;
          case 'hub':
            itemToShow = systemHubs.find((i) => i.hub_id === id);
            break;
          case 'person':
            itemToShow = systemPeople.find((i) => i.person_id === id);
            break;
        }
        if (itemToShow) {
          setDetailPane({ isOpen: true, type, item: itemToShow });
        }
      }
    },
    [
      selection,
      detailPane,
      handleClosePane,
      systemSegments,
      systemPlatforms,
      systemChannels,
      systemHubs,
      systemPeople,
    ],
  );

  const handleCardClick = useCallback(
    (type: ItemType, item: any) => {
      const getId = (itemType: ItemType, itemObj: any) => {
        if (!itemObj) return null;
        const keyMap: Record<ItemType, string> = {
          program: 'program_id',
          project: 'project_id',
          milestone: 'milestone_id',
          task: 'task_id',
          person: 'person_id',
          segment: 'segment_id',
          platform: 'platform_id',
          channel: 'channel_id',
          hub: 'hub_id',
        };
        return itemObj[keyMap[itemType]];
      };

      const currentId = getId(detailPane.type!, detailPane.item);
      const newId = getId(type, item);

      if (detailPane.isOpen && detailPane.type === type && currentId === newId) {
        handleClosePane();
      } else {
        setDetailPane({ isOpen: true, type, item });
      }
    },
    [detailPane, handleClosePane],
  );

  const handleTooltip = (e: React.MouseEvent, content: React.ReactNode) => {
    e.stopPropagation();
    setActiveTooltip({ content, targetRect: e.currentTarget.getBoundingClientRect() });
  };

  const sortedSegments = useMemo(
    () =>
      [...systemSegments].sort((a, b) =>
        (a.priority_rank || '99').localeCompare(b.priority_rank || '99'),
      ),
    [systemSegments],
  );
  const sortedPeople = useMemo(
    () => [...systemPeople].sort((a, b) => a.full_name.localeCompare(b.full_name)),
    [systemPeople],
  );

  const selectionData = useMemo(() => {
    const isFiltered = !!selection;

    const allIds = {
      programs: new Set(programs.map((p) => p.program_id)),
      projects: new Set(mgmtProjects.map((p) => p.project_id)),
      tasks: new Set(mgmtTasks.map((t) => t.task_id)),
      hubs: new Set(systemHubs.map((h) => h.hub_id)),
      people: new Set(systemPeople.map((p) => p.person_id)),
    };

    if (!isFiltered) {
      return { isFiltered, highlights: allIds };
    }

    const highlights = {
      programs: new Set<string>(),
      projects: new Set<string>(),
      tasks: new Set<string>(),
      hubs: new Set<string>(),
      people: new Set<string>(),
    };

    if (selection) {
      switch (selection.type) {
        case 'segment':
          programs.forEach((p) => {
            if (idStringIncludes(p.serves_segment_ids, selection.id))
              highlights.programs.add(p.program_id);
          });
          mgmtProjects.forEach((p) => {
            if (idStringIncludes(p.segment_impact, selection.id))
              highlights.projects.add(p.project_id);
          });
          break;
        case 'platform':
          programs.forEach((p) => {
            if (idStringIncludes(p.platform_ids, selection.id))
              highlights.programs.add(p.program_id);
          });
          mgmtProjects.forEach((p) => {
            if (p.platform_id === selection.id)
              highlights.projects.add(p.project_id);
          });
          break;
        case 'channel':
          programs.forEach((p) => {
            if (idStringIncludes(p.channel_ids, selection.id))
              highlights.programs.add(p.program_id);
          });
          mgmtProjects.forEach((p) => {
            if (idStringIncludes(p.channel_ids, selection.id))
              highlights.projects.add(p.project_id);
          });
          break;
        case 'hub':
          highlights.hubs.add(selection.id);
          programs.forEach((p) => {
            if (
              p.owner_hub_id === selection.id ||
              idStringIncludes(p.contributing_hub_ids, selection.id)
            )
              highlights.programs.add(p.program_id);
          });
          mgmtProjects.forEach((p) => {
            if (p.hub_id === selection.id) highlights.projects.add(p.project_id);
          });
          mgmtTasks.forEach((t) => {
            if (t.hub_id === selection.id) highlights.tasks.add(t.task_id);
          });
          systemPeople.forEach((p) => {
            if (p.primary_hub === selection.id)
              highlights.people.add(p.person_id);
          });
          break;
        case 'person':
          highlights.people.add(selection.id);
          programs.forEach((p) => {
            if (p.owner_person_id === selection.id)
              highlights.programs.add(p.program_id);
          });
          mgmtProjects.forEach((p) => {
            if (p.owner_id === selection.id) highlights.projects.add(p.project_id);
          });
          mgmtTasks.forEach((t) => {
            if (
              t.owner_id === selection.id ||
              idStringIncludes(t.assignee_ids, selection.id)
            )
              highlights.tasks.add(t.task_id);
          });
          const person = systemPeople.find((p) => p.person_id === selection.id);
          if (person?.primary_hub) highlights.hubs.add(person.primary_hub);
          break;
      }
    }

    // Propagate from programs to projects and tasks
    mgmtProjects.forEach((p) => {
      if (p.program_id && highlights.programs.has(p.program_id))
        highlights.projects.add(p.project_id);
    });
    mgmtTasks.forEach((t) => {
      const milestone = milestones.find((m) => m.milestone_id === t.milestone_id);
      if (
        (t.project_id && highlights.projects.has(t.project_id)) ||
        (milestone &&
          milestone.project_id &&
          highlights.projects.has(milestone.project_id))
      ) {
        highlights.tasks.add(t.task_id);
      }
    });

    return {
      isFiltered,
      highlights,
    };
  }, [
    selection,
    programs,
    mgmtProjects,
    mgmtTasks,
    milestones,
    systemHubs,
    systemPeople,
  ]);

  const structuredData: StructuredProgram[] = useMemo(() => {
    const tasksByMilestone = new Map<string, MgmtTask[]>();
    mgmtTasks.forEach((task) => {
      if (task.milestone_id) {
        if (!tasksByMilestone.has(task.milestone_id)) {
          tasksByMilestone.set(task.milestone_id, []);
        }
        tasksByMilestone.get(task.milestone_id)!.push(task);
      }
    });
    const milestonesByProject = new Map<string, (Milestone & { tasks: MgmtTask[] })[]>();
    milestones.forEach((mile) => {
      if (mile.project_id) {
        if (!milestonesByProject.has(mile.project_id)) {
          milestonesByProject.set(mile.project_id, []);
        }
        milestonesByProject
          .get(mile.project_id)!
          .push({ ...mile, tasks: tasksByMilestone.get(mile.milestone_id) || [] });
      }
    });
    const projectsByProgram = new Map<string, StructuredProject[]>();
    mgmtProjects.forEach((proj) => {
      if (proj.program_id) {
        if (!projectsByProgram.has(proj.program_id)) {
          projectsByProgram.set(proj.program_id, []);
        }
        projectsByProgram
          .get(proj.program_id)!
          .push({
            ...proj,
            milestones: milestonesByProject.get(proj.project_id) || [],
          });
      }
    });
    return programs.map((prog) => ({
      ...prog,
      projects: projectsByProgram.get(prog.program_id) || [],
    }));
  }, [programs, mgmtProjects, milestones, mgmtTasks]);

  const displayedTasks = useMemo(() => {
    const { type, item } = detailPane;
    let tasksToShow: MgmtTask[] = [];

    if (item) {
      if (type === 'program') {
        const programProjectIds = new Set(
          (item as StructuredProgram).projects.map((p) => p.project_id),
        );
        tasksToShow = mgmtTasks.filter(
          (t) => t.project_id && programProjectIds.has(t.project_id),
        );
      } else if (type === 'project') {
        tasksToShow = mgmtTasks.filter(
          (t) => t.project_id === (item as MgmtProject).project_id,
        );
      } else if (type === 'milestone') {
        tasksToShow = mgmtTasks.filter(
          (t) => t.milestone_id === (item as Milestone).milestone_id,
        );
      } else if (type === 'task') {
        tasksToShow = mgmtTasks.filter(
          (t) => t.task_id === (item as MgmtTask).task_id,
        );
      }
    } else if (selectionData.isFiltered) {
      tasksToShow = mgmtTasks.filter((t) =>
        selectionData.highlights.tasks.has(t.task_id),
      );
    }
    return tasksToShow.sort((a, b) =>
      (a.due_date || 'z').localeCompare(b.due_date || 'z'),
    );
  }, [detailPane, mgmtTasks, selectionData]);

  return (
    <div className="flex flex-col gap-4 pr-2 pb-4">
      <Tooltip
        content={activeTooltip.content}
        targetRect={activeTooltip.targetRect}
      />

      {/* --- TOP: SEGMENTS --- */}
      <div className="flex-shrink-0">
        <div className="flex justify-between items-center mb-2 px-1">
          <div className="text-center flex-grow">
            <h2 className="text-xl font-semibold text-white">Segments</h2>
            <p className="text-sm text-gray-400 -mt-1">
              Filter programs and projects by customer segment
            </p>
          </div>
          {selection && (
            <button
              onClick={() => {
                setSelection(null);
                handleClosePane();
              }}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-white flex-shrink-0"
            >
              <CloseIcon className="w-4 h-4" />
              Clear filter
            </button>
          )}
        </div>
        {loading ? (
          <RowSkeleton />
        ) : (
          <SegmentRow
            segments={sortedSegments}
            selectedId={selection?.type === 'segment' ? selection.id : null}
            onSelect={handleSelect}
            onTooltip={handleTooltip}
            onClearTooltip={() => setActiveTooltip({ content: null, targetRect: null })}
            platforms={systemPlatforms}
          />
        )}
      </div>

      <div className="w-full h-px bg-gray-800 flex-shrink-0"></div>

      {/* --- MIDDLE: PROGRAMS, PROJECTS, TASKS --- */}
      <div className="flex flex-col gap-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white">
            Programs, Projects & Tasks
          </h2>
        </div>
        <div className="flex gap-4 items-start">
          <div className="w-2/3">
            <div className="flex gap-4 overflow-x-auto pb-4 px-1">
              {loading ? (
                <>
                  <ProgramColumnSkeleton />
                  <ProgramColumnSkeleton />
                </>
              ) : (
                structuredData.map((program) => (
                  <ProgramColumn
                    key={program.program_id}
                    program={program}
                    isDimmed={
                      selectionData.isFiltered &&
                      !selectionData.highlights.programs.has(program.program_id)
                    }
                    highlightedProjIds={selectionData.highlights.projects}
                    onCardClick={handleCardClick}
                    onTooltip={handleTooltip}
                    onClearTooltip={() =>
                      setActiveTooltip({ content: null, targetRect: null })
                    }
                  />
                ))
              )}
            </div>
          </div>

          <div className="w-px bg-gray-800 self-stretch flex-shrink-0"></div>

          <div className="w-1/3 flex-shrink-0">
            {loading ? (
              <TaskListSkeleton />
            ) : (
              <TaskList
                tasks={displayedTasks}
                onCardClick={handleCardClick}
                showPrompt={!detailPane.isOpen && !selectionData.isFiltered}
                isFiltered={selectionData.isFiltered}
                highlightedTaskIds={selectionData.highlights.tasks}
              />
            )}
          </div>
        </div>
      </div>

      <div className="w-full h-px bg-gray-800 flex-shrink-0"></div>

      {/* --- BOTTOM: HUBS, PEOPLE, CHANNELS, PLATFORMS --- */}
      <div className="flex-shrink-0 pt-2">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            <div className="flex-shrink-0">
              <div className="text-center mb-2">
                <h2 className="text-xl font-semibold text-white">Channels</h2>
              </div>
              {loading ? (
                <RowSkeleton />
              ) : (
                <ChannelRow
                  channels={systemChannels}
                  selectedId={selection?.type === 'channel' ? selection.id : null}
                  onSelect={handleSelect}
                />
              )}
            </div>
            <div className="flex-shrink-0">
              <div className="text-center mb-2">
                <h2 className="text-xl font-semibold text-white">Platforms</h2>
              </div>
              {loading ? (
                <RowSkeleton />
              ) : (
                <PlatformRow
                  platforms={systemPlatforms}
                  selectedId={selection?.type === 'platform' ? selection.id : null}
                  onSelect={handleSelect}
                />
              )}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="flex flex-col">
            <div className="text-center mb-2">
              <h2 className="text-xl font-semibold text-white">Hubs & People</h2>
            </div>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SkeletonCard className="h-48" />
                <SkeletonCard className="h-48" />
              </div>
            ) : (
              <HubsAndPeopleSection
                hubs={systemHubs}
                people={sortedPeople}
                selection={selection}
                onSelect={handleSelect}
                isFiltered={selectionData.isFiltered}
                highlightedHubIds={selectionData.highlights.hubs}
                highlightedPersonIds={selectionData.highlights.people}
              />
            )}
          </div>
        </div>
      </div>

      <DetailPane
        detail={detailPane}
        onClose={handleClosePane}
        onSelect={handleCardClick}
      />
    </div>
  );
};

export default ProgramsViewPage;