import React from 'react';

// FIX: Extend React.HTMLAttributes<HTMLDivElement> to allow passing standard div props
// like onMouseEnter and onMouseLeave to the component.
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  ...props
}) => {
  return (
    // FIX: Spread any additional props onto the root div element to support event handlers and other attributes.
    <div
      className={`bg-gray-900 border border-gray-800 rounded-xl ${className}`}
      {...props}
    >
      {title && (
        <div className="px-6 py-4 border-b border-gray-800">
          <h3 className="text-base font-semibold text-white">{title}</h3>
        </div>
      )}
      <div className={title ? 'p-6' : ''}>{children}</div>
    </div>
  );
};

export default Card;
