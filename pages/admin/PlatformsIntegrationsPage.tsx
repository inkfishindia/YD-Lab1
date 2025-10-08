
import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useSpreadsheetConfig } from '../../contexts/SpreadsheetConfigContext';

const PlatformsIntegrationsPage: React.FC = () => {
    const { spreadsheetIds, saveSpreadsheetIds, isConfigured } = useSpreadsheetConfig();
    const [localIds, setLocalIds] = useState({
        EXECUTION: '',
        STRATEGY: '',
        PARTNERS: '',
        YDS_APP: '',
        MANIFEST: '',
    });
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        setLocalIds(spreadsheetIds);
    }, [spreadsheetIds]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setLocalIds(prev => ({ ...prev, [name]: value }));
        setIsSaved(false); // Reset saved status on change
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        saveSpreadsheetIds(localIds);
        setIsSaved(true);
        // Optional: Add a timeout to hide the saved message
        setTimeout(() => setIsSaved(false), 3000);
    };

    const renderInputField = (key: keyof typeof localIds, label: string, description: string) => (
        <div>
            <label htmlFor={key} className="block text-sm font-medium text-white">{label}</label>
            <p className="text-xs text-gray-400 mb-2">{description}</p>
            <input
                type="text"
                id={key}
                name={key}
                value={localIds[key]}
                onChange={handleChange}
                placeholder="Enter Spreadsheet ID here"
                className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-blue-500 focus:border-blue-500"
                required
            />
        </div>
    );

    return (
        <Card>
            <div className="p-2">
                <h1 className="text-2xl font-bold text-white">Platforms & Integrations</h1>
                <p className="text-gray-400 mt-2">
                    Connect your Google Sheets to power the application. You can find the Spreadsheet ID in the URL of your Google Sheet.
                </p>
                <p className="text-gray-400 mt-1 text-sm">
                    It looks like this: `.../spreadsheets/d/`<strong className="text-blue-400">SPREADSHEET_ID</strong>`/edit...`
                </p>

                {!isConfigured && (
                    <div className="mt-4 p-4 bg-yellow-900/50 border border-yellow-500/50 rounded-lg text-yellow-300">
                        <p className="font-bold">Configuration Needed</p>
                        <p className="text-sm">Please fill in all spreadsheet IDs and save to begin using the application.</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                    {renderInputField("EXECUTION", "Execution Spreadsheet ID", "Contains sheets for People, Projects, Tasks, and Roles.")}
                    {renderInputField("STRATEGY", "Strategy Spreadsheet ID", "Contains sheets for Business Units and Flywheels.")}
                    {renderInputField("PARTNERS", "Partners/Revenue Spreadsheet ID", "Contains sheets for Leads, Opportunities, and Accounts.")}
                    {renderInputField("YDS_APP", "YDS App Spreadsheet ID", "Contains sheets for app-specific data like BrainDump and Logs.")}
                    {renderInputField("MANIFEST", "Manifest Spreadsheet ID", "Contains sheets for Built in Tools and Agents.")}
                    
                    <div className="flex items-center gap-4">
                        <Button type="submit">Save Configuration</Button>
                        {isSaved && <span className="text-green-400">Configuration saved successfully!</span>}
                    </div>
                </form>
            </div>
        </Card>
    );
};

export default PlatformsIntegrationsPage;
