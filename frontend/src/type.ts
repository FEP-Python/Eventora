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
