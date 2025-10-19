import React, { useState, useEffect } from 'react';

import type { Role } from '../../types';
import Button from '../ui/Button';
import Modal from '../ui/Modal';

interface RoleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Role) => void;
  role: Role | null; // Keep for consistency, but will be null for new roles
}

const RoleFormModal: React.FC<RoleFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  role,
}) => {
  const [roleName, setRoleName] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Reset form when opening
      setRoleName(role?.role_name || '');
    }
  }, [role, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Create a new role with an empty permissions array.
    // Permissions will be configured in the main page UI.
    onSave({
      role_name: roleName,
      permissions: [],
    });
    setRoleName('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={role ? 'Edit Role' : 'Add New Role'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="role_name"
            className="block text-sm font-medium text-gray-300"
          >
            Role Name
          </label>
          <input
            type="text"
            name="role_name"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white disabled:bg-gray-800 disabled:text-gray-400"
            required
            // Role name is a key, so it should not be editable.
            disabled={!!role}
          />
          {!!role && (
            <p className="text-xs text-gray-500 mt-1">
              Role name cannot be changed as it's the primary key.
            </p>
          )}
        </div>
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Modal>
  );
};

export default RoleFormModal;
