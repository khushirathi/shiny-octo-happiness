// core/services/logger.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { LoggerService, LogLevel } from './logger.service';
import { PLATFORM_ID } from '@angular/core';
import { environment } from '../../../../environments/environment';

describe('LoggerService', () => {
  let service: LoggerService;
  let httpMock: HttpTestingController;
  let originalEnvironment: any;
  
  beforeEach(() => {
    // Save original environment configuration
    originalEnvironment = { ...environment };
    
    // Mock environment configuration for testing
    (environment as any).logging = {
      level: 'DEBUG',
      remoteLoggingUrl: 'http://test-api/logs',
      saveToFile: false
    };
    
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        LoggerService,
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    });
    
    service = TestBed.inject(LoggerService);
    httpMock = TestBed.inject(HttpTestingController);
    
    // Spy on console methods
    spyOn(console, 'debug');
    spyOn(console, 'info');
    spyOn(console, 'warn');
    spyOn(console, 'error');
    spyOn(console, 'log');  // Also spy on console.log which might be used instead of console.debug
  });
  
  // Restore environment after tests
  afterEach(() => {
    Object.assign(environment, originalEnvironment);
    httpMock.verify();
  });
  
  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  
  it('should log debug messages to console with source', () => {
    service.configure(LogLevel.DEBUG);
    service.debug('TestSource.method', 'Test debug message');
    
    // Since we're running in a test environment, the logger might use console.log
    // instead of console.debug as per our implementation
    const debugSpy = console.debug as jasmine.Spy;
    const logSpy = console.log as jasmine.Spy;
    
    // Check if either console.debug or console.log was called
    const wasDebugCalled = debugSpy.calls.any();
    const wasLogCalled = logSpy && logSpy.calls.any();
    
    // At least one of them should have been called
    expect(wasDebugCalled || wasLogCalled).toBe(true, 'Neither console.debug nor console.log was called');
    
    // If debug was called, check the formatting
    if (wasDebugCalled) {
      expect(debugSpy).toHaveBeenCalledWith(
        jasmine.stringMatching(/\[DEBUG\] \[TestSource.method\]/),
        jasmine.anything(),
        undefined
      );
    }
    // If log was called instead (which happens in local development mode), check that
    else if (wasLogCalled) {
      expect(logSpy).toHaveBeenCalledWith(
        jasmine.stringMatching(/\[DEBUG\] \[TestSource.method\]/),
        jasmine.anything(),
        undefined
      );
    }
  });
  
  it('should not log debug messages when level is set to INFO', () => {
    service.configure(LogLevel.INFO);
    service.debug('TestSource.method', 'Test debug message');
    
    expect(console.debug).not.toHaveBeenCalled();
  });
  
  it('should log info messages when level is set to INFO', () => {
    service.configure(LogLevel.INFO);
    service.info('TestSource.method', 'Test info message');
    
    expect(console.info).toHaveBeenCalled();
  });
  
  it('should log warning messages when level is set to WARN', () => {
    service.configure(LogLevel.WARN);
    service.warn('TestSource.method', 'Test warning message');
    
    expect(console.warn).toHaveBeenCalled();
  });
  
  it('should log error messages when level is set to ERROR', () => {
    service.configure(LogLevel.ERROR);
    service.error('TestSource.method', 'Test error message');
    
    expect(console.error).toHaveBeenCalled();
  });
  
  it('should not log info messages when level is set to ERROR', () => {
    service.configure(LogLevel.ERROR);
    service.info('TestSource.method', 'Test info message');
    
    expect(console.info).not.toHaveBeenCalled();
  });
  
  it('should send logs to remote server when URL is configured', () => {
    const testUrl = 'https://api.example.com/logs';
    service.configure(LogLevel.INFO, testUrl);
    service.error('TestSource.method', 'Test remote error message', { code: 500 });
    
    const req = httpMock.expectOne(testUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.message).toBe('Test remote error message');
    expect(req.request.body.level).toBe(LogLevel.ERROR);
    expect(req.request.body.additionalInfo).toEqual({ code: 500 });
    expect(req.request.body.source).toBe('TestSource.method');
  });
  
  it('should not send debug logs to remote server even when remote logging is enabled', () => {
    const testUrl = 'https://api.example.com/logs';
    service.configure(LogLevel.DEBUG, testUrl);
    service.debug('TestSource.method', 'Test debug message');
    
    httpMock.expectNone(testUrl);
  });
  
  it('should include additional info in log entries when provided', () => {
    service.configure(LogLevel.DEBUG);
    const additionalInfo = { userId: '12345', action: 'test' };
    service.info('TestSource.method', 'Test with additional info', additionalInfo);
    
    expect(console.info).toHaveBeenCalled();
    // The third argument should be our additionalInfo
    expect((console.info as jasmine.Spy).calls.mostRecent().args[2]).toEqual(additionalInfo);
  });
  
  it('should log nothing when level is set to OFF', () => {
    service.configure(LogLevel.OFF);
    service.debug('TestSource.method', 'Debug message');
    service.info('TestSource.method', 'Info message');
    service.warn('TestSource.method', 'Warning message');
    service.error('TestSource.method', 'Error message');
    service.fatal('TestSource.method', 'Fatal message');
    
    expect(console.debug).not.toHaveBeenCalled();
    expect(console.info).not.toHaveBeenCalled();
    expect(console.warn).not.toHaveBeenCalled();
    expect(console.error).not.toHaveBeenCalled();
  });
});