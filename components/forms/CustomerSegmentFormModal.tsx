import React, { useState, useEffect } from 'react';
import type { CustomerSegment, Flywheel } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface CustomerSegmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CustomerSegment) => void;
  segment: CustomerSegment | null;
  flywheels: Flywheel[];
}

const getInitialData = (flywheels: Flywheel[]): CustomerSegment => ({
    customer_segment: '',
    purpose: '',
    vission: '',
    mission: '',
    expression: '',
    psychological_job_to_be_done: '',
    behavioral_truth: '',
    brand_position_for_them: '',
    messaging_tone: '',
    design_pov: '',
    flywheel_id: flywheels[0]?.flywheel_id || '',
});

const CustomerSegmentFormModal: React.FC<CustomerSegmentFormModalProps> = ({ isOpen, onClose, onSave, segment, flywheels }) => {
    const [formData, setFormData] = useState<CustomerSegment>(getInitialData(flywheels));

    useEffect(() => {
        if (isOpen) {
            setFormData(segment ? segment : getInitialData(flywheels));
        }
    }, [segment, flywheels, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={segment ? 'Edit Customer Segment' : 'Add Customer Segment'}>
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                <div>
                    <label className="block text-sm font-medium text-gray-300">Customer Segment Name</label>
                    <input type="text" name="customer_segment" value={formData.customer_segment} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" required readOnly={!!segment} />
                    {!!segment && <p className="text-xs text-gray-500 mt-1">The segment name cannot be changed as it is the unique identifier.</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Purpose</label>
                        <input type="text" name="purpose" value={formData.purpose} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Flywheel</label>
                        <select name="flywheel_id" value={formData.flywheel_id} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" required>
                            {flywheels.map(f => <option key={f.flywheel_id} value={f.flywheel_id}>{f.flywheel_name}</option>)}
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Vision</label>
                    <textarea name="vission" value={formData.vission} onChange={handleChange} rows={2} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white"></textarea>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-300">Mission</label>
                    <textarea name="mission" value={formData.mission} onChange={handleChange} rows={2} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white"></textarea>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-300">Psychological Job-to-be-Done</label>
                    <input type="text" name="psychological_job_to_be_done" value={formData.psychological_job_to_be_done} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Behavioral Truth</label>
                    <input type="text" name="behavioral_truth" value={formData.behavioral_truth} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-300">Messaging Tone</label>
                        <input type="text" name="messaging_tone" value={formData.messaging_tone} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-300">Design POV</label>
                        <input type="text" name="design_pov" value={formData.design_pov} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
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

export default CustomerSegmentFormModal;
