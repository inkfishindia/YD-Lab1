import React from 'react';

const CustomerJourneyPage: React.FC = () => {
    return (
        <div className="h-full w-full flex flex-col">
            <div className="flex-grow rounded-lg overflow-hidden">
                <iframe 
                    style={{ border: 'none' }} 
                    width="100%" 
                    height="100%" 
                    src="https://embed.figma.com/board/fcOP1QQsmzQjZHFXuog8zw/YD---customer-journey?embed-host=share" 
                    allowFullScreen>
                </iframe>
            </div>
        </div>
    );
};

export default CustomerJourneyPage;