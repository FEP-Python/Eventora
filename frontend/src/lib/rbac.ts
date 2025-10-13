import { UserRole, Permission, RolePermissions, UserContext, AccessLevel } from '@/type';

// Define role permissions mapping
export const ROLE_PERMISSIONS: RolePermissions = {
  leader: [
    // Organization permissions
    'org:create',
    'org:read',
    'org:update',
    'org:delete',
    'org:manage_members',
    'org:manage_teams',
    'org:manage_budget',
    'org:manage_events',
    'org:manage_tasks',
    'org:view_analytics',
    
    // Event permissions
    'event:create',
    'event:read',
    'event:update',
    'event:delete',
    'event:manage_registrations',
    'event:publish',
    
    // Team permissions
    'team:create',
    'team:read',
    'team:update',
    'team:delete',
    'team:manage_members',
    'team:assign_tasks',
    
    // Task permissions
    'task:create',
    'task:read',
    'task:update',
    'task:delete',
    'task:assign',
    'task:complete',
    
    // Budget permissions
    'budget:create',
    'budget:read',
    'budget:update',
    'budget:delete',
    'budget:manage_expenses',
    'budget:view_analytics',
    
    // User permissions
    'user:invite',
    'user:remove',
    'user:change_role',
    'user:view_profile',
    'user:update_profile',
  ],
  
  coleader: [
    // Organization permissions (limited)
    'org:read',
    'org:update',
    'org:manage_members',
    'org:manage_teams',
    'org:manage_budget',
    'org:manage_events',
    'org:manage_tasks',
    'org:view_analytics',
    
    // Event permissions
    'event:read',
    'event:update',
    'event:delete',
    'event:manage_registrations',
    'event:publish',
    
    // Team permissions
    'team:create',
    'team:read',
    'team:update',
    'team:delete',
    'team:manage_members',
    'team:assign_tasks',
    
    // Task permissions
    'task:create',
    'task:read',
    'task:update',
    'task:delete',
    'task:assign',
    'task:complete',
    
    // Budget permissions
    'budget:create',
    'budget:read',
    'budget:update',
    'budget:delete',
    'budget:manage_expenses',
    'budget:view_analytics',
    
    // User permissions
    'user:remove',
    'user:change_role',
    'user:view_profile',
    'user:update_profile',
  ],
  
  member: [
    // Organization permissions (read-only)
    'org:read',
    'org:view_analytics',
    
    // Event permissions
    'event:read',
    'event:update',
    'event:manage_registrations',
    
    // Team permissions
    'team:read',
    
    // Task permissions
    'task:create',
    'task:read',
    'task:update',
    'task:complete',
    
    // Budget permissions
    'budget:read',
    'budget:view_analytics',
    
    // User permissions
    'user:view_profile',
    'user:update_profile',
  ],
  
  volunteer: [
    // Organization permissions (minimal)
    'org:read',
    
    // Event permissions
    'event:read',
    'event:manage_registrations',
    
    // Team permissions
    'team:read',
    
    // Task permissions
    'task:read',
    'task:complete',
    
    // Budget permissions
    'budget:read',
    
    // User permissions
    'user:view_profile',
    'user:update_profile',
  ],
};

// Role hierarchy for determining access levels
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  leader: 4,
  coleader: 3,
  member: 2,
  volunteer: 1,
};

// Permission categories for easier management
export const PERMISSION_CATEGORIES = {
  ORGANIZATION: [
    'org:create',
    'org:read',
    'org:update',
    'org:delete',
    'org:manage_members',
    'org:manage_teams',
    'org:manage_budget',
    'org:manage_events',
    'org:manage_tasks',
    'org:view_analytics',
  ],
  EVENTS: [
    'event:create',
    'event:read',
    'event:update',
    'event:delete',
    'event:manage_registrations',
    'event:publish',
  ],
  TEAMS: [
    'team:create',
    'team:read',
    'team:update',
    'team:delete',
    'team:manage_members',
    'team:assign_tasks',
  ],
  TASKS: [
    'task:create',
    'task:read',
    'task:update',
    'task:delete',
    'task:assign',
    'task:complete',
  ],
  BUDGET: [
    'budget:create',
    'budget:read',
    'budget:update',
    'budget:delete',
    'budget:manage_expenses',
    'budget:view_analytics',
  ],
  USERS: [
    'user:invite',
    'user:remove',
    'user:change_role',
    'user:view_profile',
    'user:update_profile',
  ],
};

// Utility functions
export const getRolePermissions = (role: UserRole): Permission[] => {
  return ROLE_PERMISSIONS[role] || [];
};

export const hasPermission = (userContext: UserContext, permission: Permission): boolean => {
  return userContext.permissions.includes(permission);
};

export const hasAnyPermission = (userContext: UserContext, permissions: Permission[]): boolean => {
  return permissions.some(permission => hasPermission(userContext, permission));
};

export const hasAllPermissions = (userContext: UserContext, permissions: Permission[]): boolean => {
  return permissions.every(permission => hasPermission(userContext, permission));
};

export const hasRole = (userContext: UserContext, role: UserRole): boolean => {
  return userContext.organizationRole === role || userContext.teamRole === role;
};

export const hasRoleOrHigher = (userContext: UserContext, minRole: UserRole): boolean => {
  const userRole = userContext.organizationRole || userContext.teamRole;
  if (!userRole) return false;
  
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minRole];
};

export const canManageRole = (userContext: UserContext, targetRole: UserRole): boolean => {
  const userRole = userContext.organizationRole || userContext.teamRole;
  if (!userRole) return false;
  
  // Users can only manage roles lower than their own
  return ROLE_HIERARCHY[userRole] > ROLE_HIERARCHY[targetRole];
};

export const getAccessLevel = (userContext: UserContext, resource: string): AccessLevel => {
  const permissions = userContext.permissions;
  
  // Check for admin level (all permissions for the resource)
  const adminPermissions = PERMISSION_CATEGORIES[resource as keyof typeof PERMISSION_CATEGORIES] || [];
  if (hasAllPermissions(userContext, adminPermissions)) {
    return 'admin';
  }
  
  // Check for write level
  const writePermissions = adminPermissions.filter(p => 
    p.includes(':create') || p.includes(':update') || p.includes(':delete') || p.includes(':manage')
  );
  if (hasAnyPermission(userContext, writePermissions)) {
    return 'write';
  }
  
  // Check for read level
  const readPermissions = adminPermissions.filter(p => p.includes(':read'));
  if (hasAnyPermission(userContext, readPermissions)) {
    return 'read';
  }
  
  return 'none';
};

export const filterByPermissions = <T>(
  items: T[],
  userContext: UserContext,
  permissionCheck: (item: T, userContext: UserContext) => boolean
): T[] => {
  return items.filter(item => permissionCheck(item, userContext));
};

// Create user context from user and organization/team data
export const createUserContext = (
  user: any,
  organizationRole?: UserRole,
  teamRole?: UserRole
): UserContext => {
  const permissions = getRolePermissions(organizationRole || user.role);
  
  return {
    user,
    organizationRole,
    teamRole,
    permissions,
  };
};
