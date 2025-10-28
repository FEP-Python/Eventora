import { Org, OrgRole, OrgPermissions, UserOrgContext } from "@/type";

// ============================================================================
// ROLE CHECKING FUNCTIONS
// ============================================================================

/**
 * Check if user is a leader of the organization
 */
export const isOrgLeader = (userRole: OrgRole | null | undefined): boolean => {
  return userRole === "leader";
};

/**
 * Check if user is an admin (leader or co-leader) of the organization
 */
export const isOrgAdmin = (userRole: OrgRole | null | undefined): boolean => {
  return userRole === "leader" || userRole === "coleader";
};

/**
 * Check if user is a member of the organization
 */
export const isOrgMember = (userRole: OrgRole | null | undefined): boolean => {
  return !!userRole;
};

/**
 * Check if user is the owner of the organization
 */
export const isOrgOwner = (org: Org | undefined, userId: number): boolean => {
  return org?.ownerId === userId;
};

// ============================================================================
// PERMISSION CHECKING FUNCTIONS
// ============================================================================

/**
 * Check if user can update organization details
 */
export const canUpdateOrg = (userRole: OrgRole | null | undefined): boolean => {
  return isOrgAdmin(userRole);
};

/**
 * Check if user can delete organization
 */
export const canDeleteOrg = (org: Org | undefined, userId: number): boolean => {
  return isOrgOwner(org, userId);
};

/**
 * Check if user can update member roles
 */
export const canUpdateRoles = (userRole: OrgRole | null | undefined): boolean => {
  return isOrgLeader(userRole);
};

/**
 * Check if user can remove members
 */
export const canRemoveMembers = (userRole: OrgRole | null | undefined): boolean => {
  return isOrgAdmin(userRole);
};

/**
 * Check if user can remove a specific member
 * Co-leaders cannot remove leaders
 */
export const canRemoveSpecificMember = (
  currentUserRole: OrgRole | null | undefined,
  targetMemberRole: OrgRole,
  orgOwnerId: number,
  targetUserId: number
): boolean => {
  // Cannot remove owner
  if (targetUserId === orgOwnerId) return false;

  // Leader can remove anyone (except owner)
  if (isOrgLeader(currentUserRole)) return true;

  // Co-leader can remove members and volunteers, but not leaders
  if (currentUserRole === "coleader") {
    return targetMemberRole !== "leader";
  }

  return false;
};

/**
 * Check if user can create events
 */
export const canCreateEvents = (userRole: OrgRole | null | undefined): boolean => {
  return isOrgAdmin(userRole);
};

/**
 * Check if user can create teams
 */
export const canCreateTeams = (userRole: OrgRole | null | undefined): boolean => {
  return isOrgAdmin(userRole);
};

/**
 * Check if user can create tasks
 */
export const canCreateTasks = (userRole: OrgRole | null | undefined): boolean => {
  return isOrgMember(userRole);
};

/**
 * Check if user can manage budgets
 */
export const canManageBudgets = (userRole: OrgRole | null | undefined): boolean => {
  return isOrgAdmin(userRole);
};

/**
 * Check if user can transfer ownership
 */
export const canTransferOwnership = (org: Org | undefined, userId: number): boolean => {
  return isOrgOwner(org, userId);
};

/**
 * Check if user can leave organization
 */
export const canLeaveOrg = (org: Org | undefined, userId: number): boolean => {
  return !isOrgOwner(org, userId);
};

// ============================================================================
// PERMISSION GENERATOR
// ============================================================================

/**
 * Get all permissions for a user in an organization
 */
export const getOrgPermissions = (
  org: Org | undefined,
  userId: number,
  userRole: OrgRole | null | undefined
): OrgPermissions => {
  const isOwner = isOrgOwner(org, userId);
  const isLeader = isOrgLeader(userRole);
  const isAdmin = isOrgAdmin(userRole);
  const isMember = isOrgMember(userRole);

  return {
    canView: isMember,
    canUpdate: isAdmin,
    canDelete: isOwner,
    canManageMembers: isAdmin,
    canUpdateRoles: isLeader,
    canCreateEvents: isAdmin,
    canCreateTeams: isAdmin,
    canCreateTasks: isMember,
    canManageBudgets: isAdmin,
  };
};

/**
 * Get complete user organization context
 */
export const getUserOrgContext = (
  org: Org | undefined,
  userId: number,
  userRole: OrgRole | null | undefined
): UserOrgContext | null => {
  if (!org) return null;

  const isOwner = isOrgOwner(org, userId);
  const isMember = isOrgMember(userRole);
  const isAdmin = isOrgAdmin(userRole);
  const isLeader = isOrgLeader(userRole);

  return {
    org,
    userRole: userRole ?? null,
    isOwner,
    isMember,
    isAdmin,
    isLeader,
    permissions: getOrgPermissions(org, userId, userRole),
  };
};

// ============================================================================
// ROLE DISPLAY FUNCTIONS
// ============================================================================

/**
 * Get display name for role
 */
export const getRoleDisplayName = (role: OrgRole): string => {
  const roleNames: Record<OrgRole, string> = {
    leader: "Leader",
    coleader: "Co-Leader",
    member: "Member",
    volunteer: "Volunteer",
  };
  return roleNames[role];
};

/**
 * Get role badge color (for Tailwind classes)
 */
export const getRoleBadgeColor = (role: OrgRole): string => {
  const colors: Record<OrgRole, string> = {
    leader: "bg-purple-100 text-purple-800 border-purple-200",
    coleader: "bg-blue-100 text-blue-800 border-blue-200",
    member: "bg-green-100 text-green-800 border-green-200",
    volunteer: "bg-gray-100 text-gray-800 border-gray-200",
  };
  return colors[role];
};

