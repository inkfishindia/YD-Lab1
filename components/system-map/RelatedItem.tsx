import React from 'react';
import { TargetIcon, RocketLaunchIcon, BuildingStorefrontIcon, MegaphoneIcon, ComputerDesktopIcon, Squares2X2Icon, UserGroupIcon, QueueListIcon, CursorArrowRaysIcon } from '../Icons';
// FIX: Changed to type import as SystemEntityType is only used for type annotations.
import type { SystemEntityType } from '../../pages/system/SystemMapPage';

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

interface RelatedItemProps {
    type: SystemEntityType;
    name: string;
    detail?: string;
    onClick?: () => void;
}

const RelatedItem: React.FC<RelatedItemProps> = ({ type, name, detail, onClick }) => {
    const Icon = iconMap[type];
    const clickableClasses = onClick ? 'cursor-pointer hover:bg-gray-700 hover:border-blue-600' : '';

    return (
        <div onClick={onClick} className={`bg-gray-800/50 p-2 rounded-md flex items-center gap-3 border border-gray-700/50 ${clickableClasses} transition-colors`}>
            {Icon && <Icon className="w-5 h-5 text-gray-400 flex-shrink-0" />}
            <div className="flex-grow overflow-hidden">
                <p className="text-sm text-white truncate">{name}</p>
                {detail && <p className="text-xs text-gray-400 truncate">{detail}</p>}
            </div>
        </div>
    );
};

export default RelatedItem;