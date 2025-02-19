// src/environments/environment.interface.ts

export interface Environment {
    production: boolean;
    apiKey: string;
    apiBaseUrl: string;
    apiVersion: string;
    auth: {
        clientId: string;
        authority: string;
        redirectUri: string;
    };
    features: {
        enableAnalytics: boolean;
        enableCache: boolean;
        debugMode: boolean;
    };
    logging: {
        level: 'debug' | 'info' | 'warn' | 'error';
        enableRemoteLogging: boolean;
        logEndpoint?: string;
    };
    cache: {
        ttl: number; // Time to live in seconds
        maxSize: number; // Maximum cache size in MB
    };
}