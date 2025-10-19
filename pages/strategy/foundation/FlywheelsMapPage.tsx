import React, { useState, useMemo, useRef, useLayoutEffect } from 'react';
import { useData } from '../../../contexts/DataContext';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { 
    PlusIcon, Squares2X2Icon, UserGroupIcon, ExclamationTriangleIcon, TargetIcon,
    RocketLaunchIcon, BuildingStorefrontIcon, MegaphoneIcon, ComputerDesktopIcon,
    QueueListIcon, CursorArrowRaysIcon, EditIcon, CloseIcon,
    CurrencyDollarIcon, PresentationChartLineIcon, ShoppingCartIcon
} from '../../../components/Icons';
import Badge from '../../../components/ui/Badge';
import { PRIORITY_COLORS, SYSTEM_STATUS_COLORS } from '../../../constants';
import type { Priority } from '../../../types';

import type { SystemBusinessUnit, SystemFlywheel, SystemSegment, SystemChannel, SystemHub, SystemPerson, SystemPlatform, SystemEntityType } from '../../../types';

// Form Modals for System Data
import SystemSegmentFormModal from '../../../components/forms/system-map/SystemSegmentFormModal';
import SystemFlywheelFormModal from '../../../components/forms/system-map/SystemFlywheelFormModal';
import SystemBusinessUnitFormModal from '../../../components/forms/system-map/SystemBusinessUnitFormModal';
import SystemChannelFormModal from '../../../components/forms/system-map/SystemChannelFormModal';
import SystemHubFormModal from '../../../components/forms/system-map/SystemHubFormModal';
import SystemPersonFormModal from '../../../components/forms/system-map/SystemPersonFormModal';

// --- HELPER & DETAIL COMPONENTS ---

const splitAndTrim = (str: string | undefined): string[] => str ? str.split(',').map(s => s.trim()).filter(Boolean) : [];

const Tooltip: React.FC<{ content: React.ReactNode; targetRect: DOMRect | null }> = ({ content, targetRect }) => {
    const tooltipRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ top: -9999, left: -9999, opacity: 0 });
    const [arrowStyle, setArrowStyle] = useState<React.CSSProperties>({});

    useLayoutEffect(() => {
        if (!targetRect || !tooltipRef.current) {
            setPosition(p => ({ ...p, opacity: 0 }));
            return;
        }

        const tip = tooltipRef.current.getBoundingClientRect();
        const MARGIN = 12;
        const arrowSize = 10;
        
        let top = targetRect.bottom + MARGIN;
        let left = targetRect.left + (targetRect.width / 2) - (tip.width / 2);

        if (left < MARGIN) left = MARGIN;
        else if (left + tip.width > window.innerWidth - MARGIN) left = window.innerWidth - tip.width - MARGIN;
        
        const arrowLeft = targetRect.left + (targetRect.width / 2) - left;
        
        const currentArrowStyle: React.CSSProperties = {
            left: `${arrowLeft}px`,
            transform: 'translateX(-50%) rotate(45deg)',
            top: `-${arrowSize / 2}px`,
        };
        
        setPosition({ top, left, opacity: 1 });
        setArrowStyle(currentArrowStyle);

    }, [content, targetRect]);

    if (!content) return null;
    
    const arrowClasses = `absolute w-2.5 h-2.5 bg-gray-950 border-gray-700 border-t border-l`;

    return (
        <div
            ref={tooltipRef}
            style={position}
            className="fixed z-50 bg-gray-950 p-3 border border-gray-700 rounded-lg shadow-lg max-w-sm transition-opacity duration-200 pointer-events-none"
            role="tooltip"
        >
            {content}
            <div 
                className={arrowClasses}
                style={arrowStyle}
            />
        </div>
    );
};

const iconMap: Record<string, React.ElementType> = {
    segment: TargetIcon,
    flywheel: RocketLaunchIcon,
    bu: BuildingStorefrontIcon,
    channel: MegaphoneIcon,
    interface: ComputerDesktopIcon,
    hub: Squares2X2Icon,
    person: UserGroupIcon,
    stage: QueueListIcon,
    touchpoint: CursorArrowRaysIcon,
};

const StatCard: React.FC<{ label: string; value: any; prefix?: string; suffix?: string; icon?: React.ElementType; }> = ({ label, value, prefix = '', suffix = '', icon: Icon }) => {
    const formatValue = (val: any) => {
        if (val === null || val === undefined || val === '') return 'N/A';
        const num = Number(String(val).replace(/[^0-9.-]+/g, ""));
        if (isNaN(num)) return val;
        
        if (prefix === '₹') {
            if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
            if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
            if (num >= 1000) return `₹${(num / 1000).toFixed(1)}k`;
            return `₹${num.toLocaleString()}`;
        }
        
        const formattedNum = num.toLocaleString(undefined, { maximumFractionDigits: 2 });
        return `${prefix}${formattedNum}${suffix}`;
    };

    return (
        <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700/50">
            <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">{label}</p>
                {Icon && <Icon className="w-4 h-4 text-gray-500" />}
            </div>
            <p className="text-xl font-bold text-white mt-1 truncate">{formatValue(value)}</p>
        </div>
    );
};

const RelatedItem: React.FC<{ type: SystemEntityType; name: string; detail?: string; onClick?: () => void; }> = ({ type, name, detail, onClick }) => {
    const Icon = iconMap[type];
    return (
        <div onClick={onClick} className="bg-gray-800/50 p-2 rounded-md flex items-center gap-3 border border-gray-700/50 cursor-pointer hover:bg-gray-700 hover:border-blue-600 transition-colors">
            {Icon && <Icon className="w-5 h-5 text-gray-400 flex-shrink-0" />}
            <div className="flex-grow overflow-hidden">
                <p className="text-sm text-white truncate">{name}</p>
                {detail && <p className="text-xs text-gray-400 truncate">{detail}</p>}
            </div>
        </div>
    );
};

