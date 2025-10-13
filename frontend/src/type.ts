export type Org = {
    name: string,
    ownerId: number,
    id: number,
    college: string,
    description?: string,
    contactEmail: string,
    contactPhone: string
    website?: string,
    code: string,
    createdAt: Date,
    updatedAt: Date,
}

export type UserRole = "leader" | "coleader" | "member" | "volunteer";

export type User = {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
    college: string;
    created_at: Date;
    updated_at: Date;
}

export type OrganizationMember = {
    user_id: number;
    org_id: number;
    role: UserRole;
    user: User;
}

export type TeamMember = {
    user_id: number;
    team_id: number;
    role: UserRole;
    user: User;
}

export type EventStatus = "draft" | "planned" | "ongoing" | "completed" | "cancelled";

export type Event = {
    id: number;
    orgId: number;
    creatorId: number;
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    registrationDeadline: Date;
    capacity: number;
    location: string;
    eventType: string;
    status: EventStatus;
    isPublic: boolean;
    registrationRequired: boolean;
    entryFee: number;
    certificateProvided: boolean;
    creator?: User;
    createdAt: Date;
    updatedAt: Date;
}

export type Team = {
    id: number;
    orgId: number;
    leaderId: number;
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
    members: User[];
    organization: Org;
    tasks: Task[];
}

export type TaskPriority = "low" | "medium" | "high" | "critical";
export type TaskStatus = "pending" | "in_progress" | "completed" | "overdue";

export type Task = {
    id: number;
    orgId: number;
    eventId: number;
    teamId: number;
    creatorId: number;
    assigneeId: number;
    title: string;
    description: string;
    priority: TaskPriority;
    status: TaskStatus;
    dueDate: Date;
    createdAt: Date;
    updatedAt: Date;
    assignee?: User;
    event?: Event;
    team?: Team;
    organization?: Org;
}

export type Budget = {
    id: number;
    orgId: number;
    name: string;
    description?: string;
    totalAmount: number;
    spentAmount: number;
    remainingAmount: number;
    createdAt?: string;
    updatedAt?: string;
}

export type BudgetAnalytics = {
    totalBudgets: number;
    totalBudgetAmount: number;
    totalSpentAmount: number;
    totalRemainingAmount: number;
    utilizationPercentage: number;
    budgets: Budget[];
}

export type CreateBudgetRequest = {
    orgId: number;
    name: string;
    description?: string;
    totalAmount: number;
    spentAmount?: number;
}

export type UpdateBudgetRequest = {
    name?: string;
    description?: string;
    totalAmount?: number;
    spentAmount?: number;
}

export type ExpenseRequest = {
    amount: number;
}

// Role-Based Access Control Types
export type Permission = 
    // Organization permissions
    | "org:create"
    | "org:read"
    | "org:update"
    | "org:delete"
    | "org:manage_members"
    | "org:manage_teams"
    | "org:manage_budget"
    | "org:manage_events"
    | "org:manage_tasks"
    | "org:view_analytics"
    
    // Event permissions
    | "event:create"
    | "event:read"
    | "event:update"
    | "event:delete"
    | "event:manage_registrations"
    | "event:publish"
    
    // Team permissions
    | "team:create"
    | "team:read"
    | "team:update"
    | "team:delete"
    | "team:manage_members"
    | "team:assign_tasks"
    
    // Task permissions
    | "task:create"
    | "task:read"
    | "task:update"
    | "task:delete"
    | "task:assign"
    | "task:complete"
    
    // Budget permissions
    | "budget:create"
    | "budget:read"
    | "budget:update"
    | "budget:delete"
    | "budget:manage_expenses"
    | "budget:view_analytics"
    
    // User permissions
    | "user:invite"
    | "user:remove"
    | "user:change_role"
    | "user:view_profile"
    | "user:update_profile";

export type RolePermissions = {
    [key in UserRole]: Permission[];
};

export type UserContext = {
    user: User;
    organizationRole?: UserRole;
    teamRole?: UserRole;
    permissions: Permission[];
};

export type AccessLevel = "none" | "read" | "write" | "admin";