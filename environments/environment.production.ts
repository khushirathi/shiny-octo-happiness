// src/environments/environment.production.ts

import { Environment } from './environment.interface';

export const environment: Environment = {
    production: true,
    apiBaseUrl: 'https://api.example.com/api',
    apiVersion: 'v1',
    auth: {
        clientId: 'prod-client-id',
        authority: 'https://auth.example.com',
        redirectUri: 'https://app.example.com/callback'
    },
    features: {
        enableAnalytics: true,
        enableCache: true,
        debugMode: false
    },
    logging: {
        level: 'error',
        enableRemoteLogging: true,
        logEndpoint: 'https://logging.example.com/logs'
    },
    cache: {
        ttl: 1800, // 30 minutes
        maxSize: 50 // 50 MB
    }
}