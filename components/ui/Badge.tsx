import React from 'react';

interface BadgeProps {
  text: string;
  colorClass: string;
  size?: 'sm' | 'md';
}

const Badge: React.FC<BadgeProps> = ({ text, colorClass, size = 'md' }) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full ${sizeClasses[size]} ${colorClass}`}
    >
      {text}
    </span>
  );
};

export default Badge;
