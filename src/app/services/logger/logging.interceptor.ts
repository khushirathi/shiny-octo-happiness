// core/interceptors/logging.interceptor.ts
import { Injectable } from '@angular/core';
import { 
  HttpInterceptor, 
  HttpRequest, 
  HttpHandler, 
  HttpEvent, 
  HttpResponse, 
  HttpErrorResponse,
  HttpContextToken
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, finalize } from 'rxjs/operators';
import { LoggerService } from './logger.service';

// Create a context token to disable logging for specific requests
export const DISABLE_LOGGING = new HttpContextToken<boolean>(() => false);

@Injectable()
export class LoggingInterceptor implements HttpInterceptor {
  constructor(private logger: LoggerService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip logging if disabled for this request
    if (request.context.get(DISABLE_LOGGING)) {
      return next.handle(request);
    }

    // Don't log requests to the logging endpoint to avoid infinite loops
    if (request.url.includes('/logs')) {
      return next.handle(request);
    }

    const startTime = Date.now();
    let requestId = this.generateRequestId();
    
    // Log the outgoing request
    this.logRequest(request, requestId);
    
    return next.handle(request).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          this.logResponse(event, requestId, startTime);
        }
      }),
      catchError(error => {
        this.logError(error, requestId, startTime);
        return throwError(() => error);
      }),
      finalize(() => {
        const elapsedTime = Date.now() - startTime;
        this.logger.debug(`Request ${requestId} completed in ${elapsedTime}ms`);
      })
    );
  }

  private generateRequestId(): string {
    return `req-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  }

  private logRequest(request: HttpRequest<any>, requestId: string): void {
    const { url, method, headers, params, body } = request;
    
    // Only include non-sensitive headers
    const safeHeaders: { [key: string]: string } = {};
    headers.keys().forEach(key => {
      if (!this.isSensitiveHeader(key)) {
        safeHeaders[key] = headers.get(key) || '';
      }
    });
    
    this.logger.debug(
      `HTTP Request ${requestId}: ${method} ${url}`, 
      {
        method,
        url,
        headers: safeHeaders,
        params: params.toString(),
        body: this.sanitizeBody(body)
      }
    );
  }

  private logResponse(response: HttpResponse<any>, requestId: string, startTime: number): void {
    const elapsedTime = Date.now() - startTime;
    
    // Only log body for non-binary responses
    let responseBody = {};
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('json')) {
      responseBody = this.sanitizeBody(response.body);
    } else if (!contentType.includes('octet-stream') && !contentType.includes('image/')) {
      responseBody = { type: contentType, size: JSON.stringify(response.body).length };
    } else {
      responseBody = { type: contentType, size: 'binary data' };
    }
    
    this.logger.debug(
      `HTTP Response ${requestId}: ${response.status} (${elapsedTime}ms)`,
      {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        elapsedTime,
        headers: this.getHeadersMap(response.headers),
        body: responseBody
      }
    );
  }

  private logError(error: HttpErrorResponse, requestId: string, startTime: number): void {
    const elapsedTime = Date.now() - startTime;
    
    this.logger.error(
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
  }

  private getHeadersMap(headers: any): { [key: string]: string } {
    const result: { [key: string]: string } = {};
    if (headers && headers.keys) {
      headers.keys().forEach((key: string) => {
        if (!this.isSensitiveHeader(key)) {
          result[key] = headers.get(key);
        }
      });
    }
    return result;
  }

  private isSensitiveHeader(headerName: string): boolean {
    const sensitiveHeaders = [
      'authorization', 
      'cookie', 
      'x-auth-token',
      'x-api-key',
      'jwt',
      'password',
      'secret'
    ];
    
    return sensitiveHeaders.some(h => 
      headerName.toLowerCase().includes(h.toLowerCase())
    );
  }

  private sanitizeBody(body: any): any {
    if (!body) {
      return body;
    }
    
    // For simple objects, return a shallow copy
    if (typeof body !== 'object') {
      return body;
    }
    
    // For File or Blob objects, just return the type and size
    if (body instanceof File || body instanceof Blob) {
      return {
        type: body.type,
        size: body.size,
        name: body instanceof File ? body.name : 'Blob'
      };
    }
    
    // For FormData, return a list of keys
    if (body instanceof FormData) {
      const keys: string[] = [];
      (body as any).forEach((_: any, key: string) => keys.push(key));
      return { formData: keys };
    }
    
    // For regular objects, sanitize sensitive properties
    try {
      const sanitized = { ...body };
      
      // List of potentially sensitive properties
      const sensitiveProps = [
        'password', 'token', 'secret', 'apiKey', 'api_key', 'key',
        'credential', 'credentials', 'auth', 'authentication', 'jwt'
      ];
      
      // Replace sensitive values with a placeholder
      this.recursiveSanitize(sanitized, sensitiveProps);
      
      return sanitized;
    } catch (error) {
      return { sanitized: false, error: 'Could not sanitize body' };
    }
  }

  private recursiveSanitize(obj: any, sensitiveProps: string[]): void {
    if (!obj || typeof obj !== 'object') {
      return;
    }
    
    Object.keys(obj).forEach(key => {
      // Check if the key is sensitive
      if (sensitiveProps.some(prop => key.toLowerCase().includes(prop.toLowerCase()))) {
        obj[key] = '[REDACTED]';
      } 
      // Recurse if the value is an object but not null
      else if (obj[key] && typeof obj[key] === 'object') {
        this.recursiveSanitize(obj[key], sensitiveProps);
      }
    });
  }
}