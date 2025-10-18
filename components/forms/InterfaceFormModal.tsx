import React, { useState, useEffect } from 'react';
import type { Interface, Person, Flywheel, BusinessUnit } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface InterfaceFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Omit<Interface, 'interface_id'> | Interface) => void;
    iface: Interface | null;
    people: Person[];
    flywheels: Flywheel[];
    businessUnits: BusinessUnit[];
}

const getInitialData = (people: Person[], flywheels: Flywheel[]): Omit<Interface, 'interface_id'> => ({
    interface_name: '',
    channel_id: '',
    interface_goal: '',
    interface_category: '',
    interface_type: '',
    platform_id: '',
    bu_ids_served: [],
    flywheel_id: flywheels[0]?.flywheel_id || '',
    interface_owner: people[0]?.user_id || '',
    monthly_budget: 0,
    cost_model: 0,
    avg_cac: 0,
    avg_conversion_rate: 0,
    interface_status: 'Active',
    notes: '',
});

const InterfaceFormModal: React.FC<InterfaceFormModalProps> = ({ isOpen, onClose, onSave, iface, people, flywheels, businessUnits }) => {
    const [formData, setFormData] = useState(getInitialData(people, flywheels));

    useEffect(() => {
        if (isOpen) {
            if (iface) {
                const { interface_id, ...editableData } = iface;
                setFormData(editableData);
            } else {
                setFormData(getInitialData(people, flywheels));
            }
        }
    }, [iface, people, flywheels, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const numericFields = ['monthly_budget', 'cost_model', 'avg_cac', 'avg_conversion_rate'];
        setFormData(prev => ({ ...prev, [name]: numericFields.includes(name) ? parseFloat(value) : value }));
    };

    const handleMultiSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        // FIX: Refactored to use `selectedOptions` which is safer and more direct than iterating all options.
        // Also explicitly types 'option' to resolve potential ambiguity.
        const value = Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value);
        setFormData(prev => ({ ...prev, [e.target.name]: value }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(iface ? { ...formData, interface_id: iface.interface_id } : formData);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={iface ? 'Edit Interface' : 'Add Interface'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Interface Name</label>
                        <input type="text" name="interface_name" value={formData.interface_name} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Category</label>
                        <input type="text" name="interface_category" value={formData.interface_category} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-300">Type</label>
                        <input type="text" name="interface_type" value={formData.interface_type} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Owner</label>
                        <select name="interface_owner" value={formData.interface_owner} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" required>
                            {people.map(p => <option key={p.user_id} value={p.user_id}>{p.full_name}</option>)}
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-300">Flywheel</label>
                        <select name="flywheel_id" value={formData.flywheel_id} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" required>
                            {flywheels.map(f => <option key={f.flywheel_id} value={f.flywheel_id}>{f.flywheel_name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Monthly Budget</label>
                        <input type="number" name="monthly_budget" value={formData.monthly_budget} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Business Units Served</label>
                    <select name="bu_ids_served" multiple value={formData.bu_ids_served} onChange={handleMultiSelectChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white h-32">
                        {businessUnits.map(bu => <option key={bu.bu_id} value={bu.bu_id}>{bu.bu_name}</option>)}
                    </select>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                    <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save</Button>
                </div>
            </form>
        </Modal>
    );
};

export default InterfaceFormModal;
