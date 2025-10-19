import React, { useState, useEffect } from 'react';
import { useData } from '../../../contexts/DataContext';
import type { SystemSegment } from '../../../types';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: SystemSegment | null;
}

const getInitialFormData = (): Omit<SystemSegment, 'segment_id'> => ({
    segment_name: '',
    priority_rank: '1',
    customer_profile: '',
    psychological_job: '',
    served_by_flywheels: [],
    behavioral_truth: '',
    validated_aov: 0,
    annual_orders: 0,
    validated_cac: '',
    validation_status: 'EMERGING',
    owner_person: '',
    strategic_notes: '',
    revenue_9mo_actual_inr: 0,
    '9mo_actual_orders': 0,
    served_by_bus: [],
});

const SystemSegmentFormModal: React.FC<FormModalProps> = ({ isOpen, onClose, initialData }) => {
    const { addSystemSegment, updateSystemSegment, systemPeople } = useData();
    const [formData, setFormData] = useState<Partial<SystemSegment>>(getInitialFormData());

    useEffect(() => {
        if (isOpen) {
            setFormData(initialData ? initialData : getInitialFormData());
        }
    }, [initialData, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const numericFields = ['validated_aov', 'annual_orders', 'validated_cac', 'revenue_9mo_actual_inr', '9mo_actual_orders', 'ltv_cac_ratio', 'annual_ltv'];
        setFormData(prev => ({ ...prev, [name]: numericFields.includes(name) ? parseFloat(value) || 0 : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (initialData) {
            updateSystemSegment(formData as SystemSegment);
        } else {
            addSystemSegment(formData as Omit<SystemSegment, 'segment_id'>);
        }
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Segment' : 'Add Segment'}>
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-4">
                <div>
                    <label>Segment Name</label>
                    <input name="segment_name" value={formData.segment_name} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" required />
                </div>
                 <div>
                    <label>Owner</label>
                    <select name="owner_person" value={formData.owner_person} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white">
                        <option value="">-- Select Owner --</option>
                        {systemPeople.map(p => <option key={p.person_id} value={p.person_id}>{p.full_name}</option>)}
                    </select>
                </div>
                 <div>
                    <label>Customer Profile</label>
                    <textarea name="customer_profile" value={formData.customer_profile} onChange={handleChange} rows={3} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                </div>
                 <div>
                    <label>Strategic Notes</label>
                    <textarea name="strategic_notes" value={formData.strategic_notes} onChange={handleChange} rows={3} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save</Button>
                </div>
            </form>
        </Modal>
    );
};

export default SystemSegmentFormModal;