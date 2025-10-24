

import React, { useState, useEffect } from 'react';
import type { Flywheel, Hub, CustomerSegment } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface FlywheelFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Flywheel, 'flywheel_id'> | Flywheel) => void;
  flywheel: Flywheel | null;
  hubs: Hub[];
  customerSegments: CustomerSegment[];
}

const getInitialData = (segments: CustomerSegment[]): Omit<Flywheel, 'flywheel_id'> => ({
    flywheel_name: '',
// FIX: Changed initial value of 'serves_segments' to an empty array to match its 'string[]' type.
    serves_segments: segments[0] ? [segments[0].segment_id] : [],
    motion_sequence: '',
    owner_person: '',
    primary_channels: [],
    order_size_range: '',
    hub_dependencies: [],
    efficiency_metrics: [],
    annual_revenue_target_inr: 0,
    annual_orders_target: 0,
    cac_target: '',
    validated_aov_inr: 0,
    conversion_rate_pct: 0,
    description: '',
    interface: '',
});

const FlywheelFormModal: React.FC<FlywheelFormModalProps> = ({ isOpen, onClose, onSave, flywheel, hubs, customerSegments }) => {
    const [formData, setFormData] = useState<Partial<Flywheel>>(getInitialData(customerSegments));

    useEffect(() => {
        if (isOpen) {
            if (flywheel) {
                setFormData({
                    ...getInitialData(customerSegments),
                    ...flywheel,
                });
            } else {
                setFormData(getInitialData(customerSegments));
            }
        }
    }, [flywheel, customerSegments, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const numericFields = ['annual_revenue_target_inr', 'annual_orders_target', 'validated_aov_inr', 'conversion_rate_pct'];
        if (name === 'serves_segments') {
            // FIX: Correctly handle serves_segments as a string array
            setFormData(prev => ({ ...prev, serves_segments: value.split(',').map(s => s.trim()).filter(Boolean) }));
        } else if (numericFields.includes(name)) {
            // FIX: Explicitly cast to 'any' for numeric input value.
            setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
        } else {
            // FIX: Explicitly cast to 'any' for general input value.
            setFormData(prev => ({ ...prev, [name]: value as any }));
        }
    };
    
    const handleMultiSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        // FIX: Explicitly type the 'option' parameter to resolve ambiguity in some TypeScript configurations.
        const options = Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value);
        setFormData(prev => ({...prev, [e.target.name]: options}));
    };
    
    const handleArrayStringChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value.split(',').map(s => s.trim())}));
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(flywheel ? { ...formData, flywheel_id: flywheel.flywheel_id } as Flywheel : formData as Omit<Flywheel, 'flywheel_id'>);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={flywheel ? 'Edit Flywheel' : 'Add Flywheel'}>
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Flywheel Name</label>
                        <input type="text" name="flywheel_name" value={formData.flywheel_name || ''} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Customer Segment</label>
                        <select name="serves_segments" value={formData.serves_segments?.[0] || ''} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" required>
{/* FIX: Changed 'customer_segment' to 'segment_id' for the key and 'segment_name' for the value and display text. */}
                           {customerSegments.map(s => <option key={s.segment_id} value={s.segment_id}>{s.segment_name}</option>)}
                        </select>
                    </div>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-300">Description</label>
                    <textarea name="description" value={formData.description || ''} onChange={handleChange} rows={2} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Motion Sequence</label>
                        <input type="text" name="motion_sequence" value={formData.motion_sequence || ''} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Interface</label>
                        <input type="text" name="interface" value={formData.interface || ''} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Owner</label>
                    <select name="owner_person" value={formData.owner_person || ''} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" required>
                        {hubs.map(h => <option key={h.hub_id} value={h.primaryOwner}>{h.primaryOwner}</option>)}
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Annual Revenue Target (INR)</label>
                        <input type="number" name="annual_revenue_target_inr" value={formData.annual_revenue_target_inr || 0} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Annual Orders Target</label>
                        <input type="number" name="annual_orders_target" value={formData.annual_orders_target || 0} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">CAC Target</label>
                        <input type="text" name="cac_target" value={formData.cac_target || ''} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Validated AOV (INR)</label>
                        <input type="number" name="validated_aov_inr" value={formData.validated_aov_inr || 0} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Conversion Rate (%)</label>
                    <input type="number" name="conversion_rate_pct" value={formData.conversion_rate_pct || 0} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                </div>
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700 mt-6">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save</Button>
                </div>
            </form>
        </Modal>
    );
};

export default FlywheelFormModal;