import React from 'react';
import type { SystemInterface } from '../../../types';
import { useData } from '../../../contexts/DataContext';
import StatCard from '../StatCard';
import RelatedItem from '../RelatedItem';
import { UsersIcon } from '../../Icons';

interface FocusProps {
    item: SystemInterface;
    onSelect: (type: any, id: string) => void;
}

const InterfaceFocus: React.FC<FocusProps> = ({ item, onSelect }) => {
    const { systemHubs, systemPeople } = useData();

    const responsiblePerson = systemPeople.find(p => p.person_id === item.responsible_person);
    const ownerHub = systemHubs.find(h => h.hub_id === item.owned_by_hub);

    return (
        <div className="p-4 space-y-5">
            <div>
                <h3 className="text-xl font-bold text-white">{item.interface_name}</h3>
                {responsiblePerson && <p className="text-sm text-gray-400">Responsible: {responsiblePerson.full_name}</p>}
                <p className="text-sm text-gray-400 mt-1">Status: <span className="font-semibold text-gray-300">{item.build_status}</span></p>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <StatCard label="Monthly MAU" value={item.monthly_mau} icon={UsersIcon} />
                <StatCard label="Annual Volume" value={item.annual_volume} />
            </div>

            <div>
                <h4 className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-2">Notes</h4>
                <p className="text-sm text-gray-300 bg-gray-800/50 p-3 rounded-md">{item.notes}</p>
            </div>
            
            {ownerHub && (
                <div>
                    <h4 className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-2">Owned by Hub</h4>
                    <RelatedItem 
                        type="hub" 
                        name={ownerHub.hub_name} 
                        detail={ownerHub.hub_type}
                        onClick={() => onSelect('hub', ownerHub.hub_id)} 
                    />
                </div>
            )}
        </div>
    );
};

export default InterfaceFocus;