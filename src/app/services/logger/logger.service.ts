// core/services/logger.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../../environments/environment';

export enum LogLevel {
  TRACE = 0,
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4,
  FATAL = 5,
  OFF = 6
}

export interface LogEntry {
  message: string;
  level: LogLevel;
  timestamp: Date;
  additionalInfo?: any;
  source?: string;  // Added back for explicit source tracking
}

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  private logLevel: LogLevel = environment.production ? LogLevel.WARN : LogLevel.DEBUG;
  private remoteLoggingUrl: string | null = environment.logging?.remoteLoggingUrl || null;
  private saveToFile: boolean = environment.logging?.saveToFile || false;
  private maxLogFiles: number = environment.logging?.maxLogFiles || 5;
  private maxLogSize: number = environment.logging?.maxLogSize || 10 * 1024 * 1024; // 10MB
  private isBrowser: boolean;
  private fileSystem: any;
  private pendingLogs: LogEntry[] = [];
  private processingLogs = false;
  
  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    // Initialize file system access for browser environments
    if (this.isBrowser && this.saveToFile) {
      this.initializeFileSystem();
    }
  }
  
  /**
   * Configures the logger
   * @param level Minimum log level
   * @param remoteLoggingUrl URL for server-side logging (optional)
   * @param options Additional configuration options
   */
  configure(level: LogLevel, remoteLoggingUrl?: string | null, options?: {
    saveToFile?: boolean;
    maxLogFiles?: number;
    maxLogSize?: number;
  }): void {
    this.logLevel = level;
    this.remoteLoggingUrl = remoteLoggingUrl || null;
    
    if (options) {
      if (options.saveToFile !== undefined) this.saveToFile = options.saveToFile;
      if (options.maxLogFiles) this.maxLogFiles = options.maxLogFiles;
      if (options.maxLogSize) this.maxLogSize = options.maxLogSize;
      
      // Re-initialize file system if needed
      if (this.isBrowser && this.saveToFile) {
        this.initializeFileSystem();
      }
    }
  }
  
  /**
   * Initializes the file system for local file logging
   */
  private initializeFileSystem(): void {
    try {
      console.info('Using IndexedDB for local log storage (fixed path implementation)');
      this.initializeIndexedDB();
    } catch (error) {
      console.error('Error setting up file logging:', error);
    }
  }
  
  /**
   * Initializes IndexedDB for log storage
   */
  private initializeIndexedDB(): void {
    const self = this; // Store this reference for callbacks
    const request = indexedDB.open('AppLogs', 1); // Simplified to version 1
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create logs store for individual log entries
      const store = db.createObjectStore('logs', { keyPath: 'timestamp' });
      store.createIndex('level', 'level', { unique: false });
      store.createIndex('date', 'date', { unique: false });
      store.createIndex('source', 'source', { unique: false }); // Added back for filtering
      
      // Create logFiles store for complete log files
      const filesStore = db.createObjectStore('logFiles', { keyPath: 'name' });
      filesStore.createIndex('lastModified', 'lastModified', { unique: false });
    };
    
    request.onsuccess = (event) => {
      self.fileSystem = (event.target as IDBOpenDBRequest).result;
    };
    
    request.onerror = (event) => {
      console.error('Error initializing IndexedDB for logging:', (event.target as IDBOpenDBRequest).error);
    };
  }
  
  /**
   * Logs a trace message
   * @param source Source of the log (e.g., 'ServiceName.methodName')
   * @param message Message to log
   * @param additionalInfo Any additional information to include
   */
  trace(source: string, message: string, additionalInfo?: any): void {
    this.log(LogLevel.TRACE, message, additionalInfo, source);
  }
  
  /**
   * Logs a debug message
   * @param source Source of the log (e.g., 'ServiceName.methodName')
   * @param message Message to log
   * @param additionalInfo Any additional information to include
   */
  debug(source: string, message: string, additionalInfo?: any): void {
    this.log(LogLevel.DEBUG, message, additionalInfo, source);
  }
  
  /**
   * Logs an info message
   * @param source Source of the log (e.g., 'ServiceName.methodName')
   * @param message Message to log
   * @param additionalInfo Any additional information to include
   */
  info(source: string, message: string, additionalInfo?: any): void {
    this.log(LogLevel.INFO, message, additionalInfo, source);
  }
  
  /**
   * Logs a warning message
   * @param source Source of the log (e.g., 'ServiceName.methodName')
   * @param message Message to log
   * @param additionalInfo Any additional information to include
   */
  warn(source: string, message: string, additionalInfo?: any): void {
    this.log(LogLevel.WARN, message, additionalInfo, source);
  }
  
  /**
   * Logs an error message
   * @param source Source of the log (e.g., 'ServiceName.methodName')
   * @param message Message to log
   * @param additionalInfo Any additional information to include
   */
  error(source: string, message: string, additionalInfo?: any): void {
    this.log(LogLevel.ERROR, message, additionalInfo, source);
  }
  
  /**
   * Logs a fatal error message
   * @param source Source of the log (e.g., 'ServiceName.methodName')
   * @param message Message to log
   * @param additionalInfo Any additional information to include
   */
  fatal(source: string, message: string, additionalInfo?: any): void {
    this.log(LogLevel.FATAL, message, additionalInfo, source);
  }
  
  /**
   * Main logging method
   * @param level Log level
   * @param message Message to log
   * @param additionalInfo Any additional information to include
   * @param source Source of the log (e.g., 'ServiceName.methodName')
   */
  private log(level: LogLevel, message: string, additionalInfo?: any, source?: string): void {
    // Only log if the level is appropriate
    if (this.shouldLog(level)) {
      // Create log entry with source information
      const entry: LogEntry = {
        message,
        level,
        timestamp: new Date(),
        additionalInfo,
        source
      };
      
      // Log to console
      this.logToConsole(entry);
      
      // Log to server if configured
      if (this.remoteLoggingUrl) {
        this.logToServer(entry);
      }
    }
  }
  
  /**
   * Determines if a message should be logged based on configured level
   * @param level Log level to check
   * @returns boolean
   */
  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel && this.logLevel !== LogLevel.OFF;
  }
  
  /**
   * Logs message to console with formatting
   * @param entry Log entry to display
   */
  private logToConsole(entry: LogEntry): void {
    const color = this.getColorForLevel(entry.level);
    const timestamp = entry.timestamp.toISOString();
    const levelName = LogLevel[entry.level];
    const source = entry.source ? `[${entry.source}]` : '';
    
    // Format: [TIMESTAMP] [LEVEL] [SOURCE] Message
    const formattedMessage = `[${timestamp}] [${levelName}] ${source} ${entry.message}`;
    
    // Force console.debug to be visible in development mode by using console.log instead
    const isLocalDev = !environment.production && this.isBrowser && 
                      (typeof window !== 'undefined') && 
                      window.location && 
                      window.location.hostname === 'localhost';
    
    // Use appropriate console methods based on level and environment
    if ((entry.level === LogLevel.DEBUG || entry.level === LogLevel.TRACE) && isLocalDev) {
      // Use console.log for debug/trace in local dev to ensure visibility
      console.log(`%c${formattedMessage}`, `color: ${color}`, entry.additionalInfo);
    } else {
      // Use standard console methods for other cases
      switch (entry.level) {
        case LogLevel.TRACE:
        case LogLevel.DEBUG:
          console.debug(`%c${formattedMessage}`, `color: ${color}`, entry.additionalInfo);
          break;
        case LogLevel.INFO:
          console.info(`%c${formattedMessage}`, `color: ${color}`, entry.additionalInfo);
          break;
        case LogLevel.WARN:
          console.warn(`%c${formattedMessage}`, `color: ${color}`, entry.additionalInfo);
          break;
        case LogLevel.ERROR:
        case LogLevel.FATAL:
          console.error(`%c${formattedMessage}`, `color: ${color}`, entry.additionalInfo);
          break;
      }
    }
    
    // Save log to file if enabled (for local development)
    if (this.saveToFile && this.isBrowser) {
      this.logToFile(entry);
    }
  }
  
  /**
   * Writes log to local file system
   * @param entry Log entry to save
   */
  private logToFile(entry: LogEntry): void {
    // Add to pending logs queue
    this.pendingLogs.push(entry);
    
    // Process queue if not already processing
    if (!this.processingLogs) {
      this.processLogQueue();
    }
  }
  
  /**
   * Process pending logs queue
   */
  private async processLogQueue(): Promise<void> {
    if (this.pendingLogs.length === 0 || this.processingLogs) {
      return;
    }
    
    this.processingLogs = true;
    
    try {
      // Get all logs that need to be written
      const logsToWrite = [...this.pendingLogs];
      this.pendingLogs = [];
      
      // Format logs for writing
      const logLines = logsToWrite.map(entry => {
        const timestamp = entry.timestamp.toISOString();
        const levelName = LogLevel[entry.level];
        const additionalInfo = entry.additionalInfo ? 
          ` | ${JSON.stringify(entry.additionalInfo)}` : '';
        
        return `[${timestamp}] [${levelName}] ${entry.message}${additionalInfo}`;
      }).join('\n') + '\n';
      
      // Use IndexedDB for storing logs in the browser
      await this.writeToIndexedDB(logLines, logsToWrite);
    } catch (error) {
      console.error('Error writing logs to storage:', error);
    } finally {
      this.processingLogs = false;
      
      // If there are more logs in the queue, process them
      if (this.pendingLogs.length > 0) {
        setTimeout(() => this.processLogQueue(), 100);
      }
    }
  }
  
  /**
   * Write logs to IndexedDB
   */
  private async writeToIndexedDB(logLines: string, logsToWrite: LogEntry[]): Promise<void> {
    if (!this.fileSystem) {
      // Initialize IndexedDB if not already done
      await this.initializeIndexedDBPromise();
    }
    
    if (this.fileSystem instanceof IDBDatabase) {
      try {
        const transaction = this.fileSystem.transaction(['logs', 'logFiles'], 'readwrite');
        const logsStore = transaction.objectStore('logs');
        const filesStore = transaction.objectStore('logFiles');
        
        // Get current date for filename
        const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
        const fileName = `app_${today}.log`;
        
        // Check if we already have a file for today
        const getFileRequest = filesStore.get(fileName);
        
        getFileRequest.onsuccess = (event) => {
          const fileEntry = (event.target as IDBRequest).result;
          
          if (fileEntry) {
            // Append to existing file
            filesStore.put({
              name: fileName,
              content: fileEntry.content + logLines,
              lastModified: new Date(),
              size: fileEntry.content.length + logLines.length
            });
          } else {
            // Create new file
            filesStore.add({
              name: fileName,
              content: logLines,
              lastModified: new Date(),
              size: logLines.length
            });
          }
        };
        
        // Also store individual log entries for querying
        for (const entry of logsToWrite) {
          // Add date string for easier querying and include source info
          const logRecord = {
            ...entry,
            date: entry.timestamp.toISOString().slice(0, 10),
            // Ensure source is included for filtering
            source: entry.source || 'unknown'
          };
          
          logsStore.add(logRecord);
        }
        
        // Clean up old logs
        this.cleanUpIndexedDBLogs();
      } catch (error) {
        console.error('Error writing to IndexedDB:', error);
      }
    }
  }
  
  /**
   * Initialize IndexedDB with a Promise wrapper
   */
  private initializeIndexedDBPromise(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const request = indexedDB.open('AppLogs', 1); // Match version with main initialization
        
        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          
          // Create logs store
          const store = db.createObjectStore('logs', { keyPath: 'timestamp' });
          store.createIndex('level', 'level', { unique: false });
          store.createIndex('date', 'date', { unique: false });
          store.createIndex('source', 'source', { unique: false }); // Added back for filtering
          
          // Create logFiles store
          const filesStore = db.createObjectStore('logFiles', { keyPath: 'name' });
          filesStore.createIndex('lastModified', 'lastModified', { unique: false });
        };
        
        request.onsuccess = (event) => {
          this.fileSystem = (event.target as IDBOpenDBRequest).result;
          resolve();
        };
        
        request.onerror = (event) => {
          const error = (event.target as IDBOpenDBRequest).error;
          console.error('Error initializing IndexedDB for logging:', error);
          reject(error);
        };
      } catch (error) {
        console.error('Exception initializing IndexedDB:', error);
        reject(error);
      }
    });
  }
  
  /**
   * Cleans up old logs from IndexedDB
   */
  private cleanUpIndexedDBLogs(): void {
    try {
      if (!(this.fileSystem instanceof IDBDatabase)) {
        return;
      }
      
      const self = this;
      
      // Clean up individual log entries
      const logsTransaction = this.fileSystem.transaction(['logs'], 'readwrite');
      const logsStore = logsTransaction.objectStore('logs');
      const logsIndex = logsStore.index('date');
      
      // Get unique dates
      const logDatesRequest = logsIndex.getAll();
      
      logDatesRequest.onsuccess = (event) => {
        const logs = (event.target as IDBRequest).result;
        
        // Extract unique dates
        const uniqueDates = [...new Set(logs.map((log: any) => log.date))];
        
        // Sort dates (oldest first)
        uniqueDates.sort();
        
        // Keep only the newest maxLogFiles days
        while (uniqueDates.length > self.maxLogFiles) {
          const oldestDate = uniqueDates.shift();
          
          // Delete logs from oldest date
          const range = IDBKeyRange.only(oldestDate);
          logsStore.index('date').openCursor(range).onsuccess = (event) => {
            const cursor = (event.target as IDBRequest).result;
            if (cursor) {
              cursor.delete();
              cursor.continue();
            }
          };
        }
      };
      
      // Clean up log files
      const filesTransaction = this.fileSystem.transaction(['logFiles'], 'readwrite');
      const filesStore = filesTransaction.objectStore('logFiles');
      const lastModifiedIndex = filesStore.index('lastModified');
      
      // Get all log files sorted by lastModified
      const filesRequest = lastModifiedIndex.getAll();
      
      filesRequest.onsuccess = (event) => {
        const files = (event.target as IDBRequest).result;
        
        // Sort by lastModified (oldest first)
        files.sort((a: any, b: any) => {
          return new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime();
        });
        
        // Delete old files if we have more than maxLogFiles
        while (files.length > self.maxLogFiles) {
          const oldestFile = files.shift();
          if (oldestFile) {
            filesStore.delete(oldestFile.name);
          }
        }
      };
    } catch (error) {
      console.error('Error cleaning up IndexedDB logs:', error);
    }
  }
  
  /**
   * Sends log data to remote server
   * @param entry Log entry to send
   */
  private logToServer(entry: LogEntry): void {
    // Only send higher-level logs to the server
    if (entry.level >= LogLevel.INFO && this.remoteLoggingUrl) {
      // Send to generic endpoint
      this.http.post(this.remoteLoggingUrl, entry).subscribe({
        error: (err) => {
          // If remote logging fails, log to console but don't retry to avoid loops
          console.error('Remote logging failed:', err);
        }
      });
    }
  }
  
  /**
   * Gets appropriate color for console log based on level
   * @param level Log level
   * @returns CSS color string
   */
  private getColorForLevel(level: LogLevel): string {
    switch (level) {
      case LogLevel.TRACE:
        return 'gray';
      case LogLevel.DEBUG:
        return 'blue';
      case LogLevel.INFO:
        return 'green';
      case LogLevel.WARN:
        return 'orange';
      case LogLevel.ERROR:
        return 'red';
      case LogLevel.FATAL:
        return 'purple';
      default:
        return 'black';
    }
  }
}