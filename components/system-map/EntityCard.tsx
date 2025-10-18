
import React from 'react';
import { EditIcon, TrashIcon } from '../Icons';
import { useData } from '../../contexts/DataContext';
import { SYSTEM_STATUS_COLORS } from '../../constants';

interface EntityCardProps {
    item: any;
    type: string;
    icon: React.ElementType;
    nameKey: string;
    detailKey: string;
    metricKey: string;
    metricPrefix?: string;
    isSelected: boolean;
    isDimmed: boolean;
    onSelect: () => void;
    onEdit: () => void;
    status?: string;
    tags?: string[];
}

const formatMetric = (value: any, prefix?: string) => {
    if (value === null || value === undefined || value === '') return 'N/A';
    const num = Number(value);
    if (isNaN(num)) return value;

    if (prefix === '₹') {
        if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
        if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
        if (num >= 1000) return `₹${(num / 1000).toFixed(1)}k`;
        return `₹${num.toLocaleString()}`;
    }
    if (prefix === '%') {
      if (num < 1) return `${(num * 100).toFixed(1)}%`; // Assumes values like 0.25 for 25%
      return `${num.toFixed(1)}%`; // Assumes values like 25 for 25%
    }
    
    return num.toLocaleString();
};

const EntityCard: React.FC<EntityCardProps> = ({ item, type, icon: Icon, nameKey, detailKey, metricKey, metricPrefix, isSelected, isDimmed, onSelect, onEdit, status, tags }) => {
    const { deleteSystemSegment, deleteSystemFlywheel, deleteSystemBusinessUnit, deleteSystemChannel, deleteSystemInterface, deleteSystemHub, deleteSystemPerson, deleteSystemStage, deleteSystemTouchpoint } = useData();

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if(window.confirm(`Are you sure you want to delete this ${type}?`)) {
            switch(type) {
                case 'segment': deleteSystemSegment(item.segment_id); break;
                case 'flywheel': deleteSystemFlywheel(item.flywheel_id); break;
                case 'bu': deleteSystemBusinessUnit(item.bu_id); break;
                case 'channel': deleteSystemChannel(item.channel_id); break;
                case 'interface': deleteSystemInterface(item.interface_id); break;
                case 'hub': deleteSystemHub(item.hub_id); break;
                case 'person': deleteSystemPerson(item.person_id); break;
                case 'stage': deleteSystemStage(item.stage_id); break;
                case 'touchpoint': deleteSystemTouchpoint(item.touchpoint_id); break;
            }
        }
    };
    
    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        onEdit();
    };

    const name = item[nameKey] || 'Unnamed';
    const detail = item[detailKey] || '';
    const metric = formatMetric(item[metricKey], metricPrefix);
    const statusColor = status ? SYSTEM_STATUS_COLORS[status] : undefined;

    return (
        <div
            onClick={onSelect}
            className={`group p-3 rounded-lg cursor-pointer transition-all duration-300 relative border ${
                isDimmed ? 'opacity-30 filter grayscale hover:opacity-100 hover:filter-none' : 'opacity-100'
            } ${
                isSelected ? 'bg-blue-900/50 border-blue-500' : 'bg-gray-800 hover:bg-gray-700 border-gray-700'
            }`}
        >
            {statusColor && (
                <div 
                    title={`Status: ${status}`}
                    className={`absolute top-2.5 right-2.5 w-3 h-3 rounded-full ${statusColor} ring-2 ring-gray-900`} 
                />
            )}
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 overflow-hidden">
                    <Icon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="overflow-hidden">
                        <p className="font-medium text-white leading-tight pr-4 truncate" title={name}>{name}</p>
                        {detail && <p className="text-xs text-gray-400 mt-0.5 truncate" title={detail}>{detail}</p>}
                    </div>
                </div>
                <p className="text-lg font-bold text-white whitespace-nowrap pl-2">{metric}</p>
            </div>

            {tags && tags.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-700/50">
                    <div className="flex flex-wrap gap-1">
                        {tags.map(tag => (
                            <span key={tag} className="text-[10px] bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <div className="absolute top-2 right-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={handleEdit} className="p-1 text-blue-400 hover:text-blue-300 bg-gray-900/50 rounded"><EditIcon className="w-4 h-4" /></button>
                <button onClick={handleDelete} className="p-1 text-red-400 hover:text-red-300 bg-gray-900/50 rounded"><TrashIcon className="w-4 h-4" /></button>
            </div>
        </div>
    );
};

export default EntityCard;
