// features/organization/services/organization-data.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, catchError } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface OrganizationData {
  id: string;
  name: string;
  department: string;
  position: string;
  location: string;
  joinDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrganizationDataService {
  private apiUrl = `${environment.apiBaseUrl}/organizations`;

  constructor(private http: HttpClient) {}

  /**
   * Get all organization data
   * @returns Observable of Organization Data
   */
  getOrganizationData(): Observable<OrganizationData[]> {
    return this.http.get<OrganizationData[]>(this.apiUrl)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Handle HTTP errors
   * @param error The HTTP error response
   * @returns An observable error with meaningful error message
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 400:
          errorMessage = 'Bad request. Please check your input.';
          break;
        case 401:
          errorMessage = 'Unauthorized. Please log in to access this resource.';
          break;
        case 403:
          errorMessage = 'Forbidden. You do not have permission to access this resource.';
          break;
        case 404:
          errorMessage = 'The requested data could not be found.';
          break;
        case 500:
          errorMessage = 'Internal server error. Please try again later.';
          break;
        default:
          errorMessage = `Error: ${error.statusText || 'Server error'}`;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }
}