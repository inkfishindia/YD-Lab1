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

