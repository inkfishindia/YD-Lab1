import React, { useState, useEffect, useMemo } from 'react';

import { PlusIcon } from '../../components/Icons';
import Button from '../../components/ui/Button';
import RoleFormModal from '../../components/forms/RoleFormModal';
import { useData } from '../../contexts/DataContext';
import { usePermissions } from '../../contexts/PermissionsContext';
import type { Role } from '../../types';

// --- Application Module Structure ---
interface Module {
  name: string;
  key: string;
  subModules?: Module[];
}

const appModules: Module[] = [
  {
    name: 'Command Center',
    key: 'command-center',
    subModules: [
      { name: 'Dashboard', key: 'dashboard' },
      { name: 'Executive Dashboard', key: 'executive-dashboard' },
    ],
  },
  {
    name: 'Execution',
    key: 'execution',
    subModules: [{ name: 'Programs View', key: 'programs' }],
  },
  {
    name: 'Marketing',
    key: 'marketing',
    subModules: [
      { name: 'Campaigns', key: 'campaigns' },
      { name: 'Content Pipeline', key: 'content' },
      { name: 'Interfaces', key: 'interfaces' },
    ],
  },
  {
    name: 'Creative',
    key: 'creative',
    subModules: [
      { name: 'YDC Map', key: 'ydc-map' },
      { name: 'Competitor Analysis', key: 'competitor-analysis' },
      { name: 'Visual Mood', key: 'visual-mood' },
      { name: 'Experience Store', key: 'experience-store' },
      { name: 'Customer Journey', key: 'customer-journey' },
    ],
  },
  {
    name: 'Revenue',
    key: 'revenue',
    subModules: [
      { name: 'Leads', key: 'leads' },
      { name: 'Opportunities', key: 'opportunities' },
      { name: 'Accounts', key: 'accounts' },
      { name: 'Products', key: 'products' },
    ],
  },
  {
    name: 'Strategy',
    key: 'strategy',
    subModules: [
      { name: 'System Map', key: 'system-map' },
      { name: 'Positioning', key: 'positioning' },
      { name: 'Business Units', key: 'business-units' },
      { name: 'Metrics & KPIs', key: 'metrics' },
      { name: 'Strategic Briefs', key: 'briefs' },
    ],
  },
  {
    name: 'Tools',
    key: 'tools',
    subModules: [
      { name: 'BrainDump', key: 'braindump' },
      { name: 'AI Assistant', key: 'ai-assistant' },
      { name: 'Inbox', key: 'inbox' },
      { name: 'Calendar', key: 'calendar' },
      { name: 'Notes & Docs', key: 'notes' },
    ],
  },
  {
    name: 'Admin',
    key: 'admin',
    subModules: [
      { name: 'Platforms & Integrations', key: 'integrations' },
      { name: 'Sheet Health Check', key: 'health-check' },
      { name: 'Hubs & Functions', key: 'hubs' },
      { name: 'Financial Tracking', key: 'financials' },
      { name: 'Delegation Workflows', key: 'workflows' },
    ],
  },
];

// --- Types and Helpers for Permission Management ---
type PermissionLevel = 'none' | 'read' | 'write';
type EditedPermissions = Record<string, PermissionLevel>;

const parsePermissions = (permissions: string[]): EditedPermissions => {
  const state: EditedPermissions = {};
  permissions.forEach((p) => {
    const [resource, action] = p.split(':');
    if (action === '*' || action === 'write') {
      state[resource] = 'write';
    } else if (action === 'read' && state[resource] !== 'write') {
      state[resource] = 'read';
    }
  });

  if (state['*'] === 'write') {
    const allKeys: string[] = [];
    const collectKeys = (modules: Module[]) => {
      modules.forEach((m) => {
        allKeys.push(m.key);
        if (m.subModules) collectKeys(m.subModules);
      });
    };
    collectKeys(appModules);
    allKeys.forEach((key) => (state[key] = 'write'));
  }
  return state;
};

const buildPermissions = (state: EditedPermissions): string[] => {
  const permissions: string[] = [];
  Object.entries(state).forEach(([resource, level]) => {
    if (level === 'write') {
      permissions.push(`${resource}:write`);
      permissions.push(`${resource}:read`); // Write implies read
    } else if (level === 'read') {
      permissions.push(`${resource}:read`);
    }
  });
  // Deduplicate and return
  return [...new Set(permissions)];
};

const PermissionControl: React.FC<{
  permissionKey: string;
  level: PermissionLevel;
  onChange: (level: PermissionLevel) => void;
  disabled: boolean;
}> = ({ permissionKey, level, onChange, disabled }) => {
  const levels: { value: PermissionLevel; label: string }[] = [
    { value: 'none', label: 'No Access' },
    { value: 'read', label: 'View Only' },
    { value: 'write', label: 'Full Access' },
  ];
  const baseId = `perm-${permissionKey.replace(/\s+/g, '-')}`;
  return (
    <fieldset className="flex items-center space-x-4" disabled={disabled}>
      <legend className="sr-only">Permissions for {permissionKey}</legend>
      {levels.map(({ value, label }) => (
        <div key={value} className="flex items-center">
          <input
            id={`${baseId}-${value}`}
            name={baseId}
            type="radio"
            value={value}
            checked={level === value}
            onChange={() => onChange(value)}
            disabled={disabled}
            className="h-4 w-4 text-blue-500 bg-gray-700 border-gray-600 focus:ring-blue-500 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <label
            htmlFor={`${baseId}-${value}`}
            className={`ml-2 block text-sm text-gray-300 ${disabled ? 'text-gray-500' : ''}`}
          >
            {label}
          </label>
        </div>
      ))}
    </fieldset>
  );
};

