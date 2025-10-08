import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import type { BusinessUnit } from '../../types';
import { Priority, HealthStatus } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface BusinessUnitFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<BusinessUnit, 'bu_id'> | BusinessUnit) => void;
  businessUnit: BusinessUnit | null;
}

const BusinessUnitFormModal: React.FC<BusinessUnitFormModalProps> = ({ isOpen, onClose, onSave, businessUnit }) => {
    const { people, flywheels } = useData();
    const [formData, setFormData] = useState({
        bu_name: '',
        bu_type: '',
        owner_user_id: '',
        health_status: HealthStatus.OnTrack,
        priority_level: Priority.Medium,
        primary_flywheel_id: '',
        upsell_flywheel_id: '',
    });

    useEffect(() => {
        setFormData({
            bu_name: businessUnit?.bu_name || '',
            bu_type: businessUnit?.bu_type || '',
            owner_user_id: businessUnit?.owner_user_id || (people[0]?.user_id || ''),
            health_status: businessUnit?.health_status || HealthStatus.OnTrack,
            priority_level: businessUnit?.priority_level || Priority.Medium,
            primary_flywheel_id: businessUnit?.primary_flywheel_id || (flywheels[0]?.flywheel_id || ''),
            upsell_flywheel_id: businessUnit?.upsell_flywheel_id || '',
        });
    }, [businessUnit, people, flywheels, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(businessUnit ? { ...formData, bu_id: businessUnit.bu_id } : formData);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={businessUnit ? 'Edit Business Unit' : 'Add Business Unit'}>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-300">Business Unit Name</label>
                    <input type="text" name="bu_name" value={formData.bu_name} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">BU Type</label>
                    <input type="text" name="bu_type" value={formData.bu_type} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Owner</label>
                    <select name="owner_user_id" value={formData.owner_user_id} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" required>
                        {people.map(p => <option key={p.user_id} value={p.user_id}>{p.full_name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Health Status</label>
                    <select name="health_status" value={formData.health_status} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white">
                        {Object.values(HealthStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Priority</label>
                    <select name="priority_level" value={formData.priority_level} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white">
                        {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Primary Flywheel</label>
                    <select name="primary_flywheel_id" value={formData.primary_flywheel_id} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" required>
                        {flywheels.map(fw => <option key={fw.flywheel_id} value={fw.flywheel_id}>{fw.flywheel_name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Upsell Flywheel (Optional)</label>
                    <select name="upsell_flywheel_id" value={formData.upsell_flywheel_id} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white">
                        <option value="">None</option>
                        {flywheels.map(fw => <option key={fw.flywheel_id} value={fw.flywheel_id}>{fw.flywheel_name}</option>)}
                    </select>
                </div>
                <div className="col-span-2 flex justify-end space-x-3 pt-4">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save</Button>
                </div>
            </form>
        </Modal>
    );
};

export default BusinessUnitFormModal;
