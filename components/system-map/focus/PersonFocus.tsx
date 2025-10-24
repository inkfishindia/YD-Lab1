
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
    const { systemHubs, systemFlywheels, systemSegments, systemBusinessUnits } = useData();
    const primaryHub = systemHubs.find(h => h.hub_id === item.primary_hub);
    const ownedFlywheels = systemFlywheels.filter(f => item.owns_flywheels_ids?.includes(f.flywheel_id));
    const ownedSegments = systemSegments.filter(s => item.owns_segments_ids?.includes(s.segment_id));
    const ownedBUs = systemBusinessUnits.filter(b => item.owns_bus_ids?.includes(b.bu_id));

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
            
            <DetailSection title="Owns Flywheels"><div className="space-y-2">{ownedFlywheels.map(f => <RelatedItem key={f.flywheel_id} type="flywheel" name={f.flywheel_name} onClick={() => onSelect('flywheel', f.flywheel_id)} />)}</div></DetailSection>
            <DetailSection title="Owns Segments"><div className="space-y-2">{ownedSegments.map(s => <RelatedItem key={s.segment_id} type="segment" name={s.segment_name} onClick={() => onSelect('segment', s.segment_id)} />)}</div></DetailSection>
            <DetailSection title="Owns BUs"><div className="space-y-2">{ownedBUs.map(b => <RelatedItem key={b.bu_id} type="bu" name={b.bu_name} onClick={() => onSelect('bu', b.bu_id)} />)}</div></DetailSection>
        </div>
    );
};

// A helper component to avoid rendering empty sections
const DetailSection: React.FC<{title: string, children: React.ReactNode}> = ({ title, children }) => {
    const childrenArray = React.Children.toArray(children);
    if (!childrenArray.some(child => Array.isArray(child) ? child.length > 0 : child)) {
        return null;
    }

    return (
        <div>
            <h4 className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-2">{title}</h4>
            {children}
        </div>
    );
}

export default PersonFocus;