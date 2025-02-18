// src/environments/environment.staging.ts

import { Environment } from './environment.interface';

export const environment: Environment = {
    production: false,
    apiBaseUrl: 'https://api-staging.example.com/api',
    apiVersion: 'v1',
    auth: {
        clientId: 'staging-client-id',
        authority: 'https://staging-auth.example.com',
        redirectUri: 'https://app-staging.example.com/callback'
    },
    features: {
        enableAnalytics: true,
        enableCache: true,
        debugMode: true
    },
    logging: {
        level: 'info',
        enableRemoteLogging: true,
        logEndpoint: 'https://logging-staging.example.com/logs'
    },
    cache: {
        ttl: 600, // 10 minutes
        maxSize: 20 // 20 MB
    }
}