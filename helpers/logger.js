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
} else {
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
