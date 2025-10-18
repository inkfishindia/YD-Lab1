import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { usePermissions } from '../../contexts/PermissionsContext';
import type { Role } from '../../types';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { PlusIcon, EditIcon, TrashIcon } from '../../components/Icons';
import RoleFormModal from '../../components/forms/RoleFormModal';

const RoleManagementPage: React.FC = () => {
    const { roles, addRole, updateRole, deleteRole } = useData();
    const { hasPermission } = usePermissions();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);

    const canManageRoles = hasPermission('roles:write');

    const sortedRoles = useMemo(() => {
        return [...roles].sort((a, b) => a.role_name.localeCompare(b.role_name));
    }, [roles]);

    const openModal = (role: Role | null = null) => {
        setEditingRole(role);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setEditingRole(null);
        setIsModalOpen(false);
    };

    const handleSave = (roleData: Role) => {
        // Since the keyField `role_name` might be edited, we rely on `editingRole` to know if it's an update
        if (editingRole) {
            // Note: If you allow editing role_name, the logic becomes more complex.
            // For now, we assume role_name is the key and isn't changed.
            updateRole(roleData);
        } else {
            addRole(roleData);
        }
        closeModal();
    };

    const handleDelete = async (roleName: string) => {
        if (window.confirm(`Are you sure you want to delete the "${roleName}" role? This action cannot be undone.`)) {
            try {
                await deleteRole(roleName);
            } catch (error) {
                console.error("Failed to delete role:", error);
                alert(`Error: ${error instanceof Error ? error.message : String(error)}`);
            }
        }
    };
    
    if (!canManageRoles) {
        return (
            <div className="text-center text-gray-400 p-8">
                <h1 className="text-xl text-white font-semibold">Access Denied</h1>
                <p>You do not have permission to manage roles.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-semibold text-white">Role Management</h1>
                <Button onClick={() => openModal()} className="flex items-center gap-2">
                    <PlusIcon className="w-5 h-5" />
                    Add Role
                </Button>
            </div>
            
            <p className="text-gray-400 mb-6 text-sm">
                Define roles and their permissions. Permissions use the format `resource:action` (e.g., `projects:write`) or wildcards (`*:*` for super admin).
            </p>

            <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-800">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Role Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Permissions</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {sortedRoles.map((role) => (
                            <tr key={role.role_name} className="hover:bg-gray-800">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{role.role_name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex flex-wrap gap-1">
                                        {role.permissions.map(p => <Badge key={p} text={p} colorClass="bg-gray-700 text-gray-300" size="sm" />)}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                    <button onClick={() => openModal(role)} className="text-blue-400 hover:text-blue-300"><EditIcon className="w-5 h-5" /></button>
                                    <button onClick={() => handleDelete(role.role_name)} className="text-red-400 hover:text-red-300"><TrashIcon className="w-5 h-5" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <RoleFormModal 
                isOpen={isModalOpen} 
                onClose={closeModal} 
                onSave={handleSave} 
                role={editingRole} 
            />
        </div>
    );
};

export default RoleManagementPage;
