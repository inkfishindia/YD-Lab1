
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

const ChannelFormModal: React.FC<ChannelFormModalProps> = ({ isOpen, onClose, onSave, channel }) => {
    const [formData, setFormData] = useState({
        channel_name: '',
        channel_type: '',
        interfaces: '',
        focus: '',
    });

    useEffect(() => {
        if (isOpen) {
            setFormData({
                channel_name: channel?.channel_name || '',
                channel_type: channel?.channel_type || '',
                interfaces: channel?.interfaces || '',
                focus: channel?.focus || '',
            });
        }
    }, [channel, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(channel ? { ...formData, channel_id: channel.channel_id } : formData);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={channel ? 'Edit Channel' : 'Add Channel'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Channel Name</label>
                        <input type="text" name="channel_name" value={formData.channel_name} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Channel Type</label>
                        <input type="text" name="channel_type" value={formData.channel_type} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Interfaces (comma-separated IDs)</label>
                        <input type="text" name="interfaces" value={formData.interfaces} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Focus</label>
                        <input type="text" name="focus" value={formData.focus} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                    </div>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                    <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save</Button>
                </div>
            </form>
        </Modal>
    );
};

export default ChannelFormModal;