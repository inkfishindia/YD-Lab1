import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { useData } from '../../contexts/DataContext';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
// FIX: Add missing type imports from the types file and correct SystemEntityType import.
import {
  FlywheelStrategy,
  SegmentPositioning,
  FunnelStage,
  InterfaceMap,
} from '../../types';
import type { SystemEntityType } from '../../types';

const DetailCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <Card className="!p-0">
        <h3 className="text-base font-semibold text-white px-5 py-3 border-b border-gray-800">{title}</h3>
        <div className="p-5">{children}</div>
    </Card>
);

const PositioningPage: React.FC = () => {
    const { flywheelStrategies, segmentPositionings, funnelStages, interfaceMaps } = useData();
    const [selectedFlywheel, setSelectedFlywheel] = useState<FlywheelStrategy | null>(null);
    const [selectedStageId, setSelectedStageId] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleNavigateToSystemMap = (type: SystemEntityType, id: string) => {
        navigate('/system/map', { state: { selection: { type, id } } });
    };

    const handleSelectFlywheel = (fw: FlywheelStrategy) => {
        setSelectedFlywheel(fw);
        setSelectedStageId(null); // Reset stage selection when flywheel changes
    };

    const relatedSegments = useMemo(() => {
        if (!selectedFlywheel?.servesSegments) return [];
        // Handle cases like "SEG-02 + SEG-04" or "SEG-01"
        const servedSegmentIds = selectedFlywheel.servesSegments.split(/[+,]/).map(s => s.trim());
        return segmentPositionings.filter(s => servedSegmentIds.includes(s.segment));
    }, [selectedFlywheel, segmentPositionings]);

    const relatedFunnelStages = useMemo(() => {
        if (!selectedFlywheel) return [];
        return funnelStages.filter(s => s.flywheelId === selectedFlywheel.flywheelId);
    }, [selectedFlywheel, funnelStages]);

    const relatedInterfaceMaps = useMemo(() => {
        if (!selectedFlywheel) return [];
        return interfaceMaps.filter(i => i.flywheel === selectedFlywheel.flywheelName);
    }, [selectedFlywheel, interfaceMaps]);
    
    const relatedInterfaceChannelIds = useMemo(() => {
        if (!selectedStageId) return [];
        const stage = funnelStages.find(s => s.stageId === selectedStageId);
        if (!stage?.interfaceChannel) return [];
        return stage.interfaceChannel.split(/[/,]/).map(id => id.trim());
    }, [selectedStageId, funnelStages]);


    return (
        <div className="flex h-full gap-6">
            {/* Master Pane */}
            <div className="w-1/3 flex flex-col gap-4">
                <h1 className="text-2xl font-semibold text-white">Flywheel Strategies</h1>
                <p className="text-gray-400 -mt-3 text-sm">Click any item to view on the System Map.</p>
                <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                    {flywheelStrategies.map(fw => (
                        <div
                            key={fw.flywheelId}
                            onClick={() => handleSelectFlywheel(fw)}
                            onDoubleClick={() => handleNavigateToSystemMap('flywheel', fw.flywheelId)}
                            title="Double-click to view on System Map"
                            className={`p-4 rounded-lg cursor-pointer transition-colors border ${
                                selectedFlywheel?.flywheelId === fw.flywheelId
                                    ? 'bg-blue-900/50 border-blue-500'
                                    : 'bg-gray-800 border-gray-700 hover:bg-gray-700 hover:border-gray-600'
                            }`}
                        >
                            <div className="flex justify-between items-start">
                                <h2 className="font-bold text-white text-lg">{fw.flywheelName}</h2>
                                <Badge text={`Rank ${fw.strategicRank}`} colorClass="bg-gray-700 text-gray-300" />
                            </div>
                            <p className="text-sm text-gray-400 mt-1">{fw.positioningWeOwn}</p>
                            <p className="text-sm text-red-400 mt-2 font-semibold">Bottleneck: <span className="text-gray-300 font-normal">{fw.bottleneckProblem}</span></p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Detail Pane */}
            <div className="w-2/3 overflow-y-auto pr-2 space-y-6">
                {!selectedFlywheel ? (
                    <div className="h-full flex items-center justify-center bg-gray-900 border border-gray-800 rounded-lg">
                        <div className="text-center">
                            <h2 className="text-xl font-semibold text-white">Select a Strategy</h2>
                            <p className="text-gray-400 mt-1">Choose a flywheel strategy from the left to see its details.</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <DetailCard title="Flywheel Strategic Details">
                            <div className="space-y-3 text-sm">
                                <p><strong className="text-gray-400 w-32 inline-block">Strategic Action:</strong> <span className="text-white font-medium">{selectedFlywheel.strategicAction}</span></p>
                                <p><strong className="text-gray-400 w-32 inline-block">Key Metric:</strong> {selectedFlywheel.velocityCompounding}</p>
                                <p><strong className="text-gray-400 w-32 inline-block">Fix Investment:</strong> {selectedFlywheel.fixInvestment}</p>
                                <p><strong className="text-gray-400 w-32 inline-block">Kill Criteria:</strong> {selectedFlywheel.killCriteria}</p>
                            </div>
                        </DetailCard>

                        {relatedSegments.length > 0 && (
                            <DetailCard title="Segment Positioning">
                                <div className="space-y-6">
                                {relatedSegments.map(segment => (
                                    <div key={segment.segment} className="border-b border-gray-800 last:border-b-0 pb-4 last:pb-0">
                                        <h3 
                                            className="text-lg font-bold text-blue-400 cursor-pointer hover:underline"
                                            onClick={() => handleNavigateToSystemMap('segment', segment.segment)}
                                            title="Click to view on System Map"
                                        >
                                            {segment.segmentName}
                                        </h3>
                                        <p className="font-semibold text-white mt-1">{segment.tagline}</p>
                                        <blockquote className="mt-3 pl-4 border-l-2 border-gray-700 italic text-gray-300">{segment.ourPov}</blockquote>
                                        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-gray-500 uppercase text-xs font-bold">Shift From</p>
                                                <p className="text-gray-300">{segment.shiftFrom}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 uppercase text-xs font-bold">Shift To</p>
                                                <p className="text-white font-semibold">{segment.shiftTo}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                </div>
                            </DetailCard>
                        )}
                        
                        <DetailCard title="Funnel Stages">
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead className="text-left text-gray-400"><tr><th className="p-2">Stage</th><th className="p-2">Hub</th><th className="p-2">Owner</th><th className="p-2">Conv %</th><th className="p-2">Bottleneck</th></tr></thead>
                                    <tbody className="divide-y divide-gray-800">
                                        {relatedFunnelStages.map(s => <tr 
                                            key={s.stageId}
                                            onClick={() => setSelectedStageId(s.stageId === selectedStageId ? null : s.stageId)}
                                            className={`cursor-pointer transition-colors ${selectedStageId === s.stageId ? 'bg-blue-900/50' : 'hover:bg-gray-800/50'}`}
                                        >
                                            <td className="p-2 font-medium text-white">{s.stage}</td>
                                            <td className="p-2">{s.hubName}</td>
                                            <td className="p-2">{s.ownerName}</td>
                                            <td className="p-2">{s.currentConv} → {s.targetConv}</td>
                                            <td className="p-2 text-red-400">{s.bottleneck}</td>
                                        </tr>)}
                                    </tbody>
                                </table>
                            </div>
                        </DetailCard>

                         <DetailCard title="Interface & Hub Mapping">
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead className="text-left text-gray-400"><tr><th className="p-2">Interface</th><th className="p-2">Channel</th><th className="p-2">Hub</th><th className="p-2">Owner</th><th className="p-2">Status</th></tr></thead>
                                    <tbody className="divide-y divide-gray-800">
                                        {relatedInterfaceMaps.map(i => {
                                            const isHighlighted = selectedStageId && (relatedInterfaceChannelIds.includes(i.interfaceId) || relatedInterfaceChannelIds.includes(i.channelId));
                                            return (
                                                <tr key={i.interfaceId} className={`transition-colors ${isHighlighted ? 'bg-green-900/30' : ''}`}>
                                                    <td className="p-2 font-medium text-white">{i.interfaceName}</td>
                                                    <td className="p-2">{i.channelName}</td>
                                                    <td className="p-2">{i.hubName}</td>
                                                    <td className="p-2">{i.ownerName}</td>
                                                    <td className="p-2"><Badge text={i.status} colorClass={i.status === 'Active' || i.status === 'Growing' ? 'bg-green-800/50 text-green-300' : 'bg-red-800/50 text-red-300'}/></td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </DetailCard>
                    </>
                )}
            </div>
        </div>
    );
};

export default PositioningPage;
