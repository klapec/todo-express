import express from 'express';
import mongoose from 'mongoose';
import logger from './helpers/logger';
import config from './config/config';

const app = express();
const port = process.env.PORT || 3000;

const connect = () => {
  mongoose.connect(config.db, {server: {socketOptions: {keepAlive: 1}}});
};
connect();

const db = mongoose.connection;

db.on('connected', () => {
  logger.info('Connected to the database');
});
db.on('error', (err) => {
  logger.info(`Error connecting to database ${err}`);
});

// Initialize models
import './models/user';
import './models/task';

import passportConf from './config/passport';
import expressConf from './config/express';
import routesConf from './config/routes';

passportConf();
expressConf(app);
routesConf(app);

// Set up server
app.listen(port, () => {
  logger.info(`Server listening on port: ${port}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
});
