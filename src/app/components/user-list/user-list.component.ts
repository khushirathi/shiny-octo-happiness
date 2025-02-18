// src/app/components/user-list/user-list.component.ts

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { User, UserRequest } from '../../services/user.interface';

@Component({
    selector: 'app-user-list',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './user-list.html'
})
export class UserListComponent implements OnInit {
    private userService = inject(UserService);

    users: User[] = [];
    total = 0;
    currentPage = 1;
    pageSize = 10;
    pages: number[] = [];
    searchTerm = '';
    sortBy = 'name';
    sortOrder: 'asc' | 'desc' = 'asc';

    tableHeaders = [
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'role', label: 'Role' },
        { key: 'status', label: 'Status' },
        { key: 'createdAt', label: 'Created At' },
        { key: 'actions', label: 'Actions' }
    ];

    ngOnInit() {
        this.loadUsers();
    }

    loadUsers() {
        const request: UserRequest = {
            page: this.currentPage,
            limit: this.pageSize,
            searchTerm: this.searchTerm,
            sortBy: this.sortBy,
            sortOrder: this.sortOrder
        };

        this.userService.getUsers(request).subscribe({
            next: (response) => {
                this.users = response.users;
                this.total = response.total;
                this.updatePagination();
            },
            error: (error) => {
                console.error('Error loading users:', error);
                // Handle error (show toast, etc.)
            }
        });
    }

    updatePagination() {
        const totalPages = Math.ceil(this.total / this.pageSize);
        this.pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    goToPage(page: number) {
        this.currentPage = page;
        this.loadUsers();
    }

    onSearch() {
        this.currentPage = 1; // Reset to first page when searching
        this.loadUsers();
    }

    sort(key: string) {
        if (this.sortBy === key) {
            this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortBy = key;
            this.sortOrder = 'asc';
        }
        this.loadUsers();
    }

    editUser(user: User) {
        // Implement edit logic or navigate to edit page
        console.log('Edit user:', user);
    }

    deleteUser(id: number) {
        if (confirm('Are you sure you want to delete this user?')) {
            this.userService.deleteUser(id).subscribe({
                next: () => {
                    this.loadUsers(); // Refresh the list
                },
                error: (error) => {
                    console.error('Error deleting user:', error);
                    // Handle error (show toast, etc.)
                }
            });
        }
    }
}