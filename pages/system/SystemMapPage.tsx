





import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { 
    CurrencyDollarIcon, 
    ExclamationTriangleIcon, 
    PresentationChartLineIcon, 
    ScaleIcon, 
    CloseIcon,
} from '../../components/Icons';
import type { SystemHub } from '../../types';
import Panel from '../../components/kit/Panel';
import KPI from '../../components/kit/KPI';
// FIX: Import 'useData' hook from DataContext to resolve 'Cannot find name useData' error.
import { useData } from '../../contexts/DataContext';

// Centralized entity type definition imported from types.ts
import type { SystemEntityType } from '../../types';

// Helper to parse currency strings
const parseCurrency = (val: any): number => {
    if (typeof val === 'number') return val;
    if (typeof val !== 'string' || !val) return 0;
    const num = parseFloat(val.replace(/[^0-9.-]+/g, ""));
    return isNaN(num) ? 0 : num;
};

// Trend Sidebar Component
interface TrendSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
}

const TrendSidebar: React.FC<TrendSidebarProps> = ({ isOpen, onClose, title }) => {
    // Mock data for trend chart
    const mockTrendData = [
        { name: 'Mar', value: 4000 },
        { name: 'Apr', value: 3000 },
        { name: 'May', value: 2000 },
        { name: 'Jun', value: 2780 },
        { name: 'Jul', value: 1890 },
        { name: 'Aug', value: 2390 },
    ];
    return (
        <div className={`fixed top-16 right-0 h-[calc(100%-4rem)] bg-gray-950 border-l border-gray-800 shadow-2xl z-40 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`} style={{ width: '400px' }}>
             <div className="flex flex-col h-full">
                <div className="p-4 border-b border-gray-800 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-lg font-semibold text-white">{title} Trend</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><CloseIcon className="w-6 h-6" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                    <p className="text-sm text-gray-400 mb-4">Showing mock trend data for the last 6 months.</p>
                    <div style={{ width: '100%', height: 250 }}>
                        <ResponsiveContainer>
                             <LineChart data={mockTrendData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                                <YAxis stroke="#9CA3AF" fontSize={12} />
                                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }} />
                                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    {/* Additional details could go here */}
                </div>
            </div>
        </div>
    );
}

