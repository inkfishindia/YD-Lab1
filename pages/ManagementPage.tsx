import React from 'react';
import { Outlet } from 'react-router-dom';

const ManagementPage: React.FC = () => {
    return (
        <div className="h-full">
            <Outlet />
        </div>
    );
};

export default ManagementPage;
