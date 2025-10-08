
import React from 'react';
import Card from './Card';

const PlaceholderPage: React.FC<{ title: string; children?: React.ReactNode }> = ({ title, children }) => (
  <Card>
    <div className="text-center py-20">
      <h1 className="text-2xl font-bold text-white">{title}</h1>
      <p className="text-gray-400 mt-2">This page is under construction.</p>
      {children}
    </div>
  </Card>
);

export default PlaceholderPage;
