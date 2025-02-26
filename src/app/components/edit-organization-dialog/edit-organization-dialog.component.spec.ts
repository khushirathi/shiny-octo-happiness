// features/organization/components/edit-organization-dialog/edit-organization-dialog.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EditOrganizationDialogComponent } from './edit-organization-dialog.component';

describe('EditOrganizationDialogComponent', () => {
  let component: EditOrganizationDialogComponent;
  let fixture: ComponentFixture<EditOrganizationDialogComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<EditOrganizationDialogComponent>>;
  
  const mockData = {
    id: '1',
    name: 'John Doe',
    department: 'Engineering',
    position: 'Senior Developer',
    location: 'New York',
    joinDate: '2023-01-15'
  };

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('MatDialogRef', ['close']);
    
    await TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        ReactiveFormsModule,
        EditOrganizationDialogComponent
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: mockData },
        { provide: MatDialogRef, useValue: spy }
      ]
    }).compileComponents();

    dialogRefSpy = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<EditOrganizationDialogComponent>>;
    fixture = TestBed.createComponent(EditOrganizationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with provided data', () => {
    expect(component.editForm.getRawValue().id).toBe(mockData.id);
    expect(component.editForm.getRawValue().name).toBe(mockData.name);
    expect(component.editForm.getRawValue().department).toBe(mockData.department);
    expect(component.editForm.getRawValue().position).toBe(mockData.position);
    expect(component.editForm.getRawValue().location).toBe(mockData.location);
    
    // For the date field, we need to check that it was properly converted to a Date object
    expect(component.editForm.getRawValue().joinDate instanceof Date).toBe(true);
  });

  it('should close dialog with no results when cancel is clicked', () => {
    component.onCancel();
    expect(dialogRefSpy.close).toHaveBeenCalledWith();
  });

  it('should validate required fields', () => {
    // Set required field to empty
    component.editForm.get('name')?.setValue('');
    expect(component.editForm.valid).toBeFalse();
    
    // Restore value
    component.editForm.get('name')?.setValue('John Doe');
    expect(component.editForm.valid).toBeTrue();
  });

  it('should close dialog with updated data when form is submitted', () => {
    // Update a field
    component.editForm.get('name')?.setValue('Updated Name');
    
    component.onSubmit();
    
    // Check that dialog was closed with updated data
    expect(dialogRefSpy.close).toHaveBeenCalled();
    const closedData = dialogRefSpy.close.calls.mostRecent().args[0];
    expect(closedData.name).toBe('Updated Name');
    expect(closedData.id).toBe(mockData.id);
  });

  it('should not close dialog when form is invalid', () => {
    // Make form invalid
    component.editForm.get('name')?.setValue('');
    
    component.onSubmit();
    
    // Dialog should not be closed
    expect(dialogRefSpy.close).not.toHaveBeenCalled();
  });

  it('should format date properly when submitting', () => {
    // Set a specific date
    const testDate = new Date('2024-02-25');
    component.editForm.get('joinDate')?.setValue(testDate);
    
    component.onSubmit();
    
    // Check the formatted date in the output
    const closedData = dialogRefSpy.close.calls.mostRecent().args[0];
    expect(closedData.joinDate).toBe('2024-02-25');
  });
});