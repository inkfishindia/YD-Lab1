import React from 'react';

interface BadgeProps {
  text: string;
  colorClass: string;
}

const Badge: React.FC<BadgeProps> = ({ text, colorClass }) => {
  return (
    <div className="inline-flex items-center">
      <span className={`w-2 h-2 mr-2 rounded-full ${colorClass}`}></span>
      <span className="text-sm text-gray-300">{text}</span>
    </div>
  );
};

export default Badge;