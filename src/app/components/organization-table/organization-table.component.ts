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
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import * as XLSX from 'xlsx';
import { LoggerService } from '../../services/logger/logger.service';

interface OrganizationData {
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

  // Define source constant for logging
  private readonly SOURCE = 'OrganizationTableComponent';

  displayedColumns: string[] = ['id', 'name', 'department', 'position', 'location', 'joinDate'];
  dataSource: MatTableDataSource<OrganizationData>;
  searchControl = new FormControl('');

  constructor(private logger: LoggerService) {
    this.logger.debug(`${this.SOURCE}.constructor`, 'Component initialized');
    
    // Sample data - replace with your actual data service
    const SAMPLE_DATA: OrganizationData[] = [
      { id: '1', name: 'John Doe', department: 'Engineering', position: 'Senior Developer', location: 'New York', joinDate: '2023-01-15' },
      { id: '2', name: 'Jane Smith', department: 'HR', position: 'HR Manager', location: 'London', joinDate: '2023-02-20' },
      // Add more sample data...
    ];

    this.dataSource = new MatTableDataSource(SAMPLE_DATA);
    this.logger.debug(`${this.SOURCE}.constructor`, 'Data source created with sample data', { 
      rowCount: SAMPLE_DATA.length 
    });
  }

  ngOnInit() {
    this.logger.debug(`${this.SOURCE}.ngOnInit`, 'Component initialization');
    
    // Setup search filter
    this.searchControl.valueChanges.subscribe(value => {
      this.dataSource.filter = (value || '').trim().toLowerCase();
      this.logger.debug(`${this.SOURCE}.ngOnInit`, 'Search filter applied', { 
        filterValue: value 
      });
    });
  }

  ngAfterViewInit() {
    this.logger.debug(`${this.SOURCE}.ngAfterViewInit`, 'View initialized');
    
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;

    // Custom filter predicate to search all columns
    this.dataSource.filterPredicate = (data: OrganizationData, filter: string) => {
      const dataStr = Object.values(data).join(' ').toLowerCase();
      return dataStr.indexOf(filter) != -1;
    };
  }

  exportToExcel() {
    this.logger.info(`${this.SOURCE}.exportToExcel`, 'Starting Excel export');
    
    try {
      // Create worksheet from data
      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.dataSource.data);
      
      // Create workbook and add worksheet
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Organization Data');
      
      // Save file
      XLSX.writeFile(wb, 'organization-data.xlsx');
      
      this.logger.info(`${this.SOURCE}.exportToExcel`, 'Excel export completed successfully', { 
        rows: this.dataSource.data.length, 
        filename: 'organization-data.xlsx' 
      });
    } catch (error) {
      this.logger.error(`${this.SOURCE}.exportToExcel`, 'Excel export failed', 
        error
      );
      // Rethrow or handle as needed
      throw error;
    }
  }
}