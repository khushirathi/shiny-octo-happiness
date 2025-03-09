export const environment = {
    production: true,
    apiKey: 'abcd',
    logging: {
      level: 'WARN',
      remoteLoggingUrl: null,
      saveToFile: true,
      maxLogFiles: 5,
      maxLogSize: 10 * 1024 * 1024, // 10MB
    }  
  };