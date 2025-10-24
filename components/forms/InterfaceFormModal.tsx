

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
    // FIX: Corrected typo from 'Flywheels' to 'Flywheel'.
    flywheels: Flywheel[];
    businessUnits: BusinessUnit[];
}

const getInitialData = (people: Person[], flywheels: Flywheel[]): Partial<Interface> => ({
    interface_name: '',
    interface_category: '',
    interface_type: '',
    serves_flywheels_ids: flywheels[0] ? [flywheels[0].flywheel_id] : [],
    serves_bus_ids: [],
    responsible_person: people[0]?.user_id || '',
    monthly_mau: 0, // Added for InterfaceSchema compatibility
    notes: '',
    monthly_budget: 0, // Added for InterfaceSchema compatibility
    build_status: 'Active', // Added for InterfaceSchema compatibility
    annual_volume: 0, // Added for InterfaceSchema compatibility
    cost_model: '', // Added for InterfaceSchema compatibility
    avg_cac: 0, // Added for InterfaceSchema compatibility
    avg_conversion_rate: 0, // Added for InterfaceSchema compatibility
    tech_stack: '', // Added for InterfaceSchema compatibility
});

const InterfaceFormModal: React.FC<InterfaceFormModalProps> = ({ isOpen, onClose, onSave, iface, people, flywheels, businessUnits }) => {
    const [formData, setFormData] = useState<Partial<Interface>>(getInitialData(people, flywheels));

    useEffect(() => {
        if (isOpen) {
            if (iface) {
                setFormData({
                    ...getInitialData(people, flywheels),
                    ...iface,
                });
            } else {
                setFormData(getInitialData(people, flywheels));
            }
        }
    }, [iface, people, flywheels, businessUnits, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const numericFields = ['monthly_budget', 'monthly_mau', 'annual_volume', 'avg_cac', 'avg_conversion_rate']; // Added missing numeric fields
        setFormData(prev => ({ ...prev, [name]: numericFields.includes(name) ? parseFloat(value) || 0 : value }));
    };

    const handleMultiSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        // FIX: Refactored to use `selectedOptions` which is safer and more direct than iterating all options.
        // Also explicitly types 'option' to resolve potential ambiguity.
        const value = Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value);
        setFormData(prev => ({ ...prev, [e.target.name]: value }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(iface ? { ...formData, interface_id: iface.interface_id } as Interface : formData as Omit<Interface, 'interface_id'>);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={iface ? 'Edit Interface' : 'Add Interface'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Interface Name</label>
                        <input type="text" name="interface_name" value={formData.interface_name || ''} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Category</label>
                        <input type="text" name="interface_category" value={formData.interface_category || ''} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-300">Type</label>
                        <input type="text" name="interface_type" value={formData.interface_type || ''} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Owner</label>
                        <select name="responsible_person" value={formData.responsible_person || ''} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" required>
                            {people.map(p => <option key={p.user_id} value={p.user_id}>{p.full_name}</option>)}
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-300">Flywheel</label>
                        <select name="serves_flywheels_ids" value={formData.serves_flywheels_ids?.[0] || ''} onChange={(e) => setFormData(p => ({...p, serves_flywheels_ids: [e.target.value]}))} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" required>
                            {flywheels.map(f => <option key={f.flywheel_id} value={f.flywheel_id}>{f.flywheel_name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Monthly Budget</label>
                        <input type="number" name="monthly_budget" value={formData.monthly_budget || 0} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Business Units Served</label>
                    <select name="serves_bus_ids" multiple value={formData.serves_bus_ids || []} onChange={handleMultiSelectChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white h-32">
                        {businessUnits.map(bu => <option key={bu.bu_id} value={bu.bu_id}>{bu.bu_name}</option>)}
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Monthly MAU</label>
                        <input type="number" name="monthly_mau" value={formData.monthly_mau || 0} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Annual Volume</label>
                        <input type="number" name="annual_volume" value={formData.annual_volume || 0} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Cost Model</label>
                        <input type="text" name="cost_model" value={formData.cost_model || ''} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Avg. CAC</label>
                        <input type="number" name="avg_cac" value={formData.avg_cac || 0} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Avg. Conversion Rate</label>
                        <input type="number" name="avg_conversion_rate" value={formData.avg_conversion_rate || 0} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Tech Stack</label>
                        <input type="text" name="tech_stack" value={formData.tech_stack || ''} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Build Status</label>
                    <input type="text" name="build_status" value={formData.build_status || ''} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Notes</label>
                    <textarea name="notes" value={formData.notes || ''} onChange={handleChange} rows={3} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
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
