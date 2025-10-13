'use client';

import { useMemo } from 'react';
import { useCurrentUser } from './use-auth';
import { useOrg } from './use-org';
import { useOrgId } from './use-org-id';
import { 
  UserContext, 
  UserRole, 
  Permission, 
  AccessLevel 
} from '@/type';
import {
  createUserContext,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  hasRole,
  hasRoleOrHigher,
  canManageRole,
  getAccessLevel,
  getRolePermissions,
} from '@/lib/rbac';

// Hook to get current user's context with role information
export const useUserContext = (orgId?: number, teamId?: number): UserContext | null => {
  const { data: user } = useCurrentUser();
  const { data: org } = useOrg(orgId || 0);

  return useMemo(() => {
    if (!user) return null;

    // Use user's global role as organization role when member role data isn't available
    const organizationRole = (user.role as UserRole) || undefined;

    // Team role resolution can be added when team member role data is available
    const teamRole = undefined;

    const baseContext = createUserContext(user, organizationRole, teamRole);

    // If user is the organization owner, ensure critical permissions regardless of role
    if (org && user && org.ownerId === user.id) {
      const elevated = new Set(baseContext.permissions);
      elevated.add('event:create');
      elevated.add('user:invite');
      return { ...baseContext, permissions: Array.from(elevated) };
    }

    return baseContext;
  }, [user, org]);
};

// Hook to check if user has a specific permission
export const useHasPermission = (permission: Permission, orgId?: number, teamId?: number): boolean => {
  const userContext = useUserContext(orgId, teamId);
  
  return useMemo(() => {
    if (!userContext) return false;
    return hasPermission(userContext, permission);
  }, [userContext, permission]);
};

// Hook to check if user has any of the specified permissions
export const useHasAnyPermission = (permissions: Permission[], orgId?: number, teamId?: number): boolean => {
  const userContext = useUserContext(orgId, teamId);
  
  return useMemo(() => {
    if (!userContext) return false;
    return hasAnyPermission(userContext, permissions);
  }, [userContext, permissions]);
};

// Hook to check if user has all of the specified permissions
export const useHasAllPermissions = (permissions: Permission[], orgId?: number, teamId?: number): boolean => {
  const userContext = useUserContext(orgId, teamId);
  
  return useMemo(() => {
    if (!userContext) return false;
    return hasAllPermissions(userContext, permissions);
  }, [userContext, permissions]);
};

// Hook to check if user has a specific role
export const useHasRole = (role: UserRole, orgId?: number, teamId?: number): boolean => {
  const userContext = useUserContext(orgId, teamId);
  
  return useMemo(() => {
    if (!userContext) return false;
    return hasRole(userContext, role);
  }, [userContext, role]);
};

// Hook to check if user has a role or higher
export const useHasRoleOrHigher = (minRole: UserRole, orgId?: number, teamId?: number): boolean => {
  const userContext = useUserContext(orgId, teamId);
  
  return useMemo(() => {
    if (!userContext) return false;
    return hasRoleOrHigher(userContext, minRole);
  }, [userContext, minRole]);
};

// Hook to check if user can manage a specific role
export const useCanManageRole = (targetRole: UserRole, orgId?: number, teamId?: number): boolean => {
  const userContext = useUserContext(orgId, teamId);
  
  return useMemo(() => {
    if (!userContext) return false;
    return canManageRole(userContext, targetRole);
  }, [userContext, targetRole]);
};

// Hook to get user's access level for a resource
export const useAccessLevel = (resource: string, orgId?: number, teamId?: number): AccessLevel => {
  const userContext = useUserContext(orgId, teamId);
  
  return useMemo(() => {
    if (!userContext) return 'none';
    return getAccessLevel(userContext, resource);
  }, [userContext, resource]);
};

// Hook to get user's permissions for a specific role
export const useRolePermissions = (role: UserRole): Permission[] => {
  return useMemo(() => {
    return getRolePermissions(role);
  }, [role]);
};

// Hook for organization-specific permissions
export const useOrgPermissions = (orgId?: number) => {
  const currentOrgId = useOrgId();
  const targetOrgId = orgId || currentOrgId;
  
  const userContext = useUserContext(targetOrgId);
  
  return useMemo(() => {
    if (!userContext) return {
      canCreate: false,
      canRead: false,
      canUpdate: false,
      canDelete: false,
      canManageMembers: false,
      canManageTeams: false,
      canManageBudget: false,
      canManageEvents: false,
      canManageTasks: false,
      canViewAnalytics: false,
      accessLevel: 'none' as AccessLevel,
    };

    return {
      canCreate: hasPermission(userContext, 'org:create'),
      canRead: hasPermission(userContext, 'org:read'),
      canUpdate: hasPermission(userContext, 'org:update'),
      canDelete: hasPermission(userContext, 'org:delete'),
      canManageMembers: hasPermission(userContext, 'org:manage_members'),
      canManageTeams: hasPermission(userContext, 'org:manage_teams'),
      canManageBudget: hasPermission(userContext, 'org:manage_budget'),
      canManageEvents: hasPermission(userContext, 'org:manage_events'),
      canManageTasks: hasPermission(userContext, 'org:manage_tasks'),
      canViewAnalytics: hasPermission(userContext, 'org:view_analytics'),
      accessLevel: getAccessLevel(userContext, 'ORGANIZATION'),
    };
  }, [userContext]);
};

