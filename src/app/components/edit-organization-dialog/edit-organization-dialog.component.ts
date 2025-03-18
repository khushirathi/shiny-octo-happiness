// features/organization/components/edit-organization-dialog/edit-organization-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { OrganizationData } from '../../services/organization-data/organization-data.service';

@Component({
  selector: 'app-edit-organization-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  template: `
    <div class="p-6">
      <h2 class="text-xl font-semibold mb-4">Edit Organization Member</h2>
      
      <form [formGroup]="editForm" (ngSubmit)="onSubmit()">
        <!-- ID Field (Disabled) -->
        <mat-form-field class="w-full mb-4">
          <mat-label>ID</mat-label>
          <input matInput formControlName="id" readonly>
        </mat-form-field>
        
        <!-- Name Field -->
        <mat-form-field class="w-full mb-4">
          <mat-label>Name</mat-label>
          <input matInput formControlName="name">
          <mat-error *ngIf="editForm.get('name')?.hasError('required')">
            Name is required
          </mat-error>
        </mat-form-field>
        
        <!-- Department Field -->
        <mat-form-field class="w-full mb-4">
          <mat-label>Department</mat-label>
          <mat-select formControlName="department">
            <mat-option value="Engineering">Engineering</mat-option>
            <mat-option value="HR">HR</mat-option>
            <mat-option value="Marketing">Marketing</mat-option>
            <mat-option value="Finance">Finance</mat-option>
            <mat-option value="Product">Product</mat-option>
            <mat-option value="Operations">Operations</mat-option>
            <mat-option value="Sales">Sales</mat-option>
            <mat-option value="Customer Service">Customer Service</mat-option>
            <mat-option value="IT">IT</mat-option>
            <mat-option value="Legal">Legal</mat-option>
          </mat-select>
          <mat-error *ngIf="editForm.get('department')?.hasError('required')">
            Department is required
          </mat-error>
        </mat-form-field>
        
        <!-- Position Field -->
        <mat-form-field class="w-full mb-4">
          <mat-label>Position</mat-label>
          <input matInput formControlName="position">
          <mat-error *ngIf="editForm.get('position')?.hasError('required')">
            Position is required
          </mat-error>
        </mat-form-field>
        
        <!-- Location Field -->
        <mat-form-field class="w-full mb-4">
          <mat-label>Location</mat-label>
          <input matInput formControlName="location">
          <mat-error *ngIf="editForm.get('location')?.hasError('required')">
            Location is required
          </mat-error>
        </mat-form-field>
        
        <!-- Join Date Field -->
        <mat-form-field class="w-full mb-6">
          <mat-label>Join Date</mat-label>
          <input matInput [matDatepicker]="joinDatePicker" formControlName="joinDate">
          <mat-datepicker-toggle matSuffix [for]="joinDatePicker"></mat-datepicker-toggle>
          <mat-datepicker #joinDatePicker></mat-datepicker>
          <mat-error *ngIf="editForm.get('joinDate')?.hasError('required')">
            Join Date is required
          </mat-error>
        </mat-form-field>
        
        <!-- Action Buttons -->
        <div class="flex justify-end gap-3">
          <button mat-button type="button" (click)="onCancel()">Cancel</button>
          <button mat-raised-button color="primary" type="submit" [disabled]="editForm.invalid">Save</button>
        </div>
      </form>
    </div>
  `
})
export class EditOrganizationDialogComponent {
  editForm: FormGroup;
  
  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EditOrganizationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: OrganizationData
  ) {
    // Initialize form with the data passed to the dialog
    this.editForm = this.fb.group({
      id: [{ value: data.id, disabled: true }],
      name: [data.name, [Validators.required]],
      department: [data.department, [Validators.required]],
      position: [data.position, [Validators.required]],
      location: [data.location, [Validators.required]],
      joinDate: [new Date(data.joinDate), [Validators.required]]
    });
  }
  
  onSubmit(): void {
    if (this.editForm.valid) {
      // Format the date to the expected format
      const formValue = this.editForm.getRawValue();
      const joinDate = formValue.joinDate instanceof Date 
        ? formValue.joinDate.toISOString().split('T')[0] 
        : formValue.joinDate;
      
      // Close dialog and pass updated data
      this.dialogRef.close({
        ...formValue,
        joinDate
      });
    }
  }
  
  onCancel(): void {
    this.dialogRef.close();
  }
}