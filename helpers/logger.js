// Logging helper
// Built using winston

import path from 'path';
import winston from 'winston';

const infoPath = path.resolve('logs/messages.log');
const env = process.env.NODE_ENV;
const transports = [];

function timestamp() {
  const now = new Date().toLocaleString();
  return now.slice(4, 15) + ' ' + now.slice(16, -16);
}

if (env === 'production') {
  transports.push(
    new winston.transports.Console({
      timestamp,
      colorize: true
    }),
    new winston.transports.File({
      filename: infoPath,
      handleExceptions: true,
      timestamp,
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
      timestamp,
      colorize: true
    })
  );
}

const logger = new winston.Logger({
  transports,
  exitOnError: false
});

export default logger;
