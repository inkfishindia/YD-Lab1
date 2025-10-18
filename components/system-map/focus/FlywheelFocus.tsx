import React from 'react';
import type { SystemFlywheel } from '../../../types';
import { useData } from '../../../contexts/DataContext';
import StatCard from '../StatCard';
import RelatedItem from '../RelatedItem';
import { PresentationChartLineIcon, UsersIcon, ShoppingCartIcon } from '../../Icons';

interface FocusProps {
    item: SystemFlywheel;
    onSelect: (type: any, id: string) => void;
}

const splitAndTrim = (str: string | undefined): string[] => str ? str.split(',').map(s => s.trim()).filter(Boolean) : [];

const FlywheelFocus: React.FC<FocusProps> = ({ item, onSelect }) => {
    const { systemSegments, systemBusinessUnits, systemChannels, systemPeople } = useData();

    const owner = systemPeople.find(p => p.person_id === item.owner_person);
    const relatedSegments = systemSegments.filter(s => splitAndTrim(item.serves_segments).includes(s.segment_id));
    const relatedBUs = systemBusinessUnits.filter(bu => splitAndTrim(item.serves_bus).includes(bu.bu_id));
    const relatedChannels = systemChannels.filter(c => splitAndTrim(item.acquisition_channels).includes(c.channel_id));

    return (
        <div className="p-4 space-y-5">
            <div>
                <h3 className="text-xl font-bold text-white">{item.flywheel_name}</h3>
                {owner && <p className="text-sm text-gray-400">Owner: {owner.full_name}</p>}
                <p className="text-sm text-gray-400 mt-1">Status: <span className="font-semibold text-gray-300">{item.validation_status}</span></p>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
                <StatCard label="9-Mo Revenue" value={item['9mo_actual_revenue_inr']} prefix="₹" />
                <StatCard label="Conversion %" value={(item.conversion_rate_pct || 0) * 100} suffix="%" icon={PresentationChartLineIcon} />
                <StatCard label="9-Mo Orders" value={item['9mo_actual_orders']} icon={UsersIcon} />
                <StatCard label="Validated AOV" value={item.validated_aov_inr} prefix="₹" icon={ShoppingCartIcon} />
            </div>

             <div>
                <h4 className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-2">Primary Bottleneck</h4>
                <p className="text-sm text-gray-300 bg-gray-800/50 p-3 rounded-md">{item.primary_bottleneck}</p>
            </div>

            <div>
                <h4 className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-2">Serves Segments</h4>
                <div className="space-y-2">
                    {relatedSegments.map(s => <RelatedItem key={s.segment_id} type="segment" name={s.segment_name} detail={s.validation_status} onClick={() => onSelect('segment', s.segment_id)} />)}
                </div>
            </div>

            <div>
                <h4 className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-2">Served by BUs</h4>
                <div className="space-y-2">
                    {relatedBUs.map(bu => <RelatedItem key={bu.bu_id} type="bu" name={bu.bu_name} detail={bu.bu_type} onClick={() => onSelect('bu', bu.bu_id)} />)}
                </div>
            </div>
            
            <div>
                <h4 className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-2">Acquisition Channels</h4>
                <div className="space-y-2">
                    {relatedChannels.map(c => <RelatedItem key={c.channel_id} type="channel" name={c.channel_name} detail={c.channel_type} onClick={() => onSelect('channel', c.channel_id)} />)}
                </div>
            </div>
        </div>
    );
};

export default FlywheelFocus;