const SystemMapPage: React.FC = () => {
    const { systemHubs, systemBusinessUnits, systemSegments } = useData();
    const [sidebar, setSidebar] = useState<{ isOpen: boolean; title: string }>({ isOpen: false, title: '' });

    // --- Metric Calculations ---
    const businessHealthData = useMemo(() => {
        if (!systemHubs.length || !systemBusinessUnits.length || !systemSegments.length) {
            return {
                monthlyBurn: { value: 0, isHigh: false },
                capacityCrisis: [],
                unitEconomics: { count: 0 },
                revenueVsTarget: { percent: 0 }
            };
        }
        // 1. Monthly Burn
        const totalMonthlyBurn = systemHubs.reduce((sum, hub) => sum + (hub.budget_monthly_inr || 0), 0);
        const total9MoRevenue = systemBusinessUnits.reduce((sum, bu) => sum + (bu['9mo_actual_revenue_inr'] || 0), 0);
        const avgMonthlyRevenue = total9MoRevenue > 0 ? total9MoRevenue / 9 : 0;
        const isBurnHigh = avgMonthlyRevenue > 0 && totalMonthlyBurn > avgMonthlyRevenue;
        
        // 2. Capacity Crisis
        const highUtilizationHubs: SystemHub[] = systemHubs
            .filter(hub => (hub.current_utilization_pct || 0) >= 75)
            .sort((a, b) => (b.current_utilization_pct || 0) - (a.current_utilization_pct || 0))
            .slice(0, 3);
            
        // 3. Unit Economics
        const segmentCacMap = new Map<string, number>();
        systemSegments.forEach(seg => {
            if (seg.validated_cac) segmentCacMap.set(seg.segment_id, parseCurrency(seg.validated_cac));
        });
        const negativeUnitEconomicsBUs = systemBusinessUnits.filter(bu => {
// FIX: Corrected property access from 'serves_segment' to 'serves_segments_ids' to match the type.
            const segmentId = bu.serves_segments_ids?.[0];
            if (segmentId) {
                const aov = bu.validated_aov || 0;
                const cac = segmentCacMap.get(segmentId) || 0;
                return aov > 0 && cac > 0 && (aov - cac < 0);
            }
            return false;
        });
        
        // 4. Revenue vs Target
        const total9MoActual = systemBusinessUnits.reduce((sum, bu) => sum + (bu['9mo_actual_revenue_inr'] || 0), 0);
        const annualizedActual = total9MoRevenue > 0 ? (total9MoActual / 9) * 12 : 0;
        const totalAnnualTarget = systemBusinessUnits.reduce((sum, bu) => sum + (bu.annual_revenue_target_inr || 0), 0);
        const percentToGoal = totalAnnualTarget > 0 ? (annualizedActual / totalAnnualTarget) * 100 : 0;
        
        return {
            monthlyBurn: { value: totalMonthlyBurn, isHigh: isBurnHigh },
            capacityCrisis: highUtilizationHubs,
            unitEconomics: { count: negativeUnitEconomicsBUs.length },
            revenueVsTarget: { percent: percentToGoal }
        };
    }, [systemHubs, systemBusinessUnits, systemSegments]);

    const openSidebar = (title: string) => {
        setSidebar({ isOpen: true, title });
    };

    const formattedMonthlyBurn = businessHealthData.monthlyBurn.value >= 100000 
        ? `${(businessHealthData.monthlyBurn.value / 100000).toFixed(1)}L` 
        : `₹${(businessHealthData.monthlyBurn.value / 1000).toFixed(1)}k`;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">Business Health</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPI 
                    title="Monthly Burn" 
                    value={formattedMonthlyBurn}
                    alertLevel={businessHealthData.monthlyBurn.isHigh ? 'danger' : 'none'}
                    onClick={() => openSidebar('Monthly Burn')}
                />
                <KPI 
                    title="Capacity Crisis" 
                    value={`${businessHealthData.capacityCrisis.length}`}
                    unit="Hubs"
                    alertLevel={businessHealthData.capacityCrisis.some(h=>(h.current_utilization_pct || 0) > 90) ? 'danger' : businessHealthData.capacityCrisis.length > 0 ? 'warning' : 'none'}
                    onClick={() => openSidebar('Capacity Crisis')}
                >
                    <div className="text-xs text-gray-400 space-y-1">
                        {businessHealthData.capacityCrisis.map(hub => (
                            <div key={hub.hub_id} className="flex justify-between items-center">
                                <span>{hub.hub_name}</span>
                                <span className={`font-semibold ${hub.current_utilization_pct! > 90 ? 'text-red-400' : 'text-yellow-400'}`}>{hub.current_utilization_pct}%</span>
                            </div>
                        ))}
                    </div>
                </KPI>
                 <KPI 
                    title="Unit Economics" 
                    value={`${businessHealthData.unitEconomics.count}`} 
                    unit="BUs Negative"
                    alertLevel={businessHealthData.unitEconomics.count > 0 ? 'danger' : 'none'}
                    onClick={() => openSidebar('Unit Economics')}
                />
                <KPI 
                    title="Revenue vs Target" 
                    value={`${businessHealthData.revenueVsTarget.percent.toFixed(1)}`} 
                    unit="%"
                    alertLevel={businessHealthData.revenueVsTarget.percent < 75 ? 'warning' : 'none'}
                    onClick={() => openSidebar('Revenue vs Target')}
                />
            </div>

            {/* Placeholder for other sections */}
            <div className="pt-8">
                <Panel title="Further Analysis">
                     <div className="h-48 flex items-center justify-center text-center text-gray-500 border border-dashed border-gray-700 rounded-lg">
                        More sections will be added here based on your briefs.
                    </div>
                </Panel>
            </div>

            <TrendSidebar isOpen={sidebar.isOpen} onClose={() => setSidebar({isOpen: false, title: ''})} title={sidebar.title} />
        </div>
    );
};

export default SystemMapPage;
