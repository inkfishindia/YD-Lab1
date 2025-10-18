import React, { useState, useLayoutEffect, useRef } from 'react';

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

export default Tooltip;
