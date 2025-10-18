import React from 'react';

interface StatCardProps {
    label: string;
    value: string | number | undefined;
    icon?: React.ElementType;
    prefix?: string;
    suffix?: string;
}

const formatValue = (value: any, prefix?: string, suffix?: string): string => {
    if (value === null || value === undefined || value === '') return 'N/A';
    
    const num = Number(value);
    if (isNaN(num)) return `${prefix || ''}${value}${suffix || ''}`;
    
    if (prefix === '₹') {
        if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)}Cr`;
        if (num >= 100000) return `₹${(num / 100000).toFixed(2)}L`;
        if (num >= 1000) return `₹${(num / 1000).toFixed(1)}k`;
    }

    const formattedNum = num.toLocaleString(undefined, { maximumFractionDigits: 2 });
    return `${prefix || ''}${formattedNum}${suffix || ''}`;
};


const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, prefix, suffix }) => {
    return (
        <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700/50">
            <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">{label}</p>
                {Icon && <Icon className="w-4 h-4 text-gray-500" />}
            </div>
            <p className="text-xl font-bold text-white mt-1 truncate">{formatValue(value, prefix, suffix)}</p>
        </div>
    );
};

export default StatCard;