export const environment = {
    production: false,
    apiKey: 'abcd',
    logging: {
      level: 'TRACE',
      remoteLoggingUrl: null,
      saveToFile: true,
      maxLogFiles: 5,
      maxLogSize: 10 * 1024 * 1024, // 10MB
    }
  };