// features/organization/services/organization.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { OrganizationData } from '../../components/organization-table/organization-table.component';

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {
  // Sample data - would typically come from an API
  private initialData: OrganizationData[] = [
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

  private organizationDataSubject = new BehaviorSubject<OrganizationData[]>(this.initialData);
  
  constructor() {}

  /**
   * Get all organization data
   */
  getOrganizationData(): Observable<OrganizationData[]> {
    return this.organizationDataSubject.asObservable();
  }

  /**
   * Update an organization member
   */
  updateOrganizationMember(updatedMember: OrganizationData): void {
    const currentData = this.organizationDataSubject.value;
    const index = currentData.findIndex(item => item.id === updatedMember.id);
    
    if (index !== -1) {
      const updatedData = [...currentData];
      updatedData[index] = updatedMember;
      this.organizationDataSubject.next(updatedData);
    }
  }

  /**
   * Add a new organization member
   */
  addOrganizationMember(newMember: Omit<OrganizationData, 'id'>): void {
    const currentData = this.organizationDataSubject.value;
    // Generate a new ID (in a real app this would be handled by the backend)
    const newId = (Math.max(...currentData.map(item => parseInt(item.id))) + 1).toString();
    
    const memberWithId: OrganizationData = {
      id: newId,
      ...newMember
    };
    
    this.organizationDataSubject.next([...currentData, memberWithId]);
  }

  /**
   * Delete an organization member
   */
  deleteOrganizationMember(id: string): void {
    const currentData = this.organizationDataSubject.value;
    const updatedData = currentData.filter(item => item.id !== id);
    this.organizationDataSubject.next(updatedData);
  }

  /**
   * Get available departments for dropdown
   */
  getDepartments(): string[] {
    return [
      'Engineering',
      'HR',
      'Marketing',
      'Finance',
      'Product',
      'Operations',
      'Sales',
      'Customer Service',
      'IT',
      'Legal'
    ];
  }
}