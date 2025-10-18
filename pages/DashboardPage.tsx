import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';
import { PRIORITY_COLORS, STATUS_COLORS } from '../../constants';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Status, Priority, Task } from '../../types';

const DashboardPage: React.FC = () => {
  const { projects, tasks, people } = useData();
  const { currentUser } = useAuth();

  const allOpenTasks = tasks.filter(
    (task) =>
      task.status !== Status.Completed && task.status !== Status.Cancelled,
  );

  let myOpenTasks: Task[];

  if (currentUser) {
    // User is signed in, find their record in the people sheet by email
    const currentPerson = people.find(
      (p) => p.email.toLowerCase() === currentUser.email.toLowerCase(),
    );
    if (currentPerson) {
      // User found, filter tasks assigned to their user_id from the sheet
      myOpenTasks = allOpenTasks.filter(
        (task) => task.assignee_user_id === currentPerson.user_id,
      );
    } else {
      // User is signed in but not in the people sheet, so they have no assigned tasks.
      myOpenTasks = [];
    }
  } else {
    // User is not signed in, show a sample of open tasks from mock data
    myOpenTasks = allOpenTasks.slice(0, 5);
  }

  const projectStatusData = Object.values(Status)
    .map((status) => ({
      name: status,
      value: projects.filter((p) => p.status === status).length,
    }))
    .filter((d) => d.value > 0);

  const taskPriorityData = Object.values(Priority)
    .map((priority) => ({
      name: priority,
      value: tasks.filter((t) => t.priority === priority).length,
    }))
    .filter((d) => d.value > 0);

  const projectBudgetData = projects.slice(0, 10).map((p) => ({
    name:
      p.project_name.length > 15
        ? `${p.project_name.substring(0, 12)}...`
        : p.project_name,
    Planned: p.budget_planned,
    Spent: p.budget_spent,
  }));

  const DEFAULT_CHART_COLOR = '#cccccc'; // A neutral gray for unknown values

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <h4 className="text-gray-400 text-sm font-medium">Total Projects</h4>
          <p className="text-3xl font-bold text-white mt-1">{projects.length}</p>
        </Card>
        <Card>
          <h4 className="text-gray-400 text-sm font-medium">Total Tasks</h4>
          <p className="text-3xl font-bold text-white mt-1">{tasks.length}</p>
        </Card>
        <Card>
          <h4 className="text-gray-400 text-sm font-medium">Active People</h4>
          <p className="text-3xl font-bold text-white mt-1">
            {people.filter((p) => p.is_active !== false).length}
          </p>
        </Card>
        <Card>
          <h4 className="text-gray-400 text-sm font-medium">
            Total Planned Budget
          </h4>
          <p className="text-3xl font-bold text-white mt-1">
            ₹
            {projects
              .reduce((sum, p) => sum + p.budget_planned, 0)
              .toLocaleString()}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title={currentUser ? 'My Open Tasks' : 'Sample Open Tasks'}>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {myOpenTasks.length > 0 ? (
                myOpenTasks.map((task) => (
                  <div
                    key={task.task_id}
                    className="p-3 bg-gray-800 rounded-md flex justify-between items-center"
                  >
                    <div>
                      <p className="text-white font-medium">{task.title}</p>
                      <p className="text-xs text-gray-400">
                        Due: {task.due_date}
                      </p>
                    </div>
                    <Badge
                      text={task.priority}
                      colorClass={
                        PRIORITY_COLORS[task.priority] || 'bg-gray-500'
                      }
                    />
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center py-4">
                  {currentUser
                    ? 'You have no open tasks. Great job!'
                    : 'No sample tasks to display.'}
                </p>
              )}
            </div>
          </Card>
        </div>

        <Card title="Project Status">
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={projectStatusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                >
                  {projectStatusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        STATUS_COLORS[entry.name as Status] || DEFAULT_CHART_COLOR
                      }
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e1e1e',
                    border: '1px solid #2d2d2d',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Project Budget Overview (Top 10)">
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart
                data={projectBudgetData}
                margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
              >
                <XAxis
                  dataKey="name"
                  stroke="#999999"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#999999"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `₹${Number(value) / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e1e1e',
                    border: '1px solid #2d2d2d',
                  }}
                  cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
                />
                <Legend />
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
                <Pie
                  data={taskPriorityData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                >
                  {taskPriorityData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        PRIORITY_COLORS[entry.name as Priority] ||
                        DEFAULT_CHART_COLOR
                      }
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e1e1e',
                    border: '1px solid #2d2d2d',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
