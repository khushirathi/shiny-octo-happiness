// src/environments/environment.development.ts

import { Environment } from './environment.interface';

export const environment: Environment = {
    production: false,
    apiKey: 'abcd',
    apiBaseUrl: 'http://localhost:3000/api',
    apiVersion: 'v1',
    auth: {
        clientId: 'dev-client-id',
        authority: 'https://dev-auth.example.com',
        redirectUri: 'http://localhost:4200/callback'
    },
    features: {
        enableAnalytics: false,
        enableCache: true,
        debugMode: true
    },
    logging: {
        level: 'debug',
        enableRemoteLogging: false
    },
    cache: {
        ttl: 300, // 5 minutes
        maxSize: 10 // 10 MB
    }
}