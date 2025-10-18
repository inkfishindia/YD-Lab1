import React from 'react';
import type { SystemPerson } from '../../../types';
import { useData } from '../../../contexts/DataContext';
import StatCard from '../StatCard';
import RelatedItem from '../RelatedItem';
import { PresentationChartLineIcon } from '../../Icons';

interface FocusProps {
    item: SystemPerson;
    onSelect: (type: any, id: string) => void;
}

const PersonFocus: React.FC<FocusProps> = ({ item, onSelect }) => {
    const { systemHubs } = useData();
    const primaryHub = systemHubs.find(h => h.hub_id === item.primary_hub);

    return (
        <div className="p-4 space-y-5">
            <div>
                <h3 className="text-xl font-bold text-white">{item.full_name}</h3>
                <p className="text-sm text-gray-400">{item.role}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <StatCard label="Annual Comp" value={item.annual_comp_inr} prefix="₹" />
                <StatCard label="Capacity Util." value={item.capacity_utilization_pct} suffix="%" icon={PresentationChartLineIcon} />
            </div>
            
            <div>
                <h4 className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-2">Primary OKRs</h4>
                <p className="text-sm text-gray-300 bg-gray-800/50 p-3 rounded-md whitespace-pre-wrap">{item.primary_okrs}</p>
            </div>

            {primaryHub && (
                <div>
                    <h4 className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-2">Primary Hub</h4>
                    <RelatedItem 
                        type="hub" 
                        name={primaryHub.hub_name} 
                        detail={primaryHub.hub_type}
                        onClick={() => onSelect('hub', primaryHub.hub_id)} 
                    />
                </div>
            )}
        </div>
    );
};

export default PersonFocus;