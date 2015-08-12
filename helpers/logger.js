// Logging helper
// Built using winston

import path from 'path';
import winston from 'winston';

const infoPath = path.resolve('logs/messages.log');
const env = process.env.NODE_ENV;
const transports = [];

if (env === 'production') {
  transports.push(
    new winston.transports.Console({
      timestamp() {
        return new Date().toGMTString();
      },
      colorize: true
    }),
    new winston.transports.File({
      filename: infoPath,
      handleExceptions: true,
      timestamp() {
        return new Date().toGMTString();
      },
      maxsize: 102400,
      maxFiles: 5,
      tailable: true,
      prettyPrint: true
    })
  );
} else if (env === 'development') {
  transports.push(
    new winston.transports.Console({
      level: 'info',
      timestamp() {
        return new Date().toGMTString();
      },
      colorize: true
    })
  );
}

const logger = new winston.Logger({
  transports,
  exitOnError: false
});

export default logger;
