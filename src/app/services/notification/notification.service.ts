// core/services/notification.service.ts
import { Injectable, Optional, Inject } from '@angular/core';
import { MatSnackBar, MAT_SNACK_BAR_DEFAULT_OPTIONS, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private defaultConfig: MatSnackBarConfig;

  constructor(
    private snackBar: MatSnackBar,
    @Optional() @Inject(MAT_SNACK_BAR_DEFAULT_OPTIONS) defaultOptions: MatSnackBarConfig
  ) {
    // Use provided default options or set fallback defaults
    this.defaultConfig = defaultOptions || {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    };
  }

  /**
   * Show success message
   * @param message Message to display
   * @param duration Optional custom duration in milliseconds
   */
  showSuccess(message: string, duration?: number): void {
    this.snackBar.open(message, 'Close', {
      ...this.defaultConfig,
      ...(duration && { duration }),
      panelClass: ['success-snackbar']
    });
  }

  /**
   * Show error message
   * @param message Message to display
   * @param duration Optional custom duration in milliseconds (longer than default)
   */
  showError(message: string, duration?: number): void {
    this.snackBar.open(message, 'Close', {
      ...this.defaultConfig,
      // Use longer duration for errors if no custom duration provided
      duration: duration || (this.defaultConfig.duration ? this.defaultConfig.duration * 1.6 : 5000),
      panelClass: ['error-snackbar']
    });
  }

  /**
   * Show warning message
   * @param message Message to display
   * @param duration Optional custom duration in milliseconds
   */
  showWarning(message: string, duration?: number): void {
    this.snackBar.open(message, 'Close', {
      ...this.defaultConfig,
      // Use slightly longer duration for warnings if no custom duration provided
      duration: duration || (this.defaultConfig.duration ? this.defaultConfig.duration * 1.3 : 4000),
      panelClass: ['warning-snackbar']
    });
  }

  /**
   * Show info message
   * @param message Message to display
   * @param duration Optional custom duration in milliseconds
   */
  showInfo(message: string, duration?: number): void {
    this.snackBar.open(message, 'Close', {
      ...this.defaultConfig,
      ...(duration && { duration }),
      panelClass: ['info-snackbar']
    });
  }
  
  /**
   * Dismiss all currently displayed snackbars
   */
  dismissAll(): void {
    this.snackBar.dismiss();
  }
}