import React from 'react';

import PlaceholderPage from '../../components/ui/PlaceholderPage';

const NotebookLLMPage: React.FC = () => {
    return (
        <PlaceholderPage title="Notebook LLM (AI Assistant)">
            <p className="text-gray-400 mt-2">
                This page previously integrated with the Gemini API for LLM functionality.
                This feature has been temporarily removed.
            </p>
            <p className="text-gray-400 mt-2">
                Future iterations may explore different AI integrations or provide local tooling.
            </p>
        </PlaceholderPage>
    );
};

export default NotebookLLMPage;