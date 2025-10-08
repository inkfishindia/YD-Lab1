import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { useData } from './DataContext';
import { Role } from '../types';

interface IPermissionsContext {
  userRole: Role | null;
  hasPermission: (requiredPermission: string) => boolean;
}

const PermissionsContext = createContext<IPermissionsContext | undefined>(undefined);

export const PermissionsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser, isSignedIn } = useAuth();
  const { people, roles, loading } = useData();

  const userRole = useMemo(() => {
    if (loading || !currentUser || !isSignedIn) return null;

    // First find the person record matching the signed-in user's email
    const person = people.find(p => p.email.toLowerCase() === currentUser.email.toLowerCase());
    if (!person || !person.role_name) {
        // If user is signed in but not in the People sheet, they get no role.
        return null;
    }
    
    // Then find the role definition that matches the person's assigned role name
    return roles.find(r => r.role_name === person.role_name) || null;

  }, [currentUser, people, roles, loading, isSignedIn]);

  const hasPermission = (requiredPermission: string): boolean => {
    if (loading || !userRole) return false;

    const { permissions } = userRole;
    
    // Check for super admin permission
    if (permissions.includes('*:*')) return true;

    const [requiredResource, requiredAction] = requiredPermission.split(':');
    
    // Check for global read permission if the action is 'read'
    if (requiredAction === 'read' && permissions.includes('*:read')) return true;

    // Check for specific and wildcard permissions
    return permissions.some(permission => {
        const [resource, action] = permission.split(':');
        
        const resourceMatch = resource === '*' || resource === requiredResource;
        const actionMatch = action === '*' || action === requiredAction;
        
        return resourceMatch && actionMatch;
    });
  };
  
  const value = { userRole, hasPermission };

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
};
