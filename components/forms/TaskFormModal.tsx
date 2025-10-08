import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import type { Task } from '../../types';
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
    const { people, projects } = useData();
    const [formData, setFormData] = useState({
        title: '',
        project_id: '',
        assignee_user_id: '',
        status: Status.NotStarted,
        priority: Priority.Medium,
        estimate_hours: 0,
        due_date: '',
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
        });
      }
    }, [task, projects, people, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'estimate_hours' ? parseFloat(value) : value }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(task ? { ...formData, task_id: task.task_id } : formData);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={task ? 'Edit Task' : 'Add Task'}>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-300">Title</label>
                    <input type="text" name="title" value={formData.title} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Project</label>
                    <select name="project_id" value={formData.project_id} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" required>
                        {projects.map(p => <option key={p.project_id} value={p.project_id}>{p.project_name}</option>)}
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-300">Assignee</label>
                    <select name="assignee_user_id" value={formData.assignee_user_id} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" required>
                        {people.map(p => <option key={p.user_id} value={p.user_id}>{p.full_name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Status</label>
                    <select name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white">
                        {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-300">Priority</label>
                    <select name="priority" value={formData.priority} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white">
                        {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Due Date</label>
                    <input type="date" name="due_date" value={formData.due_date} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Estimate (hours)</label>
                    <input type="number" name="estimate_hours" value={formData.estimate_hours} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" required />
                </div>
                <div className="col-span-2 flex justify-end space-x-3 pt-4">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save</Button>
                </div>
            </form>
        </Modal>
    );
};

export default TaskFormModal;
