// features/organization/services/organization.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { OrganizationService } from './organization.service';
import { first } from 'rxjs/operators';

describe('OrganizationService', () => {
  let service: OrganizationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrganizationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return organization data', (done) => {
    service.getOrganizationData().pipe(first()).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toBeGreaterThan(0);
      done();
    });
  });

  it('should update an organization member', (done) => {
    // First get the initial data
    service.getOrganizationData().pipe(first()).subscribe(initialData => {
      // Get the first member to update
      const memberToUpdate = { ...initialData[0], name: 'Updated Name' };
      
      // Update the member
      service.updateOrganizationMember(memberToUpdate);
      
      // Check if update was successful
      service.getOrganizationData().pipe(first()).subscribe(updatedData => {
        const updatedMember = updatedData.find(item => item.id === memberToUpdate.id);
        expect(updatedMember).toBeTruthy();
        expect(updatedMember?.name).toBe('Updated Name');
        done();
      });
    });
  });

  it('should add a new organization member', (done) => {
    // First get the initial data count
    service.getOrganizationData().pipe(first()).subscribe(initialData => {
      const initialCount = initialData.length;
      
      // Add a new member
      const newMember = {
        name: 'New Member',
        department: 'Engineering',
        position: 'Developer',
        location: 'Remote',
        joinDate: '2023-12-01'
      };
      
      service.addOrganizationMember(newMember);
      
      // Check if addition was successful
      service.getOrganizationData().pipe(first()).subscribe(updatedData => {
        expect(updatedData.length).toBe(initialCount + 1);
        
        // Find the added member (should be the last one)
        const addedMember = updatedData.find(item => item.name === newMember.name);
        expect(addedMember).toBeTruthy();
        expect(addedMember?.department).toBe('Engineering');
        done();
      });
    });
  });

  it('should delete an organization member', (done) => {
    // First get the initial data
    service.getOrganizationData().pipe(first()).subscribe(initialData => {
      const initialCount = initialData.length;
      const memberToDelete = initialData[0];
      
      // Delete the member
      service.deleteOrganizationMember(memberToDelete.id);
      
      // Check if deletion was successful
      service.getOrganizationData().pipe(first()).subscribe(updatedData => {
        expect(updatedData.length).toBe(initialCount - 1);
        
        // Ensure the deleted member is not in the list anymore
        const deletedMember = updatedData.find(item => item.id === memberToDelete.id);
        expect(deletedMember).toBeUndefined();
        done();
      });
    });
  });

  it('should return a list of departments', () => {
    const departments = service.getDepartments();
    expect(departments).toBeTruthy();
    expect(departments.length).toBeGreaterThan(0);
    expect(departments).toContain('Engineering');
    expect(departments).toContain('HR');
  });
});