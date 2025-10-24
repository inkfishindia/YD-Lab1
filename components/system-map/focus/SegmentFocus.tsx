




import React from 'react';
import type { SystemSegment } from '../../../types';
import { useData } from '../../../contexts/DataContext';
import StatCard from '../StatCard';
import RelatedItem from '../RelatedItem';
import { CurrencyDollarIcon, PresentationChartLineIcon, UserGroupIcon, ShoppingCartIcon } from '../../Icons';

interface FocusProps {
    item: SystemSegment;
    onSelect: (type: any, id: string) => void;
}

const SegmentFocus: React.FC<FocusProps> = ({ item: segment, onSelect }) => {
    const { systemFlywheels, systemBusinessUnits, systemPeople } = useData();
    
// FIX: Corrected property name from 'owner_person' to 'owner_person_id' and 'person_id' to 'user_id' to match schema.
    const owner = systemPeople.find(p => p.user_id === segment.owner_person_id);

    // FIX: The 'served_by_flywheels' and 'served_by_bus' properties are already string arrays.
    // The 'splitAndTrim' helper function, which expects a string, is not needed here.
// FIX: Corrected 'served_by_flywheels' to 'served_by_flywheels_ids' and 'served_by_bus' to use the 'bu_id' property.
    const relatedFlywheels = systemFlywheels.filter(fw => segment.served_by_flywheels_ids?.includes(fw.flywheel_id));
    const relatedBUs = systemBusinessUnits.filter(bu => bu.bu_id === segment.bu_id);
    
    return (
        <div className="p-4 space-y-5">
            <div>
                <h3 className="text-xl font-bold text-white">{segment.segment_name}</h3>
                {owner && <p className="text-sm text-gray-400">Owner: {owner.full_name}</p>}
                 <p className="text-sm text-gray-400 mt-1">Status: <span className="font-semibold text-gray-300">{segment.validation_status}</span></p>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <StatCard label="9-Mo Revenue" value={segment.revenue_9mo_actual_inr} prefix="₹" icon={CurrencyDollarIcon}/>
                <StatCard label="LTV/CAC Ratio" value={segment.ltv_cac_ratio} icon={PresentationChartLineIcon}/>
                <StatCard label="Customers" value={segment.current_customers} icon={UserGroupIcon}/>
                <StatCard label="Avg. AOV" value={segment.validated_aov} prefix="₹" icon={ShoppingCartIcon}/>
            </div>
            
            <div>
                <h4 className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-2">Customer Profile</h4>
                <p className="text-sm text-gray-300 bg-gray-800/50 p-3 rounded-md">{segment.customer_profile}</p>
            </div>
            
            <div>
                <h4 className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-2">Strategic Notes</h4>
                <p className="text-sm text-gray-300 bg-gray-800/50 p-3 rounded-md">{segment.strategic_notes}</p>
            </div>

            <div>
                <h4 className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-2">Served by Flywheels</h4>
                <div className="space-y-2">
                    {relatedFlywheels.length > 0 ? relatedFlywheels.map(fw => 
                        <RelatedItem key={fw.flywheel_id} type="flywheel" name={fw.flywheel_name} detail={fw.owner_person_Name ?? undefined} onClick={() => onSelect('flywheel', fw.flywheel_id)} />
                    ) : <p className="text-sm text-gray-500">None</p>}
                </div>
            </div>
            
            <div>
                <h4 className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-2">Served by BUs</h4>
                <div className="space-y-2">
                    {relatedBUs.length > 0 ? relatedBUs.map(bu => 
                        <RelatedItem key={bu.bu_id} type="bu" name={bu.bu_name} detail={bu.bu_type} onClick={() => onSelect('bu', bu.bu_id)}/>
                    ) : <p className="text-sm text-gray-500">None</p>}
                </div>
            </div>
        </div>
    );
};

export default SegmentFocus;