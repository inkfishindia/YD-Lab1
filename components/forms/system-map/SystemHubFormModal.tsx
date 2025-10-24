
import React, { useState, useEffect } from 'react';
import { useData } from '../../../contexts/DataContext';
import type { SystemHub } from '../../../types';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: SystemHub | null;
}

const getInitialFormData = (): Omit<SystemHub, 'hub_id'> => ({
    hub_name: '',
    hub_type: '',
    owner_person: '',
});

const SystemHubFormModal: React.FC<FormModalProps> = ({ isOpen, onClose, initialData }) => {
    const { addSystemHub, updateSystemHub, systemPeople } = useData();
    const [formData, setFormData] = useState<Partial<SystemHub>>(getInitialFormData());

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
            updateSystemHub(formData as SystemHub);
        } else {
            addSystemHub(formData as Omit<SystemHub, 'hub_id'>);
        }
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Hub' : 'Add Hub'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label>Hub Name</label>
                    <input name="hub_name" value={formData.hub_name} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" required />
                </div>
                <div>
                    <label>Hub Type</label>
                    <input name="hub_type" value={formData.hub_type} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                </div>
                <div>
                    <label>Owner</label>
                    <select name="owner_person" value={formData.owner_person} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white">
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

export default SystemHubFormModal;
