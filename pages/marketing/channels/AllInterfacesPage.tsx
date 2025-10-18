import React, { useState, useMemo, useRef, useLayoutEffect } from 'react';
import { useData } from '../../../contexts/DataContext';
import type { Interface, Channel } from '../../../types';
import InterfaceFormModal from '../../../components/forms/InterfaceFormModal';

const TooltipPortal: React.FC<{ activeTooltip: { content: React.ReactNode; targetRect: DOMRect | null } }> = ({ activeTooltip }) => {
    const tooltipRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ top: -9999, left: -9999, opacity: 0 });

    useLayoutEffect(() => {
        if (activeTooltip.targetRect && tooltipRef.current) {
            const target = activeTooltip.targetRect;
            const tip = tooltipRef.current.getBoundingClientRect();
            
            let top = target.top - tip.height - 8; // Default above
            let left = target.left + (target.width / 2) - (tip.width / 2);

            if (top < 8) top = target.bottom + 8; // Move below if no space above

            if (left < 8) left = 8;
            else if (left + tip.width > window.innerWidth) left = window.innerWidth - tip.width - 8;

            setPosition({ top, left, opacity: 1 });
        } else {
            setPosition(pos => ({ ...pos, opacity: 0 }));
        }
    }, [activeTooltip]);

    if (!activeTooltip.content) return null;

    return (
        <div 
            ref={tooltipRef}
            style={{ top: position.top, left: position.left, opacity: position.opacity }}
            className="fixed z-50 bg-gray-950 p-3 border border-gray-700 rounded-lg shadow-xl w-72 transition-opacity duration-200"
        >
            {activeTooltip.content}
        </div>
    );
};


const AllInterfacesPage: React.FC = () => {
  const { channels, interfaces, people } = useData();
  const [activeTooltip, setActiveTooltip] = useState<{ content: React.ReactNode; targetRect: DOMRect | null }>({ content: null, targetRect: null });
  
  const peopleMap = useMemo(() => new Map(people.map(p => [p.user_id, p.full_name])), [people]);
  const interfaceMap = useMemo(() => new Map(interfaces.map(i => [i.interface_id, i.interface_name])), [interfaces]);
  const getPersonName = (id: string) => peopleMap.get(id) || 'N/A';
  
  const handleInterfaceTooltip = (e: React.MouseEvent<HTMLDivElement>, item: Interface) => {
      const content = (
          <div className="text-xs space-y-2 text-left">
              <div className="grid grid-cols-3 gap-2 items-start">
                  <span className="text-gray-400 col-span-1">Status</span>
                  <span className="font-medium text-white col-span-2">{item.interface_status}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 items-start">
                  <span className="text-gray-400 col-span-1">Notes</span>
                  <span className="font-medium text-white col-span-2">{item.notes || 'N/A'}</span>
              </div>
          </div>
      );
      setActiveTooltip({
          content,
          targetRect: e.currentTarget.getBoundingClientRect(),
      });
  };

  const handleChannelTooltip = (e: React.MouseEvent<HTMLDivElement>, item: Channel) => {
      const interfaceIds = item.interfaces.split(',').map(s => s.trim()).filter(Boolean);
      const interfaceNames = interfaceIds.map(id => interfaceMap.get(id) || id);

      const content = (
          <div className="text-xs space-y-2 text-left">
              <div className="font-bold text-base text-white mb-2">{item.channel_name}</div>
              <div className="grid grid-cols-3 gap-2 items-start">
                  <span className="text-gray-400 col-span-1">Interfaces</span>
                  <span className="font-medium text-white col-span-2">
                      {interfaceNames.length > 0 ? interfaceNames.join(', ') : 'None assigned'}
                  </span>
              </div>
          </div>
      );
      setActiveTooltip({
          content,
          targetRect: e.currentTarget.getBoundingClientRect(),
      });
  };

  return (
    <div className="h-full flex flex-col">
        <TooltipPortal activeTooltip={activeTooltip} />
        <h1 className="text-2xl font-semibold text-white mb-4">Interface & Channel Board</h1>
        
        <div className="flex-1 flex gap-4 overflow-x-auto pb-4 -mx-8 px-8">
            {channels.map(channel => {
                const relatedInterfaces = interfaces.filter(i => i.channel_id === channel.channel_id);
                return (
                    <div key={channel.channel_id} className="w-[340px] flex-shrink-0 bg-gray-900 border border-gray-800 rounded-xl flex flex-col">
                        {/* Channel Header */}
                        <div 
                            className="p-4 border-b border-gray-800 cursor-pointer"
                            onMouseEnter={(e) => handleChannelTooltip(e, channel)}
                            onMouseLeave={() => setActiveTooltip({ content: null, targetRect: null })}
                        >
                            <h3 className="font-bold text-lg text-white">{channel.channel_name}</h3>
                            <div className="my-2 border-t border-gray-700"></div>
                            <div className="flex justify-between items-center text-xs text-gray-400">
                                <span>{channel.channel_type}</span>
                                <span className="font-medium text-right">{channel.focus}</span>
                            </div>
                        </div>

                        {/* Interface Cards */}
                        <div className="p-4 space-y-4 overflow-y-auto">
                            {relatedInterfaces.length > 0 ? relatedInterfaces.map(iface => (
                                <div
                                    key={iface.interface_id}
                                    onMouseEnter={(e) => handleInterfaceTooltip(e, iface)}
                                    onMouseLeave={() => setActiveTooltip({ content: null, targetRect: null })}
                                    className="bg-gray-800 border border-gray-700 rounded-lg p-3 cursor-pointer hover:border-accent-blue"
                                >
                                    <h4 className="font-bold text-base text-accent-blue">{iface.interface_name}</h4>
                                    <div className="flex justify-between items-center mt-1 text-xs text-gray-400">
                                        <p className="truncate w-1/2">{iface.interface_goal}</p>
                                        <p className="truncate w-1/2 text-right">{getPersonName(iface.interface_owner)}</p>
                                    </div>

                                    <div className="my-2 border-t border-gray-700"></div>

                                    <div className="text-xs space-y-1">
                                        <div className="flex justify-between gap-2">
                                            <span className="text-gray-400">Budget</span>
                                            <span className="font-medium text-white text-right">${iface.monthly_budget.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between gap-2">
                                            <span className="text-gray-400">Cost Model</span>
                                            <span className="font-medium text-white text-right">{iface.cost_model}</span>
                                        </div>
                                        <div className="flex justify-between gap-2">
                                            <span className="text-gray-400">Avg. CAC</span>
                                            <span className="font-medium text-white text-right">${iface.avg_cac.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between gap-2">
                                            <span className="text-gray-400">Conv. Rate</span>
                                            <span className="font-medium text-white text-right">{iface.avg_conversion_rate}%</span>
                                        </div>
                                    </div>
                                </div>
                            )) : <p className="text-sm text-gray-500 text-center p-4">No interfaces for this channel.</p>}
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
  );
};

export default AllInterfacesPage;