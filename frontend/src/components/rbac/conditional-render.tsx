'use client';

import { ReactNode } from 'react';
import { Permission, UserRole, AccessLevel } from '@/type';
import { 
  useHasPermission, 
  useHasAnyPermission, 
  useHasAllPermissions,
  useHasRole, 
  useHasRoleOrHigher, 
  useAccessLevel 
} from '@/hooks/use-rbac';

interface ConditionalRenderProps {
  children: ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  role?: UserRole;
  minRole?: UserRole;
  accessLevel?: AccessLevel;
  minAccessLevel?: AccessLevel;
  orgId?: number;
  teamId?: number;
  fallback?: ReactNode;
}

export const ConditionalRender = ({
  children,
  permission,
  permissions,
  requireAll = false,
  role,
  minRole,
  accessLevel,
  minAccessLevel,
  orgId,
  teamId,
  fallback = null,
}: ConditionalRenderProps) => {
  // Check single permission
  const hasSinglePermission = permission ? useHasPermission(permission, orgId, teamId) : true;
  
  // Check multiple permissions
  const hasMultiplePermissions = permissions 
    ? requireAll 
      ? useHasAllPermissions(permissions, orgId, teamId)
      : useHasAnyPermission(permissions, orgId, teamId)
    : true;
  
  // Check role
  const hasRequiredRole = role ? useHasRole(role, orgId, teamId) : true;
  
  // Check minimum role
  const hasMinRole = minRole ? useHasRoleOrHigher(minRole, orgId, teamId) : true;
  
  // Check access level
  const currentAccessLevel = useAccessLevel('ORGANIZATION', orgId, teamId);
  const hasRequiredAccessLevel = accessLevel 
    ? currentAccessLevel === accessLevel 
    : true;
  
  // Check minimum access level
  const accessLevels: AccessLevel[] = ['none', 'read', 'write', 'admin'];
  const hasMinAccessLevel = minAccessLevel 
    ? accessLevels.indexOf(currentAccessLevel) >= accessLevels.indexOf(minAccessLevel)
    : true;
  
  // Determine if user has access
  const hasAccess = hasSinglePermission && 
                   hasMultiplePermissions && 
                   hasRequiredRole && 
                   hasMinRole && 
                   hasRequiredAccessLevel && 
                   hasMinAccessLevel;
  
  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

interface ShowIfProps {
  children: ReactNode;
  condition: boolean;
  fallback?: ReactNode;
}

export const ShowIf = ({ children, condition, fallback = null }: ShowIfProps) => {
  return condition ? <>{children}</> : <>{fallback}</>;
};

interface HideIfProps {
  children: ReactNode;
  condition: boolean;
  fallback?: ReactNode;
}

export const HideIf = ({ children, condition, fallback = null }: HideIfProps) => {
  return condition ? <>{fallback}</> : <>{children}</>;
};
