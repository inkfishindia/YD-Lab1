import React from 'react';
import type { SystemTouchpoint } from '../../../types';
import { useData } from '../../../contexts/DataContext';
import StatCard from '../StatCard';
import RelatedItem from '../RelatedItem';
import { PresentationChartLineIcon, UsersIcon } from '../../Icons';

interface FocusProps {
    item: SystemTouchpoint;
    onSelect: (type: any, id: string) => void;
}

const TouchpointFocus: React.FC<FocusProps> = ({ item, onSelect }) => {
    const { systemStages, systemChannels, systemInterfaces, systemHubs, systemPeople } = useData();

    const stage = systemStages.find(s => s.stage_id === item.stage);
    const channel = systemChannels.find(c => c.channel_id === item.channel);
    const iface = systemInterfaces.find(i => i.interface_id === item.interface);
    const hub = systemHubs.find(h => h.hub_id === item.responsible_hub);
    const person = systemPeople.find(p => p.person_id === item.responsible_person);

    return (
        <div className="p-4 space-y-5">
            <div>
                <h3 className="text-xl font-bold text-white">{item.touchpoint_name}</h3>
                <p className="text-sm text-gray-400 mt-1">Status: <span className="font-semibold text-gray-300">{item.current_status}</span></p>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
                <StatCard label="Success Metric" value={item.success_metric} />
                <StatCard label="Monthly Volume" value={item.monthly_volume} icon={UsersIcon} />
                <StatCard label="Target Value" value={item.target_value} />
                <StatCard label="Current Value" value={item.current_value} />
                <StatCard label="Conversion" value={(item.conversion_to_next || 0) * 100} suffix="%" icon={PresentationChartLineIcon} />
                <StatCard label="Drop-off" value={(item.drop_off_rate || 0) * 100} suffix="%" />
            </div>

            <div>
                <h4 className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-2">Friction Points</h4>
                <p className="text-sm text-gray-300 bg-gray-800/50 p-3 rounded-md">{item.friction_points}</p>
            </div>
            
            <div className="space-y-3">
                {stage && <RelatedItem type="stage" name={stage.stage_name} detail="Stage" onClick={() => onSelect('stage', stage.stage_id)} />}
                {channel && <RelatedItem type="channel" name={channel.channel_name} detail="Channel" onClick={() => onSelect('channel', channel.channel_id)} />}
                {iface && <RelatedItem type="interface" name={iface.interface_name} detail="Interface" onClick={() => onSelect('interface', iface.interface_id)} />}
                {hub && <RelatedItem type="hub" name={hub.hub_name} detail="Responsible Hub" onClick={() => onSelect('hub', hub.hub_id)} />}
                {person && <RelatedItem type="person" name={person.full_name} detail="Responsible Person" onClick={() => onSelect('person', person.person_id)} />}
            </div>
        </div>
    );
};

export default TouchpointFocus;