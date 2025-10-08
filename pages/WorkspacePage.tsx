
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/ui/Card';
import { ViewGridIcon } from '../components/Icons';
import Button from '../components/ui/Button';

// --- Type Definitions for API responses ---
interface CalendarEvent {
  id: string;
  summary: string;
  start: { dateTime?: string; date?: string };
  htmlLink: string;
}
interface GmailMessage {
  id: string;
  snippet: string;
  payload: {
    headers: { name: string; value: string }[];
  };
}
interface DriveFile {
  id:string;
  name: string;
  iconLink: string;
  webViewLink: string;
  modifiedTime: string;
}

const WorkspacePage: React.FC = () => {
    const { isSignedIn, signIn } = useAuth();
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [messages, setMessages] = useState<GmailMessage[]>([]);
    const [files, setFiles] = useState<DriveFile[]>([]);
    const [loading, setLoading] = useState({ calendar: true, gmail: true, drive: true });
    const [error, setError] = useState<{ calendar: string | null, gmail: string | null, drive: string | null }>({ calendar: null, gmail: null, drive: null });

    const getHeaderValue = (headers: { name: string; value: string }[], name: string) => {
        const header = headers.find(h => h.name.toLowerCase() === name.toLowerCase());
        return header ? header.value : 'Unknown';
    };

    const fetchCalendarData = useCallback(async () => {
        setLoading(prev => ({ ...prev, calendar: true }));
        try {
            const response = await (window as any).gapi.client.calendar.events.list({
                calendarId: 'primary',
                timeMin: new Date().toISOString(),
                showDeleted: false,
                singleEvents: true,
                maxResults: 10,
                orderBy: 'startTime',
            });
            setEvents(response.result.items);
            setError(prev => ({ ...prev, calendar: null }));
        } catch (err: any) {
            console.error("Error fetching calendar data:", err);
            setError(prev => ({ ...prev, calendar: err.result?.error?.message || 'Failed to load events.' }));
        } finally {
            setLoading(prev => ({ ...prev, calendar: false }));
        }
    }, []);

    const fetchGmailData = useCallback(async () => {
        setLoading(prev => ({ ...prev, gmail: true }));
        try {
            const response = await (window as any).gapi.client.gmail.users.messages.list({
                userId: 'me',
                q: 'is:unread',
                maxResults: 10,
            });
            const messageIds = response.result.messages || [];
            if (messageIds.length > 0) {
                const batch = (window as any).gapi.client.newBatch();
                messageIds.forEach((message: { id: string }) => {
                    batch.add((window as any).gapi.client.gmail.users.messages.get({
                        userId: 'me',
                        id: message.id,
                        format: 'metadata',
                        metadataHeaders: ['Subject', 'From', 'Date'],
                    }));
                });
                const batchResponse = await batch;
                const fetchedMessages = Object.values(batchResponse.result).map((res: any) => res.result);
                setMessages(fetchedMessages);
            } else {
                setMessages([]);
            }
            setError(prev => ({ ...prev, gmail: null }));
        } catch (err: any) {
            console.error("Error fetching gmail data:", err);
            setError(prev => ({ ...prev, gmail: err.result?.error?.message || 'Failed to load emails.' }));
        } finally {
            setLoading(prev => ({ ...prev, gmail: false }));
        }
    }, []);

    const fetchDriveData = useCallback(async () => {
        setLoading(prev => ({ ...prev, drive: true }));
        try {
            const response = await (window as any).gapi.client.drive.files.list({
                pageSize: 10,
                fields: "nextPageToken, files(id, name, iconLink, webViewLink, modifiedTime)",
                orderBy: 'modifiedTime desc',
            });
            setFiles(response.result.files);
            setError(prev => ({ ...prev, drive: null }));
        } catch (err: any) {
            console.error("Error fetching drive data:", err);
            setError(prev => ({ ...prev, drive: err.result?.error?.message || 'Failed to load files.' }));
        } finally {
            setLoading(prev => ({ ...prev, drive: false }));
        }
    }, []);

    useEffect(() => {
        if (isSignedIn && (window as any).gapi?.client?.calendar) {
            fetchCalendarData();
            fetchGmailData();
            fetchDriveData();
        }
    }, [isSignedIn, fetchCalendarData, fetchGmailData, fetchDriveData]);

    const renderLoading = () => <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div></div>;
    const renderError = (message: string) => <div className="text-red-400 text-sm p-4 text-center">{message}</div>;

    if (!isSignedIn) {
        return (
            <div className="flex flex-col items-center justify-center text-center p-8 bg-gray-900 border border-gray-800 rounded-lg h-full">
                <ViewGridIcon className="w-12 h-12 text-gray-600 mb-4" />
                <h2 className="text-xl font-semibold text-white">Unlock Your Workspace</h2>
                <p className="text-gray-400 mt-2 mb-6 max-w-md">Sign in to connect your Google Workspace and see your upcoming events, unread emails, and recent files all in one place.</p>
                <Button onClick={signIn}>Sign In to Continue</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-white">My Workspace</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card title="Upcoming Events" className="flex flex-col">
                    <div className="flex-grow min-h-[300px]">
                        {loading.calendar ? renderLoading() : error.calendar ? renderError(error.calendar) : (
                            <ul className="space-y-3">
                                {events.length > 0 ? events.map(event => (
                                    <li key={event.id} className="p-3 bg-gray-800/50 rounded-md">
                                        <a href={event.htmlLink} target="_blank" rel="noopener noreferrer" className="font-medium text-white hover:text-blue-400">{event.summary}</a>
                                        <p className="text-xs text-gray-400 mt-1">{new Date(event.start.dateTime || event.start.date || '').toLocaleString()}</p>
                                    </li>
                                )) : <p className="text-gray-500 text-center pt-10">No upcoming events.</p>}
                            </ul>
                        )}
                    </div>
                </Card>
                <Card title="Unread Emails" className="flex flex-col">
                    <div className="flex-grow min-h-[300px]">
                        {loading.gmail ? renderLoading() : error.gmail ? renderError(error.gmail) : (
                            <ul className="space-y-3">
                                {messages.length > 0 ? messages.map(msg => (
                                    <li key={msg.id} className="p-3 bg-gray-800/50 rounded-md">
                                        <p className="text-sm font-medium text-white truncate">{getHeaderValue(msg.payload.headers, 'Subject')}</p>
                                        <p className="text-xs text-gray-400 mt-1 truncate">{getHeaderValue(msg.payload.headers, 'From')}</p>
                                    </li>
                                )) : <p className="text-gray-500 text-center pt-10">You're all caught up!</p>}
                            </ul>
                        )}
                    </div>
                </Card>
                <Card title="Recent Files" className="flex flex-col">
                    <div className="flex-grow min-h-[300px]">
                        {loading.drive ? renderLoading() : error.drive ? renderError(error.drive) : (
                            <ul className="space-y-3">
                                {files.length > 0 ? files.map(file => (
                                    <li key={file.id} className="p-3 bg-gray-800/50 rounded-md flex items-center">
                                        <img src={file.iconLink} alt="file icon" className="w-4 h-4 mr-3" />
                                        <div className="flex-grow overflow-hidden">
                                            <a href={file.webViewLink} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-white hover:text-blue-400 truncate block">{file.name}</a>
                                            <p className="text-xs text-gray-400 mt-1">Modified: {new Date(file.modifiedTime).toLocaleDateString()}</p>
                                        </div>
                                    </li>
                                )) : <p className="text-gray-500 text-center pt-10">No recent files.</p>}
                            </ul>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default WorkspacePage;
