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

export type User = {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    college: string;
    created_at: Date;
    updated_at: Date;
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