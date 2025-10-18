import React, { useState, useEffect } from 'react';
import { useData } from '../../../contexts/DataContext';
import type { SystemBusinessUnit } from '../../../types';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: SystemBusinessUnit | null;
}

const getInitialFormData = (): Omit<SystemBusinessUnit, 'bu_id'> => ({
    bu_name: '',
    bu_type: '',
    in_form_of: '',
    owner_person: '',
    primary_flywheel: '',
    serves_segment: '',
    offering_description: '',
});

const SystemBusinessUnitFormModal: React.FC<FormModalProps> = ({ isOpen, onClose, initialData }) => {
    const { addSystemBusinessUnit, updateSystemBusinessUnit, systemPeople, systemFlywheels, systemSegments } = useData();
    const [formData, setFormData] = useState<Partial<SystemBusinessUnit>>(getInitialFormData());

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
            updateSystemBusinessUnit(formData as SystemBusinessUnit);
        } else {
            addSystemBusinessUnit(formData as Omit<SystemBusinessUnit, 'bu_id'>);
        }
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Business Unit' : 'Add Business Unit'}>
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-4">
                <div>
                    <label>Business Unit Name</label>
                    <input name="bu_name" value={formData.bu_name} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" required />
                </div>
                 <div>
                    <label>BU Type</label>
                    <input name="bu_type" value={formData.bu_type} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                </div>
                <div>
                    <label>In Form Of</label>
                    <input name="in_form_of" value={formData.in_form_of} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                </div>
                <div>
                    <label>Owner</label>
                    <select name="owner_person" value={formData.owner_person} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white">
                        <option value="">-- Select Owner --</option>
                        {systemPeople.map(p => <option key={p.person_id} value={p.person_id}>{p.full_name}</option>)}
                    </select>
                </div>
                 <div>
                    <label>Primary Flywheel</label>
                    <select name="primary_flywheel" value={formData.primary_flywheel} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white">
                        <option value="">-- Select Flywheel --</option>
                        {systemFlywheels.map(f => <option key={f.flywheel_id} value={f.flywheel_id}>{f.flywheel_name}</option>)}
                    </select>
                </div>
                 <div>
                    <label>Serves Segment</label>
                    <select name="serves_segment" value={formData.serves_segment} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white">
                        <option value="">-- Select Segment --</option>
                        {systemSegments.map(s => <option key={s.segment_id} value={s.segment_id}>{s.segment_name}</option>)}
                    </select>
                </div>
                 <div>
                    <label>Offering Description</label>
                    <textarea name="offering_description" value={formData.offering_description} onChange={handleChange} rows={3} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save</Button>
                </div>
            </form>
        </Modal>
    );
};

export default SystemBusinessUnitFormModal;
