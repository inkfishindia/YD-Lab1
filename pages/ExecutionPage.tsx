import React from 'react';
import { Outlet } from 'react-router-dom';

const ExecutionPage: React.FC = () => {
    return (
        <div className="h-full">
            <Outlet />
        </div>
    );
};

export default ExecutionPage;