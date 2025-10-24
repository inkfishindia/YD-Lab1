
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
                  href={platform.platform_link_url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={platform.platform_name}
                  className="block"
                  onClick={(e) => e.stopPropagation()}
                >
                  {platform.platform_icon_url && (
                    <img
                      src={platform.platform_icon_url}
                      alt={platform.platform_name}
                      className="w-5 h-5 rounded-sm object-contain"
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
          {platform.platform_icon_url && (
            <img src={platform.platform_icon_url} alt="" className="w-5 h-5 rounded-sm object-contain" />
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
                  selection?.type === 'person' && selection.id === person.user_id;
                const isPersonHighlighted = highlightedPersonIds.has(
                  person.user_id,
                );
                const isPersonDimmed = isFiltered && !isPersonHighlighted;

                return (
                  <div
                    key={person.user_id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect('person', person.user_id);
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

export const ProgramsViewPage: React.FC = () => {
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
    dataError,
  } = useData();

  const [selectedItem, setSelectedItem] = useState<{
    type: ItemType;
    id: string;
  } | null>(null);
  const [activeTooltip, setActiveTooltip] = useState<{
    content: React.ReactNode;
    targetRect: DOMRect | null;
  }>({ content: null, targetRect: null });

  const structuredPrograms = useMemo(() => {
    const projectMap = new Map<string, StructuredProject>();
    mgmtProjects.forEach((proj) => {
      projectMap.set(proj.project_id, { ...proj, milestones: [] });
    });

    const milestoneMap = new Map<string, Milestone & { tasks: MgmtTask[] }>();
    milestones.forEach((ms) => {
      milestoneMap.set(ms.milestone_id, { ...ms, tasks: [] });
    });

    mgmtTasks.forEach((task) => {
      if (task.milestone_id && milestoneMap.has(task.milestone_id)) {
        milestoneMap.get(task.milestone_id)?.tasks.push(task);
      }
    });

    milestoneMap.forEach((ms) => {
      if (ms.project_id && projectMap.has(ms.project_id)) {
        projectMap.get(ms.project_id)?.milestones.push(ms);
      }
    });

    const programMap = new Map<string, StructuredProgram>();
    programs.forEach((program) => {
      programMap.set(program.program_id, { ...program, projects: [] });
    });

    projectMap.forEach((proj) => {
      if (proj.program_id && programMap.has(proj.program_id)) {
        programMap.get(proj.program_id)?.projects.push(proj);
      }
    });

    return Array.from(programMap.values()).sort((a, b) =>
      a.program_name.localeCompare(b.program_name),
    );
  }, [programs, mgmtProjects, milestones, mgmtTasks]);

  const allItems = useMemo(() => {
    const items = new Map<string, ItemType>();
    structuredPrograms.forEach((p) => {
      items.set(p.program_id, 'program');
      p.projects.forEach((proj) => {
        items.set(proj.project_id, 'project');
        proj.milestones.forEach((ms) => {
          items.set(ms.milestone_id, 'milestone');
          ms.tasks.forEach((task) => items.set(task.task_id, 'task'));
        });
      });
    });
    systemPeople.forEach((p) => items.set(p.user_id, 'person'));
    systemSegments.forEach((s) => items.set(s.segment_id, 'segment'));
    systemPlatforms.forEach((p) => items.set(p.platform_id, 'platform'));
    systemChannels.forEach((c) => items.set(c.channel_id, 'channel'));
    systemHubs.forEach((h) => items.set(h.hub_id, 'hub'));
    return items;
  }, [
    structuredPrograms,
    systemPeople,
    systemSegments,
    systemPlatforms,
    systemChannels,
    systemHubs,
  ]);

  const highlightedIds = useMemo(() => {
    const sets: Record<ItemType, Set<string>> = {
      program: new Set(),
      project: new Set(),
      milestone: new Set(),
      task: new Set(),
      person: new Set(),
      segment: new Set(),
      platform: new Set(),
      channel: new Set(),
      hub: new Set(),
    };

    if (!selectedItem) return sets;

    sets[selectedItem.type].add(selectedItem.id);

    let changed = true;
    while (changed) {
      const currentSize = Object.values(sets).reduce(
        (acc, set) => acc + set.size,
        0,
      );

      // Propagate highlights upwards (children highlight parents)
      structuredPrograms.forEach((p) => {
        p.projects.forEach((proj) => {
          if (sets.milestone.has(proj.project_id))
            sets.project.add(proj.project_id);
          proj.milestones.forEach((ms) => {
            if (sets.task.has(ms.milestone_id))
              sets.milestone.add(ms.milestone_id);
          });
        });
      });

      // Propagate highlights downwards and sideways (parents/peers highlight children/related)
      structuredPrograms.forEach((p) => {
        if (sets.program.has(p.program_id)) {
          // Program -> Segment, Platform, Channel, Hub, Person
          p.serves_segment_ids?.forEach((id) => sets.segment.add(id));
          p.platform_ids?.forEach((id) => sets.platform.add(id));
          p.channel_ids?.forEach((id) => sets.channel.add(id));
          p.contributing_hub_ids?.forEach((id) => sets.hub.add(id));
          if (p.owner_person_id) sets.person.add(p.owner_person_id);
          p.projects.forEach((proj) => sets.project.add(proj.project_id));
        }
        p.projects.forEach((proj) => {
          if (sets.project.has(proj.project_id)) {
            // Project -> Person, Hub, Channel
            if (proj.owner_id) sets.person.add(proj.owner_id);
            if (proj.hub_id) sets.hub.add(proj.hub_id);
            proj.channel_ids?.forEach((id) => sets.channel.add(id));
            proj.milestones.forEach((ms) => sets.milestone.add(ms.milestone_id));
          }
          proj.milestones.forEach((ms) => {
            if (sets.milestone.has(ms.milestone_id)) {
              // Milestone -> Person
              if (ms.owner_id) sets.person.add(ms.owner_id);
              ms.tasks.forEach((task) => sets.task.add(task.task_id));
            }
            ms.tasks.forEach((task) => {
              if (sets.task.has(task.task_id)) {
                // Task -> Person, Hub
                if (task.assignee_ids) sets.person.add(task.assignee_ids);
                if (task.hub_id) sets.hub.add(task.hub_id);
              }
            });
          });
        });
      });

      // From System entities to Programs
      systemSegments.forEach((s) => {
        if (sets.segment.has(s.segment_id)) {
          structuredPrograms.forEach((p) => {
            if (idStringIncludes(p.serves_segment_ids?.join(','), s.segment_id))
              sets.program.add(p.program_id);
          });
        }
      });
      systemPlatforms.forEach((p) => {
        if (sets.platform.has(p.platform_id)) {
          structuredPrograms.forEach((prog) => {
            if (idStringIncludes(prog.platform_ids?.join(','), p.platform_id))
              sets.program.add(prog.program_id);
          });
        }
      });
      systemChannels.forEach((c) => {
        if (sets.channel.has(c.channel_id)) {
          structuredPrograms.forEach((prog) => {
            if (idStringIncludes(prog.channel_ids?.join(','), c.channel_id))
              sets.program.add(prog.program_id);
          });
          mgmtProjects.forEach((proj) => {
            if (idStringIncludes(proj.channel_ids?.join(','), c.channel_id))
              sets.project.add(proj.project_id);
          });
        }
      });
      systemHubs.forEach((h) => {
        if (sets.hub.has(h.hub_id)) {
          structuredPrograms.forEach((prog) => {
            if (idStringIncludes(prog.contributing_hub_ids?.join(','), h.hub_id))
              sets.program.add(prog.program_id);
          });
          mgmtProjects.forEach((proj) => {
            if (proj.hub_id === h.hub_id) sets.project.add(proj.project_id);
          });
          mgmtTasks.forEach((task) => {
            if (task.hub_id === h.hub_id) sets.task.add(task.task_id);
          });
        }
      });
      systemPeople.forEach((p) => {
        if (sets.person.has(p.user_id)) {
          structuredPrograms.forEach((prog) => {
            if (prog.owner_person_id === p.user_id) sets.program.add(prog.program_id);
          });
          mgmtProjects.forEach((proj) => {
            if (proj.owner_id === p.user_id) sets.project.add(proj.project_id);
          });
          milestones.forEach((ms) => {
            if (ms.owner_id === p.user_id) sets.milestone.add(ms.milestone_id);
          });
          mgmtTasks.forEach((task) => {
            if (task.assignee_ids === p.user_id) sets.task.add(task.task_id);
          });
        }
      });

      const newSize = Object.values(sets).reduce(
        (acc, set) => acc + set.size,
        0,
      );
      changed = newSize > currentSize;
    }

    return sets;
  }, [
    selectedItem,
    structuredPrograms,
    systemPeople,
    systemSegments,
    systemPlatforms,
    systemChannels,
    systemHubs,
    mgmtProjects,
    milestones,
    mgmtTasks,
  ]);

  const handleSelectItem = useCallback((type: ItemType, id: string) => {
    setSelectedItem((prev) =>
      prev?.type === type && prev.id === id ? null : { type, id },
    );
    setActiveTooltip({ content: null, targetRect: null });
  }, []);

  const handleTooltip = useCallback(
    (e: React.MouseEvent, content: React.ReactNode) => {
      e.stopPropagation();
      setActiveTooltip({ content, targetRect: e.currentTarget.getBoundingClientRect() });
    },
    [],
  );

  const handleClearTooltip = useCallback(() => {
    setActiveTooltip({ content: null, targetRect: null });
  }, []);

  const isFiltered = !!selectedItem;

  if (loading) {
    return (
      <div className="flex flex-col h-full overflow-hidden space-y-6">
        <RowSkeleton />
        <RowSkeleton />
        <div className="flex flex-1 gap-4 overflow-hidden">
          <ProgramColumnSkeleton />
          <ProgramColumnSkeleton />
          <ProgramColumnSkeleton />
          <TaskListSkeleton />
        </div>
      </div>
    );
  }

  if (dataError.length > 0) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-950 text-white p-4">
        <div className="max-w-2xl w-full text-center p-8 bg-gray-900 rounded-lg shadow-xl border border-red-500/50">
          <h2 className="text-2xl font-bold text-red-400 mb-4">
            Data Loading Error
          </h2>
          <p className="text-gray-300 text-left whitespace-pre-wrap">
            {dataError.map((e) => e.message).join('\n')}
          </p>
          <p className="mt-4 text-gray-400">
            Please check your spreadsheet configurations and network connection.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col h-full overflow-hidden"
      onClick={() => setSelectedItem(null)}
    >
      <Tooltip
        content={activeTooltip.content}
        targetRect={activeTooltip.targetRect}
      />
      <div className="flex-shrink-0 mb-6 text-center">
        <h1 className="text-2xl font-bold text-white mb-2">
          E2E Delivery Map
        </h1>
        <p className="text-gray-400 text-sm mb-4">
          Visualizing the interconnectedness of your programs, projects, and
          teams. Click an item to highlight its dependencies.
        </p>

        {/* Filters/Swimlanes */}
        <div className="space-y-6">
          {/* Segment Row */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Customer Segments
            </h3>
            <SegmentRow
              segments={systemSegments}
              selectedId={
                selectedItem?.type === 'segment' ? selectedItem.id : null
              }
              onSelect={handleSelectItem}
              onTooltip={handleTooltip}
              onClearTooltip={handleClearTooltip}
              platforms={systemPlatforms}
            />
          </div>

          {/* Platforms Row */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Platforms
            </h3>
            <PlatformRow
              platforms={systemPlatforms}
              selectedId={
                selectedItem?.type === 'platform' ? selectedItem.id : null
              }
              onSelect={handleSelectItem}
            />
          </div>

          {/* Channels Row */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Channels
            </h3>
            <ChannelRow
              channels={systemChannels}
              selectedId={
                selectedItem?.type === 'channel' ? selectedItem.id : null
              }
              onSelect={handleSelectItem}
            />
          </div>
        </div>
      </div>

      {/* Main Content: Programs, Projects, Milestones, Tasks */}
      <div className="flex-grow flex gap-4 overflow-x-auto overflow-y-auto pb-4">
        {structuredPrograms.map((program) => {
          const isProgramSelected =
            selectedItem?.type === 'program' &&
            selectedItem.id === program.program_id;
          const isProgramHighlighted = highlightedIds.program.has(
            program.program_id,
          );
          const isProgramDimmed = isFiltered && !isProgramHighlighted;

          return (
            <div
              key={program.program_id}
              className={`bg-gray-900 border rounded-xl flex-shrink-0 w-[340px] flex flex-col transition-opacity duration-300 ${
                isProgramDimmed ? 'opacity-30' : ''
              } ${isProgramSelected ? 'border-blue-500' : 'border-gray-800'}`}
            >
              {/* Program Header */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectItem('program', program.program_id);
                }}
                className="p-3 border-b border-gray-800 cursor-pointer"
              >
                <h2 className="text-lg font-bold text-white truncate">
                  {program.program_name}
                </h2>
                <p className="text-sm text-gray-400 italic mt-1 truncate">
                  {program.objective}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge
                    text={program.status}
                    colorClass={
                      STATUS_COLORS[program.status as keyof typeof STATUS_COLORS] ||
                      'bg-gray-700 text-gray-300'
                    }
                    size="sm"
                  />
                  <Badge
                    text={program.priority}
                    colorClass={
                      PRIORITY_COLORS[
                        program.priority as keyof typeof PRIORITY_COLORS
                      ] || 'bg-gray-700 text-gray-300'
                    }
                    size="sm"
                  />
                  {program.health_status && (
                    <span
                      title={`Health: ${program.health_status}`}
                      className={`w-3 h-3 rounded-full ${getHealthColor(
                        program.health_status,
                      )}`}
                    ></span>
                  )}
                </div>
              </div>

              {/* Projects */}
              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {program.projects.map((project) => {
                  const isProjectSelected =
                    selectedItem?.type === 'project' &&
                    selectedItem.id === project.project_id;
                  const isProjectHighlighted = highlightedIds.project.has(
                    project.project_id,
                  );
                  const isProjectDimmed = isFiltered && !isProjectHighlighted; // Variable correctly defined here

                  const projectTooltipContent = (
                    <div className="text-xs">
                      <p className="font-bold text-gray-300">Objective</p>
                      <p>{project.objective}</p>
                      <p className="font-bold text-gray-300 mt-2">Budget</p>
                      <p>
                        Planned:{' '}
                        {formatNumber(project.budget, 'currency')}
                        , Spent:{' '}
                        {formatNumber(project.budget_spent, 'currency')}
                      </p>
                    </div>
                  );

                  return (
                    <ProjectCard
                      key={project.project_id}
                      project={project}
                      isDimmed={isProjectDimmed}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectItem('project', project.project_id);
                      }}
                      onTooltip={handleTooltip}
                      onClearTooltip={handleClearTooltip}
                      projectTooltipContent={projectTooltipContent}
                      selectedItem={selectedItem}
                      highlightedIds={highlightedIds}
                      isFiltered={isFiltered}
                      handleSelectItem={handleSelectItem}
                      handleTooltip={handleTooltip}
                      handleClearTooltip={handleClearTooltip}
                      systemPeople={systemPeople} // Pass systemPeople here
                    />
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Hubs and People Sidebar */}
        <div
          className={`flex-shrink-0 w-[400px] transition-opacity duration-300 ${
            isFiltered ? 'opacity-100' : 'opacity-30'
          }`}
        >
          <HubsAndPeopleSection
            hubs={systemHubs}
            people={systemPeople}
            selection={selectedItem}
            onSelect={handleSelectItem}
            isFiltered={isFiltered}
            highlightedHubIds={highlightedIds.hub}
            highlightedPersonIds={highlightedIds.person}
          />
        </div>
      </div>
    </div>
  );
};

interface ProjectCardProps {
  project: StructuredProject;
  isDimmed: boolean;
  onClick: (e: React.MouseEvent) => void;
  onTooltip: (e: React.MouseEvent, content: React.ReactNode) => void;
  onClearTooltip: () => void;
  projectTooltipContent: React.ReactNode;
  selectedItem: { type: ItemType; id: string } | null;
  highlightedIds: Record<ItemType, Set<string>>;
  isFiltered: boolean;
  handleSelectItem: (type: ItemType, id: string) => void;
  handleTooltip: (e: React.MouseEvent, content: React.ReactNode) => void;
  handleClearTooltip: () => void;
  systemPeople: SystemPerson[]; // Add systemPeople prop here
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  isDimmed,
  onClick,
  onTooltip,
  onClearTooltip,
  projectTooltipContent,
  selectedItem,
  highlightedIds,
  isFiltered,
  handleSelectItem,
  handleTooltip,
  handleClearTooltip,
  systemPeople, // Destructure systemPeople here
}) => {
  const isProjectSelected =
    selectedItem?.type === 'project' && selectedItem.id === project.project_id;
  const isProjectHighlighted = highlightedIds.project.has(project.project_id);

  return (
    <div
      onClick={onClick}
      className={`bg-gray-800 rounded-lg p-3 cursor-pointer group relative transition-all duration-300 ${
        isDimmed ? 'opacity-30' : ''
      } ${isProjectSelected ? 'border border-blue-500' : 'hover:bg-gray-700'}`}
    >
      <div className="flex justify-between items-start">
        <h3
          onMouseEnter={(e) => onTooltip(e, projectTooltipContent)}
          onMouseLeave={onClearTooltip}
          className={`font-medium ${
            isProjectSelected ? 'text-white' : 'text-gray-200'
          } truncate`}
        >
          {project.project_name}
        </h3>
        {isProjectHighlighted && !isProjectSelected && (
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse-fade-in" />
        )}
      </div>
      <p className="text-xs text-gray-400 mt-1 truncate">
        Owner:{' '}
        {
          systemPeople.find((p) => p.user_id === project.owner_id)
            ?.full_name
        }
      </p>
      <div className="flex items-center gap-2 mt-2">
        <Badge
          text={project.status}
          colorClass={
            STATUS_COLORS[project.status as keyof typeof STATUS_COLORS] ||
            'bg-gray-700 text-gray-300'
          }
          size="sm"
        />
        <Badge
          text={project.priority}
          colorClass={
            PRIORITY_COLORS[project.priority as keyof typeof PRIORITY_COLORS] ||
            'bg-gray-700 text-gray-300'
          }
          size="sm"
        />
      </div>

      {project.milestones.map((milestone) => {
        const isMilestoneSelected =
          selectedItem?.type === 'milestone' &&
          selectedItem.id === milestone.milestone_id;
        const isMilestoneHighlighted = highlightedIds.milestone.has(
          milestone.milestone_id,
        );
        const isMilestoneDimmed = isFiltered && !isMilestoneHighlighted;

        const milestoneTooltipContent = (
          <div className="text-xs">
            <p className="font-bold text-gray-300">Status</p>
            <p>{milestone.status}</p>
            <p className="font-bold text-gray-300 mt-2">Target Date</p>
            <p>{milestone.target_date}</p>
          </div>
        );

        return (
          <div
            key={milestone.milestone_id}
            onClick={(e) => {
              e.stopPropagation();
              handleSelectItem('milestone', milestone.milestone_id);
            }}
            className={`bg-gray-900 rounded-lg p-2 mt-2 cursor-pointer group relative transition-all duration-300 ${
              isMilestoneDimmed ? 'opacity-30' : ''
            } ${
              isMilestoneSelected
                ? 'border border-blue-500'
                : 'hover:bg-gray-800'
            }`}
          >
            <div className="flex justify-between items-start">
              <h4
                onMouseEnter={(e) => onTooltip(e, milestoneTooltipContent)}
                onMouseLeave={onClearTooltip}
                className={`text-sm font-medium ${
                  isMilestoneSelected ? 'text-white' : 'text-gray-200'
                } truncate`}
              >
                {milestone.milestone_name}
              </h4>
              {isMilestoneHighlighted && !isMilestoneSelected && (
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse-fade-in" />
              )}
            </div>
            <p className="text-xs text-gray-500">
              Tasks:{' '}
              {milestone.tasks.filter((t) => t.status === 'Completed').length}/
              {milestone.tasks.length}
            </p>

            {milestone.tasks.map((task) => {
              const isTaskSelected =
                selectedItem?.type === 'task' && selectedItem.id === task.task_id;
              const isTaskHighlighted = highlightedIds.task.has(task.task_id);
              const isTaskDimmed = isFiltered && !isTaskHighlighted;

              const taskTooltipContent = (
                <div className="text-xs">
                  <p className="font-bold text-gray-300">Description</p>
                  <p>{task.description}</p>
                  <p className="font-bold text-gray-300 mt-2">Due Date</p>
                  <p>{task.due_date}</p>
                </div>
              );

              return (
                <div
                  key={task.task_id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectItem('task', task.task_id);
                  }}
                  className={`bg-gray-700/50 rounded-md p-2 mt-1 flex items-center justify-between group relative transition-all duration-300 ${
                    isTaskDimmed ? 'opacity-30' : ''
                  } ${
                    isTaskSelected
                      ? 'border border-blue-500'
                      : 'hover:bg-gray-700'
                  }`}
                >
                  <div className="overflow-hidden pr-2">
                    <h5
                      onMouseEnter={(e) => onTooltip(e, taskTooltipContent)}
                      onMouseLeave={onClearTooltip}
                      className={`text-xs font-medium ${
                        isTaskSelected ? 'text-white' : 'text-gray-300'
                      } truncate`}
                    >
                      {task.task_name}
                    </h5>
                  </div>
                  {isTaskHighlighted && !isTaskSelected && (
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse-fade-in" />
                  )}
                  <Badge
                    text={task.status}
                    colorClass={
                      STATUS_COLORS[task.status as keyof typeof STATUS_COLORS] ||
                      'bg-gray-600 text-gray-300'
                    }
                    size="sm"
                  />
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
