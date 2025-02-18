// src/app/services/user.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { User, UserRequest, UserResponse } from './user.interface';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private readonly apiUrl = `${environment.apiBaseUrl}/users`;
    private http = inject(HttpClient);

    getUsers(request: UserRequest): Observable<UserResponse> {
        let params = new HttpParams();
        
        if (request.searchTerm) {
            params = params.set('search', request.searchTerm);
        }
        if (request.page) {
            params = params.set('page', request.page.toString());
        }
        if (request.limit) {
            params = params.set('limit', request.limit.toString());
        }
        if (request.sortBy) {
            params = params.set('sortBy', request.sortBy);
            params = params.set('sortOrder', request.sortOrder || 'asc');
        }

        return this.http.get<UserResponse>(this.apiUrl, { params })
            .pipe(
                catchError(this.handleError)
            );
    }

    createUser(user: Omit<User, 'id' | 'createdAt'>): Observable<User> {
        return this.http.post<User>(this.apiUrl, user)
            .pipe(
                catchError(this.handleError)
            );
    }

    updateUser(id: number, user: Partial<User>): Observable<User> {
        return this.http.put<User>(`${this.apiUrl}/${id}`, user)
            .pipe(
                catchError(this.handleError)
            );
    }

    deleteUser(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`)
            .pipe(
                catchError(this.handleError)
            );
    }

    private handleError(error: any) {
        console.error('An error occurred:', error);
        return throwError(() => new Error('Something went wrong. Please try again later.'));
    }
}