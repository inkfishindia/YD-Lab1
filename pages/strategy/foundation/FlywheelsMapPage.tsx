
import React, { useState, useMemo } from 'react';
import { useData } from '../../../contexts/DataContext';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import { HEALTH_STATUS_COLORS, PRIORITY_COLORS } from '../../../constants';

type Selection = { type: 'segment' | 'flywheel' | 'bu' | 'hub' | 'interface'; id: string };

const FlywheelsMapPage: React.FC = () => {
    const { businessUnits, flywheels, people, hubs, interfaces } = useData();
    const [selection, setSelection] = useState<Selection | null>(null);

    const customerSegments = useMemo(() => [...new Set(flywheels.map(fw => fw.customer_type))].sort(), [flywheels]);
    const getPersonName = (id: string) => people.find(p => p.user_id === id)?.full_name || 'N/A';

    // --- Omni-directional Interaction Logic ---
    const handleCardClick = (type: Selection['type'], id: string) => {
        if (selection?.type === type && selection.id === id) {
            setSelection(null); // Deselect if clicking the same card
        } else {
            setSelection({ type, id });
        }
    };

    const { highlightedSegmentIds, highlightedFlywheelIds, highlightedBuIds, highlightedHubIds, highlightedInterfaceIds } = useMemo(() => {
        const segments = new Set<string>();
        const fws = new Set<string>();
        const bus = new Set<string>();
        const highlightedHubs = new Set<string>();
        const highlightedInterfaces = new Set<string>();

        if (!selection) {
            return { highlightedSegmentIds: segments, highlightedFlywheelIds: fws, highlightedBuIds: bus, highlightedHubIds: highlightedHubs, highlightedInterfaceIds: highlightedInterfaces };
        }

        const sortedBuIds = [...businessUnits].sort((a,b) => a.bu_name.localeCompare(b.bu_name)).map(b => b.bu_id);

        if (selection.type === 'segment') {
            segments.add(selection.id);
            const relatedFws = flywheels.filter(fw => fw.customer_type === selection.id);
            relatedFws.forEach(fw => fws.add(fw.flywheel_id));
            businessUnits.forEach(bu => {
                if (fws.has(bu.primary_flywheel_id) || (bu.upsell_flywheel_id && fws.has(bu.upsell_flywheel_id))) {
                    bus.add(bu.bu_id);
                }
            });
        } else if (selection.type === 'flywheel') {
            fws.add(selection.id);
            const selectedFw = flywheels.find(fw => fw.flywheel_id === selection.id);
            if (selectedFw) segments.add(selectedFw.customer_type);
            businessUnits.forEach(bu => {
                if (bu.primary_flywheel_id === selection.id || bu.upsell_flywheel_id === selection.id) {
                    bus.add(bu.bu_id);
                }
            });
        } else if (selection.type === 'bu') {
            bus.add(selection.id);
            const selectedBu = businessUnits.find(bu => bu.bu_id === selection.id);
            if (selectedBu) {
                const relatedFwIds = [selectedBu.primary_flywheel_id, selectedBu.upsell_flywheel_id].filter(Boolean) as string[];
                relatedFwIds.forEach(fwId => fws.add(fwId));
                flywheels.forEach(fw => { if (fws.has(fw.flywheel_id)) segments.add(fw.customer_type); });
            }
        } else if (selection.type === 'hub') {
            highlightedHubs.add(selection.id);
            const selectedHub = hubs.find(h => h.hub_id === selection.id);
            if (selectedHub) {
                selectedHub.serves_flywheel_ids.forEach(fwId => fws.add(fwId));
                sortedBuIds.forEach((buId, index) => { if (selectedHub[`serves_bu${index + 1}` as keyof typeof selectedHub]) bus.add(buId); });
            }
        } else if (selection.type === 'interface') {
            highlightedInterfaces.add(selection.id);
            const selectedInterface = interfaces.find(c => c.interface_id === selection.id);
            if (selectedInterface) {
                fws.add(selectedInterface.flywheel_id);
                selectedInterface.bu_ids_served.forEach(buId => bus.add(buId));
            }
        }

        if (selection.type !== 'segment') flywheels.forEach(fw => { if (fws.has(fw.flywheel_id)) segments.add(fw.customer_type); });
        
        hubs.forEach(hub => {
            if (hub.serves_flywheel_ids.some(fwId => fws.has(fwId)) || sortedBuIds.some((buId, index) => bus.has(buId) && hub[`serves_bu${index + 1}` as keyof typeof hub])) {
                highlightedHubs.add(hub.hub_id);
            }
        });

        interfaces.forEach(iface => {
            if (fws.has(iface.flywheel_id) || iface.bu_ids_served.some(buId => bus.has(buId))) {
                highlightedInterfaces.add(iface.interface_id);
            }
        });

        return { highlightedSegmentIds: segments, highlightedFlywheelIds: fws, highlightedBuIds: bus, highlightedHubIds: highlightedHubs, highlightedInterfaceIds: highlightedInterfaces };
    }, [selection, flywheels, businessUnits, hubs, interfaces]);

    // --- Memoized Sorting based on Highlighting ---
    const sortedCustomerSegments = useMemo(() => [...customerSegments].sort((a, b) => (highlightedSegmentIds.has(a) ? -1 : 1) - (highlightedSegmentIds.has(b) ? -1 : 1) || a.localeCompare(b)), [customerSegments, highlightedSegmentIds]);
    const sortedFlywheels = useMemo(() => [...flywheels].sort((a, b) => (highlightedFlywheelIds.has(a.flywheel_id) ? -1 : 1) - (highlightedFlywheelIds.has(b.flywheel_id) ? -1 : 1) || a.flywheel_name.localeCompare(b.flywheel_name)), [flywheels, highlightedFlywheelIds]);
    const sortedHubs = useMemo(() => [...hubs].sort((a, b) => (highlightedHubIds.has(a.hub_id) ? -1 : 1) - (highlightedHubIds.has(b.hub_id) ? -1 : 1) || a.hub_name.localeCompare(b.hub_name)), [hubs, highlightedHubIds]);
    const sortedInterfaces = useMemo(() => [...interfaces].sort((a, b) => (highlightedInterfaceIds.has(a.interface_id) ? -1 : 1) - (highlightedInterfaceIds.has(b.interface_id) ? -1 : 1) || a.interface_name.localeCompare(b.interface_name)), [interfaces, highlightedInterfaceIds]);
    const sortedBusinessUnits = useMemo(() => [...businessUnits].sort((a, b) => (highlightedBuIds.has(a.bu_id) ? -1 : 1) - (highlightedBuIds.has(b.bu_id) ? -1 : 1) || a.bu_name.localeCompare(b.bu_name)), [businessUnits, highlightedBuIds]);
    
    // --- Rendering ---
    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-2xl font-semibold text-white mb-4">Customer Segment &amp; Foundation</h1>
                <p className="text-gray-400 mb-4 -mt-2 text-sm">Click any card to highlight its entire strategic chain.</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {sortedCustomerSegments.map(segment => {
                        const isSelected = selection?.type === 'segment' && selection.id === segment;
                        const isDimmed = selection !== null && !highlightedSegmentIds.has(segment);
                        return (
                            <div key={segment} className={`relative group cursor-pointer transition-all duration-300 ${isDimmed ? 'opacity-50 hover:opacity-100' : 'opacity-100'}`} onClick={() => handleCardClick('segment', segment)} role="button" aria-pressed={isSelected} tabIndex={0}>
                                <Card className={`h-full flex flex-col justify-center items-center text-center p-6 ${isSelected ? 'border-blue-500 ring-2 ring-blue-500/50' : 'border-gray-800'}`}>
                                    <h3 className="text-xl font-bold text-white">{segment}</h3>
                                </Card>
                            </div>
                        )
                    })}
                </div>
            </div>

            <div>
                <h1 className="text-2xl font-semibold text-white mb-4">Flywheels</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sortedFlywheels.map(fw => {
                        const isSelected = selection?.type === 'flywheel' && selection.id === fw.flywheel_id;
                        const isDimmed = selection !== null && !highlightedFlywheelIds.has(fw.flywheel_id);
                        return (
                            <div key={fw.flywheel_id} className={`relative group cursor-pointer transition-all duration-300 ${isDimmed ? 'opacity-50 hover:opacity-100' : 'opacity-100'}`} onClick={() => handleCardClick('flywheel', fw.flywheel_id)} role="button" aria-pressed={isSelected} tabIndex={0}>
                                <Card className={`h-full ${isSelected ? 'border-blue-500 ring-2 ring-blue-500/50' : 'border-gray-800'}`}>
                                    <h3 className="text-lg font-bold text-white">{fw.flywheel_name}</h3>
                                    <p className="text-sm text-gray-400 mb-3">{fw.motion}</p>
                                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                                        <div><p className="text-gray-500">Customer Type</p><p className="font-medium text-white">{fw.customer_type}</p></div>
                                        <div><p className="text-gray-500">Target Revenue</p><p className="font-medium text-white">${fw.target_revenue.toLocaleString()}</p></div>
                                        <div className="col-span-2"><p className="text-gray-500">Primary Channels</p><p className="font-medium text-white">{fw.primary_channels.join(', ')}</p></div>
                                    </div>
                                </Card>
                            </div>
                        )
                    })}
                </div>
            </div>
            
            <div>
                <h1 className="text-2xl font-semibold text-white mb-4">Hubs &amp; Departments</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sortedHubs.map(hub => {
                        const isSelected = selection?.type === 'hub' && selection.id === hub.hub_id;
                        const isDimmed = selection !== null && !highlightedHubIds.has(hub.hub_id);
                        return (
                             <div key={hub.hub_id} className={`relative group cursor-pointer transition-all duration-300 ${isDimmed ? 'opacity-50 hover:opacity-100' : 'opacity-100'}`} onClick={() => handleCardClick('hub', hub.hub_id)} role="button" aria-pressed={isSelected} tabIndex={0}>
                                <Card className={`h-full ${isSelected ? 'border-blue-500 ring-2 ring-blue-500/50' : 'border-gray-800'}`}>
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-lg font-bold text-white mb-1">{hub.hub_name}</h3>
                                        <span className={`text-xs px-2 py-1 rounded-full ${hub.capacity_constraint ? 'bg-yellow-900 text-yellow-300' : 'bg-green-900 text-green-300'}`}>{hub.capacity_constraint ? 'Constrained' : 'Healthy'}</span>
                                    </div>
                                    <p className="text-sm text-gray-400">Owner: {getPersonName(hub.owner_user_id)}</p>
                                    <p className="text-sm text-gray-400 mb-3">Category: {hub.function_category}</p>
                                    <Badge text={`Hiring: ${hub.hiring_priority}`} colorClass={PRIORITY_COLORS[hub.hiring_priority as keyof typeof PRIORITY_COLORS]} />
                                </Card>
                            </div>
                        )
                    })}
                </div>
            </div>

            <div>
                <h1 className="text-2xl font-semibold text-white mb-4">Interfaces</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sortedInterfaces.map(iface => {
                        const isSelected = selection?.type === 'interface' && selection.id === iface.interface_id;
                        const isDimmed = selection !== null && !highlightedInterfaceIds.has(iface.interface_id);
                        return (
                             <div key={iface.interface_id} className={`relative group cursor-pointer transition-all duration-300 ${isDimmed ? 'opacity-50 hover:opacity-100' : 'opacity-100'}`} onClick={() => handleCardClick('interface', iface.interface_id)} role="button" aria-pressed={isSelected} tabIndex={0}>
                                <Card className={`h-full ${isSelected ? 'border-blue-500 ring-2 ring-blue-500/50' : 'border-gray-800'}`}>
                                    <div className="flex justify-between items-start">
                                      <h3 className="text-lg font-bold text-white mb-1">{iface.interface_name}</h3>
                                    </div>
                                    <p className="text-sm text-gray-400">Owner: {getPersonName(iface.interface_owner)}</p>
                                    <p className="text-sm text-gray-400 mb-3">Category: {iface.interface_category}</p>
                                    <p className="text-sm font-medium text-white">${iface.monthly_budget.toLocaleString()} / mo</p>
                                </Card>
                            </div>
                        )
                    })}
                </div>
            </div>

            <div>
                <h1 className="text-2xl font-semibold text-white mb-4">Business Units</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sortedBusinessUnits.map(bu => {
                        const isSelected = selection?.type === 'bu' && selection.id === bu.bu_id;
                        const isDimmed = selection !== null && !highlightedBuIds.has(bu.bu_id);
                        return (
                             <div key={bu.bu_id} className={`relative group cursor-pointer transition-all duration-300 ${isDimmed ? 'opacity-50 hover:opacity-100' : 'opacity-100'}`} onClick={() => handleCardClick('bu', bu.bu_id)} role="button" aria-pressed={isSelected} tabIndex={0}>
                                <Card className={`h-full ${isSelected ? 'border-blue-500 ring-2 ring-blue-500/50' : 'border-gray-800'}`}>
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-xl font-bold text-white mb-2">{bu.bu_name}</h3>
                                        <Badge text={bu.health_status} colorClass={HEALTH_STATUS_COLORS[bu.health_status]} />
                                    </div>
                                    <p className="text-sm text-gray-400">Type: {bu.bu_type}</p>
                                    <p className="text-sm text-gray-400">Owner: {getPersonName(bu.owner_user_id)}</p>
                                    <div className="mt-4">
                                        <Badge text={bu.priority_level} colorClass={PRIORITY_COLORS[bu.priority_level]} />
                                    </div>
                                </Card>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};

export default FlywheelsMapPage;
