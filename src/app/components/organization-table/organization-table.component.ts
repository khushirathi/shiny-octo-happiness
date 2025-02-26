// features/organization/components/organization-table/organization-table.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTable } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import * as XLSX from 'xlsx';
import { EditOrganizationDialogComponent } from '../edit-organization-dialog/edit-organization-dialog.component';
import { OrganizationService } from '../../services/organization/organization.service';

export interface OrganizationData {
  id: string;
  name: string;
  department: string;
  position: string;
  location: string;
  joinDate: string;
}

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
    MatDialogModule,
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

        <button mat-raised-button color="primary" (click)="exportToExcel()">
          <mat-icon class="mr-2">download</mat-icon>
          Export to Excel
        </button>
      </div>

      <!-- Table -->
      <mat-table [dataSource]="dataSource" matSort class="w-full">
        <!-- Edit Column -->
        <ng-container matColumnDef="edit">
          <mat-header-cell *matHeaderCellDef> Edit </mat-header-cell>
          <mat-cell *matCellDef="let row">
            <button mat-icon-button color="primary" (click)="openEditDialog(row)">
              <mat-icon>edit</mat-icon>
            </button>
          </mat-cell>
        </ng-container>

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

      <!-- Paginator -->
      <mat-paginator 
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

  displayedColumns: string[] = ['edit', 'id', 'name', 'department', 'position', 'location', 'joinDate'];
  dataSource: MatTableDataSource<OrganizationData>;
  searchControl = new FormControl('');

  constructor(private dialog: MatDialog) {
    // Sample data - replace with your actual data service
    const SAMPLE_DATA: OrganizationData[] = [
      { id: '1', name: 'John Doe', department: 'Engineering', position: 'Senior Developer', location: 'New York', joinDate: '2023-01-15' },
      { id: '2', name: 'Jane Smith', department: 'HR', position: 'HR Manager', location: 'London', joinDate: '2023-02-20' },
      { id: '3', name: 'Alice Johnson', department: 'Marketing', position: 'Marketing Specialist', location: 'Los Angeles', joinDate: '2023-03-10' },
      { id: '4', name: 'Bob Brown', department: 'Finance', position: 'Financial Analyst', location: 'Chicago', joinDate: '2023-04-05' },
      { id: '5', name: 'Carol White', department: 'Engineering', position: 'Junior Developer', location: 'San Francisco', joinDate: '2023-05-12' },
      { id: '6', name: 'David Miller', department: 'Product', position: 'Product Manager', location: 'Seattle', joinDate: '2023-06-18' },
      { id: '7', name: 'Eva Wilson', department: 'Operations', position: 'Operations Director', location: 'Boston', joinDate: '2023-07-22' },
      { id: '8', name: 'Frank Taylor', department: 'Sales', position: 'Sales Representative', location: 'Dallas', joinDate: '2023-08-30' },
      { id: '9', name: 'Grace Lee', department: 'Customer Service', position: 'Support Specialist', location: 'Miami', joinDate: '2023-09-14' },
      { id: '10', name: 'Henry Clark', department: 'IT', position: 'IT Administrator', location: 'Denver', joinDate: '2023-10-07' },
      { id: '11', name: 'Irene Lopez', department: 'Legal', position: 'Legal Counsel', location: 'Washington DC', joinDate: '2023-11-19' },
    ];

    this.dataSource = new MatTableDataSource(SAMPLE_DATA);
  }

  ngOnInit() {
    // Setup search filter
    this.searchControl.valueChanges.subscribe(value => {
      this.dataSource.filter = (value || '').trim().toLowerCase();
    });
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;

    // Custom filter predicate to search all columns
    this.dataSource.filterPredicate = (data: OrganizationData, filter: string) => {
      const dataStr = Object.values(data).join(' ').toLowerCase();
      return dataStr.indexOf(filter) != -1;
    };
  }

  openEditDialog(row: OrganizationData): void {
    const dialogRef = this.dialog.open(EditOrganizationDialogComponent, {
      width: '500px',
      data: { ...row } // Pass a copy of the data to avoid direct references
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Find the index of the edited item
        const index = this.dataSource.data.findIndex(item => item.id === result.id);
        
        // Update the data in the table
        if (index > -1) {
          const updatedData = [...this.dataSource.data];
          updatedData[index] = result;
          this.dataSource.data = updatedData;
        }
      }
    });
  }

  exportToExcel() {
    // Create worksheet from data
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.dataSource.data);
    
    // Create workbook and add worksheet
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Organization Data');
    
    // Save file
    XLSX.writeFile(wb, 'organization-data.xlsx');
  }
}