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
    customer_type: segments[0]?.customer_segment || '',
    description: '',
    motion: '',
    interface: '',
    customer_acquisition_motion: '',
    notes: '',
    primary_channels: [],
    order_size: '',
    hub_dependencies: [],
    key_metrics: [],
    revenue_driver: 0,
    revenue_model: 0,
    what_drives_growth: '',
    economics: [],
    target_revenue: 0,
    target_orders: 0,
    avg_cac: 0,
    avg_ltv: 0,
    conversion_rate_pct: 0,
});

const FlywheelFormModal: React.FC<FlywheelFormModalProps> = ({ isOpen, onClose, onSave, flywheel, hubs, customerSegments }) => {
    const [formData, setFormData] = useState(getInitialData(customerSegments));

    useEffect(() => {
        if (isOpen) {
            if (flywheel) {
                const { flywheel_id, ...editableData } = flywheel;
                setFormData(editableData);
            } else {
                setFormData(getInitialData(customerSegments));
            }
        }
    }, [flywheel, customerSegments, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const numericFields = ['target_revenue', 'target_orders', 'avg_cac', 'avg_ltv', 'conversion_rate_pct', 'revenue_driver', 'revenue_model'];
        if (numericFields.includes(name)) {
            setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
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
        onSave(flywheel ? { ...formData, flywheel_id: flywheel.flywheel_id } : formData);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={flywheel ? 'Edit Flywheel' : 'Add Flywheel'}>
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Flywheel Name</label>
                        <input type="text" name="flywheel_name" value={formData.flywheel_name} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Customer Segment</label>
                        <select name="customer_type" value={formData.customer_type} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" required>
                           {customerSegments.map(s => <option key={s.customer_segment} value={s.customer_segment}>{s.customer_segment}</option>)}
                        </select>
                    </div>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-300">Description</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} rows={2} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Motion</label>
                        <input type="text" name="motion" value={formData.motion} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Interface</label>
                        <input type="text" name="interface" value={formData.interface} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Primary Channels (comma-separated)</label>
                    <input type="text" name="primary_channels" value={formData.primary_channels.join(', ')} onChange={handleArrayStringChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Hub Dependencies</label>
                    <select name="hub_dependencies" multiple value={formData.hub_dependencies} onChange={handleMultiSelectChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white h-24">
                        {hubs.map(h => <option key={h.hub_id} value={h.hub_id}>{h.hub_name}</option>)}
                    </select>
                </div>
                 <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Target Revenue</label>
                        <input type="number" name="target_revenue" value={formData.target_revenue} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Target Orders</label>
                        <input type="number" name="target_orders" value={formData.target_orders} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-300">Avg. CAC</label>
                        <input type="number" name="avg_cac" value={formData.avg_cac} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                    </div>
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
