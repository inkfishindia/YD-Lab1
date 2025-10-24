
import React from 'react';
import { useData } from '../../contexts/DataContext';
// FIX: Changed to type import from central types.ts file for consistency.
import type { SystemEntityType } from '../../types';
import Card from '../ui/Card';

// Import all focus components
import SegmentFocus from './focus/SegmentFocus';
import FlywheelFocus from './focus/FlywheelFocus';
import BusinessUnitFocus from './focus/BusinessUnitFocus';
import ChannelFocus from './focus/ChannelFocus';
import InterfaceFocus from './focus/InterfaceFocus';
import HubFocus from './focus/HubFocus';
import PersonFocus from './focus/PersonFocus';
import StageFocus from './focus/StageFocus';
import TouchpointFocus from './focus/TouchpointFocus';


interface FocusPaneProps {
    selection: { type: SystemEntityType; id: string } | null;
    onSelect: (type: SystemEntityType, id: string) => void;
}

const FocusPane: React.FC<FocusPaneProps> = ({ selection, onSelect }) => {
    const data = useData();

    if (!selection) {
        return (
            <Card className="h-full flex items-center justify-center">
                <div className="text-center text-gray-500 p-4">
                    <h3 className="text-base font-medium text-white">System Map Details</h3>
                    <p className="mt-1 text-sm">Select an item from any column to see its details and connections here.</p>
                </div>
            </Card>
        );
    }

    const renderContent = () => {
        const { type, id } = selection;
        const props = { onSelect };
        switch (type) {
            case 'segment':
                const segment = data.systemSegments.find(s => s.segment_id === id);
                return segment ? <SegmentFocus item={segment} {...props} /> : <div>Segment not found.</div>;
            case 'flywheel':
                const flywheel = data.systemFlywheels.find(f => f.flywheel_id === id);
                return flywheel ? <FlywheelFocus item={flywheel} {...props} /> : <div>Flywheel not found.</div>;
             case 'bu':
                const bu = data.systemBusinessUnits.find(b => b.bu_id === id);
                return bu ? <BusinessUnitFocus item={bu} {...props} /> : <div>Business Unit not found.</div>;
            case 'channel':
                const channel = data.systemChannels.find(c => c.channel_id === id);
                return channel ? <ChannelFocus item={channel} {...props} /> : <div>Channel not found.</div>;
            case 'interface':
                const iface = data.systemInterfaces.find(i => i.interface_id === id);
                return iface ? <InterfaceFocus item={iface} {...props} /> : <div>Interface not found.</div>;
            case 'hub':
                const hub = data.systemHubs.find(h => h.hub_id === id);
                return hub ? <HubFocus item={hub} {...props} /> : <div>Hub not found.</div>;
            case 'person':
// FIX: Corrected a TypeScript error by changing the property access from 'person_id' to 'user_id' to match the SystemPerson type definition.
                const person = data.systemPeople.find(p => p.user_id === id);
                return person ? <PersonFocus item={person} {...props} /> : <div>Person not found.</div>;
            case 'stage':
                const stage = data.systemStages.find(s => s.stage_id === id);
                return stage ? <StageFocus item={stage} {...props} /> : <div>Stage not found.</div>;
            case 'touchpoint':
                const touchpoint = data.systemTouchpoints.find(t => t.touchpoint_id === id);
                return touchpoint ? <TouchpointFocus item={touchpoint} {...props} /> : <div>Touchpoint not found.</div>;
            default:
                return <div>Details for {type} {id}</div>;
        }
    };
    
    return (
        <div className="bg-gray-900 border border-gray-800 rounded-lg h-full overflow-y-auto">
            {renderContent()}
        </div>
    );
};

export default FocusPane;