import React from 'react';

import {
  ExclamationTriangleIcon,
} from '../Icons';

interface KPIProps {
    title: string;
    value: string;
    unit?: string;
    alertLevel?: 'none' | 'warning' | 'danger';
    onClick?: () => void;
    children?: React.ReactNode;
}

const KPI: React.FC<KPIProps> = ({ title, value, unit, alertLevel = 'none', onClick, children }) => {
    const alertClasses = {
        none: 'border-gray-700',
        warning: 'border-yellow-500',
        danger: 'border-red-500',
    };
    
    const alertIcon = {
        warning: <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />,
        danger: <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />,
        none: null,
    };

    return (
        <div 
            className={`bg-gray-900 border-l-4 ${alertClasses[alertLevel]} rounded-r-lg shadow-md p-5 ${onClick ? 'cursor-pointer hover:bg-gray-800' : ''} transition-colors`}
            onClick={onClick}
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-400">{title}</p>
                    <div className="flex items-baseline gap-2 mt-1">
                        <p className="text-3xl font-bold text-white">{value}</p>
                        {unit && <p className="text-lg font-medium text-gray-500">{unit}</p>}
                    </div>
                </div>
                {alertIcon[alertLevel]}
            </div>
            {children && <div className="mt-4 pt-3 border-t border-gray-700/50">{children}</div>}
        </div>
    );
};

export default KPI;
