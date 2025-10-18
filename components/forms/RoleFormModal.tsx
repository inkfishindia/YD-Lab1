import React, { useState, useEffect } from 'react';
import type { Role } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface RoleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Role) => void;
  role: Role | null;
}

const RoleFormModal: React.FC<RoleFormModalProps> = ({ isOpen, onClose, onSave, role }) => {
    const [formData, setFormData] = useState({
        role_name: '',
        permissions: '',
    });

    useEffect(() => {
        if (isOpen) {
            setFormData({
                role_name: role?.role_name || '',
                permissions: role?.permissions.join(', ') || '',
            });
        }
    }, [role, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const permissionsArray = formData.permissions.split(',').map(p => p.trim()).filter(Boolean);
        onSave({
            role_name: formData.role_name,
            permissions: permissionsArray,
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={role ? 'Edit Role' : 'Add Role'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="role_name" className="block text-sm font-medium text-gray-300">Role Name</label>
                    <input
                        type="text"
                        name="role_name"
                        value={formData.role_name}
                        onChange={handleChange}
                        className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white disabled:bg-gray-800 disabled:text-gray-400"
                        required
                        disabled={!!role} // Prevent editing the key field
                    />
                    {!!role && <p className="text-xs text-gray-500 mt-1">Role name cannot be changed.</p>}
                </div>
                <div>
                    <label htmlFor="permissions" className="block text-sm font-medium text-gray-300">Permissions (comma-separated)</label>
                    <textarea
                        name="permissions"
                        value={formData.permissions}
                        onChange={handleChange}
                        rows={4}
                        className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white"
                        placeholder="e.g., *:*, projects:read, tasks:write"
                    />
                     <p className="text-xs text-gray-500 mt-1">
                        Use `resource:action` or `*:*` for super admin.
                    </p>
                </div>
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save</Button>
                </div>
            </form>
        </Modal>
    );
};

export default RoleFormModal;
