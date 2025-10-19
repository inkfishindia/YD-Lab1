import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import type { BrainDump } from '../../types';
import { Priority } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface BrainDumpFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<BrainDump, 'braindump_id'> | BrainDump) => void;
  item: BrainDump | null;
}

const BrainDumpFormModal: React.FC<BrainDumpFormModalProps> = ({ isOpen, onClose, onSave, item }) => {
    const { currentUser } = useAuth();
    // FIX: Explicitly type the useState hook to prevent type inference issues.
    const [formData, setFormData] = useState<{
        type: string;
        content: string;
        priority: Priority;
    }>({
        type: '',
        content: '',
        priority: Priority.Medium,
    });

    useEffect(() => {
      if (isOpen) {
        setFormData({
            type: item?.type || '',
            content: item?.content || '',
            priority: item?.priority || Priority.Medium,
        });
      }
    }, [item, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value as any }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) {
            alert("You must be signed in to add an item.");
            return;
        }

        const submissionData = {
            ...formData,
            timestamp: item?.timestamp || new Date().toISOString(),
            user_email: item?.user_email || currentUser.email,
        };

        onSave(item ? { ...submissionData, braindump_id: item.braindump_id } : submissionData);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={item ? 'Edit BrainDump Item' : 'Add BrainDump Item'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-300">Type</label>
                        <input type="text" name="type" placeholder="e.g., Idea, Feedback, Note" value={formData.type} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" required />
                    </div>
                    <div>
                        <label htmlFor="priority" className="block text-sm font-medium text-gray-300">Priority</label>
                        <select name="priority" value={formData.priority} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white">
                            {/* FIX: Explicitly type 'p' to resolve type inference issue. */}
                            {Object.values(Priority).map((p: Priority) => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                </div>
                <div>
                    <label htmlFor="content" className="block text-sm font-medium text-gray-300">Content</label>
                    <textarea name="content" value={formData.content} onChange={handleChange} rows={5} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" required />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                    <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save</Button>
                </div>
            </form>
        </Modal>
    );
};

export default BrainDumpFormModal;
