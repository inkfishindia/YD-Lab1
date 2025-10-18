import React from 'react';
import type { SystemHub } from '../../../types';
import { useData } from '../../../contexts/DataContext';
import StatCard from '../StatCard';
import RelatedItem from '../RelatedItem';
import { CurrencyDollarIcon, UsersIcon } from '../../Icons';

interface FocusProps {
    item: SystemHub;
    onSelect: (type: any, id: string) => void;
}

const splitAndTrim = (str: string | undefined): string[] => str ? str.split(',').map(s => s.trim()).filter(Boolean) : [];

const HubFocus: React.FC<FocusProps> = ({ item, onSelect }) => {
    const { systemInterfaces, systemChannels, systemPeople } = useData();

    const owner = systemPeople.find(p => p.person_id === item.owner_person);
    const ownedInterfaces = systemInterfaces.filter(i => splitAndTrim(item.interfaces_owned).includes(i.interface_id));
    const ownedChannels = systemChannels.filter(c => splitAndTrim(item.channels_owned).includes(c.channel_id));

    return (
        <div className="p-4 space-y-5">
            <div>
                <h3 className="text-xl font-bold text-white">{item.hub_name}</h3>
                {owner && <p className="text-sm text-gray-400">Owner: {owner.full_name}</p>}
                <p className="text-sm text-gray-400 mt-1">Type: <span className="font-semibold text-gray-300">{item.hub_type}</span></p>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <StatCard label="Team Size" value={item.team_size} icon={UsersIcon} />
                <StatCard label="Monthly Budget" value={item.budget_monthly_inr} prefix="₹" icon={CurrencyDollarIcon} />
            </div>

            <div>
                <h4 className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-2">Core Capabilities</h4>
                <p className="text-sm text-gray-300 bg-gray-800/50 p-3 rounded-md">{item.core_capabilities}</p>
            </div>
            
            <div>
                <h4 className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-2">Primary Bottleneck</h4>
                <p className="text-sm text-gray-300 bg-gray-800/50 p-3 rounded-md">{item.primary_bottleneck}</p>
            </div>

            <div>
                <h4 className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-2">Owned Interfaces</h4>
                <div className="space-y-2">
                    {ownedInterfaces.map(i => <RelatedItem key={i.interface_id} type="interface" name={i.interface_name} detail={i.interface_type} onClick={() => onSelect('interface', i.interface_id)} />)}
                </div>
            </div>
            
            <div>
                <h4 className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-2">Owned Channels</h4>
                <div className="space-y-2">
                    {ownedChannels.map(c => <RelatedItem key={c.channel_id} type="channel" name={c.channel_name} detail={c.channel_type} onClick={() => onSelect('channel', c.channel_id)} />)}
                </div>
            </div>
        </div>
    );
};

export default HubFocus;