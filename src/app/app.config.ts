import { tap, catchError, throwError, Observable } from 'rxjs';// app/app.config.ts
import { ApplicationConfig, importProvidersFrom, ErrorHandler, APP_INITIALIZER, inject, provideAppInitializer } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors, HttpContextToken, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { LoggerService, LogLevel } from './services/logger/logger.service';
import { environment } from '../../environments/environment';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { NotificationService } from './services/notification/notification.service';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';

// Create a context token to disable logging for specific requests
export const DISABLE_LOGGING = new HttpContextToken<boolean>(() => false);

// Custom error handler that uses the Logger service
class GlobalErrorHandler implements ErrorHandler {
  private readonly SOURCE = 'GlobalErrorHandler';
  
  constructor(private logger: LoggerService, private notificationService: NotificationService) {}

  handleError(error: any): void {
    // Extract useful error information
    const message = error.message || 'Unknown error';
    const stack = error.stack || '';
    const name = error.name || 'Error';

    let errorMessage: string;

    if (error instanceof HttpErrorResponse) {
      // Server or connection error happened
      errorMessage = getServerErrorMessage(error);
      this.notificationService.showError(errorMessage);
    } else {
      // Client Error (Angular Error, ReferenceError...)
      errorMessage = getClientErrorMessage(error);
      
      // Only show UI notification for non-trivial errors
      // (prevents spamming users with internal Angular errors)
      if (shouldDisplayError(error)) {
        this.notificationService.showError('An error occurred. Please try again later.');
      }
    }
    
    // Log the error with the logger service
    this.logger.error(`${this.SOURCE}.handleError`, `${name}: ${message}`, { stack });
    
    // You could also report to monitoring services like Sentry here
    
    // Optionally rethrow or handle the error differently based on environment
    if (!environment.production) {
      console.error('An error occurred:', error);
    }
  }
}

function getServerErrorMessage(error: HttpErrorResponse): string {
  switch (error.status) {
    case 0:
      return 'Server unavailable. Please check your internet connection.';
    case 400:
      return 'Bad request. Please check your input.';
    case 401:
      return 'Unauthorized. Please log in.';
    case 403:
      return 'You do not have permission to access this resource.';
    case 404:
      return 'The requested resource was not found.';
    case 500:
      return 'Internal server error. Please try again later.';
    default:
      return `Unknown server error: ${error.status} ${error.message}`;
  }
}

function getClientErrorMessage(error: Error): string {
  return `Error: ${error.message || error.toString()}`;
}

function shouldDisplayError(error: Error): boolean {
  // Filter out some internal framework errors that shouldn't be shown to users
  const suppressPatterns = [
    /ExpressionChangedAfterItHasBeenChecked/,
    /NG0100/,
    /routing/i
  ];
  
  const errorString = error.toString();
  return !suppressPatterns.some(pattern => pattern.test(errorString));
}

// Factory function to initialize the logger
function initializeLogger(): void {
  const logger = inject(LoggerService);
  const logging = environment.logging || {};
  
  // Convert string log level from environment to enum
  const logLevel = LogLevel[(logging.level || 'INFO') as keyof typeof LogLevel];
  
  // Configure additional logging options
  const options = {
    saveToFile: logging.saveToFile,
    maxLogFiles: logging.maxLogFiles,
    maxLogSize: logging.maxLogSize
  };
  
  // Enable all logging levels in local development
  const isLocalDev = !environment.production && 
                     typeof window !== 'undefined' && 
                     window.location && 
                     window.location.hostname === 'localhost';
  const effectiveLogLevel = isLocalDev ? LogLevel.TRACE : logLevel;
  
  // Handle null remoteLoggingUrl by passing undefined instead
  const remoteLoggingUrl = logging.remoteLoggingUrl || undefined;
  
  logger.configure(effectiveLogLevel, remoteLoggingUrl, options);
  logger.info('AppInitializer.initialize', 'Application initialized', { 
    version: '1.0.0',
    environment: environment.production ? 'production' : 'development',
    logLevel: LogLevel[effectiveLogLevel]
  });
  
  if (isLocalDev) {
    console.log('%c🔍 DEBUG LOGGING ENABLED FOR LOCAL DEVELOPMENT 🔍', 'background: #4CAF50; color: white; font-size: 12px; padding: 4px;');
  }
}

// Function-based HTTP logging interceptor
const loggingInterceptor = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const logger = inject(LoggerService);
  const startTime = Date.now();
  const requestId = `req-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  
  // Skip logging if disabled for this request
  if (req.context.get(DISABLE_LOGGING)) {
    return next(req);
  }
  
  // Don't log requests to the logging endpoint to avoid infinite loops
  if (req.url.includes('/logs')) {
    return next(req);
  }
  
  // Log the request with HTTP source
  logger.debug('HTTP.request', `Request ${requestId}: ${req.method} ${req.url}`, {
    method: req.method,
    url: req.url,
    headers: getSafeHeaders(req.headers),
    params: req.params.toString()
  });
  
  return next(req).pipe(
    tap(event => {
      if (event.type === 4) { // HttpEventType.Response = 4
        const elapsedTime = Date.now() - startTime;
        
        // Log the response with HTTP source
        logger.debug('HTTP.response', `Response ${requestId}: ${event.status} (${elapsedTime}ms)`, {
          status: event.status,
          statusText: event.statusText,
          url: event.url,
          elapsedTime
        });
      }
    }),
    catchError(error => {
      const elapsedTime = Date.now() - startTime;
      
      // Log the error with HTTP source
      logger.error('HTTP.error', `Error ${requestId}: ${error.status} ${error.statusText} (${elapsedTime}ms)`, {
        status: error.status,
        statusText: error.statusText,
        url: error.url,
        elapsedTime,
        message: error.message,
        error: error.error
      });
      
      return throwError(() => error);
    })
  );
};

// Helper function to get safe headers
function getSafeHeaders(headers: any): Record<string, string> {
  const safeHeaders: Record<string, string> = {};
  const sensitiveHeaders = [
    'authorization', 'cookie', 'x-auth-token', 'x-api-key',
    'jwt', 'password', 'secret'
  ];
  
  headers.keys().forEach((key: string) => {
    if (!sensitiveHeaders.some(h => key.toLowerCase().includes(h.toLowerCase()))) {
      safeHeaders[key] = headers.get(key);
    }
  });
  
  return safeHeaders;
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    provideAnimationsAsync(),
    provideHttpClient(
      withInterceptors([loggingInterceptor]),
    ),
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler,
      deps: [LoggerService]
    },
    provideAppInitializer(initializeLogger),
    // Default snackbar configuration
    {
      provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
      useValue: {
        duration: 300000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      }
    }
  ]
};