const RoleManagementPage: React.FC = () => {
  const { roles, addRole, updateRole, deleteRole } = useData();
  const { hasPermission } = usePermissions();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoleName, setSelectedRoleName] = useState<string | null>(null);
  const [editedPermissions, setEditedPermissions] = useState<EditedPermissions>(
    {},
  );

  const canManageRoles = hasPermission('roles:write');

  const selectedRole = useMemo(
    () => roles.find((r) => r.role_name === selectedRoleName),
    [roles, selectedRoleName],
  );

  useEffect(() => {
    if (selectedRole) {
      setEditedPermissions(parsePermissions(selectedRole.permissions));
    } else {
      setEditedPermissions({});
    }
  }, [selectedRole]);

  const handlePermissionChange = (key: string, level: PermissionLevel) => {
    if (!canManageRoles) return;
    setEditedPermissions((prev) => ({ ...prev, [key]: level }));
  };

  const handleModulePermissionChange = (
    module: Module,
    level: PermissionLevel,
  ) => {
    if (!canManageRoles) return;
    const newPermissions = { ...editedPermissions };
    newPermissions[module.key] = level;
    if (module.subModules) {
      module.subModules.forEach((sm) => {
        newPermissions[sm.key] = level;
      });
    }
    setEditedPermissions(newPermissions);
  };

  const handleSave = async () => {
    if (selectedRole && canManageRoles) {
      const newPermissions = buildPermissions(editedPermissions);
      try {
        await updateRole({ ...selectedRole, permissions: newPermissions });
        alert('Role updated successfully!');
      } catch (e: any) {
        alert(`Failed to update role: ${e.message}`);
      }
    }
  };

  const handleAddRole = async (roleData: Role) => {
    if (!canManageRoles) return;
    try {
      await addRole(roleData);
      setIsModalOpen(false);
      setSelectedRoleName(roleData.role_name); // Select the new role
    } catch (e: any) {
      alert(`Failed to add role: ${e.message}`);
    }
  };

  const handleDelete = async () => {
    if (
      selectedRole &&
      canManageRoles &&
      window.confirm(
        `Are you sure you want to delete the "${selectedRole.role_name}" role?`,
      )
    ) {
      try {
        await deleteRole(selectedRole.role_name);
        setSelectedRoleName(null);
      } catch (e: any) {
        alert(`Failed to delete role: ${e.message}`);
      }
    }
  };

  return (
    <div className="flex h-full gap-6">
      {/* Left Column: Role List */}
      <div className="w-1/3 max-w-xs bg-gray-900 border border-gray-800 rounded-lg p-4 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-white">Roles</h2>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="!p-2"
            disabled={!canManageRoles}
          >
            <PlusIcon className="w-5 h-5" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-2 -mx-2 px-2">
          {roles
            .sort((a, b) => a.role_name.localeCompare(b.role_name))
            .map((role) => (
              <div
                key={role.role_name}
                onClick={() => setSelectedRoleName(role.role_name)}
                className={`p-3 rounded-md cursor-pointer ${
                  selectedRoleName === role.role_name
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                {role.role_name}
              </div>
            ))}
        </div>
      </div>

      {/* Right Column: Permission Editor */}
      <div className="flex-1 bg-gray-900 border border-gray-800 rounded-lg flex flex-col">
        {selectedRole ? (
          <>
            <div className="p-4 border-b border-gray-800 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">
                {canManageRoles ? 'Editing' : 'Viewing'} Role:{' '}
                <span className="text-blue-400">{selectedRole.role_name}</span>
              </h2>
              {canManageRoles && (
                <div>
                  <Button
                    variant="danger"
                    onClick={handleDelete}
                    className="mr-2"
                  >
                    Delete
                  </Button>
                  <Button onClick={handleSave}>Save Changes</Button>
                </div>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {appModules.map((module) => (
                <div key={module.key} className="p-4 border border-gray-700 rounded-lg">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">
                      {module.name}
                    </h3>
                    <PermissionControl
                      permissionKey={module.key}
                      level={editedPermissions[module.key] || 'none'}
                      onChange={(level) =>
                        handleModulePermissionChange(module, level)
                      }
                      disabled={!canManageRoles}
                    />
                  </div>
                  {module.subModules && (
                    <div className="mt-4 pt-4 border-t border-gray-700/50 space-y-3">
                      {module.subModules.map((subModule) => (
                        <div
                          key={subModule.key}
                          className="flex justify-between items-center pl-4"
                        >
                          <p className="text-gray-300">{subModule.name}</p>
                          <PermissionControl
                            permissionKey={subModule.key}
                            level={editedPermissions[subModule.key] || 'none'}
                            onChange={(level) =>
                              handlePermissionChange(subModule.key, level)
                            }
                            disabled={!canManageRoles}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>Select a role to view its permissions.</p>
          </div>
        )}
      </div>

      <RoleFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddRole}
        role={null}
      />
    </div>
  );
};

export default RoleManagementPage;