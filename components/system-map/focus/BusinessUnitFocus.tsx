import React from 'react';
import type { SystemBusinessUnit } from '../../../types';
import { useData } from '../../../contexts/DataContext';
import StatCard from '../StatCard';
import RelatedItem from '../RelatedItem';
import { CurrencyDollarIcon, PresentationChartLineIcon } from '../../Icons';

interface FocusProps {
    item: SystemBusinessUnit;
    onSelect: (type: any, id: string) => void;
}

const BusinessUnitFocus: React.FC<FocusProps> = ({ item, onSelect }) => {
    const { systemSegments, systemFlywheels, systemPeople } = useData();
    
    const owner = systemPeople.find(p => p.person_id === item.owner_person);
    const primaryFlywheel = systemFlywheels.find(f => f.flywheel_id === item.primary_flywheel);
    const servedSegment = systemSegments.find(s => s.segment_id === item.serves_segment);

    return (
        <div className="p-4 space-y-5">
            <div>
                <h3 className="text-xl font-bold text-white">{item.bu_name}</h3>
                {owner && <p className="text-sm text-gray-400">Owner: {owner.full_name}</p>}
                <p className="text-sm text-gray-400 mt-1">Status: <span className="font-semibold text-gray-300">{item.current_status}</span></p>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <StatCard label="9-Mo Revenue" value={item['9mo_actual_revenue_inr']} prefix="₹" icon={CurrencyDollarIcon} />
                <StatCard label="Utilization" value={item.current_utilization_pct} suffix="%" icon={PresentationChartLineIcon} />
            </div>
            
            <div>
                <h4 className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-2">Offering Description</h4>
                <p className="text-sm text-gray-300 bg-gray-800/50 p-3 rounded-md">{item.offering_description}</p>
            </div>
            
            {primaryFlywheel && (
                <div>
                    <h4 className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-2">Primary Flywheel</h4>
                    <RelatedItem 
                        type="flywheel" 
                        name={primaryFlywheel.flywheel_name} 
                        detail={primaryFlywheel.owner_person_Name}
                        onClick={() => onSelect('flywheel', primaryFlywheel.flywheel_id)} 
                    />
                </div>
            )}
            
            {servedSegment && (
                <div>
                    <h4 className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-2">Serves Segment</h4>
                    <RelatedItem 
                        type="segment" 
                        name={servedSegment.segment_name} 
                        detail={servedSegment.validation_status}
                        onClick={() => onSelect('segment', servedSegment.segment_id)} 
                    />
                </div>
            )}
        </div>
    );
};

export default BusinessUnitFocus;