const DetailSection: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => {
    const childrenArray = React.Children.toArray(children);
    const hasContent = childrenArray.some(child => {
        if (typeof child === 'string') return child.trim().length > 0;
        if (React.isValidElement<{ children?: React.ReactNode }>(child) && child.props.children) {
             const childContent = React.Children.toArray(child.props.children);
             return childContent.some(c => c !== null && c !== undefined && String(c).trim() !== '');
        }
        return child !== null && child !== undefined;
    });

    if (!hasContent) return null;
    
    return (
        <div>
            <h4 className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-2">{title}</h4>
            <div className={`text-sm text-gray-300 bg-gray-800/50 p-3 rounded-md ${className || ''}`}>
                {children}
            </div>
        </div>
    );
};

const SegmentDetailView: React.FC<{ item: SystemSegment; onSelect: (type: SystemEntityType, id: string) => void; }> = ({ item: segment, onSelect }) => {
    const { systemFlywheels, systemBusinessUnits, systemPeople, systemPlatforms } = useData();
    const owner = systemPeople.find(p => p.person_id === segment.owner_person);
    const relatedFlywheels = systemFlywheels.filter(fw => splitAndTrim(segment.served_by_flywheels).includes(fw.flywheel_id));
    const relatedBUs = systemBusinessUnits.filter(bu => splitAndTrim(segment.served_by_bus).includes(bu.bu_id));
    const relatedPlatforms = systemPlatforms.filter(p => splitAndTrim(segment.Platforms).includes(p.platform_id));

    return (
        <div className="p-4 space-y-4">
            <h3 className="text-xl font-bold text-white">{segment.segment_name}</h3>
            {owner && <p className="text-sm text-gray-400">Owner: {owner.full_name}</p>}
            <p className="text-sm text-gray-400">Status: <span className="font-semibold text-gray-300">{segment.validation_status}</span></p>

            <div className="grid grid-cols-2 gap-2">
                <StatCard label="9-Mo Revenue" value={segment.revenue_9mo_actual_inr} prefix="₹" icon={CurrencyDollarIcon}/>
                <StatCard label="LTV/CAC Ratio" value={segment.ltv_cac_ratio} icon={PresentationChartLineIcon}/>
                <StatCard label="Customers" value={segment.current_customers} icon={UserGroupIcon}/>
                <StatCard label="Validated AOV" value={segment.validated_aov} prefix="₹" icon={ShoppingCartIcon}/>
            </div>

            <DetailSection title="Positioning">{segment.Positioning}</DetailSection>
            <DetailSection title="Core Promise">{segment.Promise}</DetailSection>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
                <DetailSection title="For">{segment.For}</DetailSection>
                <DetailSection title="Against">{segment.Against}</DetailSection>
            </div>

            <DetailSection title="Identity">
                <p><strong>Vision:</strong> {segment.vision}</p>
                <p className="mt-2"><strong>Mission:</strong> {segment.mission}</p>
                <p className="mt-2"><strong>Expression:</strong> {segment.expression}</p>
            </DetailSection>
            
            <DetailSection title="Brand Position">
                <p><strong>Category:</strong> {segment.market_category}</p>
                <p className="mt-2"><strong>Our Position:</strong> {segment.brand_position}</p>
                <p className="mt-2"><strong>Differentiated Value:</strong> {segment.differentiated_value}</p>
                <p className="mt-2"><strong>Design POV:</strong> {segment.design_pov}</p>
            </DetailSection>

            <DetailSection title="Go-To-Market">
                 <p><strong>Category Entry Points:</strong> {segment.category_entry_points}</p>
                 <p className="mt-2"><strong>Buying Situations:</strong> {segment.buying_situations}</p>
                 <p className="mt-2"><strong>Distinctive Assets:</strong> {segment.distinctive_assets}</p>
            </DetailSection>

            <DetailSection title="Competitive Alternatives">
                <ul className="list-disc list-inside space-y-1">
                    {segment.competitive_alt_1 && <li>{segment.competitive_alt_1}</li>}
                    {segment.competitive_alt_2 && <li>{segment.competitive_alt_2}</li>}
                    {segment.competitive_alt_3 && <li>{segment.competitive_alt_3}</li>}
                </ul>
            </DetailSection>

            <DetailSection title="Target Audience Deep Dive">
                {(segment.age_min || segment.age_max) && <p><strong>Age Group:</strong> {segment.age_min} - {segment.age_max}</p>}
                <p className="mt-2"><strong>Company Size:</strong> {segment.company_size}</p>
                <p className="mt-2"><strong>Psychographic:</strong> {segment.psychographic}</p>
            </DetailSection>
            
            <DetailSection title="Purchase Triggers">
                 <ul className="list-disc list-inside ml-4 space-y-1">
                    {segment.purchase_trigger_1 && <li>{segment.purchase_trigger_1}</li>}
                    {segment.purchase_trigger_2 && <li>{segment.purchase_trigger_2}</li>}
                    {segment.purchase_trigger_3 && <li>{segment.purchase_trigger_3}</li>}
                </ul>
            </DetailSection>

             <DetailSection title="Solution Efficiency">
                 <p><strong>Current Solution Efficiency:</strong> {segment.current_solution_efficiency}</p>
                 <p className="mt-2"><strong>Our Solution Efficiency:</strong> {segment.our_solution_efficiency}</p>
                 <p className="mt-2"><strong>Delta Score:</strong> {segment.delta_score}</p>
            </DetailSection>
            
            <DetailSection title="Adoption">
                 <p><strong>Adoption Threshold:</strong> {segment.adoption_threshold}</p>
                 <p className="mt-2"><strong>Irreversibility Trigger:</strong> {segment.irreversibility_trigger}</p>
            </DetailSection>

            <DetailSection title="Messaging">
                 <p><strong>Tone:</strong> {segment.messaging_tone}</p>
                 <p className="mt-2"><strong>Old World Pain:</strong> {segment.old_world_pain}</p>
                 <p className="mt-2"><strong>New World Gain:</strong> {segment.new_world_gain}</p>
            </DetailSection>

            <DetailSection title="Strategic Notes">{segment.strategic_notes}</DetailSection>
            
            <DetailSection title="Platforms">
                <div className="flex flex-wrap gap-2">
                    {relatedPlatforms.map(platform => (
                        <a 
                            key={platform.platform_id} 
                            href={platform.platform_link || '#'} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex items-center gap-2 bg-gray-900/50 p-2 rounded-md border border-gray-700 hover:border-blue-500 transition-colors"
                        >
                            {platform.platform_icon && <img src={platform.platform_icon} alt={platform.platform_name} className="w-5 h-5 rounded-sm object-contain" />}
                            <span className="text-sm text-white">{platform.platform_name}</span>
                        </a>
                    ))}
                </div>
            </DetailSection>

            <DetailSection title="Served by Flywheels">
                <div className="space-y-2">{relatedFlywheels.map(fw => <RelatedItem key={fw.flywheel_id} type="flywheel" name={fw.flywheel_name} onClick={() => onSelect('flywheel', fw.flywheel_id)} />)}</div>
            </DetailSection>

            <DetailSection title="Served by BUs">
                <div className="space-y-2">{relatedBUs.map(bu => <RelatedItem key={bu.bu_id} type="bu" name={bu.bu_name} onClick={() => onSelect('bu', bu.bu_id)} />)}</div>
            </DetailSection>
        </div>
    );
};

