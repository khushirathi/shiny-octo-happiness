// src/environments/environment.ts

import { Environment } from './environment.interface';

export const environment: Environment = {
    production: false,
    apiBaseUrl: 'http://localhost:3000/api',
    apiVersion: 'v1',
    auth: {
        clientId: 'local-client-id',
        authority: 'https://local-auth.example.com',
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
        ttl: 300,
        maxSize: 10
    }
}