/**
 * Get role icon (emoji or icon name)
 */
export const getRoleIcon = (role: OrgRole): string => {
  const icons: Record<OrgRole, string> = {
    leader: "👑",
    coleader: "⭐",
    member: "👤",
    volunteer: "🤝",
  };
  return icons[role];
};

// ============================================================================
// ROLE COMPARISON FUNCTIONS
// ============================================================================

/**
 * Get role hierarchy value (higher = more permissions)
 */
export const getRoleHierarchy = (role: OrgRole): number => {
  const hierarchy: Record<OrgRole, number> = {
    leader: 4,
    coleader: 3,
    member: 2,
    volunteer: 1,
  };
  return hierarchy[role];
};

/**
 * Check if role A has higher permissions than role B
 */
export const isHigherRole = (roleA: OrgRole, roleB: OrgRole): boolean => {
  return getRoleHierarchy(roleA) > getRoleHierarchy(roleB);
};

/**
 * Check if role A has equal or higher permissions than role B
 */
export const isEqualOrHigherRole = (roleA: OrgRole, roleB: OrgRole): boolean => {
  return getRoleHierarchy(roleA) >= getRoleHierarchy(roleB);
};

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate if a role value is valid
 */
export const isValidRole = (role: string): role is OrgRole => {
  return ["leader", "coleader", "member", "volunteer"].includes(role);
};

/**
 * Get available roles that a user can assign based on their role
 */
export const getAssignableRoles = (
  currentUserRole: OrgRole | null | undefined
): OrgRole[] => {
  if (isOrgLeader(currentUserRole)) {
    return ["leader", "coleader", "member", "volunteer"];
  }
  return [];
};

/**
 * Check if current user can assign a specific role
 */
export const canAssignRole = (
  currentUserRole: OrgRole | null | undefined,
  targetRole: OrgRole
): boolean => {
  const assignableRoles = getAssignableRoles(currentUserRole);
  return assignableRoles.includes(targetRole);
};

// ============================================================================
// FORMATTING FUNCTIONS
// ============================================================================

/**
 * Format organization code for display
 */
export const formatOrgCode = (code: string): string => {
  return code.toUpperCase();
};

/**
 * Get organization age in human-readable format
 */
export const getOrgAge = (createdAt: string): string => {
  const created = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
};

/**
 * Format member count
 */
export const formatMemberCount = (count: number): string => {
  if (count === 1) return "1 member";
  return `${count} members`;
};

// ============================================================================
// SEARCH AND FILTER FUNCTIONS
// ============================================================================

/**
 * Filter organizations by search query
 */
export const filterOrgs = (
  orgs: Org[],
  searchQuery: string
): Org[] => {
  const query = searchQuery.toLowerCase().trim();
  if (!query) return orgs;

  return orgs.filter(
    (org) =>
      org.name.toLowerCase().includes(query) ||
      org.college.toLowerCase().includes(query) ||
      org.code.toLowerCase().includes(query) ||
      org.description?.toLowerCase().includes(query)
  );
};

/**
 * Sort organizations by various criteria
 */
export const sortOrgs = (
  orgs: Org[],
  sortBy: "name" | "members" | "date" | "college",
  direction: "asc" | "desc" = "asc"
): Org[] => {
  const sorted = [...orgs].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      case "members":
        comparison = a.memberCount - b.memberCount;
        break;
      case "date":
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case "college":
        comparison = a.college.localeCompare(b.college);
        break;
    }

    return direction === "asc" ? comparison : -comparison;
  });

  return sorted;
};

/**
 * Group organizations by role
 */
export const groupOrgsByRole = (orgs: Org[]): Record<OrgRole | "owned", Org[]> => {
  return orgs.reduce(
    (acc, org) => {
      if (org.isOwner) {
        acc.owned.push(org);
      } else if (org.userRole) {
        if (!acc[org.userRole]) {
          acc[org.userRole] = [];
        }
        acc[org.userRole].push(org);
      }
      return acc;
    },
    {
      owned: [],
      leader: [],
      coleader: [],
      member: [],
      volunteer: [],
    } as Record<OrgRole | "owned", Org[]>
  );
};

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Get user-friendly error message
 */
export const getOrgErrorMessage = (error): string => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.message) {
    return error.message;
  }
  return "An unexpected error occurred. Please try again.";
};

// ============================================================================
// COPY TO CLIPBOARD
// ============================================================================

/**
 * Copy organization code to clipboard
 */
export const copyOrgCode = async (code: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(code);
    return true;
  } catch (error) {
    console.error("Failed to copy:", error);
    return false;
  }
};

// ============================================================================
// URL HELPERS
// ============================================================================

/**
 * Get organization page URL
 */
export const getOrgUrl = (orgId: number): string => {
  return `/orgs/${orgId}`;
};

/**
 * Get organization settings URL
 */
export const getOrgSettingsUrl = (orgId: number): string => {
  return `/orgs/${orgId}/settings`;
};

/**
 * Get organization members URL
 */
export const getOrgMembersUrl = (orgId: number): string => {
  return `/orgs/${orgId}/members`;
};

/**
 * Get organization events URL
 */
export const getOrgEventsUrl = (orgId: number): string => {
  return `/orgs/${orgId}/events`;
};

/**
 * Get organization teams URL
 */
export const getOrgTeamsUrl = (orgId: number): string => {
  return `/orgs/${orgId}/teams`;
};

/**
 * Get organization tasks URL
 */
export const getOrgTasksUrl = (orgId: number): string => {
  return `/orgs/${orgId}/tasks`;
};

/**
 * Get organization budgets URL
 */
export const getOrgBudgetsUrl = (orgId: number): string => {
  return `/orgs/${orgId}/budgets`;
};
