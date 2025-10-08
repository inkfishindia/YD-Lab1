
import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { HEALTH_STATUS_COLORS, PRIORITY_COLORS } from '../constants';

type Selection = { type: 'segment' | 'flywheel' | 'bu'; id: string };

const StrategyPage: React.FC = () => {
    const { businessUnits, flywheels, people } = useData();
    const [selection, setSelection] = useState<Selection | null>(null);

    const customerSegments = useMemo(() => [...new Set(flywheels.map(fw => fw.customer_type))].sort(), [flywheels]);
    const getPersonName = (id: string) => people.find(p => p.user_id === id)?.full_name || 'N/A';

    // --- Omni-directional Interaction Logic ---
    const handleCardClick = (type: Selection['type'], id: string) => {
        if (selection?.type === type && selection?.id === id) {
            setSelection(null); // Deselect if clicking the same card
        } else {
            setSelection({ type, id });
        }
    };

    const { highlightedSegmentIds, highlightedFlywheelIds, highlightedBuIds } = useMemo(() => {
        const segments = new Set<string>();
        const fws = new Set<string>();
        const bus = new Set<string>();

        if (!selection) {
            return { highlightedSegmentIds: segments, highlightedFlywheelIds: fws, highlightedBuIds: bus };
        }

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
            if (selectedFw) {
                segments.add(selectedFw.customer_type);
            }
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
                flywheels.forEach(fw => {
                    if (fws.has(fw.flywheel_id)) {
                        segments.add(fw.customer_type);
                    }
                });
            }
        }
        return { highlightedSegmentIds: segments, highlightedFlywheelIds: fws, highlightedBuIds: bus };
    }, [selection, flywheels, businessUnits]);

    // --- Memoized Sorting based on Highlighting ---
    const sortedCustomerSegments = useMemo(() => {
        return [...customerSegments].sort((a, b) => {
            const aIsHighlighted = highlightedSegmentIds.has(a);
            const bIsHighlighted = highlightedSegmentIds.has(b);
            if (aIsHighlighted && !bIsHighlighted) return -1;
            if (bIsHighlighted && !aIsHighlighted) return 1;
            return a.localeCompare(b);
        });
    }, [customerSegments, highlightedSegmentIds]);

    const sortedFlywheels = useMemo(() => {
        return [...flywheels].sort((a, b) => {
            const aIsHighlighted = highlightedFlywheelIds.has(a.flywheel_id);
            const bIsHighlighted = highlightedFlywheelIds.has(b.flywheel_id);
            if (aIsHighlighted && !bIsHighlighted) return -1;
            if (bIsHighlighted && !aIsHighlighted) return 1;
            return a.flywheel_name.localeCompare(b.flywheel_name);
        });
    }, [flywheels, highlightedFlywheelIds]);

    const sortedBusinessUnits = useMemo(() => {
        return [...businessUnits].sort((a, b) => {
            const aIsHighlighted = highlightedBuIds.has(a.bu_id);
            const bIsHighlighted = highlightedBuIds.has(b.bu_id);
            if (aIsHighlighted && !bIsHighlighted) return -1;
            if (bIsHighlighted && !aIsHighlighted) return 1;
            return a.bu_name.localeCompare(b.bu_name);
        });
    }, [businessUnits, highlightedBuIds]);

    // --- Rendering ---
    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-2xl font-semibold text-white mb-4">Customer Segment &amp; Foundation</h1>
                <p className="text-gray-400 mb-4 -mt-2 text-sm">Click any card below—Segment, Flywheel, or Business Unit—to highlight and reorder its entire strategic chain.</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {sortedCustomerSegments.map(segment => {
                        const isSelected = selection?.type === 'segment' && selection.id === segment;
                        const isDimmed = selection !== null && !highlightedSegmentIds.has(segment);
                        const relatedFws = flywheels.filter(fw => fw.customer_type === segment);

                        return (
                            <div
                                key={segment}
                                className={`relative group cursor-pointer transition-all duration-300 ${isDimmed ? 'opacity-50 hover:opacity-100' : 'opacity-100'}`}
                                onClick={() => handleCardClick('segment', segment)}
                                role="button" aria-pressed={isSelected} tabIndex={0}
                            >
                                <Card className={`h-full flex flex-col justify-center items-center text-center p-6 ${isSelected ? 'border-blue-500 ring-2 ring-blue-500/50' : 'border-gray-800'}`}>
                                    <h3 className="text-xl font-bold text-white">{segment}</h3>
                                </Card>
                                 {relatedFws.length > 0 && (
                                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-max max-w-xs p-2 bg-gray-950 border border-gray-700 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                        <span className="font-bold">Flywheels:</span> {relatedFws.map(fw => fw.flywheel_name).join(', ')}
                                    </div>
                                )}
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
                        const relatedBUs = businessUnits.filter(bu => bu.primary_flywheel_id === fw.flywheel_id || bu.upsell_flywheel_id === fw.flywheel_id);

                        return (
                            <div
                                key={fw.flywheel_id}
                                className={`relative group cursor-pointer transition-all duration-300 ${isDimmed ? 'opacity-50 hover:opacity-100' : 'opacity-100'}`}
                                onClick={() => handleCardClick('flywheel', fw.flywheel_id)}
                                role="button" aria-pressed={isSelected} tabIndex={0}
                            >
                                <Card className={`h-full ${isSelected ? 'border-blue-500 ring-2 ring-blue-500/50' : 'border-gray-800'}`}>
                                    <h3 className="text-lg font-bold text-white">{fw.flywheel_name}</h3>
                                    <p className="text-sm text-gray-400 mb-3">{fw.motion}</p>
                                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                                        <div><p className="text-gray-500">Customer Type</p><p className="font-medium text-white">{fw.customer_type}</p></div>
                                        <div><p className="text-gray-500">Target Revenue</p><p className="font-medium text-white">${fw.target_revenue.toLocaleString()}</p></div>
                                        <div className="col-span-2"><p className="text-gray-500">Primary Channels</p><p className="font-medium text-white">{fw.primary_channels.join(', ')}</p></div>
                                    </div>
                                </Card>
                                {relatedBUs.length > 0 && (
                                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-max max-w-xs p-2 bg-gray-950 border border-gray-700 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                        <span className="font-bold">Drives:</span> {relatedBUs.map(bu => bu.bu_name).join(', ')}
                                    </div>
                                )}
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
                        const primaryFw = flywheels.find(f => f.flywheel_id === bu.primary_flywheel_id);
                        const upsellFw = flywheels.find(f => f.flywheel_id === bu.upsell_flywheel_id);

                        return (
                             <div
                                key={bu.bu_id}
                                className={`relative group cursor-pointer transition-all duration-300 ${isDimmed ? 'opacity-50 hover:opacity-100' : 'opacity-100'}`}
                                onClick={() => handleCardClick('bu', bu.bu_id)}
                                role="button" aria-pressed={isSelected} tabIndex={0}
                            >
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
                                {(primaryFw || upsellFw) && (
                                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-max max-w-xs p-2 bg-gray-950 border border-gray-700 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                        {primaryFw && <div><span className="font-bold">Primary:</span> {primaryFw.flywheel_name} ({primaryFw.customer_type})</div>}
                                        {upsellFw && <div><span className="font-bold">Upsell:</span> {upsellFw.flywheel_name} ({upsellFw.customer_type})</div>}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};

export default StrategyPage;
