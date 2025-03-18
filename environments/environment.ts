export const environment = {
    production: false,
    apiBaseUrl: 'https://api.example.com/v1',
    apiKey: 'abcd',
    logging: {
      level: 'TRACE',
      remoteLoggingUrl: null,
      saveToFile: true,
      maxLogFiles: 5,
      maxLogSize: 10 * 1024 * 1024, // 10MB
    }
  };