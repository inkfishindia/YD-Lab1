import React from 'react';

const CompetitorAnalysisPage: React.FC = () => {
    return (
        <div className="h-full w-full flex flex-col">
            <div className="flex-grow rounded-lg overflow-hidden">
                <iframe 
                    style={{ border: 'none' }} 
                    width="100%" 
                    height="100%" 
                    src="https://embed.figma.com/board/ruXnN81gx0fgbOZuwTEhjV/Competitor-analysis?embed-host=share" 
                    allowFullScreen>
                </iframe>
            </div>
        </div>
    );
};

export default CompetitorAnalysisPage;