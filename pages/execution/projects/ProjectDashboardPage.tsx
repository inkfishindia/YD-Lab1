import React, { useState, useMemo } from 'react';
import { useData } from '../../../contexts/DataContext';
import type { Person, Project, Task, BusinessUnit, Flywheel, Hub, Channel, Interface } from '../../../types';
import Badge from '../../../components/ui/Badge';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { STATUS_COLORS, PRIORITY_COLORS } from '../../../constants';
import { 
    FolderIcon, 
    ClipboardCheckIcon, 
    UsersIcon, 
    PresentationChartLineIcon, 
    WrenchScrewdriverIcon,
    CurrencyDollarIcon,
    LightBulbIcon,
    XCircleIcon,
    MegaphoneIcon,
} from '../../../components/Icons';

// --- Stat Card Component ---
const StatCard: React.FC<{ icon: React.ElementType; title: string; value: string | number }> = ({ icon: Icon, title, value }) => (
    <Card className="!p-5">
        <div className="flex items-center">
            <div className="flex-shrink-0 bg-gray-800 rounded-md p-3">
                <Icon className="w-6 h-6 text-gray-400" />
            </div>
            <div className="ml-4">
                <p className="text-sm font-medium text-gray-400 truncate">{title}</p>
                <p className="text-2xl font-bold text-white">{value}</p>
            </div>
        </div>
    </Card>
);

// --- List Card Component ---
const ListCard: React.FC<{ title: string; children: React.ReactNode; filterInput?: React.ReactNode; }> = ({ title, children, filterInput }) => (
    <div className="flex flex-col bg-gray-900 border border-gray-800 rounded-lg h-full max-h-[400px]">
        <div className="p-4 border-b border-gray-800 flex-shrink-0">
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            {filterInput && <div className="mt-2">{filterInput}</div>}
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {children}
        </div>
    </div>
);

// --- Filter Row Component ---
const FilterRow: React.FC<{
  title: string;
  items: any[];
  idKey: string;
  nameKey: string;
  selectionType: string;
  onSelect: (type: string, id: string) => void;
  currentSelection: { type: string; id: string } | null;
}> = ({ title, items, idKey, nameKey, selectionType, onSelect, currentSelection }) => (
  <div>
    <h3 className="text-sm font-semibold text-gray-400 mb-2">{title}</h3>
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1" style={{ scrollbarWidth: 'thin', scrollbarColor: '#3F3F46 #18181B' }}>
      {items.map(item => {
        const isSelected = currentSelection?.type === selectionType && currentSelection.id === item[idKey];
        return (
          <button
            key={item[idKey]}
            onClick={() => onSelect(selectionType, item[idKey])}
            className={`flex-shrink-0 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors border ${
              isSelected
                ? 'bg-blue-600 border-blue-500 text-white'
                : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:border-gray-600'
            }`}
          >
            {item[nameKey]}
          </button>
        );
      })}
    </div>
  </div>
);


const ProjectDashboardPage: React.FC = () => {
    const { projects, tasks, people, hubs, businessUnits, flywheels, channels, interfaces } = useData();

    // --- State ---
    const [selection, setSelection] = useState<{ type: string; id: string } | null>(null);
    const [projectFilter, setProjectFilter] = useState('');

    // --- Memoized Lookups ---
    const peopleMap = useMemo(() => new Map(people.map(p => [p.user_id, p])), [people]);
    const buMap = useMemo(() => new Map(businessUnits.map(bu => [bu.bu_id, bu])), [businessUnits]);
    const flywheelMap = useMemo(() => new Map(flywheels.map(f => [f.flywheel_id, f])), [flywheels]);

    // --- Event Handlers ---
    const handleSelect = (type: string, id: string) => {
        if (selection && selection.type === type && selection.id === id) {
            setSelection(null);
        } else {
            setSelection({ type, id });
        }
    };
    
    const clearSelection = () => {
        setSelection(null);
    };
    
    // --- Highlighting logic based on item selection ---
    const {
        highlightedIds,
        isFiltered,
        connectedBu,
        connectedFlywheel,
    } = useMemo(() => {
        const highlights = {
            projects: new Set<string>(),
            tasks: new Set<string>(),
            people: new Set<string>(),
            hubs: new Set<string>(),
            channels: new Set<string>(),
            interfaces: new Set<string>(),
            flywheels: new Set<string>(),
            businessUnits: new Set<string>(),
        };
    
        if (!selection) {
            return { highlightedIds: highlights, isFiltered: false, connectedBu: null, connectedFlywheel: null };
        }
    
        // --- Initial seed ---
        switch (selection.type) {
            case 'project': highlights.projects.add(selection.id); break;
            case 'task': highlights.tasks.add(selection.id); break;
            case 'person': highlights.people.add(selection.id); break;
            case 'hub': highlights.hubs.add(selection.id); break;
            case 'channel': highlights.channels.add(selection.id); break;
            case 'interface': highlights.interfaces.add(selection.id); break;
            case 'businessUnit': highlights.businessUnits.add(selection.id); break;
        }
    
        // --- Propagation loop ---
        let lastSize = -1;
        while (Object.values(highlights).reduce((sum, set) => sum + set.size, 0) > lastSize) {
            lastSize = Object.values(highlights).reduce((sum, set) => sum + set.size, 0);
    
            projects.forEach(p => {
                if (highlights.projects.has(p.project_id)) {
                    p.business_unit_id?.forEach(buId => highlights.businessUnits.add(buId));
                    if (p.owner_user_id) highlights.people.add(p.owner_user_id);
                    p.hub_dependencies?.forEach(hubId => highlights.hubs.add(hubId));
                    p.channels_impacted?.forEach(channelId => highlights.channels.add(channelId));
                    tasks.forEach(t => { if (t.project_id === p.project_id) highlights.tasks.add(t.task_id); });
                }
            });
            
            tasks.forEach(t => {
                if (highlights.tasks.has(t.task_id)) {
                    if (t.project_id) highlights.projects.add(t.project_id);
                    if (t.assignee_user_id) highlights.people.add(t.assignee_user_id);
                    if (t.hub_id) highlights.hubs.add(t.hub_id);
                    if (t.channel_id) highlights.channels.add(t.channel_id);
                }
            });
    
            people.forEach(p => {
                if (highlights.people.has(p.user_id)) {
                    projects.forEach(proj => { if (proj.owner_user_id === p.user_id) highlights.projects.add(proj.project_id); });
                    tasks.forEach(t => { if (t.assignee_user_id === p.user_id) highlights.tasks.add(t.task_id); });
                    hubs.forEach(h => { if (h.owner_user_id === p.user_id) highlights.hubs.add(h.hub_id); });
                    interfaces.forEach(i => { if (i.interface_owner === p.user_id) highlights.interfaces.add(i.interface_id); });
                }
            });
            
            businessUnits.forEach(bu => {
                if (highlights.businessUnits.has(bu.bu_id)) {
                    if(bu.primary_flywheel_id) highlights.flywheels.add(bu.primary_flywheel_id);
                    if(bu.upsell_flywheel_id) highlights.flywheels.add(bu.upsell_flywheel_id);
                    projects.forEach(p => { if(p.business_unit_id.includes(bu.bu_id)) highlights.projects.add(p.project_id) });
                }
            });
            
            flywheels.forEach(fw => {
                if (highlights.flywheels.has(fw.flywheel_id)) {
                    fw.hub_dependencies?.forEach(hubId => highlights.hubs.add(hubId));
                    interfaces.forEach(i => { if (i.flywheel_id === fw.flywheel_id) highlights.interfaces.add(i.interface_id); });
                    businessUnits.forEach(bu => { if (bu.primary_flywheel_id === fw.flywheel_id || bu.upsell_flywheel_id === fw.flywheel_id) highlights.businessUnits.add(bu.bu_id); });
                }
            });
            
            hubs.forEach(h => {
                if (highlights.hubs.has(h.hub_id)) {
                    if(h.owner_user_id) highlights.people.add(h.owner_user_id);
                    h.serves_flywheel_ids?.forEach(fwId => highlights.flywheels.add(fwId));
                    tasks.forEach(t => { if(t.hub_id === h.hub_id) highlights.tasks.add(t.task_id) });
                    projects.forEach(p => { if(p.hub_dependencies?.includes(h.hub_id)) highlights.projects.add(p.project_id) });
                }
            });
            
            channels.forEach(c => {
                if (highlights.channels.has(c.channel_id)) {
                    interfaces.forEach(i => { if (i.channel_id === c.channel_id) highlights.interfaces.add(i.interface_id); });
                }
            });
            
            interfaces.forEach(i => {
                if (highlights.interfaces.has(i.interface_id)) {
                    if (i.channel_id) highlights.channels.add(i.channel_id);
                    if (i.flywheel_id) highlights.flywheels.add(i.flywheel_id);
                    if (i.interface_owner) highlights.people.add(i.interface_owner);
                    i.bu_ids_served?.forEach(buId => highlights.businessUnits.add(buId));
                }
            });
        }
    
        const firstBuId = [...highlights.businessUnits][0];
        const firstFwId = [...highlights.flywheels][0];

        let connectedBu: BusinessUnit | null = firstBuId ? buMap.get(firstBuId) ?? null : null;
        let connectedFlywheel: Flywheel | null = null;
        if(connectedBu?.primary_flywheel_id) {
            connectedFlywheel = flywheelMap.get(connectedBu.primary_flywheel_id) ?? null;
        } else if (firstFwId) {
            connectedFlywheel = flywheelMap.get(firstFwId) ?? null;
        }
    
        return { highlightedIds: highlights, isFiltered: true, connectedBu, connectedFlywheel };
    }, [selection, projects, tasks, people, hubs, channels, interfaces, businessUnits, flywheels, buMap, flywheelMap]);
    
    // --- Stats & Display Data Calculations ---
    const filteredProjectsForDisplay = useMemo(() => {
        return projects.filter(p => p.project_name.toLowerCase().includes(projectFilter.toLowerCase()))
                       .sort((a,b) => a.project_name.localeCompare(b.project_name));
    }, [projects, projectFilter]);
    
    const totalProjects = projects.length;
    const openTasks = tasks.filter(t => t.status !== 'Completed' && t.status !== 'Cancelled').length;
    const totalBudget = projects.reduce((sum, p) => sum + p.budget_planned, 0);
    const totalPeople = people.filter(p => p.is_active).length;
    
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-bold text-white">Project Dashboard</h1>
                {isFiltered && (
                    <Button variant="secondary" onClick={clearSelection}>
                        <XCircleIcon className="w-5 h-5 mr-2" />
                        Clear Selection
                    </Button>
                )}
            </div>
            
            {/* New Filter Bar */}
            <div className="mb-6 p-4 bg-gray-900 border border-gray-800 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    {/* Left Column */}
                    <div className="space-y-4">
                        <FilterRow title="Business Units" items={businessUnits} idKey="bu_id" nameKey="bu_name" selectionType="businessUnit" onSelect={handleSelect} currentSelection={selection} />
                        <FilterRow title="Channels" items={channels} idKey="channel_id" nameKey="channel_name" selectionType="channel" onSelect={handleSelect} currentSelection={selection} />
                    </div>
                    {/* Right Column */}
                    <div className="space-y-4">
                        <FilterRow title="Hubs" items={hubs} idKey="hub_id" nameKey="hub_name" selectionType="hub" onSelect={handleSelect} currentSelection={selection} />
                        <FilterRow title="Touchpoints / Interfaces" items={interfaces} idKey="interface_id" nameKey="interface_name" selectionType="interface" onSelect={handleSelect} currentSelection={selection} />
                    </div>
                </div>
            </div>

            {/* Row 1: Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={FolderIcon} title="Total Projects" value={totalProjects} />
                <StatCard icon={ClipboardCheckIcon} title="Open Tasks" value={openTasks} />
                <StatCard icon={CurrencyDollarIcon} title="Total Planned Budget" value={`₹${(totalBudget / 100000).toFixed(2)}L`} />
                <StatCard icon={UsersIcon} title="Active Team Members" value={totalPeople} />
            </div>

            {/* Row 2: Projects & Tasks */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ListCard 
                    title="Projects"
                    filterInput={<input type="text" placeholder="Filter projects..." value={projectFilter} onChange={e => setProjectFilter(e.target.value)} className="w-full bg-gray-800 border-gray-700 rounded-md text-sm text-white py-1.5 px-3" />}>
                    {filteredProjectsForDisplay.map(p => {
                        const isSelected = selection?.type === 'project' && selection.id === p.project_id;
                        const isHighlighted = highlightedIds.projects.has(p.project_id);
                        const isDimmed = isFiltered && !isHighlighted;
                        return (
                        <div key={p.project_id} onClick={() => handleSelect('project', p.project_id)} className={`p-3 rounded-lg cursor-pointer transition-all duration-300 ${isDimmed ? 'opacity-30 hover:opacity-100' : ''} ${isSelected ? 'bg-blue-900/50 border border-blue-500' : `bg-gray-800 hover:bg-gray-700 border border-transparent`}`}>
                            <p className="font-medium text-white truncate">{p.project_name}</p>
                            <div className="flex justify-between items-center text-xs text-gray-400 mt-1">
                                <Badge text={p.status} colorClass={STATUS_COLORS[p.status]} size="sm"/>
                                <span>{peopleMap.get(p.owner_user_id)?.full_name || 'N/A'}</span>
                            </div>
                        </div>
                    )})}
                </ListCard>
                <ListCard title="Tasks">
                     {tasks.map(t => {
                        const isSelected = selection?.type === 'task' && selection.id === t.task_id;
                        const isHighlighted = highlightedIds.tasks.has(t.task_id);
                        const isDimmed = isFiltered && !isHighlighted;
                        return (
                        <div key={t.task_id} onClick={() => handleSelect('task', t.task_id)} className={`p-3 rounded-lg cursor-pointer transition-all duration-300 ${isDimmed ? 'opacity-30 hover:opacity-100' : ''} ${isSelected ? 'bg-blue-900/50 border border-blue-500' : `bg-gray-800 hover:bg-gray-700 border border-transparent`}`}>
                            <p className="font-medium text-white truncate">{t.title}</p>
                            <div className="flex justify-between items-center text-xs text-gray-400 mt-1">
                                <Badge text={t.priority} colorClass={PRIORITY_COLORS[t.priority]} size="sm"/>
                                <span>{peopleMap.get(t.assignee_user_id)?.full_name || 'N/A'}</span>
                            </div>
                        </div>
                     )})}
                </ListCard>
            </div>

            {/* Row 3: Channels & Interfaces */}
            <div className="space-y-6">
                <div>
                    <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2"><MegaphoneIcon className="w-5 h-5 text-gray-400"/>Channels</h2>
                    <div className="flex gap-4 overflow-x-auto pb-4 -mx-1 px-1">
                        {channels.length > 0 ? channels.map(channel => {
                            const isSelected = selection?.type === 'channel' && selection.id === channel.channel_id;
                            const isHighlighted = highlightedIds.channels.has(channel.channel_id);
                            const isDimmed = isFiltered && !isHighlighted;
                            return (
                                <div
                                    key={channel.channel_id}
                                    onClick={() => handleSelect('channel', channel.channel_id)}
                                    className={`flex-shrink-0 w-64 p-4 rounded-lg cursor-pointer transition-all duration-300 border ${
                                        isDimmed ? 'opacity-30 hover:opacity-100' : ''
                                    } ${
                                        isSelected
                                            ? 'bg-blue-900/50 border-blue-500'
                                            : `bg-gray-800 hover:bg-gray-700 border-gray-700 hover:border-blue-600`
                                    }`}
                                >
                                    <p className="font-bold text-white truncate">{channel.channel_name}</p>
                                    <p className="text-xs text-gray-400 mt-1">{channel.channel_type}</p>
                                    <div className="mt-2 text-xs text-gray-300 bg-gray-700/50 px-2 py-1 rounded-full inline-block truncate max-w-full">
                                        {channel.focus}
                                    </div>
                                </div>
                            );
                        }) : <div className="w-full text-center text-gray-500 py-4 bg-gray-900/50 rounded-lg">No Channels for this view.</div>}
                    </div>
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2"><LightBulbIcon className="w-5 h-5 text-gray-400"/>Interfaces</h2>
                    <div className="flex gap-4 overflow-x-auto pb-4 -mx-1 px-1">
                        {interfaces.length > 0 ? interfaces.map(iface => {
                            const isSelected = selection?.type === 'interface' && selection.id === iface.interface_id;
                            const isHighlighted = highlightedIds.interfaces.has(iface.interface_id);
                            const isDimmed = isFiltered && !isHighlighted;
                            return (
                                 <div
                                    key={iface.interface_id}
                                    onClick={() => handleSelect('interface', iface.interface_id)}
                                    className={`flex-shrink-0 w-64 p-4 rounded-lg cursor-pointer transition-all duration-300 border ${
                                        isDimmed ? 'opacity-30 hover:opacity-100' : ''
                                    } ${
                                        isSelected
                                            ? 'bg-blue-900/50 border-blue-500'
                                            : `bg-gray-800 hover:bg-gray-700 border-gray-700 hover:border-blue-600`
                                    }`}
                                >
                                    <p className="font-bold text-white truncate">{iface.interface_name}</p>
                                    <p className="text-xs text-gray-400 mt-1 truncate">{iface.interface_category} - {iface.interface_type}</p>
                                    <p className="text-xs text-gray-300 mt-2 truncate">{peopleMap.get(iface.interface_owner)?.full_name || 'N/A'}</p>
                                </div>
                            );
                        }) : <div className="w-full text-center text-gray-500 py-4 bg-gray-900/50 rounded-lg">No Interfaces for this view.</div>}
                    </div>
                </div>
            </div>

            {/* Row 4: Hubs & People */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ListCard title="Hubs">
                     {hubs.map(hub => {
                        const isSelected = selection?.type === 'hub' && selection.id === hub.hub_id;
                        const isHighlighted = highlightedIds.hubs.has(hub.hub_id);
                        const isDimmed = isFiltered && !isHighlighted;
                        return(
                        <div key={hub.hub_id} onClick={() => handleSelect('hub', hub.hub_id)} className={`p-3 rounded-lg cursor-pointer transition-all duration-300 ${isDimmed ? 'opacity-30 hover:opacity-100' : ''} ${isSelected ? 'bg-blue-900/50 border border-blue-500' : `bg-gray-800 hover:bg-gray-700 border border-transparent`}`}>
                            <p className="font-medium text-white truncate">{hub.hub_name}</p>
                            <p className="text-xs text-gray-400">{hub.function_category}</p>
                        </div>
                     )})}
                </ListCard>
                <ListCard title="People">
                     {people.map(person => {
                        const isSelected = selection?.type === 'person' && selection.id === person.user_id;
                        const isHighlighted = highlightedIds.people.has(person.user_id);
                        const isDimmed = isFiltered && !isHighlighted;
                        return (
                        <div key={person.user_id} onClick={() => handleSelect('person', person.user_id)} className={`p-3 rounded-lg cursor-pointer transition-all duration-300 ${isDimmed ? 'opacity-30 hover:opacity-100' : ''} ${isSelected ? 'bg-blue-900/50 border border-blue-500' : `bg-gray-800 hover:bg-gray-700 border border-transparent`}`}>
                            <p className="font-medium text-white truncate">{person.full_name}</p>
                            <p className="text-xs text-gray-400">{person.role_title}</p>
                        </div>
                     )})}
                </ListCard>
            </div>
            
            {/* Row 5: Connected Systems */}
            <Card>
                <h2 className="text-lg font-semibold text-white px-6 pt-5 pb-4">Connected Systems</h2>
                {isFiltered && (connectedBu || connectedFlywheel) ? (
                    <div className="p-6 pt-0 grid grid-cols-1 md:grid-cols-3 gap-6">
                        {connectedBu && (
                            <div className="p-4 bg-gray-800/50 rounded-lg">
                                <h4 className="font-semibold text-white flex items-center gap-2"><LightBulbIcon className="w-5 h-5 text-gray-400"/>Business Unit</h4>
                                <p className="text-blue-400 mt-1">{connectedBu.bu_name}</p>
                                <p className="text-xs text-gray-400">{connectedBu.bu_type}</p>
                            </div>
                        )}
                        {connectedFlywheel && (
                            <div className="p-4 bg-gray-800/50 rounded-lg">
                                <h4 className="font-semibold text-white flex items-center gap-2"><PresentationChartLineIcon className="w-5 h-5 text-gray-400"/>Flywheel</h4>
                                <p className="text-blue-400 mt-1">{connectedFlywheel.flywheel_name}</p>
                                <p className="text-xs text-gray-400">{connectedFlywheel.motion}</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <p className="text-gray-500 text-center pb-6 px-6">Select an item to see its strategic connections.</p>
                )}
            </Card>
        </div>
    );
};

export default ProjectDashboardPage;