import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '', title }) => {
  return (
    <div className={`bg-gray-900 border border-gray-800 rounded-lg shadow-lg ${className}`}>
      {title && (
        <div className="px-5 py-4 border-b border-gray-800">
          <h3 className="text-base font-semibold text-white">{title}</h3>
        </div>
      )}
      <div className="p-5">
        {children}
      </div>
    </div>
  );
};

export default Card;