


import React from 'react';
import type { SystemChannel } from '../../../types';
import { useData } from '../../../contexts/DataContext';
import StatCard from '../StatCard';
import RelatedItem from '../RelatedItem';
import { CurrencyDollarIcon } from '../../Icons';

interface FocusProps {
    item: SystemChannel;
    onSelect: (type: any, id: string) => void;
}

const splitAndTrim = (str: string | undefined): string[] => str ? str.split(',').map(s => s.trim()).filter(Boolean) : [];

const ChannelFocus: React.FC<FocusProps> = ({ item, onSelect }) => {
    const { systemFlywheels, systemBusinessUnits, systemInterfaces, systemPeople } = useData();

// FIX: Changed 'person_id' to 'user_id' to match the 'SystemPerson' schema.
    const responsiblePerson = systemPeople.find(p => p.user_id === item.responsible_person);
// FIX: Removed unnecessary splitAndTrim as 'serves_flywheels' is already an array.
    const relatedFlywheels = systemFlywheels.filter(fw => item.serves_flywheels?.includes(fw.flywheel_id));
// FIX: Removed unnecessary splitAndTrim as 'serves_bus' is already an array.
    const relatedBUs = systemBusinessUnits.filter(bu => item.serves_bus?.includes(bu.bu_id));
    const relatedInterfaces = systemInterfaces.filter(i => i.tech_stack?.includes(item.channel_id)); // Heuristic, might need better mapping

    return (
        <div className="p-4 space-y-5">
            <div>
                <h3 className="text-xl font-bold text-white">{item.channel_name}</h3>
                {responsiblePerson && <p className="text-sm text-gray-400">Responsible: {responsiblePerson.full_name}</p>}
                <p className="text-sm text-gray-400 mt-1">Type: <span className="font-semibold text-gray-300">{item.channel_type}</span></p>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <StatCard label="Monthly Budget" value={item.monthly_budget_inr} prefix="₹" icon={CurrencyDollarIcon} />
                <StatCard label="Current CAC" value={item.current_cac} prefix="₹" />
            </div>
            
            <div>
                <h4 className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-2">Notes</h4>
                <p className="text-sm text-gray-300 bg-gray-800/50 p-3 rounded-md">{item.Notes}</p>
            </div>

            <div>
                <h4 className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-2">Serves Flywheels</h4>
                <div className="space-y-2">
                    {relatedFlywheels.map(fw => <RelatedItem key={fw.flywheel_id} type="flywheel" name={fw.flywheel_name} onClick={() => onSelect('flywheel', fw.flywheel_id)} />)}
                </div>
            </div>

            <div>
                <h4 className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-2">Serves BUs</h4>
                <div className="space-y-2">
                    {relatedBUs.map(bu => <RelatedItem key={bu.bu_id} type="bu" name={bu.bu_name} onClick={() => onSelect('bu', bu.bu_id)} />)}
                </div>
            </div>
            
            <div>
                <h4 className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-2">Associated Interfaces</h4>
                <div className="space-y-2">
                    {relatedInterfaces.map(i => <RelatedItem key={i.interface_id} type="interface" name={i.interface_name} onClick={() => onSelect('interface', i.interface_id)} />)}
                </div>
            </div>
        </div>
    );
};

export default ChannelFocus;