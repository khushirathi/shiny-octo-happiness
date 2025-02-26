// features/organization/components/organization-table/organization-table.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { OrganizationTableComponent } from './organization-table.component';
import { EditOrganizationDialogComponent } from '../edit-organization-dialog/edit-organization-dialog.component';
import { MatTableDataSource } from '@angular/material/table';
import { OrganizationService } from '../../services/organization/organization.service';

describe('OrganizationTableComponent', () => {
  let component: OrganizationTableComponent;
  let fixture: ComponentFixture<OrganizationTableComponent>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;
  let organizationServiceSpy: jasmine.SpyObj<OrganizationService>;

  const MOCK_DATA = [
    { id: '1', name: 'John Doe', department: 'Engineering', position: 'Senior Developer', location: 'New York', joinDate: '2023-01-15' },
    { id: '2', name: 'Jane Smith', department: 'HR', position: 'HR Manager', location: 'London', joinDate: '2023-02-20' }
  ];

  beforeEach(async () => {
    const matDialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    const serviceSpy = jasmine.createSpyObj('OrganizationService', 
      ['getOrganizationData', 'updateOrganizationMember']);
    
    // Setup the service spy to return mock data
    serviceSpy.getOrganizationData.and.returnValue(of(MOCK_DATA));
    
    await TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        MatDialogModule,
        OrganizationTableComponent
      ],
      providers: [
        { provide: MatDialog, useValue: matDialogSpy },
        { provide: OrganizationService, useValue: serviceSpy }
      ]
    }).compileComponents();

    dialogSpy = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    organizationServiceSpy = TestBed.inject(OrganizationService) as jasmine.SpyObj<OrganizationService>;
    fixture = TestBed.createComponent(OrganizationTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with data from service', () => {
    expect(organizationServiceSpy.getOrganizationData).toHaveBeenCalled();
    expect(component.dataSource.data).toEqual(MOCK_DATA);
  });

  it('should have correct displayed columns including edit column', () => {
    expect(component.displayedColumns).toContain('edit');
    expect(component.displayedColumns).toContain('id');
    expect(component.displayedColumns).toContain('name');
    expect(component.displayedColumns).toContain('department');
    expect(component.displayedColumns).toContain('position');
    expect(component.displayedColumns).toContain('location');
    expect(component.displayedColumns).toContain('joinDate');
  });

  it('should filter data based on search input', () => {
    // Testing the filter functionality
    component.searchControl.setValue('john');
    expect(component.dataSource.filter).toBe('john');
    
    // Expect only filtered data to be shown
    const filteredData = component.dataSource.filteredData;
    expect(filteredData.length).toBeLessThan(component.dataSource.data.length);
    
    // Reset filter
    component.searchControl.setValue('');
  });

  it('should open edit dialog when edit button is clicked', () => {
    // Mock dialog data
    const mockData = component.dataSource.data[0];
    const mockDialogRef = {
      afterClosed: () => of(null)
    };
    dialogSpy.open.and.returnValue(mockDialogRef as any);
    
    // Call the edit dialog function
    component.openEditDialog(mockData);
    
    // Verify dialog was opened with correct data
    expect(dialogSpy.open).toHaveBeenCalledWith(
      EditOrganizationDialogComponent, 
      {
        width: '500px',
        data: jasmine.objectContaining({ id: mockData.id })
      }
    );
  });

  it('should update organization member via service when dialog returns updated data', () => {
    // Mock dialog data and result
    const mockData = component.dataSource.data[0];
    const updatedMockData = { ...mockData, name: 'Updated Name' };
    const mockDialogRef = {
      afterClosed: () => of(updatedMockData)
    };
    dialogSpy.open.and.returnValue(mockDialogRef as any);
    
    // Call the edit dialog function
    component.openEditDialog(mockData);
    
    // Verify service was called with updated data
    expect(organizationServiceSpy.updateOrganizationMember).toHaveBeenCalledWith(updatedMockData);
  });
});