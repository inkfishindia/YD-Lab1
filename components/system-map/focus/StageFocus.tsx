import React from 'react';
import type { SystemStage } from '../../../types';
import { useData } from '../../../contexts/DataContext';
import StatCard from '../StatCard';
import RelatedItem from '../RelatedItem';
import { PresentationChartLineIcon, UsersIcon } from '../../Icons';

interface FocusProps {
    item: SystemStage;
    onSelect: (type: any, id: string) => void;
}

const StageFocus: React.FC<FocusProps> = ({ item, onSelect }) => {
    const { systemFlywheels } = useData();
    const flywheel = systemFlywheels.find(f => f.flywheel_id === item.flywheel);

    return (
        <div className="p-4 space-y-5">
            <div>
                <h3 className="text-xl font-bold text-white">{item.stage_name}</h3>
                <p className="text-sm text-gray-400 mt-1">Type: <span className="font-semibold text-gray-300">{item.stage_type}</span></p>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
                <StatCard label="Current Conv. %" value={(item.current_conversion_rate || 0) * 100} suffix="%" icon={PresentationChartLineIcon} />
                <StatCard label="Expected Conv. %" value={(item.expected_conversion_rate || 0) * 100} suffix="%" />
                <StatCard label="Volume In" value={item.monthly_volume_in} icon={UsersIcon} />
                <StatCard label="Volume Out" value={item.monthly_volume_out} icon={UsersIcon} />
            </div>

            <div>
                <h4 className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-2">Stage Description</h4>
                <p className="text-sm text-gray-300 bg-gray-800/50 p-3 rounded-md">{item.stage_description}</p>
            </div>
            
            {flywheel && (
                 <div>
                    <h4 className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-2">Part of Flywheel</h4>
                    <RelatedItem 
                        type="flywheel" 
                        name={flywheel.flywheel_name} 
                        onClick={() => onSelect('flywheel', flywheel.flywheel_id)} 
                    />
                </div>
            )}
        </div>
    );
};

export default StageFocus;