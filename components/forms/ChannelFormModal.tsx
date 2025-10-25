import React, { useState, useEffect } from 'react';
import type { Channel } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface ChannelFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Channel, 'channel_id'> | Channel) => void;
  channel: Channel | null;
}

const getInitialFormData = (): Omit<Channel, 'channel_id'> => ({
    channel_name: '',
    channel_type: '',
    interfaces: '',
    focus: '',
    Platform: '',
    Notes: '',
});

const ChannelFormModal: React.FC<ChannelFormModalProps> = ({ isOpen, onClose, onSave, channel }) => {
    const [formData, setFormData] = useState<Partial<Channel>>(getInitialFormData());

    useEffect(() => {
        if (isOpen) {
            if (channel) {
                setFormData({
                    ...getInitialFormData(),
                    ...channel,
                });
            } else {
                setFormData(getInitialFormData());
            }
        }
    }, [channel, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
// FIX: Explicitly cast 'e.target.value' to 'any' to resolve a TypeScript error related to form input types.
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value as any }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(channel ? { ...formData, channel_id: channel.channel_id } as Channel : formData as Omit<Channel, 'channel_id'>);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={channel ? 'Edit Channel' : 'Add Channel'}>
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                <div>
                    <label className="block text-sm font-medium text-gray-300">Channel Name</label>
                    <input type="text" name="channel_name" value={formData.channel_name || ''} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Channel Type</label>
                    <input type="text" name="channel_type" value={formData.channel_type || ''} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Focus</label>
                    <input type="text" name="focus" value={formData.focus || ''} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Platform</label>
                    <input type="text" name="Platform" value={formData.Platform as string || ''} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Interfaces</label>
                    <input type="text" name="interfaces" value={formData.interfaces as string || ''} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Notes</label>
                    <textarea name="Notes" value={formData.Notes as string || ''} onChange={handleChange} rows={2} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white"></textarea>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700 mt-6">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save Channel</Button>
                </div>
            </form>
        </Modal>
    );
};

export default ChannelFormModal;