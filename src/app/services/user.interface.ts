// src/app/models/user.interface.ts

export interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    status: 'active' | 'inactive';
    createdAt: Date;
}

export interface UserRequest {
    searchTerm?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface UserResponse {
    users: User[];
    total: number;
    page: number;
    limit: number;
}