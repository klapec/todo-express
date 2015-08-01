import express from 'express';
import mongoose from 'mongoose';
import logger from './helpers/logger';
import mongoConfig from './config/mongo';

const app = express();
const port = process.env.PORT || 3000;
const mongoUri = process.env.MONGOURI || mongoConfig.uri;

const connect = () => {
  mongoose.connect(mongoUri, {server: {socketOptions: {keepAlive: 1}}});
};
connect();

const db = mongoose.connection;

db.on('connected', () => {
  logger.info('Connected to the database');
});
db.on('error', err => {
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

// Create a test account if running as an example on heroku
if (process.env.HEROKU_EXAMPLE) {
  const User = mongoose.model('User');
  User.findOne(
    { email: 'test@gmail.com' },
    (err, user) => {
      if (err) {
        logger.error('Error looking up for a test user account: ', err);
      } else if (!user) {
        const newUser = new User({
          email: 'test@gmail.com',
          password: 'test',
          passwordConfirmation: 'test',
          createdAt: new Date()
        });

        newUser.save(err => {
          if (err) {
            return logger.error('Error creating a test user account', err);
          }
          logger.info('Successfully created a test user account');
        });
      } else {
        logger.info('Test user account already created');
      }
    }
  );
}

export default app;
