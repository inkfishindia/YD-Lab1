
import React, { useState, useMemo } from 'react';
import { useData } from '../../../contexts/DataContext';
import type { Task } from '../../../types';
import { Priority, Status } from '../../../types';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { PlusIcon, EditIcon, TrashIcon, SortIcon } from '../../../components/Icons';
import { STATUS_COLORS, PRIORITY_COLORS } from '../../../constants';
import TaskFormModal from '../../../components/forms/TaskFormModal';

type SortConfig = { key: keyof Task; direction: 'ascending' | 'descending' } | null;

const AllTasksTablePage: React.FC = () => {
  const { tasks, addTask, updateTask, deleteTask, people, projects } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filters, setFilters] = useState({ title: '', assignee_user_id: '', status: '', priority: '' });
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
        return t.title.toLowerCase().includes(filters.title.toLowerCase()) &&
               (filters.assignee_user_id ? t.assignee_user_id === filters.assignee_user_id : true) &&
               (filters.status ? t.status === filters.status : true) &&
               (filters.priority ? t.priority === filters.priority : true);
    });
  }, [tasks, filters]);

  const sortedTasks = useMemo(() => {
    let sortableTasks = [...filteredTasks];
    if (sortConfig !== null) {
      sortableTasks.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableTasks;
  }, [filteredTasks, sortConfig]);

  const requestSort = (key: keyof Task) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig?.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const openModal = (task: Task | null = null) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingTask(null);
    setIsModalOpen(false);
  };

  const handleSave = (taskData: Omit<Task, 'task_id'> | Task) => {
    if ('task_id' in taskData) updateTask(taskData);
    else addTask(taskData);
    closeModal();
  };

  const getPersonName = (id: string) => people.find(p => p.user_id === id)?.full_name || 'N/A';
  const getProjectName = (id: string) => projects.find(p => p.project_id === id)?.project_name || 'N/A';

  const TableHeader: React.FC<{ sortKey: keyof Task, label: string }> = ({ sortKey, label }) => (
      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer" onClick={() => requestSort(sortKey)}>
          <div className="flex items-center">{label}{sortConfig?.key === sortKey && <SortIcon className="w-4 h-4 ml-2" />}</div>
      </th>
  );

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold text-white">All Tasks (Table)</h1>
        <Button onClick={() => openModal()} className="flex items-center gap-2">
          <PlusIcon className="w-5 h-5" /> Add Task
        </Button>
      </div>
      
      <div className="mb-4 p-4 bg-gray-900 border border-gray-800 rounded-lg flex items-center gap-4">
          <input type="text" name="title" placeholder="Filter by title..." value={filters.title} onChange={handleFilterChange} className="bg-gray-800 border border-gray-700 text-white rounded-md py-2 px-4 w-1/3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <select name="assignee_user_id" value={filters.assignee_user_id} onChange={handleFilterChange} className="bg-gray-800 border border-gray-700 text-white rounded-md py-2 px-4 w-1/4 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Assignees</option>
              {people.map(p => <option key={p.user_id} value={p.user_id}>{p.full_name}</option>)}
          </select>
          <select name="status" value={filters.status} onChange={handleFilterChange} className="bg-gray-800 border border-gray-700 text-white rounded-md py-2 px-4 w-1/4 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Statuses</option>
              {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select name="priority" value={filters.priority} onChange={handleFilterChange} className="bg-gray-800 border border-gray-700 text-white rounded-md py-2 px-4 w-1/4 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Priorities</option>
              {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
          </select>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-800">
            <tr>
              <TableHeader sortKey="title" label="Title" />
              <TableHeader sortKey="assignee_user_id" label="Assignee" />
              <TableHeader sortKey="status" label="Status" />
              <TableHeader sortKey="priority" label="Priority" />
              <TableHeader sortKey="due_date" label="Due Date" />
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {sortedTasks.map((task) => (
              <tr key={task.task_id} className="hover:bg-gray-800">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-white">{task.title}</div>
                  <div className="text-sm text-gray-400">{getProjectName(task.project_id)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{getPersonName(task.assignee_user_id)}</td>
                <td className="px-6 py-4 whitespace-nowrap"><Badge text={task.status} colorClass={STATUS_COLORS[task.status]} /></td>
                <td className="px-6 py-4 whitespace-nowrap"><Badge text={task.priority} colorClass={PRIORITY_COLORS[task.priority]} /></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{task.due_date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                  <button onClick={() => openModal(task)} className="text-blue-400 hover:text-blue-300"><EditIcon className="w-5 h-5"/></button>
                  <button onClick={() => deleteTask(task.task_id)} className="text-red-400 hover:text-red-300"><TrashIcon className="w-5 h-5"/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <TaskFormModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        onSave={handleSave} 
        task={editingTask} 
      />
    </div>
  );
};

export default AllTasksTablePage;
