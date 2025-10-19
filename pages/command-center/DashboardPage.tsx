import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { Status, Priority, Task } from '../../types';
import { STATUS_COLORS, PRIORITY_COLORS } from '../../constants';
// FIX: Changed import from googleSheetService to sheetGateway
import { fetchUnreadGmailCount, fetchNextCalendarEvent } from '../../services/sheetGateway';
import { EnvelopeIcon, CalendarIcon, FolderIcon } from '../../components/Icons';


// --- Hero Section Components ---
const StatCard: React.FC<{
    icon: React.ElementType,
    title: string,
    value: string | number | null,
    loading: boolean,
    link?: string,
    error?: boolean
}> = ({ icon: Icon, title, value, loading, link, error = false }) => {
    const content = (
        <>
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-400">{title}</p>
                <Icon className={`w-5 h-5 ${error ? 'text-red-500' : 'text-gray-500'}`} />
            </div>
            <div className="mt-2">
                {loading ? (
                    <p className="text-2xl font-bold text-white animate-pulse">...</p>
                ) : error ? (
                    <p className="text-2xl font-bold text-red-400">Error</p>
                ) : (
                    <p className="text-2xl font-bold text-white truncate">{value}</p>
                )}
            </div>
        </>
    );

    if (link && !loading && !error) {
        return (
            <a href={link} target="_blank" rel="noopener noreferrer" className="block p-5 bg-gray-900 border border-gray-800 rounded-xl hover:bg-gray-800 transition-colors">
                {content}
            </a>
        );
    }
    
    return <div className="p-5 bg-gray-900 border border-gray-800 rounded-xl">{content}</div>;
};


const HeroSection: React.FC = () => {
    const { currentUser } = useAuth();
    const { projects } = useData();
    const [unreadCount, setUnreadCount] = useState<number | null>(null);
    const [nextEvent, setNextEvent] = useState<any | null>(null);
    const [gmailLoading, setGmailLoading] = useState(true);
    const [calendarLoading, setCalendarLoading] = useState(true);
    const [gmailError, setGmailError] = useState(false);
    const [calendarError, setCalendarError] = useState(false);

    useEffect(() => {
        const getWorkspaceData = async () => {
            if (!currentUser) return;
            setGmailLoading(true);
            setCalendarLoading(true);
            try {
                setGmailError(false);
                const count = await fetchUnreadGmailCount();
                setUnreadCount(count);
            } catch (error) { console.error("Error fetching Gmail count:", error); setGmailError(true); } 
            finally { setGmailLoading(false); }
            
            try {
                setCalendarError(false);
                const event = await fetchNextCalendarEvent();
                setNextEvent(event);
            } catch (error) { console.error("Error fetching calendar event:", error); setCalendarError(true); } 
            finally { setCalendarLoading(false); }
        };
        getWorkspaceData();
    }, [currentUser]);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    const activeProjects = projects.filter(p => p.status === Status.InProgress || p.status === Status.NotStarted).length;

    const formatEvent = () => {
        if (!nextEvent) return "No upcoming events";
        const start = nextEvent.start?.dateTime || nextEvent.start?.date;
        const time = new Date(start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
        return `${nextEvent.summary} at ${time}`;
    };

    return (
        <div className="mb-6">
            <h1 className="text-3xl font-bold text-white">{getGreeting()}, {currentUser?.name?.split(' ')[0]}</h1>
            <p className="text-gray-400">Here's your personal dashboard for today.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <StatCard 
                    icon={EnvelopeIcon} 
                    title="Gmail Inbox" 
                    value={unreadCount !== null ? `${unreadCount} Unread` : 'N/A'} 
                    loading={gmailLoading}
                    error={gmailError}
                    link="https://mail.google.com"
                />
                 <StatCard 
                    icon={CalendarIcon} 
                    title="Next Up" 
                    value={formatEvent()} 
                    loading={calendarLoading}
                    error={calendarError}
                    link={nextEvent?.htmlLink}
                />
                 <StatCard 
                    icon={FolderIcon} 
                    title="Active Projects" 
                    value={activeProjects}
                    loading={false}
                />
            </div>
        </div>
    );
};


const DashboardPage: React.FC = () => {
  const { projects, tasks, people } = useData();
  const { currentUser } = useAuth();

  const allOpenTasks = tasks.filter(task => 
    task.status !== Status.Completed && 
    task.status !== Status.Cancelled
  );

  let myOpenTasks: Task[];

  if (currentUser) {
    const currentPerson = people.find(p => p.email.toLowerCase() === currentUser.email.toLowerCase());
    myOpenTasks = currentPerson ? allOpenTasks.filter(task => task.assignee_user_id === currentPerson.user_id) : [];
  } else {
    myOpenTasks = allOpenTasks.slice(0, 5);
  }

  const projectStatusData = Object.values(Status).map(status => ({
    name: status,
    value: projects.filter(p => p.status === status).length,
  })).filter(d => d.value > 0);

  const taskPriorityData = Object.values(Priority).map(priority => ({
    name: priority,
    value: tasks.filter(t => t.priority === priority).length,
  })).filter(d => d.value > 0);
  
  const projectBudgetData = projects.slice(0, 10).map(p => ({
    name: p.project_name.length > 15 ? `${p.project_name.substring(0, 12)}...` : p.project_name,
    Planned: p.budget_planned,
    Spent: p.budget_spent,
  }));

  const DEFAULT_CHART_COLOR = '#A1A1AA';

  return (
    <div className="space-y-6">
      <HeroSection />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <Card title={currentUser ? "My Open Tasks" : "Sample Open Tasks"}>
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {myOpenTasks.length > 0 ? myOpenTasks.map(task => (
                  <div key={task.task_id} className="p-3 bg-gray-800 rounded-lg flex justify-between items-center">
                    <div>
                      <p className="text-white font-medium">{task.title}</p>
                      <p className="text-xs text-gray-400">Due: {task.due_date}</p>
                    </div>
                    <Badge text={task.priority} colorClass={PRIORITY_COLORS[task.priority] || 'bg-gray-700'} />
                  </div>
                )) : <p className="text-gray-500 text-center py-4">{currentUser ? "You have no open tasks. Great job!" : "No sample tasks to display."}</p>}
              </div>
            </Card>
        </div>

        <Card title="Project Status">
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={projectStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} >
                    {projectStatusData.map((entry, index) => <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name as Status]?.split(' ')[0] || DEFAULT_CHART_COLOR} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#18181B', border: '1px solid #3F3F46', borderRadius: '0.75rem' }} />
                <Legend wrapperStyle={{fontSize: "0.875rem"}}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <Card title="Project Budget Overview (Top 10)">
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <BarChart data={projectBudgetData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <XAxis dataKey="name" stroke="#A1A1AA" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#A1A1AA" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${Number(value)/1000}k`} />
                        <Tooltip contentStyle={{ backgroundColor: '#18181B', border: '1px solid #3F3F46', borderRadius: '0.75rem' }} cursor={{fill: 'rgba(161, 161, 170, 0.1)'}} />
                        <Legend wrapperStyle={{fontSize: "0.875rem"}}/>
                        <Bar dataKey="Planned" fill="#2563eb" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Spent" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Card>
        <Card title="Task Priority">
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={taskPriorityData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5}>
                    {taskPriorityData.map((entry, index) => <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[entry.name as Priority]?.split(' ')[0] || DEFAULT_CHART_COLOR} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#18181B', border: '1px solid #3F3F46', borderRadius: '0.75rem' }} />
                <Legend wrapperStyle={{fontSize: "0.875rem"}}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;