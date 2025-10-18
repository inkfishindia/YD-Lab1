import React from 'react';

const VisualMoodPage: React.FC = () => {
    return (
        <div className="h-full w-full flex flex-col">
            <div className="flex-grow rounded-lg overflow-hidden">
                <iframe 
                    style={{ border: 'none' }} 
                    width="100%" 
                    height="100%" 
                    src="https://embed.figma.com/board/0yyAc2j2qj2X3NZRFfENVZ/Visual-mood?embed-host=share" 
                    allowFullScreen>
                </iframe>
            </div>
        </div>
    );
};

export default VisualMoodPage;