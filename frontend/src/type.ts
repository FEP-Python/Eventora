/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-object-type */
// ============================================================================
// ENUMS
// ============================================================================

export type OrgRole = "leader" | "coleader" | "member" | "volunteer";

export type EventStatus =
  | "draft"
  | "planned"
  | "ongoing"
  | "completed"
  | "cancelled";

export type TaskStatus = "pending" | "in_progress" | "completed" | "overdue";

export type TaskPriority = "low" | "medium" | "high" | "critical";

// ============================================================================
// USER TYPES
// ============================================================================

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  college?: string;
  createdAt: string;
}

export interface OrgMember extends User {
  orgRole: OrgRole;
  joinedAt: string;
  isOwner: boolean;
}

export interface TeamMember extends User {
  teamRole: OrgRole;
  joinedAt: string;
}

// ============================================================================
// ORGANIZATION TYPES
// ============================================================================

export interface Org {
  id: number;
  ownerId: number;
  name: string;
  college: string;
  description?: string;
  contactEmail: string;
  contactPhone: string;
  website?: string;
  code: string;
  memberCount: number;
  createdAt: string;
  // Additional fields from API response
  userRole?: OrgRole | null;
  isMember?: boolean;
  isOwner?: boolean;
  joinedAt?: string;
}

export interface OrgDetails {
  org: Org;
  userRole: OrgRole | null;
  isOwner: boolean;
  members: OrgMember[];
  teams: Team[];
  events: Event[];
  tasks: Task[];
  budgets: Budget[];
}

export interface OrgStatistics {
  totalMembers: number;
  totalEvents: number;
  totalTeams: number;
  totalTasks: number;
  membersByRole: {
    leader: number;
    coleader: number;
    member: number;
    volunteer: number;
  };
  eventsByStatus: {
    draft?: number;
    planned?: number;
    ongoing?: number;
    completed?: number;
    cancelled?: number;
  };
  tasksByStatus: {
    pending?: number;
    in_progress?: number;
    completed?: number;
    overdue?: number;
  };
  organizationAge: number; // in days
}

// ============================================================================
// EVENT TYPES
// ============================================================================

export interface Event {
  id: number;
  orgId: number;
  creatorId: number;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  registrationDeadline?: string;
  capacity?: number;
  location: string;
  eventType: string;
  status: EventStatus;
  isPublic: boolean;
  registrationRequired: boolean;
  entryFee: number;
  certificateProvided: boolean;
  createdAt: string;
  // Optional creator info
  creator?: User;
}

// ============================================================================
// TEAM TYPES
// ============================================================================

export interface Team {
  id: number;
  orgId: number;
  leaderId: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  members: TeamMember[];
  tasks?: Task[];
}

// ============================================================================
// TASK TYPES
// ============================================================================

export interface Task {
  id: number;
  orgId: number;
  eventId?: number;
  teamId?: number;
  creatorId: number;
  //   assigneeId?: number;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  // Optional assignee info
  assignees?: {
    id: number;
    name: string;
  }[];
}

// ============================================================================
// BUDGET TYPES
// ============================================================================

export interface Budget {
  id: number;
  orgId: number;
  name: string;
  description?: string;
  totalAmount: number;
  spentAmount: number;
  remainingAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetAnalytics {
  totalBudgets: number;
  totalBudgetAmount: number;
  totalSpentAmount: number;
  totalRemainingAmount: number;
  utilizationPercentage: number;
  budgets: Budget[];
}

export interface CreateBudgetRequest {
  orgId: number;
  name: string;
  description?: string;
  totalAmount: number;
  spentAmount?: number;
}

export interface UpdateBudgetRequest {
  name?: string;
  description?: string;
  totalAmount?: number;
  spentAmount?: number;
}

export interface ExpenseRequest {
  amount: number;
}

export type BudgetStatus = "healthy" | "warning" | "critical";

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  message: string;
  data?: T;
}

