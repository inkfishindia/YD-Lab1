

import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
// FIX: Import missing types for data from context.
import type { Task, Person, Project, Channel, Hub } from '../../types';
import { Priority, Status } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Task, 'task_id'> | Task) => void;
  task: Task | null;
}

const TaskFormModal: React.FC<TaskFormModalProps> = ({ isOpen, onClose, onSave, task }) => {
    const { people, projects, hubs, channels, tasks: allTasks } = useData();
    const [formData, setFormData] = useState({
        title: '',
        project_id: '',
        assignee_user_id: '',
        status: Status.NotStarted,
        priority: Priority.Medium,
        estimate_hours: 0,
        due_date: '',
        description: '',
        logged_hours: 0,
        channel_id: '',
        touchpoint_id: '',
        hub_id: '',
        dependency_task_id: '',
    });

    useEffect(() => {
      if (isOpen) {
        setFormData({
            title: task?.title || '',
            project_id: task?.project_id || (projects[0]?.project_id || ''),
            assignee_user_id: task?.assignee_user_id || (people[0]?.user_id || ''),
            status: task?.status || Status.NotStarted,
            priority: task?.priority || Priority.Medium,
            estimate_hours: task?.estimate_hours || 0,
            due_date: task?.due_date || '',
            description: task?.description || '',
            logged_hours: task?.logged_hours || 0,
            channel_id: task?.channel_id || '',
            touchpoint_id: task?.touchpoint_id || '',
            hub_id: task?.hub_id || '',
            dependency_task_id: task?.dependency_task_id || '',
        });
      }
    }, [task, projects, people, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const numericFields = ['estimate_hours', 'logged_hours'];
        setFormData(prev => ({ ...prev, [name]: numericFields.includes(name) ? parseFloat(value) : value }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(task ? { ...formData, task_id: task.task_id } : formData);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={task ? 'Edit Task' : 'Add Task'}>
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-4">
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-300">Title</label>
                    <input type="text" name="title" value={formData.title} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" required />
                </div>
                 <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-300">Description</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Project</label>
                        <select name="project_id" value={formData.project_id} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" required>
                            {/* FIX: Explicitly type 'p' to resolve type inference issue. */}
                            {projects.map((p: Project) => <option key={p.project_id} value={p.project_id}>{p.project_name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-300">Assignee</label>
                        <select name="assignee_user_id" value={formData.assignee_user_id} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" required>
                            {/* FIX: Explicitly type 'p' to resolve type inference issue. */}
                            {people.map((p: Person) => <option key={p.user_id} value={p.user_id}>{p.full_name}</option>)}
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Status</label>
                        <select name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white">
                            {/* FIX: Explicitly type 's' to resolve type inference issue. */}
                            {Object.values(Status).map((s: Status) => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-300">Priority</label>
                        <select name="priority" value={formData.priority} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white">
                            {/* FIX: Explicitly type 'p' to resolve type inference issue. */}
                            {Object.values(Priority).map((p: Priority) => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Due Date</label>
                        <input type="date" name="due_date" value={formData.due_date} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Estimate (hours)</label>
                        <input type="number" name="estimate_hours" value={formData.estimate_hours} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" required />
                    </div>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-300">Logged (hours)</label>
                    <input type="number" name="logged_hours" value={formData.logged_hours} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                </div>

                <div className="border-t border-gray-700 pt-4 mt-4">
                    <h3 className="text-base font-medium text-gray-300 mb-2">Connections & Dependencies</h3>
                    <div className="space-y-4">
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300">Channel</label>
                                <select name="channel_id" value={formData.channel_id} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white">
                                    <option value="">None</option>
                                    {/* FIX: Explicitly type 'c' to resolve type inference issue. */}
                                    {channels.map((c: Channel) => <option key={c.channel_id} value={c.channel_id}>{c.channel_name}</option>)}
                                </select>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-300">Hub</label>
                                <select name="hub_id" value={formData.hub_id} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white">
                                    <option value="">None</option>
                                    {/* FIX: Explicitly type 'h' to resolve type inference issue. */}
                                    {hubs.map((h: Hub) => <option key={h.hub_id} value={h.hub_id}>{h.hub_name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300">Touchpoint ID</label>
                            <input type="text" name="touchpoint_id" value={formData.touchpoint_id} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300">Dependency Task</label>
                            <select name="dependency_task_id" value={formData.dependency_task_id} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white">
                                <option value="">None</option>
                                {/* FIX: Explicitly type 't' to resolve type inference issue. */}
                                {allTasks.filter((t: Task) => t.task_id !== task?.task_id).map((t: Task) => <option key={t.task_id} value={t.task_id}>{t.title}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="col-span-2 flex justify-end space-x-3 pt-4 border-t border-gray-700">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save</Button>
                </div>
            </form>
        </Modal>
    );
};

export default TaskFormModal;