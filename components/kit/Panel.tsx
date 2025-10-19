import React from 'react';

interface PanelProps {
    title: string;
    actions?: React.ReactNode;
    children: React.ReactNode;
    footer?: React.ReactNode;
    className?: string;
}

const Panel: React.FC<PanelProps> = ({ title, actions, children, footer, className }) => {
    return (
        <div className={`bg-gray-900 border border-gray-800 rounded-xl flex flex-col ${className}`}>
            <div className="px-5 py-3 border-b border-gray-800 flex justify-between items-center">
                <h3 className="text-base font-semibold text-white">{title}</h3>
                {actions && <div className="flex items-center gap-2">{actions}</div>}
            </div>
            <div className="p-5 flex-grow">
                {children}
            </div>
            {footer && <div className="px-5 py-3 border-t border-gray-800 text-sm text-gray-400">{footer}</div>}
        </div>
    );
};

export default Panel;