export interface ApiError {
  message: string;
  error?: string;
}

// Organization Requests
export interface CreateOrgRequest {
  name: string;
  college: string;
  description?: string;
  contactEmail: string;
  contactPhone: string;
  website?: string;
}

export interface UpdateOrgRequest {
  name?: string;
  college?: string;
  description?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
}

export interface JoinOrgRequest {
  code: string;
}

export interface UpdateMemberRoleRequest {
  userId: number;
  role: OrgRole;
}

export interface RemoveMemberRequest {
  userId: number;
}

export interface TransferOwnershipRequest {
  newOwnerId: number;
}

// Event Requests
export interface CreateEventRequest {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  registrationDeadline?: string;
  capacity?: number;
  location: string;
  eventType: string;
  status?: EventStatus;
  isPublic?: boolean;
  registrationRequired?: boolean;
  entryFee?: number;
  certificateProvided?: boolean;
}

export interface UpdateEventRequest extends Partial<CreateEventRequest> {}

// Task Requests
export interface CreateTaskRequest {
  eventId?: number;
  teamId?: number;
  assigneeId?: number;
  title: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  dueDate?: string;
}

export interface UpdateTaskRequest extends Partial<CreateTaskRequest> {}

// Team Requests
export interface CreateTeamRequest {
  name: string;
  description?: string;
}

export interface UpdateTeamRequest extends Partial<CreateTeamRequest> {}

export interface AddTeamMemberRequest {
  userId: number;
  role?: OrgRole;
}

// ============================================================================
// PERMISSION TYPES
// ============================================================================

export interface OrgPermissions {
  canView: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canManageMembers: boolean;
  canUpdateRoles: boolean;
  canCreateEvents: boolean;
  canCreateTeams: boolean;
  canCreateTasks: boolean;
  canManageBudgets: boolean;
}

export interface UserOrgContext {
  org: Org;
  userRole: OrgRole | null;
  isOwner: boolean;
  isMember: boolean;
  isAdmin: boolean;
  isLeader: boolean;
  permissions: OrgPermissions;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type SortDirection = "asc" | "desc";

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FilterParams {
  search?: string;
  status?: string;
  role?: OrgRole;
  startDate?: string;
  endDate?: string;
}

// ============================================================================
// FORM TYPES
// ============================================================================

export interface OrgFormData extends CreateOrgRequest {}

export interface EventFormData extends CreateEventRequest {}

export interface TaskFormData extends CreateTaskRequest {}

export interface TeamFormData extends CreateTeamRequest {}

export interface BudgetFormData extends CreateBudgetRequest {}

// ============================================================================
// STORE TYPES (for Zustand or other state management)
// ============================================================================

export interface OrgStore {
  activeOrg: Org | null;
  setActiveOrg: (org: Org | null) => void;
  clearActiveOrg: () => void;
}

export interface UserStore {
  user: User | null;
  setUser: (user: User | null) => void;
  clearUser: () => void;
  isAuthenticated: boolean;
}

// ============================================================================
// COMPONENT PROP TYPES
// ============================================================================

export interface OrgCardProps {
  org: Org;
  showActions?: boolean;
  onJoin?: (orgId: number) => void;
  onLeave?: (orgId: number) => void;
}

export interface MemberListProps {
  members: OrgMember[];
  currentUserRole: OrgRole | null;
  orgOwnerId: number;
  onUpdateRole?: (userId: number, role: OrgRole) => void;
  onRemoveMember?: (userId: number) => void;
}

export interface EventCardProps {
  event: Event;
  showActions?: boolean;
  onEdit?: (eventId: number) => void;
  onDelete?: (eventId: number) => void;
}

export interface TaskCardProps {
  task: Task;
  showActions?: boolean;
  onEdit?: (taskId: number) => void;
  onDelete?: (taskId: number) => void;
  onStatusChange?: (taskId: number, status: TaskStatus) => void;
}
