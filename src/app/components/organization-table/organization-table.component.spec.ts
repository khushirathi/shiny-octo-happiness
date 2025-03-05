// features/organization/components/organization-table/organization-table.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { OrganizationTableComponent } from './organization-table.component';
import { LoggerService } from '../../services/logger/logger.service';
import * as XLSX from 'xlsx';

describe('OrganizationTableComponent', () => {
  let component: OrganizationTableComponent;
  let fixture: ComponentFixture<OrganizationTableComponent>;
  let loggerSpy: jasmine.SpyObj<LoggerService>;

  beforeEach(async () => {
    // Create spy for LoggerService
    loggerSpy = jasmine.createSpyObj('LoggerService', ['debug', 'info', 'warn', 'error']);

    await TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        ReactiveFormsModule,
        MatTableModule,
        MatSortModule,
        MatPaginatorModule,
        MatInputModule,
        MatFormFieldModule,
        MatButtonModule,
        MatIconModule,
        OrganizationTableComponent
      ],
      providers: [
        { provide: LoggerService, useValue: loggerSpy }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OrganizationTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(loggerSpy.debug).toHaveBeenCalledWith('OrganizationTableComponent initialized');
  });

  it('should initialize with sample data', () => {
    expect(component.dataSource.data.length).toBeGreaterThan(0);
    expect(loggerSpy.debug).toHaveBeenCalledWith('Data source created with sample data', jasmine.any(Object));
  });

  /* it('should filter data when search input changes', () => {
    // Spy on dataSource.filter
    spyOn(component.dataSource, 'filter', 'set').and.callThrough();
    
    // Set search value
    component.searchControl.setValue('john');
    fixture.detectChanges();
    
    // Check if filter was applied
    expect(component.dataSource.filter).toBe('john');
    expect(loggerSpy.debug).toHaveBeenCalledWith('Search filter applied', { filterValue: 'john' });
  }); */

  it('should call exportToExcel method when export button is clicked', () => {
    spyOn(component, 'exportToExcel');
    
    // Find and click export button
    const exportButton = fixture.nativeElement.querySelector('button');
    exportButton.click();
    fixture.detectChanges();
    
    expect(component.exportToExcel).toHaveBeenCalled();
  });

  it('should log when exportToExcel is called', () => {
    // Mock the XLSX.utils and XLSX.writeFile methods
    spyOn(XLSX.utils, 'json_to_sheet').and.returnValue({} as XLSX.WorkSheet);
    spyOn(XLSX.utils, 'book_new').and.returnValue({} as XLSX.WorkBook);
    spyOn(XLSX.utils, 'book_append_sheet');
    spyOn(XLSX, 'writeFile');
    
    component.exportToExcel();
    
    expect(loggerSpy.info).toHaveBeenCalledWith('Starting Excel export');
    expect(loggerSpy.info).toHaveBeenCalledWith('Excel export completed successfully', jasmine.any(Object));
  });

  it('should log error when Excel export fails', () => {
    // Mock the XLSX.utils.json_to_sheet to throw an error
    spyOn(XLSX.utils, 'json_to_sheet').and.throwError('Mock error');
    
    // Expect the export method to throw
    expect(() => component.exportToExcel()).toThrow();
    
    // Verify logging
    expect(loggerSpy.info).toHaveBeenCalledWith('Starting Excel export');
    expect(loggerSpy.error).toHaveBeenCalledWith('Excel export failed', jasmine.any(Error));
  });
});