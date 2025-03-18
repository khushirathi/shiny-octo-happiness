export const environment = {
    production: false,
    apiKey: 'abcd',
    apiBaseUrl: 'https://api.example.com/v1',
    logging: {
      level: 'TRACE',
      remoteLoggingUrl: null,
      saveToFile: true,
      maxLogFiles: 5,
      maxLogSize: 10 * 1024 * 1024, // 10MB
    }  
  };