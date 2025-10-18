import React from 'react';
import { Outlet } from 'react-router-dom';

const CreativePage: React.FC = () => {
    return (
        <div className="h-full">
            <Outlet />
        </div>
    );
};

export default CreativePage;
