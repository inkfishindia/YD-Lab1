
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

const getInitialFormData = (flywheels: Flywheel[]): Omit<CustomerSegment, 'segment_id'> => ({
// FIX: Added 'segment_id' and replaced 'customer_segment' with 'segment_name' to align with the CustomerSegment type.
    segmentId: `seg_${Date.now()}`,
    segmentName: '',
    segment_id: `seg_${Date.now()}`,
    segment_name: '',
    Promise: '',
    psychological_job: '',
    behavioral_truth: '',
    brand_position: '',
    messaging_tone: '',
    design_pov: '',
    served_by_flywheels_ids: flywheels[0] ? [flywheels[0].flywheel_id] : [],
    // Added for compatibility with schema, default to empty
    owner_person_id: '',
    vision: '',
    mission: '',
    expression: '',
    market_category: '',
    differentiated_value: '',
    For: '',
    Against: '',
    category_entry_points: '',
    buying_situations: '',
    distinctive_assets: '',
    competitive_alt_1: '',
    competitive_alt_2: '',
    competitive_alt_3: '',
    'age group': '',
    company_size: '',
    psychographic: '',
    purchase_trigger_1: '',
    purchase_trigger_2: '',
    purchase_trigger_3: '',
    current_solution_efficiency: '',
    our_solution_efficiency: '',
    delta_score: '',
    adoption_threshold: '',
    irreversibility_trigger: '',
    old_world_pain: '',
    new_world_gain: '',
    strategic_notes: '',
    Platforms: '',
    revenue_9mo_actual_inr: undefined,
    current_customers: undefined,
    ltv_cac_ratio: '',
    validated_cac: '',
    validated_aov: undefined,
    priority_rank: '',
    customer_profile: '',
    nineMonthRevenue: undefined,
    percentRevenue: undefined,
    status: '',
    bu_id: '',
});

const CustomerSegmentFormModal: React.FC<CustomerSegmentFormModalProps> = ({ isOpen, onClose, onSave, segment, flywheels }) => {
    const [formData, setFormData] = useState<Partial<CustomerSegment>>(getInitialFormData(flywheels));

    useEffect(() => {
        if (isOpen) {
            setFormData(segment ? segment : getInitialFormData(flywheels));
        }
    }, [segment, flywheels, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as CustomerSegment);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={segment ? 'Edit Customer Segment' : 'Add Customer Segment'}>
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                <div>
                    <label className="block text-sm font-medium text-gray-300">Customer Segment Name</label>
{/* FIX: Changed 'customer_segment' to 'segment_name' to match the type definition. */}
                    <input type="text" name="segment_name" value={formData.segment_name || ''} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Promise</label>
                        <input type="text" name="Promise" value={formData.Promise || ''} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Flywheel</label>
                        <select name="served_by_flywheels_ids" value={formData.served_by_flywheels_ids?.[0] || ''} onChange={(e) => setFormData(p => ({...p, served_by_flywheels_ids: [e.target.value]}))} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" required>
                            {flywheels.map(f => <option key={f.flywheel_id} value={f.flywheel_id}>{f.flywheel_name}</option>)}
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Vision</label>
{/* FIX: Corrected property name from 'vission' to 'vision' to match the schema. */}
                    <textarea name="vision" value={formData.vision || ''} onChange={handleChange} rows={2} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white"></textarea>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-300">Mission</label>
                    <textarea name="mission" value={formData.mission || ''} onChange={handleChange} rows={2} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white"></textarea>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-300">Psychological Job-to-be-Done</label>
{/* FIX: Corrected property name from 'psychological_job_to_be_done' to 'psychological_job' to match the schema. */}
                    <input type="text" name="psychological_job" value={formData.psychological_job || ''} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Behavioral Truth</label>
                    <input type="text" name="behavioral_truth" value={formData.behavioral_truth || ''} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-300">Messaging Tone</label>
                        <input type="text" name="messaging_tone" value={formData.messaging_tone || ''} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-300">Design POV</label>
                        <input type="text" name="design_pov" value={formData.design_pov || ''} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
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