// Hook for event-specific permissions
export const useEventPermissions = (orgId?: number) => {
  const currentOrgId = useOrgId();
  const targetOrgId = orgId || currentOrgId;
  
  const userContext = useUserContext(targetOrgId);
  
  return useMemo(() => {
    if (!userContext) return {
      canCreate: false,
      canRead: false,
      canUpdate: false,
      canDelete: false,
      canManageRegistrations: false,
      canPublish: false,
      accessLevel: 'none' as AccessLevel,
    };

    return {
      canCreate: hasPermission(userContext, 'event:create'),
      canRead: hasPermission(userContext, 'event:read'),
      canUpdate: hasPermission(userContext, 'event:update'),
      canDelete: hasPermission(userContext, 'event:delete'),
      canManageRegistrations: hasPermission(userContext, 'event:manage_registrations'),
      canPublish: hasPermission(userContext, 'event:publish'),
      accessLevel: getAccessLevel(userContext, 'EVENTS'),
    };
  }, [userContext]);
};

// Hook for team-specific permissions
export const useTeamPermissions = (orgId?: number) => {
  const currentOrgId = useOrgId();
  const targetOrgId = orgId || currentOrgId;
  
  const userContext = useUserContext(targetOrgId);
  
  return useMemo(() => {
    if (!userContext) return {
      canCreate: false,
      canRead: false,
      canUpdate: false,
      canDelete: false,
      canManageMembers: false,
      canAssignTasks: false,
      accessLevel: 'none' as AccessLevel,
    };

    return {
      canCreate: hasPermission(userContext, 'team:create'),
      canRead: hasPermission(userContext, 'team:read'),
      canUpdate: hasPermission(userContext, 'team:update'),
      canDelete: hasPermission(userContext, 'team:delete'),
      canManageMembers: hasPermission(userContext, 'team:manage_members'),
      canAssignTasks: hasPermission(userContext, 'team:assign_tasks'),
      accessLevel: getAccessLevel(userContext, 'TEAMS'),
    };
  }, [userContext]);
};

// Hook for task-specific permissions
export const useTaskPermissions = (orgId?: number) => {
  const currentOrgId = useOrgId();
  const targetOrgId = orgId || currentOrgId;
  
  const userContext = useUserContext(targetOrgId);
  
  return useMemo(() => {
    if (!userContext) return {
      canCreate: false,
      canRead: false,
      canUpdate: false,
      canDelete: false,
      canAssign: false,
      canComplete: false,
      accessLevel: 'none' as AccessLevel,
    };

    return {
      canCreate: hasPermission(userContext, 'task:create'),
      canRead: hasPermission(userContext, 'task:read'),
      canUpdate: hasPermission(userContext, 'task:update'),
      canDelete: hasPermission(userContext, 'task:delete'),
      canAssign: hasPermission(userContext, 'task:assign'),
      canComplete: hasPermission(userContext, 'task:complete'),
      accessLevel: getAccessLevel(userContext, 'TASKS'),
    };
  }, [userContext]);
};

// Hook for budget-specific permissions
export const useBudgetPermissions = (orgId?: number) => {
  const currentOrgId = useOrgId();
  const targetOrgId = orgId || currentOrgId;
  
  const userContext = useUserContext(targetOrgId);
  
  return useMemo(() => {
    if (!userContext) return {
      canCreate: false,
      canRead: false,
      canUpdate: false,
      canDelete: false,
      canManageExpenses: false,
      canViewAnalytics: false,
      accessLevel: 'none' as AccessLevel,
    };

    return {
      canCreate: hasPermission(userContext, 'budget:create'),
      canRead: hasPermission(userContext, 'budget:read'),
      canUpdate: hasPermission(userContext, 'budget:update'),
      canDelete: hasPermission(userContext, 'budget:delete'),
      canManageExpenses: hasPermission(userContext, 'budget:manage_expenses'),
      canViewAnalytics: hasPermission(userContext, 'budget:view_analytics'),
      accessLevel: getAccessLevel(userContext, 'BUDGET'),
    };
  }, [userContext]);
};