const FlywheelDetailView: React.FC<{ item: SystemFlywheel; onSelect: (type: SystemEntityType, id: string) => void; }> = ({ item, onSelect }) => {
    const { systemSegments, systemBusinessUnits, systemChannels, systemPeople } = useData();
    const owner = systemPeople.find(p => p.person_id === item.owner_person);
    const relatedSegments = systemSegments.filter(s => splitAndTrim(item.serves_segments).includes(s.segment_id));
    const relatedBUs = systemBusinessUnits.filter(bu => splitAndTrim(item.serves_bus).includes(bu.bu_id));
    const relatedChannels = systemChannels.filter(c => splitAndTrim(item.acquisition_channels).includes(c.channel_id));

    return (
        <div className="p-4 space-y-4">
            <h3 className="text-xl font-bold text-white">{item.flywheel_name}</h3>
            {owner && <p className="text-sm text-gray-400">Owner: {owner.full_name}</p>}
            <p className="text-sm text-gray-400">Status: <span className="font-semibold text-gray-300">{item.validation_status}</span></p>
            
            <div className="grid grid-cols-2 gap-2">
                <StatCard label="9-Mo Revenue" value={item['9mo_actual_revenue_inr']} prefix="₹" icon={CurrencyDollarIcon}/>
                <StatCard label="Conversion" value={item.conversion_rate_pct} suffix="%" icon={PresentationChartLineIcon}/>
                <StatCard label="Target CAC" value={item.cac_target} prefix="₹" icon={TargetIcon} />
                <StatCard label="Order Size" value={item.order_size_range} icon={ShoppingCartIcon} />
            </div>
            
            <DetailSection title="Customer Struggle">{item.customer_struggle}</DetailSection>
            <DetailSection title="JTBD Trigger Moment">{item.jtbd_trigger_moment}</DetailSection>
            <DetailSection title="Motion Sequence">{item.motion_sequence}</DetailSection>
            <DetailSection title="Efficiency Metrics"><p className="whitespace-pre-wrap">{item.efficiency_metrics}</p></DetailSection>

            <DetailSection title="Serves Segments"><div className="space-y-2">{relatedSegments.map(s => <RelatedItem key={s.segment_id} type="segment" name={s.segment_name} onClick={() => onSelect('segment', s.segment_id)} />)}</div></DetailSection>
            <DetailSection title="Serves BUs"><div className="space-y-2">{relatedBUs.map(bu => <RelatedItem key={bu.bu_id} type="bu" name={bu.bu_name} onClick={() => onSelect('bu', bu.bu_id)} />)}</div></DetailSection>
            <DetailSection title="Acquisition Channels"><div className="space-y-2">{relatedChannels.map(c => <RelatedItem key={c.channel_id} type="channel" name={c.channel_name} onClick={() => onSelect('channel', c.channel_id)} />)}</div></DetailSection>
        </div>
    );
};

const BuDetailView: React.FC<{ item: SystemBusinessUnit; onSelect: (type: SystemEntityType, id: string) => void; }> = ({ item, onSelect }) => {
    const { systemFlywheels, systemSegments, systemPeople } = useData();
    const owner = systemPeople.find(p => p.person_id === item.owner_person);
    const primaryFlywheel = systemFlywheels.find(f => f.flywheel_id === item.primary_flywheel);
    const servesSegment = systemSegments.find(s => s.segment_id === item.serves_segment);

    return (
        <div className="p-4 space-y-4">
            <h3 className="text-xl font-bold text-white">{item.bu_name}</h3>
            {owner && <p className="text-sm text-gray-400">Owner: {owner.full_name}</p>}
            <p className="text-sm text-gray-400">Status: <span className="font-semibold text-gray-300">{item.current_status}</span></p>

            <div className="grid grid-cols-2 gap-2">
                 <StatCard label="9-Mo Revenue" value={item['9mo_actual_revenue_inr']} prefix="₹" icon={CurrencyDollarIcon}/>
                 <StatCard label="Current AOV" value={item.validated_aov} prefix="₹" icon={ShoppingCartIcon} />
                 <StatCard label="Customers" value={servesSegment?.current_customers} icon={UserGroupIcon} />
                 <StatCard label="Utilization" value={item.current_utilization_pct} suffix="%" icon={PresentationChartLineIcon} />
            </div>

            <DetailSection title="Offering Description">{item.offering_description}</DetailSection>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
                <DetailSection title="Pricing Model">{item.pricing_model_Name || item.pricing_model}</DetailSection>
                <DetailSection title="Order Volume">{item.order_volume_range}</DetailSection>
            </div>

            {primaryFlywheel && <DetailSection title="Primary Flywheel"><RelatedItem type="flywheel" name={primaryFlywheel.flywheel_name} onClick={() => onSelect('flywheel', primaryFlywheel.flywheel_id)} /></DetailSection>}
            {servesSegment && <DetailSection title="Serves Segment"><RelatedItem type="segment" name={servesSegment.segment_name} onClick={() => onSelect('segment', servesSegment.segment_id)} /></DetailSection>}
        </div>
    );
};

