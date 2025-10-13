'use client';

import { ReactNode } from 'react';
import { Permission, UserRole } from '@/type';
import { useHasPermission, useHasRole, useHasRoleOrHigher, useCanManageRole } from '@/hooks/use-rbac';

interface PermissionGuardProps {
  children: ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  role?: UserRole;
  minRole?: UserRole;
  canManageRole?: UserRole;
  fallback?: ReactNode;
  orgId?: number;
  teamId?: number;
}

export const PermissionGuard = ({
  children,
  permission,
  permissions,
  requireAll = false,
  role,
  minRole,
  canManageRole: targetRole,
  fallback = null,
  orgId,
  teamId,
}: PermissionGuardProps) => {
  // Check single permission
  const hasSinglePermission = permission ? useHasPermission(permission, orgId, teamId) : true;
  
  // Check multiple permissions
  const hasMultiplePermissions = permissions 
    ? requireAll 
      ? permissions.every(p => useHasPermission(p, orgId, teamId))
      : permissions.some(p => useHasPermission(p, orgId, teamId))
    : true;
  
  // Check role
  const hasRequiredRole = role ? useHasRole(role, orgId, teamId) : true;
  
  // Check minimum role
  const hasMinRole = minRole ? useHasRoleOrHigher(minRole, orgId, teamId) : true;
  
  // Check if can manage role
  const canManageTargetRole = targetRole ? useCanManageRole(targetRole, orgId, teamId) : true;
  
  // Determine if user has access
  const hasAccess = hasSinglePermission && 
                   hasMultiplePermissions && 
                   hasRequiredRole && 
                   hasMinRole && 
                   canManageTargetRole;
  
  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

interface RoleGuardProps {
  children: ReactNode;
  role: UserRole;
  fallback?: ReactNode;
  orgId?: number;
  teamId?: number;
}

export const RoleGuard = ({ children, role, fallback = null, orgId, teamId }: RoleGuardProps) => {
  const hasRole = useHasRole(role, orgId, teamId);
  
  return hasRole ? <>{children}</> : <>{fallback}</>;
};

interface MinRoleGuardProps {
  children: ReactNode;
  minRole: UserRole;
  fallback?: ReactNode;
  orgId?: number;
  teamId?: number;
}

export const MinRoleGuard = ({ children, minRole, fallback = null, orgId, teamId }: MinRoleGuardProps) => {
  const hasMinRole = useHasRoleOrHigher(minRole, orgId, teamId);
  
  return hasMinRole ? <>{children}</> : <>{fallback}</>;
};
