import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { BusinessUnit, Person, Flywheel } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface BusinessUnitFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<BusinessUnit, 'bu_id'> | BusinessUnit) => void;
  businessUnit: BusinessUnit | null;
}

const getInitialFormData = (people: Person[], flywheels: Flywheel[]): Partial<BusinessUnit> => ({
    businessUnitName: '',
    bu_name: '', // Added for schema compatibility
    coreOffering: '',
    owner_person_id: people[0]?.user_id || '', // Use user_id for owner
    primary_flywheel_id: flywheels[0]?.flywheel_id || '', // Use primary_flywheel_id
    status: 'Active',
    offering_description: '',
    pricingModel: '',
    notes: '',
    bu_type: '', // Added for schema compatibility
    primarySegments: '', // Added for schema compatibility
    flywheelId: '', // Added for schema compatibility (if exists)
    volumeRange: '', // Added for schema compatibility
    primaryOwner: '', // Added for schema compatibility
    nineMonthRevenue: undefined, // Explicitly undefined
    percentRevenue: undefined, // Explicitly undefined
    pricing_model_name: '', // Added for schema compatibility
    validated_aov: undefined, // Explicitly undefined
    sales_motion: '', // Added for schema compatibility
    support_model: '', // Added for schema compatibility
    current_revenue: undefined, // Explicitly undefined
    current_orders: undefined, // Explicitly undefined
    upsell_path: '', // Added for schema compatibility
    serves_segments_ids: [], // Added for schema compatibility
    in_form_of: '', // Added for schema compatibility
    current_utilization_pct: undefined, // Explicitly undefined
    annual_revenue_target_inr: undefined, // Explicitly undefined
    '9mo_actual_revenue_inr': undefined, // Explicitly undefined
    order_volume_range: '', // Added for schema compatibility
});

export const BusinessUnitFormModal: React.FC<BusinessUnitFormModalProps> = ({ isOpen, onClose, onSave, businessUnit }) => {
    const { people, flywheels } = useData();
    const [formData, setFormData] = useState<Partial<BusinessUnit>>(getInitialFormData(people, flywheels));

    useEffect(() => {
        if (isOpen) {
            if (businessUnit) {
                setFormData(businessUnit);
            } else {
                setFormData(getInitialFormData(people, flywheels));
            }
        }
    }, [businessUnit, people, flywheels, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        // FIX: Explicitly cast 'e.target.value' to 'any' to resolve a TypeScript error related to form input types.
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value as string }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(businessUnit ? { ...formData, bu_id: businessUnit.bu_id, businessUnitId: businessUnit.businessUnitId } as BusinessUnit : { ...formData, businessUnitId: `bu_${Date.now()}` } as Omit<BusinessUnit, 'bu_id'>);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={businessUnit ? 'Edit Business Unit' : 'Add Business Unit'}>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-300">Business Unit Name</label>
                    <input type="text" name="bu_name" value={formData.bu_name || ''} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Core Offering</label>
                    <input type="text" name="offering_description" value={formData.offering_description || ''} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Owner</label>
                    <select name="owner_person_id" value={formData.owner_person_id || ''} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" required>
                        {people.map((p: Person) => <option key={p.user_id} value={p.user_id}>{p.full_name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Status</label>
                    <input type="text" name="status" value={formData.status || ''} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Primary Flywheel</label>
                    <select name="primary_flywheel_id" value={formData.primary_flywheel_id || ''} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" required>
                        {flywheels.map(f => <option key={f.flywheel_id} value={f.flywheel_id}>{f.flywheel_name}</option>)}
                    </select>
                </div>
                <div className="col-span-2 flex justify-end space-x-3 pt-4 border-t border-gray-700 mt-4">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save</Button>
                </div>
            </form>
        </Modal>
    );
};