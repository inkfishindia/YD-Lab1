import React, { useState, useEffect } from 'react';
import { useData } from '../../../contexts/DataContext';
import type { SystemFlywheel } from '../../../types';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: SystemFlywheel | null;
}

const getInitialFormData = (): Omit<SystemFlywheel, 'flywheel_id'> => ({
    flywheel_name: '',
    serves_segments: '',
    owner_person: '',
    customer_struggle: '',
    jtbd_trigger_moment: '',
    motion_sequence: '',
    primary_bottleneck: '',
});

const SystemFlywheelFormModal: React.FC<FormModalProps> = ({ isOpen, onClose, initialData }) => {
    const { addSystemFlywheel, updateSystemFlywheel, systemPeople } = useData();
    const [formData, setFormData] = useState<Partial<SystemFlywheel>>(getInitialFormData());

    useEffect(() => {
        if (isOpen) {
            setFormData(initialData ? initialData : getInitialFormData());
        }
    }, [initialData, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (initialData) {
            updateSystemFlywheel(formData as SystemFlywheel);
        } else {
            addSystemFlywheel(formData as Omit<SystemFlywheel, 'flywheel_id'>);
        }
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Flywheel' : 'Add Flywheel'}>
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-4">
                <div>
                    <label>Flywheel Name</label>
                    <input name="flywheel_name" value={formData.flywheel_name} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" required />
                </div>
                <div>
                    <label>Owner</label>
                    <select name="owner_person" value={formData.owner_person} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white">
                        <option value="">-- Select Owner --</option>
                        {systemPeople.map(p => <option key={p.person_id} value={p.person_id}>{p.full_name}</option>)}
                    </select>
                </div>
                 <div>
                    <label>Serves Segments (comma-separated IDs)</label>
                    <input name="serves_segments" value={formData.serves_segments} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                </div>
                 <div>
                    <label>Primary Bottleneck</label>
                    <textarea name="primary_bottleneck" value={formData.primary_bottleneck} onChange={handleChange} rows={3} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save</Button>
                </div>
            </form>
        </Modal>
    );
};

export default SystemFlywheelFormModal;