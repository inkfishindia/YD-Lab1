
import React from 'react';
import { Link } from 'react-router-dom';
import Card from './ui/Card';
import { Cog6ToothIcon } from './Icons';
import Button from './ui/Button';

const ConfigurationNeeded: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-full">
        <Card className="max-w-xl text-center">
            <Cog6ToothIcon className="mx-auto h-12 w-12 text-gray-500" />
            <h2 className="mt-4 text-xl font-semibold text-white">
                Application Not Configured
            </h2>
            <p className="mt-2 text-gray-400">
                To get started, you need to connect your Google Sheets. Please go to the admin settings page to enter your spreadsheet IDs.
            </p>
            <div className="mt-6">
                <Link to="/admin/integrations">
                    <Button variant="primary">
                        Go to Configuration
                    </Button>
                </Link>
            </div>
        </Card>
    </div>
  );
};

export default ConfigurationNeeded;
