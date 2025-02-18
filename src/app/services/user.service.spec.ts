// src/app/services/user.service.spec.ts

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserService } from './user.service';
import { User, UserRequest, UserResponse } from './user.interface';
import { environment } from '../../../environments/environment';

describe('UserService', () => {
    let service: UserService;
    let httpMock: HttpTestingController;
    const apiUrl = `${environment.apiBaseUrl}/users`;

    // Mock data
    const mockUser: User = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
        status: 'active',
        createdAt: new Date()
    };

    const mockUserResponse: UserResponse = {
        users: [mockUser],
        total: 1,
        page: 1,
        limit: 10
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [UserService]
        });

        service = TestBed.inject(UserService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify(); // Ensures no outstanding requests
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('getUsers', () => {
        it('should fetch users with no parameters', () => {
            service.getUsers({}).subscribe(response => {
                expect(response).toEqual(mockUserResponse);
            });

            const req = httpMock.expectOne(apiUrl);
            expect(req.request.method).toBe('GET');
            req.flush(mockUserResponse);
        });

        it('should fetch users with all parameters', () => {
            const mockRequest: UserRequest = {
                page: 1,
                limit: 10,
                searchTerm: 'test',
                sortBy: 'name',
                sortOrder: 'asc'
            };

            service.getUsers(mockRequest).subscribe(response => {
                expect(response).toEqual(mockUserResponse);
            });

            const req = httpMock.expectOne(
                `${apiUrl}?search=test&page=1&limit=10&sortBy=name&sortOrder=asc`
            );
            expect(req.request.method).toBe('GET');
            req.flush(mockUserResponse);
        });

        it('should handle errors when fetching users', () => {
            const mockRequest: UserRequest = { page: 1, limit: 10 };
            const errorMessage = 'Something went wrong. Please try again later.';

            service.getUsers(mockRequest).subscribe({
                error: error => {
                    expect(error.message).toBe(errorMessage);
                }
            });

            const req = httpMock.expectOne(`${apiUrl}?page=1&limit=10`);
            req.error(new ErrorEvent('Network error'));
        });
    });

    describe('createUser', () => {
        const newUser = {
            name: 'New User',
            email: 'new@example.com',
            role: 'user',
            status: 'active' as const
        };

        it('should create a new user', () => {
            const mockResponse: User = {
                ...newUser,
                id: 2,
                createdAt: new Date()
            };

            service.createUser(newUser).subscribe(response => {
                expect(response).toEqual(mockResponse);
            });

            const req = httpMock.expectOne(apiUrl);
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual(newUser);
            req.flush(mockResponse);
        });

        it('should handle error when creating user', () => {
            const errorMessage = 'Something went wrong. Please try again later.';

            service.createUser(newUser).subscribe({
                error: error => {
                    expect(error.message).toBe(errorMessage);
                }
            });

            const req = httpMock.expectOne(apiUrl);
            req.error(new ErrorEvent('Network error'));
        });
    });

    describe('updateUser', () => {
        const updateData = {
            name: 'Updated Name',
            status: 'inactive' as const
        };

        it('should update an existing user', () => {
            const userId = 1;
            const mockResponse: User = {
                ...mockUser,
                ...updateData
            };

            service.updateUser(userId, updateData).subscribe(response => {
                expect(response).toEqual(mockResponse);
            });

            const req = httpMock.expectOne(`${apiUrl}/${userId}`);
            expect(req.request.method).toBe('PUT');
            expect(req.request.body).toEqual(updateData);
            req.flush(mockResponse);
        });

        it('should handle error when updating user', () => {
            const userId = 1;
            const errorMessage = 'Something went wrong. Please try again later.';

            service.updateUser(userId, updateData).subscribe({
                error: error => {
                    expect(error.message).toBe(errorMessage);
                }
            });

            const req = httpMock.expectOne(`${apiUrl}/${userId}`);
            req.error(new ErrorEvent('Network error'));
        });

        it('should handle non-existent user update', () => {
            const nonExistentId = 999;
            const errorResponse = { status: 404, statusText: 'Not Found' };

            service.updateUser(nonExistentId, updateData).subscribe({
                error: error => {
                    expect(error.message).toBe('Something went wrong. Please try again later.');
                }
            });

            const req = httpMock.expectOne(`${apiUrl}/${nonExistentId}`);
            req.flush('User not found', errorResponse);
        });
    });

    describe('deleteUser', () => {
        it('should delete an existing user', () => {
            const userId = 1;

            service.deleteUser(userId).subscribe(response => {
                expect(response).toBeNull();
            });

            const req = httpMock.expectOne(`${apiUrl}/${userId}`);
            expect(req.request.method).toBe('DELETE');
            req.flush(null);
        });

        it('should handle error when deleting user', () => {
            const userId = 1;
            const errorMessage = 'Something went wrong. Please try again later.';

            service.deleteUser(userId).subscribe({
                error: error => {
                    expect(error.message).toBe(errorMessage);
                }
            });

            const req = httpMock.expectOne(`${apiUrl}/${userId}`);
            req.error(new ErrorEvent('Network error'));
        });

        it('should handle non-existent user deletion', () => {
            const nonExistentId = 999;
            const errorResponse = { status: 404, statusText: 'Not Found' };

            service.deleteUser(nonExistentId).subscribe({
                error: error => {
                    expect(error.message).toBe('Something went wrong. Please try again later.');
                }
            });

            const req = httpMock.expectOne(`${apiUrl}/${nonExistentId}`);
            req.flush('User not found', errorResponse);
        });
    });

    describe('error handling', () => {
        it('should handle network errors', () => {
            service.getUsers({}).subscribe({
                error: error => {
                    expect(error.message).toBe('Something went wrong. Please try again later.');
                }
            });

            const req = httpMock.expectOne(apiUrl);
            req.error(new ErrorEvent('Network error'));
        });

        it('should handle 500 server error', () => {
            service.getUsers({}).subscribe({
                error: error => {
                    expect(error.message).toBe('Something went wrong. Please try again later.');
                }
            });

            const req = httpMock.expectOne(apiUrl);
            req.flush('Internal Server Error', { status: 500, statusText: 'Internal Server Error' });
        });

        it('should handle 400 bad request', () => {
            service.getUsers({}).subscribe({
                error: error => {
                    expect(error.message).toBe('Something went wrong. Please try again later.');
                }
            });

            const req = httpMock.expectOne(apiUrl);
            req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
        });
    });
});