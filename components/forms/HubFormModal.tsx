import React, { useState, useEffect } from 'react';
import type { Hub, Person, Flywheel } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface HubFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Hub, 'hub_id'> | Hub) => void;
  hub: Hub | null;
  people: Person[];
  flywheels: Flywheel[];
}

const HubFormModal: React.FC<HubFormModalProps> = ({ isOpen, onClose, onSave, hub, people, flywheels }) => {
    const [formData, setFormData] = useState<{
        hub_name: string;
        function_category: string;
        owner_person: string;
        what_they_enable: string;
        serves_flywheel_ids: string[];
        capacity_constraint: boolean;
        hiring_priority: string;
        budget_monthly_inr: number;
        serves_bu1: boolean;
        serves_bu2: boolean;
        serves_bu3: boolean;
        serves_bu4: boolean;
        serves_bu5: boolean;
        serves_bu6: boolean;
        notes: string;
    }>({
        hub_name: '',
        function_category: '',
        owner_person: '',
        what_they_enable: '',
        serves_flywheel_ids: [],
        capacity_constraint: false,
        hiring_priority: 'Low',
        budget_monthly_inr: 0,
        serves_bu1: false,
        serves_bu2: false,
        serves_bu3: false,
        serves_bu4: false,
        serves_bu5: false,
        serves_bu6: false,
        notes: '',
    });

    useEffect(() => {
        if (isOpen) {
            setFormData({
                hub_name: hub?.hub_name || '',
                function_category: hub?.function_category || '',
                owner_person: hub?.owner_person || (people[0]?.user_id || ''),
                what_they_enable: hub?.what_they_enable || '',
                serves_flywheel_ids: hub?.serves_flywheel_ids || [],
                capacity_constraint: hub?.capacity_constraint || false,
                hiring_priority: hub?.hiring_priority || 'Low',
                budget_monthly_inr: hub?.budget_monthly_inr || 0,
                serves_bu1: hub?.serves_bu1 || false,
                serves_bu2: hub?.serves_bu2 || false,
                serves_bu3: hub?.serves_bu3 || false,
                serves_bu4: hub?.serves_bu4 || false,
                serves_bu5: hub?.serves_bu5 || false,
                serves_bu6: hub?.serves_bu6 || false,
                notes: hub?.notes || '',
            });
        }
    }, [hub, people, flywheels, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const isCheckbox = type === 'checkbox';
        
        if (name.startsWith('serves_bu')) {
            setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
        } else if (isCheckbox) {
             setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
        } else if (name === 'budget_monthly_inr') {
            // FIX: Explicitly cast to 'any' for numeric input value.
            setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
        } else {
            // FIX: Explicitly cast to 'any' for general input value.
            setFormData(prev => ({ ...prev, [name]: value as any }));
        }
    };

    const handleFlywheelChange = (flywheelId: string) => {
        setFormData(prev => {
            const currentFlywheels = prev.serves_flywheel_ids;
            if (currentFlywheels.includes(flywheelId)) {
                return { ...prev, serves_flywheel_ids: currentFlywheels.filter(id => id !== flywheelId) };
            } else {
                return { ...prev, serves_flywheel_ids: [...currentFlywheels, flywheelId] };
            }
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(hub ? { ...formData, hub_id: hub.hub_id } : formData);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={hub ? 'Edit Hub' : 'Add Hub'}>
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Hub Name</label>
                        <input type="text" name="hub_name" value={formData.hub_name} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Function Category</label>
                        <input type="text" name="function_category" value={formData.function_category} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Owner</label>
                        <select name="owner_person" value={formData.owner_person} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" required>
                            {people.map(p => <option key={p.user_id} value={p.user_id}>{p.full_name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Monthly Budget (₹)</label>
                        <input type="number" name="budget_monthly_inr" value={formData.budget_monthly_inr} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                    </div>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-300">Serves Flywheels</label>
                    <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2 p-2 bg-gray-900/50 rounded-md border border-gray-700">
                        {flywheels.map(fw => (
                            <label key={fw.flywheel_id} className="flex items-center space-x-2 text-sm text-gray-200">
                                <input
                                    type="checkbox"
                                    checked={formData.serves_flywheel_ids.includes(fw.flywheel_id)}
                                    onChange={() => handleFlywheelChange(fw.flywheel_id)}
                                    className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-600"
                                />
                                <span>{fw.flywheel_name}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300">Serves Business Units</label>
                    <div className="mt-2 grid grid-cols-3 md:grid-cols-6 gap-2">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                             <label key={i} className="flex items-center space-x-2 text-sm text-gray-200">
                                <input
                                    type="checkbox"
                                    name={`serves_bu${i}`}
                                    checked={formData[`serves_bu${i}` as keyof typeof formData] as boolean}
                                    onChange={handleChange}
                                    className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-600"
                                />
                                <span>BU{i}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300">What They Enable</label>
                    <textarea name="what_they_enable" value={formData.what_they_enable} onChange={handleChange} rows={3} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white"></textarea>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-300">Notes</label>
                    <textarea name="notes" value={formData.notes} onChange={handleChange} rows={2} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white"></textarea>
                </div>

                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-300">Hiring Priority</label>
                        <select name="hiring_priority" value={formData.hiring_priority} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white">
                            <option>Low</option>
                            <option>Medium</option>
                            <option>High</option>
                            <option>Critical</option>
                        </select>
                    </div>
                     <div className="flex items-end pb-1">
                        <label className="flex items-center space-x-2 text-sm text-gray-200">
                            <input
                                type="checkbox"
                                name="capacity_constraint"
                                checked={formData.capacity_constraint}
                                onChange={handleChange}
                                className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-600"
                            />
                            <span>Has Capacity Constraint</span>
                        </label>
                    </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700 mt-6">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save Hub</Button>
                </div>
            </form>
        </Modal>
    );
};

export default HubFormModal;