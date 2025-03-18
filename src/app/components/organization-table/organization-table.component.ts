// features/organization/components/organization-table/organization-table.component.ts
import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTable } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import * as XLSX from 'xlsx';
import { finalize, catchError, of } from 'rxjs';
import { OrganizationData, OrganizationDataService } from '../../services/organization-data/organization-data.service';

import { NotificationService } from '../../services/notification/notification.service';

@Component({
  selector: 'app-organization-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="bg-white p-6 rounded-lg shadow-md">
      <!-- Table Header -->
      <div class="flex justify-between items-center mb-6">
        <mat-form-field class="w-80">
          <mat-label>Search</mat-label>
          <input matInput [formControl]="searchControl" placeholder="Search in any column">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>

        <button mat-raised-button color="primary" (click)="exportToExcel()" [disabled]="loading || hasError">
          <mat-icon class="mr-2">download</mat-icon>
          Export to Excel
        </button>
      </div>

      <!-- Loading indicator -->
      <div *ngIf="loading" class="flex justify-center items-center p-10">
        <mat-spinner diameter="50"></mat-spinner>
      </div>

      <!-- Error message -->
      <div *ngIf="hasError" class="bg-red-50 border border-red-300 text-red-700 p-4 rounded-md mb-4">
        <div class="flex">
          <mat-icon class="text-red-500 mr-3">error</mat-icon>
          <div>
            <h3 class="text-lg font-medium">Error loading organization data</h3>
            <p>{{ errorMessage }}</p>
            <div class="mt-3">
              <button 
                mat-stroked-button 
                color="primary" 
                (click)="loadData()"
                class="mr-2">
                <mat-icon class="mr-1">refresh</mat-icon>
                Try Again
              </button>
              <button 
                mat-button 
                (click)="hasError = false; errorMessage = ''">
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Table -->
      <mat-table 
        [dataSource]="dataSource" 
        matSort 
        class="w-full"
        *ngIf="!loading && !hasError">
        
        <!-- ID Column -->
        <ng-container matColumnDef="id">
          <mat-header-cell *matHeaderCellDef mat-sort-header> ID </mat-header-cell>
          <mat-cell *matCellDef="let row"> {{row.id}} </mat-cell>
        </ng-container>

        <!-- Name Column -->
        <ng-container matColumnDef="name">
          <mat-header-cell *matHeaderCellDef mat-sort-header> Name </mat-header-cell>
          <mat-cell *matCellDef="let row"> {{row.name}} </mat-cell>
        </ng-container>

        <!-- Department Column -->
        <ng-container matColumnDef="department">
          <mat-header-cell *matHeaderCellDef mat-sort-header> Department </mat-header-cell>
          <mat-cell *matCellDef="let row"> {{row.department}} </mat-cell>
        </ng-container>

        <!-- Position Column -->
        <ng-container matColumnDef="position">
          <mat-header-cell *matHeaderCellDef mat-sort-header> Position </mat-header-cell>
          <mat-cell *matCellDef="let row"> {{row.position}} </mat-cell>
        </ng-container>

        <!-- Location Column -->
        <ng-container matColumnDef="location">
          <mat-header-cell *matHeaderCellDef mat-sort-header> Location </mat-header-cell>
          <mat-cell *matCellDef="let row"> {{row.location}} </mat-cell>
        </ng-container>

        <!-- Join Date Column -->
        <ng-container matColumnDef="joinDate">
          <mat-header-cell *matHeaderCellDef mat-sort-header> Join Date </mat-header-cell>
          <mat-cell *matCellDef="let row"> {{row.joinDate}} </mat-cell>
        </ng-container>

        <mat-header-row *matHeaderRowDef="displayedColumns"></mat-header-row>
        <mat-row *matRowDef="let row; columns: displayedColumns;"></mat-row>
      </mat-table>

      <!-- Empty state -->
      <div *ngIf="!loading && !hasError && dataSource.data.length === 0" class="text-center p-10">
        <mat-icon class="text-gray-400 text-5xl mb-3">folder_open</mat-icon>
        <p class="text-gray-500">No organization data found</p>
      </div>

      <!-- Paginator -->
      <mat-paginator 
        *ngIf="!loading && !hasError && dataSource.data.length > 0"
        [pageSize]="10"
        [pageSizeOptions]="[5, 10, 25, 100]"
        class="mt-4">
      </mat-paginator>
    </div>
  `
})
export class OrganizationTableComponent implements OnInit {
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatTable) table!: MatTable<OrganizationData>;

  displayedColumns: string[] = ['id', 'name', 'department', 'position', 'location', 'joinDate'];
  dataSource = new MatTableDataSource<OrganizationData>([]);
  searchControl = new FormControl('');
  
  loading = false;
  hasError = false;
  errorMessage = '';

  private organizationService = inject(OrganizationDataService);
  private notificationService = inject(NotificationService);

  ngOnInit() {
    // Setup search filter
    this.searchControl.valueChanges.subscribe(value => {
      this.dataSource.filter = (value || '').trim().toLowerCase();
    });

    // Load data on component initialization
    this.loadData();
  }

  ngAfterViewInit() {
    this.setupTable();
  }

  /**
   * Setup table sorting, pagination and filtering
   */
  private setupTable(): void {
    if (this.dataSource.data.length > 0) {
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;

      // Custom filter predicate to search all columns
      this.dataSource.filterPredicate = (data: OrganizationData, filter: string) => {
        const dataStr = Object.values(data).join(' ').toLowerCase();
        return dataStr.indexOf(filter) != -1;
      };
    }
  }

  /**
   * Load organization data from service
   */
  loadData(): void {
    this.loading = true;
    this.hasError = false;
    this.errorMessage = '';

    this.organizationService.getOrganizationData()
      .pipe(
        catchError(error => {
          this.hasError = true;
          this.errorMessage = error.message || 'Failed to load organization data';
          this.notificationService.showError('Error loading organization data');
          return of([]);
        }),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: (data) => {
          this.dataSource.data = data;
          // Setup table again after data is loaded
          setTimeout(() => {
            this.setupTable();
          });
        }
      });
  }

  /**
   * Export table data to Excel
   */
  exportToExcel() {
    if (this.loading || this.hasError || this.dataSource.data.length === 0) {
      return;
    }

    try {
      // Create worksheet from data
      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.dataSource.data);
      
      // Create workbook and add worksheet
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Organization Data');
      
      // Save file
      XLSX.writeFile(wb, 'organization-data.xlsx');
      
      this.notificationService.showSuccess('Organization data exported successfully');
    } catch (error) {
      this.notificationService.showError('Failed to export data');
      console.error('Export error:', error);
    }
  }
}