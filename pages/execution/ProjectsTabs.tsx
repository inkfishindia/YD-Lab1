import React from 'react';
import PlaceholderPage from '../../components/ui/PlaceholderPage';

const DeprecatedPage: React.FC = () => {
    return (
        <PlaceholderPage title="This View is Deprecated">
            <p className="text-gray-400 max-w-md mx-auto">
                This page was part of the old project management system and has been replaced by the new unified 'Programs' view under the Execution section.
            </p>
        </PlaceholderPage>
    );
};

export default DeprecatedPage;