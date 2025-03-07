export const environment = {
    production: false,
    apiKey: 'abcd',
    logLevel: 'TRACE',
    remoteLoggingUrl: null,
    logging: {
      saveToFile: true,
      logFilePath: 'logs/app.log',
      maxLogFiles: 5,
      maxLogSize: 10 * 1024 * 1024, // 10MB
    }
  };