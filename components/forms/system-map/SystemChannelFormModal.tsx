import React, { useState, useEffect } from 'react';
import { useData } from '../../../contexts/DataContext';
import type { SystemChannel } from '../../../types';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: SystemChannel | null;
}

const getInitialFormData = (): Omit<SystemChannel, 'channel_id'> => ({
    channel_name: '',
    channel_type: '',
    responsible_person: '',
});

const SystemChannelFormModal: React.FC<FormModalProps> = ({ isOpen, onClose, initialData }) => {
    const { addSystemChannel, updateSystemChannel, systemPeople } = useData();
    const [formData, setFormData] = useState<Partial<SystemChannel>>(getInitialFormData());

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
            updateSystemChannel(formData as SystemChannel);
        } else {
            addSystemChannel(formData as Omit<SystemChannel, 'channel_id'>);
        }
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Channel' : 'Add Channel'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label>Channel Name</label>
                    <input name="channel_name" value={formData.channel_name} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" required />
                </div>
                 <div>
                    <label>Channel Type</label>
                    <input name="channel_type" value={formData.channel_type} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                </div>
                <div>
                    <label>Responsible Person</label>
                    <select name="responsible_person" value={formData.responsible_person} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white">
                        <option value="">-- Select Person --</option>
                        {systemPeople.map(p => <option key={p.person_id} value={p.person_id}>{p.full_name}</option>)}
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

export default SystemChannelFormModal;