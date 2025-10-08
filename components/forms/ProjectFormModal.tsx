import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import type { Project } from '../../types';
import { Priority, Status } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Project, 'project_id'> | Project) => void;
  project: Project | null;
}

const ProjectFormModal: React.FC<ProjectFormModalProps> = ({ isOpen, onClose, onSave, project }) => {
    const { people, businessUnits } = useData();
    const [formData, setFormData] = useState({
        project_name: '',
        business_unit_id: '',
        owner_user_id: '',
        priority: Priority.Medium,
        status: Status.NotStarted,
        start_date: '',
        target_end_date: '',
        budget_planned: 0,
        budget_spent: 0,
    });

    useEffect(() => {
      if (isOpen) {
        setFormData({
            project_name: project?.project_name || '',
            business_unit_id: project?.business_unit_id || (businessUnits[0]?.bu_id || ''),
            owner_user_id: project?.owner_user_id || (people[0]?.user_id || ''),
            priority: project?.priority || Priority.Medium,
            status: project?.status || Status.NotStarted,
            start_date: project?.start_date || '',
            target_end_date: project?.target_end_date || '',
            budget_planned: project?.budget_planned || 0,
            budget_spent: project?.budget_spent || 0,
        });
      }
    }, [project, people, businessUnits, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name.startsWith('budget') ? parseFloat(value) : value }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(project ? { ...formData, project_id: project.project_id } : formData);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={project ? 'Edit Project' : 'Add Project'}>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                    <label htmlFor="project_name" className="block text-sm font-medium text-gray-300">Project Name</label>
                    <input type="text" name="project_name" value={formData.project_name} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" required />
                </div>
                <div>
                    <label htmlFor="owner_user_id" className="block text-sm font-medium text-gray-300">Owner</label>
                    <select name="owner_user_id" value={formData.owner_user_id} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" required>
                        {people.map(p => <option key={p.user_id} value={p.user_id}>{p.full_name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="business_unit_id" className="block text-sm font-medium text-gray-300">Business Unit</label>
                    <select name="business_unit_id" value={formData.business_unit_id} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" required>
                        {businessUnits.map(bu => <option key={bu.bu_id} value={bu.bu_id}>{bu.bu_name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-300">Status</label>
                    <select name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white">
                        {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="priority" className="block text-sm font-medium text-gray-300">Priority</label>
                    <select name="priority" value={formData.priority} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white">
                        {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="start_date" className="block text-sm font-medium text-gray-300">Start Date</label>
                    <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" required />
                </div>
                <div>
                    <label htmlFor="target_end_date" className="block text-sm font-medium text-gray-300">Target End Date</label>
                    <input type="date" name="target_end_date" value={formData.target_end_date} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" required />
                </div>
                <div>
                    <label htmlFor="budget_planned" className="block text-sm font-medium text-gray-300">Budget Planned</label>
                    <input type="number" name="budget_planned" value={formData.budget_planned} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" required />
                </div>
                 <div>
                    <label htmlFor="budget_spent" className="block text-sm font-medium text-gray-300">Budget Spent</label>
                    <input type="number" name="budget_spent" value={formData.budget_spent} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" required />
                </div>
                <div className="col-span-2 flex justify-end space-x-3 pt-4">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save</Button>
                </div>
            </form>
        </Modal>
    );
};

export default ProjectFormModal;