const HubDetailView: React.FC<{ item: SystemHub; onSelect: (type: SystemEntityType, id: string) => void; }> = ({ item, onSelect }) => {
    const { systemPeople, systemInterfaces, systemChannels } = useData();
    const owner = systemPeople.find(p => p.person_id === item.owner_person);
    const ownedInterfaces = systemInterfaces.filter(i => splitAndTrim(item.interfaces_owned).includes(i.interface_id));
    const ownedChannels = systemChannels.filter(c => splitAndTrim(item.channels_owned).includes(c.channel_id));

    return (
        <div className="p-4 space-y-4">
            <h3 className="text-xl font-bold text-white">{item.hub_name}</h3>
            {owner && <p className="text-sm text-gray-400">Owner: {owner.full_name}</p>}
             <p className="text-sm text-gray-400">Type: <span className="font-semibold text-gray-300">{item.hub_type} / <span className="font-bold">{item.cost_center_or_profit}</span></span></p>

            <div className="grid grid-cols-2 gap-2">
                <StatCard label="Team Size" value={item.team_size} icon={UserGroupIcon} />
                <StatCard label="Utilization" value={item.current_utilization_pct} suffix="%" icon={PresentationChartLineIcon} />
                <StatCard label="Monthly Budget" value={item.budget_monthly_inr} prefix="₹" icon={CurrencyDollarIcon} />
                <StatCard label="Revenue Attr." value={item.revenue_attribution_monthly} prefix="₹" />
            </div>
            
            <DetailSection title="Core Capabilities">{item.core_capabilities}</DetailSection>
            <DetailSection title="Primary Bottleneck">{item.primary_bottleneck}</DetailSection>
            <DetailSection title="Scale Trigger Point">{item.scale_trigger_point}</DetailSection>
            <DetailSection title="Note">{item.Note}</DetailSection>
            
            <DetailSection title="Owned Interfaces"><div className="space-y-2">{ownedInterfaces.map(i => <RelatedItem key={i.interface_id} type="interface" name={i.interface_name} onClick={() => onSelect('interface', i.interface_id)} />)}</div></DetailSection>
            <DetailSection title="Owned Channels"><div className="space-y-2">{ownedChannels.map(c => <RelatedItem key={c.channel_id} type="channel" name={c.channel_name} onClick={() => onSelect('channel', c.channel_id)} />)}</div></DetailSection>
        </div>
    );
};

const PersonDetailView: React.FC<{ item: SystemPerson; onSelect: (type: SystemEntityType, id: string) => void; }> = ({ item, onSelect }) => {
    const { systemHubs, systemFlywheels, systemSegments, systemBusinessUnits } = useData();
    const primaryHub = systemHubs.find(h => h.hub_id === item.primary_hub);
    const ownedFlywheels = systemFlywheels.filter(f => splitAndTrim(item.owns_flywheels).includes(f.flywheel_id));
    const ownedSegments = systemSegments.filter(s => splitAndTrim(item.owns_segments).includes(s.segment_id));
    const ownedBUs = systemBusinessUnits.filter(b => splitAndTrim(item.owns_bus).includes(b.bu_id));

    return (
        <div className="p-4 space-y-4">
            <h3 className="text-xl font-bold text-white">{item.full_name}</h3>
            <p className="text-sm text-gray-400">{item.role}</p>

            <div className="grid grid-cols-2 gap-2">
                <StatCard label="Capacity Util." value={item.capacity_utilization_pct} suffix="%" icon={PresentationChartLineIcon} />
            </div>

            <DetailSection title="Primary OKRs"><p className="whitespace-pre-wrap">{item.primary_okrs}</p></DetailSection>
            
            {primaryHub && <DetailSection title="Primary Hub"><RelatedItem type="hub" name={primaryHub.hub_name} onClick={() => onSelect('hub', primaryHub.hub_id)} /></DetailSection>}
            
            <DetailSection title="Owns Flywheels"><div className="space-y-2">{ownedFlywheels.map(f => <RelatedItem key={f.flywheel_id} type="flywheel" name={f.flywheel_name} onClick={() => onSelect('flywheel', f.flywheel_id)} />)}</div></DetailSection>
            <DetailSection title="Owns Segments"><div className="space-y-2">{ownedSegments.map(s => <RelatedItem key={s.segment_id} type="segment" name={s.segment_name} onClick={() => onSelect('segment', s.segment_id)} />)}</div></DetailSection>
            <DetailSection title="Owns BUs"><div className="space-y-2">{ownedBUs.map(b => <RelatedItem key={b.bu_id} type="bu" name={b.bu_name} onClick={() => onSelect('bu', b.bu_id)} />)}</div></DetailSection>
        </div>
    );
};

const ChannelDetailView: React.FC<{ item: SystemChannel; onSelect: (type: SystemEntityType, id: string) => void; }> = ({ item, onSelect }) => {
    const { systemFlywheels, systemBusinessUnits, systemPeople } = useData();
    const responsiblePerson = systemPeople.find(p => p.person_id === item.responsible_person);
    const relatedFlywheels = systemFlywheels.filter(fw => splitAndTrim(item.serves_flywheels).includes(fw.flywheel_id));
    const relatedBUs = systemBusinessUnits.filter(bu => splitAndTrim(item.serves_bus).includes(bu.bu_id));

    return (
        <div className="p-4 space-y-4">
            <h3 className="text-xl font-bold text-white">{item.channel_name}</h3>
            {responsiblePerson && <p className="text-sm text-gray-400">Responsible: {responsiblePerson.full_name}</p>}
            <p className="text-sm text-gray-400">Type: <span className="font-semibold text-gray-300">{item.channel_type}</span></p>

            <div className="grid grid-cols-2 gap-2">
                <StatCard label="Monthly Budget" value={item.monthly_budget_inr} prefix="₹" icon={CurrencyDollarIcon}/>
                <StatCard label="Current CAC" value={item.current_cac} prefix="₹"/>
            </div>

            <div><h4 className="text-xs uppercase font-semibold text-gray-400 mb-2">Serves Flywheels</h4><div className="space-y-2">{relatedFlywheels.map(fw => <RelatedItem key={fw.flywheel_id} type="flywheel" name={fw.flywheel_name} onClick={() => onSelect('flywheel', fw.flywheel_id)} />)}</div></div>
            <div><h4 className="text-xs uppercase font-semibold text-gray-400 mb-2">Serves BUs</h4><div className="space-y-2">{relatedBUs.map(bu => <RelatedItem key={bu.bu_id} type="bu" name={bu.bu_name} onClick={() => onSelect('bu', bu.bu_id)} />)}</div></div>
        </div>
    );
};


