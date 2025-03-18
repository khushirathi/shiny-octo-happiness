// features/organization/components/organization-table/organization-table.component.spec.ts
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { OrganizationTableComponent } from './organization-table.component';
import { OrganizationDataService } from '../../services/organization-data/organization-data.service';
import { NotificationService } from '../../services/notification/notification.service';
import { LoggerService } from '../../services/logger/logger.service';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';
import * as XLSX from 'xlsx';

describe('OrganizationTableComponent', () => {
  let component: OrganizationTableComponent;
  let fixture: ComponentFixture<OrganizationTableComponent>;
  let organizationServiceSpy: jasmine.SpyObj<OrganizationDataService>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;
  let loggerServiceSpy: jasmine.SpyObj<LoggerService>;

  const mockOrganizationData = [
    { id: '1', name: 'John Doe', department: 'Engineering', position: 'Senior Developer', location: 'New York', joinDate: '2023-01-15' },
    { id: '2', name: 'Jane Smith', department: 'HR', position: 'HR Manager', location: 'London', joinDate: '2023-02-20' }
  ];

  beforeEach(async () => {
    // Create spies for services
    organizationServiceSpy = jasmine.createSpyObj('OrganizationDataService', ['getOrganizationData']);
    notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['showError', 'showSuccess']);
    loggerServiceSpy = jasmine.createSpyObj('LoggerService', ['debug', 'info', 'warn', 'error']);

    await TestBed.configureTestingModule({
      imports: [
        OrganizationTableComponent,
        NoopAnimationsModule,
        ReactiveFormsModule,
        MatTableModule,
        MatSortModule,
        MatPaginatorModule
      ],
      providers: [
        { provide: OrganizationDataService, useValue: organizationServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
        { provide: LoggerService, useValue: loggerServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OrganizationTableComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    organizationServiceSpy.getOrganizationData.and.returnValue(of([]));
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should load organization data on init', fakeAsync(() => {
    // Setup spy to return mock data
    organizationServiceSpy.getOrganizationData.and.returnValue(of(mockOrganizationData));
    
    // Initialize component
    fixture.detectChanges();
    tick();
    
    // Check if error UI is displayed
    fixture.detectChanges();
    const errorElement = fixture.debugElement.query(By.css('.bg-red-50'));
    expect(errorElement).toBeTruthy();
    expect(errorElement.nativeElement.textContent).toContain('Error loading organization data');
    
    // Check if retry button exists
    const retryButton = errorElement.query(By.css('button[color="primary"]'));
    expect(retryButton).toBeTruthy();
    expect(retryButton.nativeElement.textContent).toContain('Try Again');
  }));
  
  it('should retry loading data when try again button is clicked', fakeAsync(() => {
    // First return error, then return success on second call
    organizationServiceSpy.getOrganizationData.and.returnValues(
      throwError(() => new Error('Server error')),
      of(mockOrganizationData)
    );
    
    // Initialize component (triggers first load that fails)
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    
    // Verify error state
    expect(component.hasError).toBeTrue();
    
    // Find and click the retry button
    const retryButton = fixture.debugElement.query(By.css('button[color="primary"]'));
    retryButton.nativeElement.click();
    tick();
    fixture.detectChanges();
    
    // Verify data loaded successfully after retry
    expect(component.hasError).toBeFalse();
    expect(component.dataSource.data).toEqual(mockOrganizationData);
    expect(organizationServiceSpy.getOrganizationData).toHaveBeenCalledTimes(2);
  }));
  
  it('should filter data when search input changes', fakeAsync(() => {
    // Setup spy to return mock data
    organizationServiceSpy.getOrganizationData.and.returnValue(of(mockOrganizationData));
    
    // Initialize component
    fixture.detectChanges();
    tick();
    
    // Apply filter
    component.searchControl.setValue('Jane');
    tick(300); // Debounce time
    
    // Check filtered data
    expect(component.dataSource.filter).toBe('jane');
    expect(component.dataSource.filteredData.length).toBe(1);
    expect(component.dataSource.filteredData[0].name).toBe('Jane Smith');
  }));
  
  it('should show empty state when no data is available', fakeAsync(() => {
    // Setup spy to return empty array
    organizationServiceSpy.getOrganizationData.and.returnValue(of([]));
    
    // Initialize component
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    
    // Check empty state
    expect(component.dataSource.data.length).toBe(0);
    const emptyElement = fixture.debugElement.query(By.css('.text-center'));
    expect(emptyElement).toBeTruthy();
    expect(emptyElement.nativeElement.textContent).toContain('No organization data found');
  }));
  
  it('should successfully export data to Excel', fakeAsync(() => {
    // Setup spy to return mock data
    organizationServiceSpy.getOrganizationData.and.returnValue(of(mockOrganizationData));
    
    // Mock XLSX.utils and XLSX.writeFile
    const xlsxSpy = spyOn(XLSX, 'writeFile').and.stub();
    
    // Initialize component
    fixture.detectChanges();
    tick();
    
    // Call export function
    component.exportToExcel();
    
    // Verify export was called
    expect(xlsxSpy).toHaveBeenCalled();
    expect(notificationServiceSpy.showSuccess).toHaveBeenCalledWith('Organization data exported successfully');
  }));
  
  it('should disable export button when loading or in error state', fakeAsync(() => {
    // Setup spy to return empty array
    organizationServiceSpy.getOrganizationData.and.returnValue(of([]));
    
    // Initialize component
    fixture.detectChanges();
    tick();
    
    // Set loading manually
    component.loading = true;
    fixture.detectChanges();
    
    // Check if export button is disabled
    const exportButton = fixture.debugElement.query(By.css('button[color="primary"]'));
    expect(exportButton.nativeElement.disabled).toBeTrue();
    
    // Change to error state
    component.loading = false;
    component.hasError = true;
    fixture.detectChanges();
    
    // Check if export button is still disabled
    expect(exportButton.nativeElement.disabled).toBeTrue();
    tick();
    // Check if data is loaded
    expect(component.dataSource.data).toEqual(mockOrganizationData);
    expect(component.loading).toBeFalse();
    expect(component.hasError).toBeFalse();
  }));

  it('should show error when data loading fails', fakeAsync(() => {
    // Setup spy to throw error
    const errorMessage = 'Failed to load data';
    organizationServiceSpy.getOrganizationData.and.returnValue(throwError(() => new Error(errorMessage)));
    
    // Initialize component
    fixture.detectChanges();
    tick();
    
    // Check if error state is set
    expect(component.hasError).toBeTrue();
    expect(component.errorMessage).toContain(errorMessage);
    expect(component.loading).toBeFalse();
    expect(notificationServiceSpy.showError).toHaveBeenCalled();
  }));
})