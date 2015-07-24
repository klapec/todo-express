// Logging helper
// Built using winston
//
// Logs errors to a file on production and to console on development
// Logs occasional info events to the console

import path from 'path';
import winston from 'winston';

const errorPath = path.resolve('logs/errors.log');
const env = process.env.NODE_ENV;
const transports = [];

if (env === 'production') {
  transports.push(
    new winston.transports.Console({
      name: 'info',
      colorize: true
    }),
    new winston.transports.File({
      name: 'error',
      level: 'error',
      filename: errorPath,
      handleExceptions: true,
      maxsize: 5242880,
      maxFiles: 5,
      tailable: true
    })
  );
} else if (env === 'development') {
  transports.push(
    new winston.transports.Console({
      level: 'info',
      colorize: true
    })
  );
}

const logger = new winston.Logger({
  transports,
  exitOnError: false
});

export default logger;