const DetailSidebar: React.FC<{ selection: { type: SystemEntityType; id: string } | null; onClose: () => void; onSelect: (type: SystemEntityType, id: string) => void }> = ({ selection, onClose, onSelect }) => {
    const data = useData();
    const SIDEBAR_WIDTH = 450;

    const renderContent = () => {
        if (!selection) return null;
        const { type, id } = selection;

        switch (type) {
            case 'segment': const seg = data.systemSegments.find(i => i.segment_id === id); return seg && <SegmentDetailView item={seg} onSelect={onSelect} />;
            case 'flywheel': const fw = data.systemFlywheels.find(i => i.flywheel_id === id); return fw && <FlywheelDetailView item={fw} onSelect={onSelect} />;
            case 'bu': const bu = data.systemBusinessUnits.find(i => i.bu_id === id); return bu && <BuDetailView item={bu} onSelect={onSelect} />;
            case 'hub': const hub = data.systemHubs.find(i => i.hub_id === id); return hub && <HubDetailView item={hub} onSelect={onSelect} />;
            case 'person': const person = data.systemPeople.find(i => i.person_id === id); return person && <PersonDetailView item={person} onSelect={onSelect} />;
            case 'channel': const channel = data.systemChannels.find(i => i.channel_id === id); return channel && <ChannelDetailView item={channel} onSelect={onSelect} />;
            default: return <div className="p-4 text-gray-400">Details for this item type are not yet implemented.</div>;
        }
    };

    return (
        <aside
            style={{ width: `${SIDEBAR_WIDTH}px`, transform: selection ? 'translateX(0)' : `translateX(${SIDEBAR_WIDTH}px)` }}
            className="fixed top-16 right-0 h-[calc(100vh-4rem)] bg-gray-950 border-l border-gray-800 shadow-2xl z-30 transition-transform duration-300 ease-in-out flex flex-col"
        >
            <div className="p-4 border-b border-gray-800 flex justify-between items-center flex-shrink-0">
                <h2 className="text-lg font-semibold text-white capitalize">{selection?.type} Details</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-white"><CloseIcon className="w-6 h-6" /></button>
            </div>
            <div className="flex-1 overflow-y-auto">
                {renderContent()}
            </div>
        </aside>
    );
};


