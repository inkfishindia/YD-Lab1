
import React, { useState, useEffect } from 'react';
import { useData } from '../../../contexts/DataContext';
import type { SystemPerson } from '../../../types';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: SystemPerson | null;
}

// FIX: Corrected Omit type to use 'user_id' instead of 'person_id' and added user_id to initial data.
const getInitialFormData = (): Omit<SystemPerson, 'user_id'> => ({
    full_name: '',
    role: '',
    primary_hub: '',
    email: '',
});

const SystemPersonFormModal: React.FC<FormModalProps> = ({ isOpen, onClose, initialData }) => {
    const { addSystemPerson, updateSystemPerson, systemHubs } = useData();
    const [formData, setFormData] = useState<Partial<SystemPerson>>(getInitialFormData());

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
            updateSystemPerson(formData as SystemPerson);
        } else {
            addSystemPerson(formData as Omit<SystemPerson, 'user_id'>);
        }
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Person' : 'Add Person'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label>Full Name</label>
                    <input name="full_name" value={formData.full_name} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" required />
                </div>
                 <div>
                    <label>Role</label>
                    <input name="role" value={formData.role} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                </div>
                <div>
                    <label>Primary Hub</label>
                    <select name="primary_hub" value={formData.primary_hub} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white">
                        <option value="">-- Select Hub --</option>
                        {systemHubs.map(h => <option key={h.hub_id} value={h.hub_id}>{h.hub_name}</option>)}
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

export default SystemPersonFormModal;
