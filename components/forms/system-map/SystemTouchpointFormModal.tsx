
import React, { useState, useEffect } from 'react';
import { useData } from '../../../contexts/DataContext';
import type { SystemTouchpoint } from '../../../types';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: SystemTouchpoint | null;
}

const getInitialFormData = (): Omit<SystemTouchpoint, 'touchpoint_id'> => ({
    touchpoint_name: '',
// FIX: Changed 'stage' to 'stage_id' to match schema.
    stage_id: '',
    flywheel_id: '',
// FIX: Changed 'responsible_hub' to 'responsible_hub_id' to match schema.
    responsible_hub_id: '',
// FIX: Changed 'responsible_person' to 'responsible_person_id' to match schema.
    responsible_person_id: '',
});

const SystemTouchpointFormModal: React.FC<FormModalProps> = ({ isOpen, onClose, initialData }) => {
    const { addSystemTouchpoint, updateSystemTouchpoint, systemStages, systemFlywheels, systemHubs, systemPeople } = useData();
    const [formData, setFormData] = useState<Partial<SystemTouchpoint>>(getInitialFormData());

    useEffect(() => {
        if (isOpen) {
            setFormData(initialData ? initialData : getInitialFormData());
        }
    }, [initialData, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (initialData) {
            updateSystemTouchpoint(formData as SystemTouchpoint);
        } else {
            addSystemTouchpoint(formData as Omit<SystemTouchpoint, 'touchpoint_id'>);
        }
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Touchpoint' : 'Add Touchpoint'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label>Touchpoint Name</label>
                    <input name="touchpoint_name" value={formData.touchpoint_name} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" required />
                </div>
                <div>
                    <label>Stage</label>
                    <select name="stage_id" value={formData.stage_id} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white">
                        <option value="">-- Select Stage --</option>
                        {systemStages.map(s => <option key={s.stage_id} value={s.stage_id}>{s.stage_name}</option>)}
                    </select>
                </div>
                 <div>
                    <label>Responsible Hub</label>
                    <select name="responsible_hub_id" value={formData.responsible_hub_id} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white">
                        <option value="">-- Select Hub --</option>
                        {systemHubs.map(h => <option key={h.hub_id} value={h.hub_id}>{h.hub_name}</option>)}
                    </select>
                </div>
                 <div>
                    <label>Responsible Person</label>
                    <select name="responsible_person_id" value={formData.responsible_person_id} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white">
                        <option value="">-- Select Person --</option>
{/* FIX: Corrected property 'person_id' to 'user_id' to match the 'SystemPerson' type. */}
                        {systemPeople.map(p => <option key={p.user_id} value={p.user_id}>{p.full_name}</option>)}
                    </select>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save</Button>
                </div>
            </form>
        </Modal>
    );
};

export default SystemTouchpointFormModal;