const FlywheelsMapPage: React.FC = () => {
    const data = useData();
    const [selection, setSelection] = useState<{ type: SystemEntityType; id: string } | null>(null);
    const [expandedSegmentId, setExpandedSegmentId] = useState<string | null>(null);
    const [activeTooltip, setActiveTooltip] = useState<{ content: React.ReactNode; targetRect: DOMRect | null }>({ content: null, targetRect: null });
    const [modalState, setModalState] = useState<{ type: SystemEntityType | null, isOpen: boolean, data: any }>({ type: null, isOpen: false, data: null });
    
    const handleOpenModal = (type: SystemEntityType, data: any = null) => setModalState({ type, isOpen: true, data });
    const handleCloseModal = () => setModalState({ type: null, isOpen: false, data: null });
    
    const hubOrder = [
        "Digital Platform",
        "Production & Fulfillment",
        "Sales & Business Dev",
        "Marketing & Growth"
    ];

    const sortedHubs = useMemo(() => {
        if (!data.systemHubs) return [];
        return [...data.systemHubs].sort((a, b) => {
            const aIndex = hubOrder.indexOf(a.hub_name);
            const bIndex = hubOrder.indexOf(b.hub_name);
    
            if (aIndex === -1 && bIndex === -1) return 0;
            if (aIndex === -1) return 1;
            if (bIndex === -1) return -1;
            return aIndex - bIndex;
        });
    }, [data.systemHubs]);

    const highlightedIds = useMemo(() => {
        const sets: Record<string, Set<string>> = { bu: new Set(), flywheel: new Set(), segment: new Set(), channel: new Set(), hub: new Set(), person: new Set() };
        if (!selection) return sets;

        sets[selection.type].add(selection.id);
        
        let changed = true;
        while(changed) {
            const currentSize = Object.values(sets).reduce((acc, set) => acc + set.size, 0);

            data.systemBusinessUnits.forEach(bu => { if (sets.bu.has(bu.bu_id)) { if(bu.primary_flywheel) sets.flywheel.add(bu.primary_flywheel); if(bu.serves_segment) sets.segment.add(bu.serves_segment); if(bu.owner_person) sets.person.add(bu.owner_person); }});
            data.systemFlywheels.forEach(fw => { if (sets.flywheel.has(fw.flywheel_id)) { splitAndTrim(fw.serves_segments).forEach(id => sets.segment.add(id)); splitAndTrim(fw.serves_bus).forEach(id => sets.bu.add(id)); splitAndTrim(fw.acquisition_channels).forEach(id => sets.channel.add(id)); if(fw.owner_person) sets.person.add(fw.owner_person); }});
            data.systemSegments.forEach(seg => { if (sets.segment.has(seg.segment_id)) { splitAndTrim(seg.served_by_flywheels).forEach(id => sets.flywheel.add(id)); splitAndTrim(seg.served_by_bus).forEach(id => sets.bu.add(id)); if(seg.owner_person) sets.person.add(seg.owner_person); }});
            data.systemChannels.forEach(chan => { if(sets.channel.has(chan.channel_id)) { splitAndTrim(chan.serves_flywheels).forEach(id => sets.flywheel.add(id)); splitAndTrim(chan.serves_bus).forEach(id => sets.bu.add(id)); if(chan.responsible_person) sets.person.add(chan.responsible_person); }});
            data.systemHubs.forEach(hub => { if (sets.hub.has(hub.hub_id)) { if(hub.owner_person) sets.person.add(hub.owner_person); data.systemPeople.forEach(p => { if(p.primary_hub === hub.hub_id) sets.person.add(p.person_id) }) }});
            data.systemPeople.forEach(p => { if (sets.person.has(p.person_id)) { if(p.primary_hub) sets.hub.add(p.primary_hub); splitAndTrim(p.owns_flywheels).forEach(id => sets.flywheel.add(id)); splitAndTrim(p.owns_segments).forEach(id => sets.segment.add(id)); splitAndTrim(p.owns_bus).forEach(id => sets.bu.add(id)); }});
            
            const newSize = Object.values(sets).reduce((acc, set) => acc + set.size, 0);
            changed = newSize > currentSize;
        }

        return sets;
    }, [selection, data]);

    const handleTooltip = (e: React.MouseEvent, content: React.ReactNode) => {
        e.stopPropagation();
        setActiveTooltip({ content, targetRect: e.currentTarget.getBoundingClientRect() });
    };

    const handleSelect = (type: SystemEntityType, id: string) => {
        const isDeselecting = selection?.type === type && selection.id === id;
        
        setSelection(isDeselecting ? null : { type, id });
        
        if(type === 'segment') {
             setExpandedSegmentId(isDeselecting ? null : id);
        }
    };

    const buTooltipContent = (bu: SystemBusinessUnit) => (
        <div>
            <p className="font-bold text-gray-300">Sales Motion</p>
            <p>{bu.sales_motion}</p>
            <p className="font-bold text-gray-300 mt-2">Support Model</p>
            <p>{bu.support_model}</p>
            <p className="font-bold text-gray-300 mt-2">Pricing</p>
            <p>{bu.pricing_model_Name}</p>
        </div>
    );

    const flywheelTooltipContent = (flywheel: SystemFlywheel) => (
        <div>
            <p className="font-semibold">Struggle:</p><p>{flywheel.customer_struggle}</p>
            <p className="font-semibold mt-2">Bottleneck:</p><p>{flywheel.primary_bottleneck}</p>
            <p className="font-semibold mt-2">Motion Sequence:</p><p>{flywheel.motion_sequence}</p>
        </div>
    );

    const segmentTooltipContent = (segment: SystemSegment) => (
        <div>
            <p className="font-bold text-gray-300">Profile</p><p>{segment.customer_profile}</p>
            <p className="font-bold text-gray-300 mt-2">Psychological Job</p><p>{segment.psychological_job}</p>
            <p className="font-bold text-gray-300 mt-2">Vision</p><p>{segment.vision}</p>
        </div>
    );
    
    const hubTooltipContent = (hub: SystemHub) => (
        <div>
            <p className="font-bold text-gray-300">Capabilities</p>
            <p>{hub.core_capabilities}</p>
            <p className="font-bold text-gray-300 mt-2">Bottleneck</p>
            <p>{hub.primary_bottleneck}</p>
        </div>
    );

    return (
        <div className="h-full flex flex-col" onClick={() => { setSelection(null); setExpandedSegmentId(null); }}>
            <Tooltip content={activeTooltip.content} targetRect={activeTooltip.targetRect} />
            <div 
                className="flex-1 flex flex-col gap-6 transition-all duration-300 pr-2 pb-6"
                style={{ paddingRight: selection ? '450px' : '0' }}
            >
                {/* --- TOP SECTION: BUSINESS UNITS --- */}
                <section>
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex-1"></div> {/* Spacer */}
                        <div className="text-center">
                            <h2 className="text-xl font-semibold text-white">What We Sell</h2>
                            <p className="text-sm text-gray-400 -mt-1">Business Units</p>
                        </div>
                        <div className="flex-1 flex justify-end">
                            <Button onClick={() => handleOpenModal('bu')} variant="secondary" className="!px-3 !py-1.5"><PlusIcon className="w-4 h-4 mr-2" />Add BU</Button>
                        </div>
                    </div>
                    <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-4">
                        {data.systemBusinessUnits.map(bu => {
                            const isSelected = selection?.type === 'bu' && selection.id === bu.bu_id;
                            const isHighlighted = highlightedIds.bu.has(bu.bu_id);
                            const isDimmed = !!selection && !isHighlighted;
                            const statusColor = bu.current_status ? SYSTEM_STATUS_COLORS[bu.current_status] : 'bg-gray-600';

                            return (
                                <div key={bu.bu_id} onClick={(e) => { e.stopPropagation(); handleSelect('bu', bu.bu_id) }} className={`transition-opacity duration-300 group relative ${isDimmed ? 'opacity-20' : 'opacity-100'}`} role="button">
                                    <Card className={`!p-4 h-full !border flex flex-col ${isSelected ? `border-blue-500 ring-2 ring-offset-2 ring-offset-gray-900 ring-blue-500` : `border-gray-800 hover:border-blue-500`}`}>
                                        <div className="flex justify-between items-start gap-2">
                                            <h3 onMouseEnter={(e) => handleTooltip(e, buTooltipContent(bu))} onMouseLeave={() => setActiveTooltip({ content: null, targetRect: null })} className="font-bold text-lg text-blue-400 truncate">{bu.bu_name}</h3>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <span className="text-xs text-gray-400 whitespace-nowrap">{bu.bu_type}</span>
                                                <span title={`Status: ${bu.current_status}`} className={`w-3 h-3 rounded-full ${statusColor} flex-shrink-0`} />
                                            </div>
                                        </div>
                                        {bu.in_form_of && <p className="text-center text-gray-300 italic my-2 text-sm">{bu.in_form_of}</p>}
                                        <div className="my-2 border-t border-gray-700/50" />
                                        <div className="flex justify-between items-start gap-4 text-sm mt-auto">
                                            <p className="text-gray-300 flex-1" title={bu.offering_description}>{bu.offering_description}</p>
                                            <p className="font-medium text-gray-300 flex-shrink-0 whitespace-nowrap">{bu.order_volume_range}</p>
                                        </div>
                                    </Card>
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={(e) => { e.stopPropagation(); handleOpenModal('bu', bu); }} className="p-1 text-gray-400 hover:text-white bg-gray-950/70 rounded-md"><EditIcon className="w-4 h-4" /></button></div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* --- BOTTOM SECTION --- */}
                <div className="flex gap-6 flex-1 min-h-0 items-start">
                    {/* --- BOTTOM LEFT: HOW & WHO --- */}
                    <div className="flex-1 flex flex-col min-h-0">
                        <section className="flex flex-col min-h-0">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex-1"></div>
                                <div className="text-center">
                                    <h2 className="text-xl font-semibold text-white">How & Who</h2>
                                    <p className="text-sm text-gray-400 -mt-1">Flywheels & Segments</p>
                                </div>
                                <div className="flex-1 flex justify-end">
                                    <Button onClick={() => handleOpenModal('flywheel')} variant="secondary" className="!px-3 !py-1.5"><PlusIcon className="w-4 h-4 mr-2" />Add Flywheel</Button>
                                </div>
                            </div>
                            <div className="flex gap-4 overflow-x-auto pb-4 -m-2 px-2">
                                {data.systemFlywheels.map(flywheel => {
                                    const relatedSegments = data.systemSegments.filter(s => splitAndTrim(flywheel.serves_segments).includes(s.segment_id));
                                    const isSelected = selection?.type === 'flywheel' && selection.id === flywheel.flywheel_id;
                                    const isHighlighted = highlightedIds.flywheel.has(flywheel.flywheel_id);
                                    const isDimmed = !!selection && !isHighlighted;
                                    return (
                                        <div key={flywheel.flywheel_id} className={`bg-gray-900 border rounded-lg flex flex-col transition-opacity duration-300 w-[28rem] flex-shrink-0 ${isDimmed ? 'opacity-20' : ''} ${isSelected ? 'border-accent-purple' : 'border-gray-800'}`}>
                                            <div onClick={(e) => { e.stopPropagation(); handleSelect('flywheel', flywheel.flywheel_id) }} className="p-4 bg-gray-800/40 rounded-t-lg border-b border-gray-800 cursor-pointer group relative">
                                                <h3 onMouseEnter={(e) => handleTooltip(e, flywheelTooltipContent(flywheel))} onMouseLeave={() => setActiveTooltip({ content: null, targetRect: null })} className="font-bold text-lg text-accent-purple">{flywheel.flywheel_name}</h3>
                                                <p className="text-sm text-gray-400 italic mt-1">{flywheel.customer_struggle}</p>
                                                <div className="my-3 border-t border-gray-700/50" />
                                                <div className="grid grid-cols-2 gap-4 text-xs">
                                                    <div><p className="font-semibold text-gray-300 uppercase tracking-wider">Trigger</p><p className="text-gray-400 mt-1">{flywheel.jtbd_trigger_moment}</p></div>
                                                    <div><p className="font-semibold text-gray-300 uppercase tracking-wider">Motion</p><p className="text-gray-400 mt-1">{flywheel.motion_sequence}</p></div>
                                                </div>
                                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={(e) => { e.stopPropagation(); handleOpenModal('flywheel', flywheel); }} className="p-1 text-gray-400 hover:text-white bg-gray-950/70 rounded-md"><EditIcon className="w-4 h-4" /></button></div>
                                            </div>
                                            <div className="p-2 flex flex-col gap-2 overflow-y-auto flex-1">
                                                {relatedSegments.map(segment => {
                                                    const segIsSelected = selection?.type === 'segment' && selection.id === segment.segment_id;
                                                    const segIsHighlighted = highlightedIds.segment.has(segment.segment_id);
                                                    const segIsDimmed = !!selection && !segIsHighlighted;
                                                    const hasCriticalDecision = segment.strategic_notes?.toUpperCase().includes('CRITICAL DECISION');
                                                    const priority = (segment.priority_rank as Priority) || 'Medium';
                                                    const relatedPlatforms = data.systemPlatforms.filter(p => splitAndTrim(segment.Platforms).includes(p.platform_id));
                                                    const isExpanded = expandedSegmentId === segment.segment_id;

                                                    return (
                                                        <div key={segment.segment_id} onClick={(e) => { e.stopPropagation(); handleSelect('segment', segment.segment_id); }} className={`transition-opacity duration-300 group relative ${segIsDimmed ? 'opacity-20' : ''}`} role="button">
                                                            <Card className={`!p-3 !border flex flex-col ${segIsSelected ? `border-accent-purple` : `border-gray-700 hover:border-accent-purple/50`}`}>
                                                                <div>
                                                                    <div className="space-y-2 text-xs">
                                                                        <div className="flex justify-between items-start gap-2">
                                                                            <h4 onMouseEnter={(e) => handleTooltip(e, segmentTooltipContent(segment))} onMouseLeave={() => setActiveTooltip({ content: null, targetRect: null })} className="font-semibold text-white flex items-center gap-2 text-base"><TargetIcon className="w-4 h-4 text-gray-400" />{segment.segment_name}</h4>
                                                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                                                {hasCriticalDecision && <span title="Critical decision required"><ExclamationTriangleIcon className="w-4 h-4 text-yellow-400" /></span>}
                                                                                <Badge text={segment.priority_rank || 'N/A'} colorClass={PRIORITY_COLORS[priority]} size="sm" />
                                                                            </div>
                                                                        </div>
                                                                        {segment.Promise && <p className="text-sm text-center text-gray-300 italic">"{segment.Promise}"</p>}
                                                                    </div>
                                                                    
                                                                    <div className="my-2 border-t border-gray-700/50" />

                                                                    <div className="space-y-2 text-xs">
                                                                        <div className="grid grid-cols-2 gap-x-3">{segment.Positioning && <div><p className="font-semibold text-gray-400">Positioning:</p><p className="text-gray-300">{segment.Positioning}</p></div>}{segment.expression && <div><p className="font-semibold text-gray-400">Expression:</p><p className="text-gray-300">{segment.expression}</p></div>}</div>
                                                                    </div>
                                                                    
                                                                    {isExpanded && (
                                                                        <div className="mt-3 pt-3 border-t border-gray-700/50 space-y-3 text-xs">
                                                                            <div className="grid grid-cols-2 gap-x-3">
                                                                                {segment.For && <div><p className="font-semibold text-gray-400">For:</p><p className="text-gray-300">{segment.For}</p></div>}
                                                                                {segment.Against && <div><p className="font-semibold text-gray-400">Against:</p><p className="text-gray-300">{segment.Against}</p></div>}
                                                                            </div>
                                                                            {segment.vision && <div><p className="font-semibold text-gray-400">Vision:</p><p className="text-gray-300">{segment.vision}</p></div>}
                                                                            {segment.mission && <div><p className="font-semibold text-gray-400">Mission:</p><p className="text-gray-300">{segment.mission}</p></div>}
                                                                            <div className="grid grid-cols-2 gap-x-3">
                                                                                {segment.old_world_pain && <div><p className="font-semibold text-gray-400">Old Pain:</p><p className="text-gray-300">{segment.old_world_pain}</p></div>}
                                                                                {segment.new_world_gain && <div><p className="font-semibold text-gray-400">New Gain:</p><p className="text-gray-300">{segment.new_world_gain}</p></div>}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                
                                                                {relatedPlatforms.length > 0 && (
                                                                    <div className="mt-2 pt-2 border-t border-gray-700/50 flex items-center gap-2.5">
                                                                        {relatedPlatforms.map(platform => (
                                                                            <a 
                                                                                key={platform.platform_id} 
                                                                                href={platform.platform_link || '#'} 
                                                                                target="_blank" 
                                                                                rel="noopener noreferrer" 
                                                                                onMouseEnter={(e) => handleTooltip(e, platform.platform_name)}
                                                                                onMouseLeave={() => setActiveTooltip({ content: null, targetRect: null })}
                                                                                className="block" 
                                                                                onClick={(e) => e.stopPropagation()}
                                                                            >
                                                                                {platform.platform_icon && <img src={platform.platform_icon} alt={platform.platform_name} className="w-5 h-5 rounded-sm object-contain hover:scale-110 transition-transform" />}
                                                                            </a>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <button onClick={(e) => { e.stopPropagation(); handleOpenModal('segment', segment); }} className="p-1 text-gray-400 hover:text-white bg-gray-950/70 rounded-md"><EditIcon className="w-4 h-4" /></button>
                                                                </div>
                                                            </Card>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    </div>

                    {/* --- BOTTOM RIGHT: HUBS & TEAMS --- */}
                    <div className="w-[40rem] flex-shrink-0 flex flex-col min-h-0">
                        <section className="flex flex-col min-h-0">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex-1"></div>
                                <div className="text-center">
                                    <h2 className="text-xl font-semibold text-white">Hubs & Teams</h2>
                                </div>
                                <div className="flex-1 flex justify-end">
                                    <Button onClick={() => handleOpenModal('hub')} variant="secondary" className="!px-3 !py-1.5"><PlusIcon className="w-4 h-4 mr-2" />Add Hub</Button>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 auto-rows-min overflow-y-auto p-1">
                                {sortedHubs.map(hub => {
                                    const relatedPeople = data.systemPeople.filter(p => p.primary_hub === hub.hub_id);
                                    const isSelected = selection?.type === 'hub' && selection.id === hub.hub_id;
                                    const isHighlighted = highlightedIds.hub.has(hub.hub_id);
                                    const isDimmed = !!selection && !isHighlighted;
                                    return (
                                        <div key={hub.hub_id} className={`bg-gray-900 border rounded-lg flex flex-col transition-opacity duration-300 ${isDimmed ? 'opacity-20' : ''} ${isSelected ? 'border-accent-green' : 'border-gray-800'}`}>
                                            {/* Hub Header */}
                                            <div onClick={(e) => { e.stopPropagation(); handleSelect('hub', hub.hub_id) }} className="p-4 bg-gray-800/40 rounded-t-lg border-b border-gray-800 cursor-pointer group relative">
                                                <h3 onMouseEnter={(e) => handleTooltip(e, hubTooltipContent(hub))} onMouseLeave={() => setActiveTooltip({ content: null, targetRect: null })} className="font-bold text-lg text-accent-green flex items-center gap-2"><Squares2X2Icon className="w-5 h-5"/>{hub.hub_name}</h3>
                                                <p className="text-sm text-gray-400 italic mt-1">{hub.hub_type}</p>
                                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={(e) => { e.stopPropagation(); handleOpenModal('hub', hub); }} className="p-1 text-gray-400 hover:text-white bg-gray-950/70 rounded-md"><EditIcon className="w-4 h-4" /></button>
                                                </div>
                                            </div>
                                            {/* People Grid */}
                                            <div className="p-2 grid grid-cols-2 gap-1 flex-1 items-start content-start [&>:last-child:nth-child(odd)]:col-span-2">
                                                {relatedPeople.map(person => {
                                                    const personIsSelected = selection?.type === 'person' && selection.id === person.person_id;
                                                    const personIsHighlighted = highlightedIds.person.has(person.person_id);
                                                    const personIsDimmed = !!selection && !personIsHighlighted;
                                                    return (
                                                        <div key={person.person_id} onClick={(e) => { e.stopPropagation(); handleSelect('person', person.person_id) }} className={`transition-opacity duration-300 group relative ${personIsDimmed ? 'opacity-20' : ''}`} role="button">
                                                            <Card className={`!p-2 !border ${personIsSelected ? 'border-accent-green' : 'border-gray-700 hover:border-accent-green/50'}`}>
                                                                <h4 className="font-semibold text-white text-sm truncate">{person.full_name}</h4>
                                                                <p className="text-xs text-gray-400 truncate">{person.role}</p>
                                                            </Card>
                                                            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button onClick={(e) => { e.stopPropagation(); handleOpenModal('person', person); }} className="p-1 text-gray-400 hover:text-white bg-gray-950/70 rounded-md"><EditIcon className="w-3 h-3" /></button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    </div>

                </div>
            </div>
            
            <DetailSidebar selection={selection} onClose={() => { setSelection(null); setExpandedSegmentId(null); }} onSelect={handleSelect} />

            {modalState.type === 'segment' && <SystemSegmentFormModal isOpen={modalState.isOpen} onClose={handleCloseModal} initialData={modalState.data} />}
            {modalState.type === 'flywheel' && <SystemFlywheelFormModal isOpen={modalState.isOpen} onClose={handleCloseModal} initialData={modalState.data} />}
            {modalState.type === 'bu' && <SystemBusinessUnitFormModal isOpen={modalState.isOpen} onClose={handleCloseModal} initialData={modalState.data} />}
            {modalState.type === 'channel' && <SystemChannelFormModal isOpen={modalState.isOpen} onClose={handleCloseModal} initialData={modalState.data} />}
            {modalState.type === 'hub' && <SystemHubFormModal isOpen={modalState.isOpen} onClose={handleCloseModal} initialData={modalState.data} />}
            {modalState.type === 'person' && <SystemPersonFormModal isOpen={modalState.isOpen} onClose={handleCloseModal} initialData={modalState.data} />}
        </div>
    );
};

export default FlywheelsMapPage;