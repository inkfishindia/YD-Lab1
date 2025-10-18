import React, { useState, useEffect } from 'react';
import { useData } from '../../../contexts/DataContext';
import type { SystemInterface } from '../../../types';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: SystemInterface | null;
}

const getInitialFormData = (): Omit<SystemInterface, 'interface_id'> => ({
    interface_name: '',
    interface_type: '',
    responsible_person: '',
    owned_by_hub: '',
});

const SystemInterfaceFormModal: React.FC<FormModalProps> = ({ isOpen, onClose, initialData }) => {
    const { addSystemInterface, updateSystemInterface, systemPeople, systemHubs } = useData();
    const [formData, setFormData] = useState<Partial<SystemInterface>>(getInitialFormData());

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
            updateSystemInterface(formData as SystemInterface);
        } else {
            addSystemInterface(formData as Omit<SystemInterface, 'interface_id'>);
        }
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Interface' : 'Add Interface'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label>Interface Name</label>
                    <input name="interface_name" value={formData.interface_name} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" required />
                </div>
                 <div>
                    <label>Interface Type</label>
                    <input name="interface_type" value={formData.interface_type} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                </div>
                 <div>
                    <label>Responsible Person</label>
                    <select name="responsible_person" value={formData.responsible_person} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white">
                        <option value="">-- Select Person --</option>
                        {systemPeople.map(p => <option key={p.person_id} value={p.person_id}>{p.full_name}</option>)}
                    </select>
                </div>
                 <div>
                    <label>Owned by Hub</label>
                    <select name="owned_by_hub" value={formData.owned_by_hub} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white">
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

export default SystemInterfaceFormModal;