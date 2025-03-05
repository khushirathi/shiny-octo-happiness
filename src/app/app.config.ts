import { tap, catchError, throwError, Observable } from 'rxjs';// app/app.config.ts
import { ApplicationConfig, importProvidersFrom, ErrorHandler, APP_INITIALIZER, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors, HttpContextToken, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { LoggerService, LogLevel } from './services/logger/logger.service';
import { environment } from '../../environments/environment';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

// Create a context token to disable logging for specific requests
export const DISABLE_LOGGING = new HttpContextToken<boolean>(() => false);

// Custom error handler that uses the Logger service
class GlobalErrorHandler implements ErrorHandler {
  constructor(private logger: LoggerService) {}

  handleError(error: any): void {
    // Extract useful error information
    const message = error.message || 'Unknown error';
    const stack = error.stack || '';
    const name = error.name || 'Error';
    
    // Log the error with the logger service
    this.logger.error(`${name}: ${message}`, { stack });
    
    // You could also report to monitoring services like Sentry here
    
    // Optionally rethrow or handle the error differently based on environment
    if (!environment.production) {
      console.error('An error occurred:', error);
    }
  }
}

// Factory function to initialize the logger
function initializeLogger(logger: LoggerService) {
  return () => {
    // Convert string log level from environment to enum
    const logLevel = LogLevel[environment.logLevel as keyof typeof LogLevel];
    
    // Configure additional logging options
    const options = {
      saveToFile: (environment as any).logging?.saveToFile,
      maxLogFiles: (environment as any).logging?.maxLogFiles,
      maxLogSize: (environment as any).logging?.maxLogSize
    };
    
    // Handle null remoteLoggingUrl by passing undefined instead
    const remoteLoggingUrl = environment.remoteLoggingUrl || undefined;
    
    logger.configure(logLevel, remoteLoggingUrl, options);
    logger.info('Application initialized', { 
      version: '1.0.0',
      environment: environment.production ? 'production' : 'development'
    });
  };
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
  
  // Log the request
  logger.debug(
    `HTTP Request ${requestId}: ${req.method} ${req.url}`, 
    {
      method: req.method,
      url: req.url,
      headers: getSafeHeaders(req.headers),
      params: req.params.toString()
    }
  );
  
  return next(req).pipe(
    tap(event => {
      if (event.type === 4) { // HttpEventType.Response = 4
        const elapsedTime = Date.now() - startTime;
        
        // Log the response
        logger.debug(
          `HTTP Response ${requestId}: ${event.status} (${elapsedTime}ms)`,
          {
            status: event.status,
            statusText: event.statusText,
            url: event.url,
            elapsedTime
          }
        );
      }
    }),
    catchError(error => {
      const elapsedTime = Date.now() - startTime;
      
      // Log the error
      logger.error(
        `HTTP Error ${requestId}: ${error.status} ${error.statusText} (${elapsedTime}ms)`,
        {
          status: error.status,
          statusText: error.statusText,
          url: error.url,
          elapsedTime,
          message: error.message,
          error: error.error
        }
      );
      
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
      withInterceptors([loggingInterceptor])
    ),
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler,
      deps: [LoggerService]
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeLogger,
      deps: [LoggerService],
      multi: true
    }
  ]
};