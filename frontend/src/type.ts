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
    createdAt: Date;
    updatedAt: Date;
}