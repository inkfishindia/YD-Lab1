import React, { useState, useMemo, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';

import { useData } from '../../contexts/DataContext';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import {
  BriefcaseIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  ClipboardCheckIcon,
  CurrencyDollarIcon,
  LightBulbIcon,
  MegaphoneIcon,
  SparklesIcon,
  UserGroupIcon,
  UsersIcon,
} from '../../components/Icons';
import { API_KEY } from '../../api-keys';

// --- SUB-COMPONENTS ---

const StickyNote: React.FC<{ children: React.ReactNode; color: string; className?: string; }> = ({ children, color, className }) => (
  <div className={`p-3 rounded-md shadow ${color} ${className}`}>
    {children}
  </div>
);

interface CanvasBlockProps {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}

const CanvasBlock: React.FC<CanvasBlockProps> = ({ title, icon: Icon, children, onClick, className = '' }) => (
  <div
    onClick={onClick}
    className={`bg-gray-900 border border-gray-800 rounded-xl flex flex-col cursor-pointer hover:border-blue-500 transition-all duration-200 ${className}`}
  >
    <div className="flex items-center gap-3 p-3 border-b border-gray-800 flex-shrink-0">
      <Icon className="w-5 h-5 text-gray-400" />
      <h2 className="text-base font-semibold text-white truncate">{title}</h2>
    </div>
    <div className="flex-grow p-3 space-y-3 overflow-y-auto">
      {children}
    </div>
  </div>
);

// --- MAIN COMPONENT ---

const BusinessModelCanvasPage: React.FC = () => {
    const {
        customerSegments,
        businessUnits,
        channels,
        people,
        hubs,
        partners,
        costStructure,
        revenueStreams,
        loading
    } = useData();

    const [modalData, setModalData] = useState<{ title: string; content: React.ReactNode } | null>(null);
    const [aiModalOpen, setAiModalOpen] = useState(false);
    const [analysis, setAnalysis] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    const canvasItems = useMemo(() => {
        if (loading) return null;

        const sortedSegments = [...customerSegments].sort((a, b) => (b.nineMonthRevenue || 0) - (a.nineMonthRevenue || 0));
        const totalRevenue = revenueStreams.reduce((sum, stream) => sum + (stream.nineMonthRevenue || 0), 0);

        return {
          keyPartners: {
            title: 'Key Partners',
            icon: UsersIcon,
            content: (
              <>
                {partners.filter(p => p.riskLevel?.includes('HIGH')).map(p => (
                   <StickyNote key={p.partnerId} color="bg-accent-orange/20 border border-accent-orange/50 text-amber-300">
                        <h4 className="font-bold">{p.partnerName} ({p.riskLevel})</h4>
                        <p className="text-xs">{p.notes}</p>
                    </StickyNote>
                ))}
                {partners.filter(p => !p.riskLevel?.includes('HIGH')).slice(0, 2).map(p => (
                    <StickyNote key={p.partnerId} color="bg-gray-800 border-gray-700">{p.partnerName}</StickyNote>
                ))}
              </>
            ),
          },
          keyActivities: {
            title: 'Key Activities',
            icon: ClipboardCheckIcon,
            content: (
                <>
                    {hubs.map(hub => (
                        <StickyNote key={hub.hubId} color="bg-gray-800 border-gray-700">
                            <h4 className="font-bold">{hub.hubName}</h4>
                            <p className="text-xs mt-1">{hub.keyActivities}</p>
                        </StickyNote>
                    ))}
                </>
            )
          },
          keyResources: {
            title: 'Key Resources',
            icon: BriefcaseIcon,
            content: (
                <>
                    <StickyNote color="bg-accent-purple/20 border border-accent-purple/50">{hubs.find(h => h.hubName?.includes("Production"))?.hubName || 'Production Facility'}</StickyNote>
                    <StickyNote color="bg-accent-purple/20 border border-accent-purple/50">Human Capital ({people.length}+ Team)</StickyNote>
                    <StickyNote color="bg-accent-purple/20 border border-accent-purple/50">{channels.length}+ Tech Platforms/Channels</StickyNote>
                    <StickyNote color="bg-accent-purple/20 border border-accent-purple/50">Multi-segment Business Model</StickyNote>
                </>
            )
          },
          valuePropositions: {
            title: 'Value Propositions',
            icon: LightBulbIcon,
            content: (
                <>
                    <StickyNote color="bg-accent-blue/20 border border-accent-blue/50 text-center">
                        <p className='font-bold text-blue-300'>"From design to doorstep in 2-6 days. Any quantity. Any product."</p>
                    </StickyNote>
                    <StickyNote color="bg-gray-800 border-gray-700">
                        <h4 className="font-bold">By Segment</h4>
                        <ul className="text-xs list-disc list-inside mt-1">
                            {businessUnits.slice(0,3).map(bu => {
                                const segmentName = customerSegments.find(s => s.segmentId === bu.primarySegments)?.segmentName || bu.primarySegments;
                                return <li key={bu.businessUnitId}><strong>{segmentName}:</strong> {bu.coreOffering}</li>
                            })}
                        </ul>
                    </StickyNote>
                </>
            )
          },
          customerRelationships: {
            title: 'Customer Relationships',
            icon: ChatBubbleOvalLeftEllipsisIcon,
            content: (
                <>
                    {businessUnits.map(bu => {
                        const segmentName = customerSegments.find(s => s.segmentId === bu.primarySegments)?.segmentName || bu.primarySegments;
                        const channel = channels.find(c => c.flywheelId === bu.flywheelId);
                        return (
                            <StickyNote key={bu.businessUnitId} color="bg-accent-pink/20 border border-accent-pink/50">
                                {channel?.motionType || 'N/A'} ({segmentName})
                            </StickyNote>
                        );
                    })}
                </>
            )
          },
          channels: {
            title: 'Channels',
            icon: MegaphoneIcon,
            content: (
                <>
                    {channels.slice(0, 4).map(c => (
                        <StickyNote key={c.channelId} color="bg-gray-800 border-gray-700">
                           <h4 className="font-bold">{c.channelName}</h4>
                           <p className="text-xs">{c.channelType} - {c.notes}</p>
                        </StickyNote>
                    ))}
                </>
            ),
          },
          customerSegments: {
            title: 'Customer Segments',
            icon: UserGroupIcon,
            content: (
                <>
                    {sortedSegments.map(seg => {
                        const status = seg.status || '';
                        let colorClass = 'bg-gray-800/50 text-gray-300';
                        if(status.includes('CASH COW')) colorClass = 'bg-green-800/50 text-green-300';
                        if(status.includes('AT RISK')) colorClass = 'bg-yellow-800/50 text-yellow-300';
                        if(status.includes('SCALE-READY')) colorClass = 'bg-purple-800/50 text-purple-300';
                        if(status.includes('EMERGING')) colorClass = 'bg-blue-800/50 text-blue-300';
                        return (
                             <StickyNote key={seg.segmentId} color="bg-gray-800 border-gray-700" className='!p-2'>
                               <div className='flex justify-between items-center'>
                                <p className="truncate">{seg.segmentName}</p>
                                <Badge text={status} colorClass={colorClass} size='sm' />
                               </div>
                            </StickyNote>
                        );
                    })}
                </>
            )
          },
          costStructure: {
            title: 'Cost Structure',
            icon: CurrencyDollarIcon,
            content: (
                <>
                    <StickyNote color="bg-accent-teal/20 border border-accent-teal/50">
                        <h4 className="font-bold text-accent-teal">Fixed: ~₹{costStructure.filter(c => c.costType === 'Fixed').reduce((s,c) => s + (c.monthlyAmount || 0), 0) / 100000}L/month</h4>
                    </StickyNote>
                    <StickyNote color="bg-accent-teal/20 border border-accent-teal/50">
                        <h4 className="font-bold text-accent-teal">Variable: ~{revenueStreams[0]?.grossMargin || 'N/A'}</h4>
                        <p className="text-xs">Procurement, Production, Shipping</p>
                    </StickyNote>
                    <StickyNote color="bg-red-900/40 border border-red-500/50 text-red-300">
                        <h4 className="font-bold">Unmeasured: CAC, LTV</h4>
                    </StickyNote>
                </>
            ),
          },
          revenueStreams: {
            title: 'Revenue Streams',
            icon: CurrencyDollarIcon,
            content: (
                <>
                    {businessUnits.map(bu => {
                        const buRevenue = revenueStreams
                            .filter(rs => rs.businessUnitId === bu.businessUnitId)
                            .reduce((sum, rs) => sum + (rs.nineMonthRevenue || 0), 0);
                        const percent = totalRevenue > 0 ? (buRevenue / totalRevenue) * 100 : 0;
                        if (percent < 1) return null;
                        return (
                            <StickyNote key={bu.businessUnitId} color="bg-accent-green/20 border border-accent-green/50">
                                <h4 className="font-bold text-accent-green">{bu.businessUnitName} ({percent.toFixed(0)}%)</h4>
                                <p className="text-xs">{bu.pricingModel}</p>
                            </StickyNote>
                        );
                    })}
                </>
            ),
          },
        };
    }, [loading, customerSegments, businessUnits, channels, people, hubs, partners, costStructure, revenueStreams]);

    const generateMarkdownForAI = useCallback(() => {
        if (!canvasItems) return "Data is still loading.";

        const getSegmentName = (id: string | undefined) => customerSegments.find(s => s.segmentId === id)?.segmentName || id || 'N/A';
        
        return `
# Business Model Canvas Analysis

## Customer Segments
${customerSegments.map(s => `- **${s.segmentName}**: ${s.customerProfile}, Revenue Share: ${s.percentRevenue}, Status: ${s.status}`).join('\n')}

## Value Propositions
- Universal: "From design to doorstep in 2-6 days. Any quantity. Any product."
${businessUnits.map(bu => `- **For ${getSegmentName(bu.primarySegments)}**: ${bu.coreOffering}`).join('\n')}

## Customer Relationships
${businessUnits.map(bu => {
    const channel = channels.find(c => c.flywheelId === bu.flywheelId);
    return `- **${getSegmentName(bu.primarySegments)}**: ${channel?.motionType || 'N/A'}`;
}).join('\n')}

## Channels
${channels.map(c => `- **${c.channelName}**: Type: ${c.channelType}, Focus: ${c.motionType}`).join('\n')}

## Revenue Streams
${businessUnits.map(bu => `- **${bu.businessUnitName}**: Pricing model is ${bu.pricingModel}`).join('\n')}
- Total 9-Month Revenue: ${revenueStreams.reduce((s,r) => s + (r.nineMonthRevenue || 0), 0)}

## Key Activities
${hubs.map(h => `- **${h.hubName}**: ${h.keyActivities}`).join('\n')}

## Key Resources
- Production Facility: ${hubs.find(h => h.hubName?.includes("Production"))?.hubName || 'N/A'}
- Human Capital: ${people.length}+ Team Members
- Tech & Channels: ${channels.length}+ Platforms/Channels
- Multi-segment Business Model

## Key Partners
${partners.map(p => `- **${p.partnerName}**: Type: ${p.partnerType}, Risk: ${p.riskLevel}`).join('\n')}

## Cost Structure
${costStructure.map(c => `- **${c.costCategory} (${c.costType})**: ~₹${c.monthlyAmount}/month`).join('\n')}
- CRITICAL: CAC and LTV are not tracked.
`;
    }, [canvasItems, customerSegments, businessUnits, channels, hubs, people, partners, costStructure, revenueStreams]);

    const handleGenerateAnalysis = async () => {
        setIsLoading(true);
        setError('');
        setAnalysis('');
        setAiModalOpen(true);
        try {
            const ai = new GoogleGenAI({ apiKey: API_KEY });
            const prompt = `Based on the following Business Model Canvas data, provide a concise, actionable strategic analysis in markdown format. Focus on the 3 most critical risks and the 3 biggest opportunities. Use bullet points and bold formatting.

${generateMarkdownForAI()}`;

            const result = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            setAnalysis(result.text);
        } catch (e) {
            console.error('Error generating analysis:', e);
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            setError(`Failed to get response: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    const openModal = (title: string, content: React.ReactNode) => {
        setModalData({ title, content });
    }

    if(loading || !canvasItems) {
        return <div className="flex items-center justify-center h-full"><div className="text-white animate-pulse">Loading Canvas Data...</div></div>
    }

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <h1 className="text-2xl font-bold text-white">Business Model Canvas</h1>
                <Button onClick={handleGenerateAnalysis} disabled={isLoading}>
                    <SparklesIcon className="w-5 h-5 mr-2" />
                    {isLoading ? 'Analyzing...' : 'Analyze Canvas with AI'}
                </Button>
            </div>

            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 min-h-0">
                {/* Col 1 */}
                <div className="flex flex-col gap-4">
                    <CanvasBlock title="Key Partners" icon={UsersIcon} onClick={() => openModal('Key Partners', canvasItems.keyPartners.content)}>
                        {canvasItems.keyPartners.content}
                    </CanvasBlock>
                    <CanvasBlock title="Cost Structure" icon={CurrencyDollarIcon} onClick={() => openModal('Cost Structure', canvasItems.costStructure.content)}>
                        {canvasItems.costStructure.content}
                    </CanvasBlock>
                </div>
                {/* Col 2 */}
                <div className="flex flex-col gap-4">
                    <CanvasBlock title="Key Activities" icon={ClipboardCheckIcon} onClick={() => openModal('Key Activities', canvasItems.keyActivities.content)}>
                        {canvasItems.keyActivities.content}
                    </CanvasBlock>
                    <CanvasBlock title="Key Resources" icon={BriefcaseIcon} onClick={() => openModal('Key Resources', canvasItems.keyResources.content)}>
                        {canvasItems.keyResources.content}
                    </CanvasBlock>
                </div>
                {/* Col 3 */}
                <div className="flex flex-col">
                    <CanvasBlock className="flex-grow" title="Value Propositions" icon={LightBulbIcon} onClick={() => openModal('Value Propositions', canvasItems.valuePropositions.content)}>
                        {canvasItems.valuePropositions.content}
                    </CanvasBlock>
                </div>
                {/* Col 4 */}
                <div className="flex flex-col gap-4">
                    <CanvasBlock title="Customer Relationships" icon={ChatBubbleOvalLeftEllipsisIcon} onClick={() => openModal('Customer Relationships', canvasItems.customerRelationships.content)}>
                        {canvasItems.customerRelationships.content}
                    </CanvasBlock>
                     <CanvasBlock title="Channels" icon={MegaphoneIcon} onClick={() => openModal('Channels', canvasItems.channels.content)}>
                        {canvasItems.channels.content}
                    </CanvasBlock>
                </div>
                {/* Col 5 */}
                <div className="flex flex-col gap-4">
                    <CanvasBlock title="Customer Segments" icon={UserGroupIcon} onClick={() => openModal('Customer Segments', canvasItems.customerSegments.content)}>
                        {canvasItems.customerSegments.content}
                    </CanvasBlock>
                    <CanvasBlock title="Revenue Streams" icon={CurrencyDollarIcon} onClick={() => openModal('Revenue Streams', canvasItems.revenueStreams.content)}>
                        {canvasItems.revenueStreams.content}
                    </CanvasBlock>
                </div>
            </div>

            {/* Content Modal */}
            <Modal isOpen={!!modalData} onClose={() => setModalData(null)} title={modalData?.title || ''}>
                <div className="text-gray-300 space-y-4 text-sm prose prose-sm prose-invert max-w-none">
                    {modalData?.content}
                </div>
            </Modal>
            
            {/* AI Analysis Modal */}
            <Modal isOpen={aiModalOpen} onClose={() => setAiModalOpen(false)} title="AI Strategic Analysis">
                <div className="text-sm">
                    {isLoading && <div className="text-gray-400 animate-pulse">Generating insights... This may take a moment.</div>}
                    {error && <div className="text-red-400">Error: {error}</div>}
                    {analysis && <div className="prose prose-sm prose-invert whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: analysis.replace(/\n/g, '<br />').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />}
                </div>
            </Modal>
        </div>
    );
};

export default BusinessModelCanvasPage;
