import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { Project, Priority, Status } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Project, 'project_id'> | Project) => void;
  project: Project | null;
}

const getInitialData = (people: any[], businessUnits: any[]): Omit<Project, 'project_id' | 'created_at' | 'updated_at'> => ({
    project_name: '',
    business_unit_id: businessUnits[0] ? [businessUnits[0].bu_id] : [],
    owner_user_id: people[0]?.user_id || '',
    priority: Priority.Medium,
    status: Status.NotStarted,
    start_date: '',
    target_end_date: '',
    budget_planned: 0,
    budget_spent: 0,
    objective: '',
    confidence_pct: 0,
    risk_flag: false,
    risk_note: '',
    channels_impacted: [],
    touchpoints_impacted: [],
    hub_dependencies: [],
    team_members: [],
    success_metrics: '',
});


const ProjectFormModal: React.FC<ProjectFormModalProps> = ({ isOpen, onClose, onSave, project }) => {
    const { people, businessUnits } = useData();
    const [formData, setFormData] = useState(getInitialData(people, businessUnits));

    useEffect(() => {
      if (isOpen) {
        if (project) {
            const { project_id, created_at, updated_at, ...editableData } = project;
            setFormData({
                ...getInitialData(people, businessUnits), // Ensure all fields are present
                ...editableData,
                // Ensure array fields are arrays
                business_unit_id: Array.isArray(editableData.business_unit_id) ? editableData.business_unit_id : [],
                channels_impacted: Array.isArray(editableData.channels_impacted) ? editableData.channels_impacted : [],
                touchpoints_impacted: Array.isArray(editableData.touchpoints_impacted) ? editableData.touchpoints_impacted : [],
                hub_dependencies: Array.isArray(editableData.hub_dependencies) ? editableData.hub_dependencies : [],
                team_members: Array.isArray(editableData.team_members) ? editableData.team_members : [],
            });
        } else {
            setFormData(getInitialData(people, businessUnits));
        }
      }
    }, [project, people, businessUnits, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
            setFormData(prev => ({...prev, [name]: (e.target as HTMLInputElement).checked}));
            return;
        }

        const numericFields = ['budget_planned', 'budget_spent', 'confidence_pct'];
        const arrayStringFields = ['channels_impacted', 'touchpoints_impacted', 'hub_dependencies', 'team_members'];

        if (numericFields.includes(name)) {
            setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
        } else if (arrayStringFields.includes(name)) {
             setFormData(prev => ({ ...prev, [name]: value.split(',').map(s => s.trim()).filter(Boolean) }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleMultiSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        // FIX: Explicitly type the 'option' parameter to resolve ambiguity in some TypeScript configurations.
        const selectedOptions = Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value);
        setFormData(prev => ({ ...prev, [e.target.name]: selectedOptions }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(project ? { ...formData, project_id: project.project_id } : formData);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={project ? 'Edit Project' : 'Add Project'}>
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300">Project Name</label>
                    <input type="text" name="project_name" value={formData.project_name} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Owner</label>
                        <select name="owner_user_id" value={formData.owner_user_id} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" required>
                            {people.map(p => <option key={p.user_id} value={p.user_id}>{p.full_name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Status</label>
                        <select name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white">
                            {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Priority</label>
                        <select name="priority" value={formData.priority} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white">
                            {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-300">Budget Planned</label>
                        <input type="number" name="budget_planned" value={formData.budget_planned} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                    </div>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Start Date</label>
                        <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Target End Date</label>
                        <input type="date" name="target_end_date" value={formData.target_end_date} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                    </div>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-300">Business Unit(s)</label>
                    <select name="business_unit_id" multiple value={formData.business_unit_id} onChange={handleMultiSelectChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white h-24">
                        {businessUnits.map(bu => <option key={bu.bu_id} value={bu.bu_id}>{bu.bu_name}</option>)}
                    </select>
                </div>
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700 mt-4">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save</Button>
                </div>
            </form>
        </Modal>
    );
};

export default ProjectFormModal;
