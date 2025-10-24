import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';

import Button from '../../../components/ui/Button';
import { SparklesIcon } from '../../../components/Icons';
// REMOVED: import { API_KEY } from '../../../api-keys';

const NotebookLLMPage: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError('Please enter a prompt.');
            return;
        }
        
        setIsLoading(true);
        setError('');
        setResponse('');

        try {
            // FIX: Use new GoogleGenAI({apiKey: ...}) initialization.
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            // FIX: Use ai.models.generateContent with model and contents properties.
            const result = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            // FIX: Access the generated text directly via the .text property.
            setResponse(result.text);
        } catch (e) {
            console.error('Error generating content:', e);
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            setError(`Failed to get response: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full max-w-4xl mx-auto">
            <h1 className="text-2xl font-semibold text-white mb-4">Notebook LLM</h1>
            <div className="flex flex-col flex-grow bg-gray-900 border border-gray-800 rounded-xl">
                <div className="flex-grow p-6 flex flex-col gap-4">
                    <label htmlFor="prompt-textarea" className="text-sm font-medium text-gray-300">
                        Your Prompt
                    </label>
                    <textarea
                        id="prompt-textarea"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., Write a SQL query to find all users who signed up in the last 7 days."
                        className="w-full h-40 p-3 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                        disabled={isLoading}
                    />
                    <div className="flex justify-end">
                        <Button onClick={handleGenerate} disabled={isLoading}>
                            {isLoading ? 'Generating...' : (
                                <>
                                    <SparklesIcon className="w-5 h-5 mr-2" />
                                    Generate
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                <div className="border-t border-gray-800 flex-grow p-6">
                    <h2 className="text-sm font-medium text-gray-300 mb-2">Response</h2>
                    <div className="bg-gray-950 rounded-md p-4 min-h-[200px] text-white whitespace-pre-wrap font-mono text-sm overflow-auto">
                        {isLoading && <div className="animate-pulse text-gray-500">Waiting for response...</div>}
                        {error && <div className="text-red-400">{error}</div>}
                        {response && <div>{response}</div>}
                        {!isLoading && !error && !response && <div className="text-gray-500">The generated response will appear here.</div>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotebookLLMPage;