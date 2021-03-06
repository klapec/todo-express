import { EventEmitter } from 'events';
import { fork } from 'child_process';
import express from 'express';
import mongoose from 'mongoose';
import connectMongo from 'connect-mongo';
import passport from 'passport';
import session from 'express-session';
import morgan from 'morgan';
import logRotate from 'logrotate-stream';
import requestIp from 'request-ip';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import exphbs from 'express-handlebars';
import flash from 'connect-flash';
import chalk from 'chalk';
import routes from './routes';
import localStrategy from './config/passport/local';
import User from './models/user';
import logger from './helpers/logger';
import defaultUri from './config/mongo';
import pkg from '../package.json';

const app = express();
const MongoStore = connectMongo(session);
const ipAddress = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
const port = process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 3000;
const mongoUri = process.env.MONGO_URI || defaultUri;
const env = process.env.NODE_ENV || 'development';
const runningOnOpenshift = process.env.OPENSHIFT_EXAMPLE || false;

morgan.token('timestamp', () => {
  return new Date().toISOString().slice(0, -5).split('T').join(' ');
});

morgan.token('remoteIp', req => {
  return requestIp.getClientIp(req);
});

if (env === 'production') {
  const accessLogStream = logRotate({
    file: 'server/logs/access.log',
    size: '100k',
    keep: 5
  });
  // Log to file on production
  app.use(morgan(':timestamp - :remoteIp - :method :url :status ":referrer" ":user-agent" :response-time ms - :res[content-length]', {stream: accessLogStream}));
  // Also log to the console on production
  app.use(morgan(`:timestamp - :remoteIp - ${chalk.green(':method')}: :url :status :response-time ms - :res[content-length]`));
} else if (env === 'development') {
  // Only log to the console on development
  app.use(morgan(`:timestamp - ${chalk.green(':method')}: :url :status :response-time ms - :res[content-length]`));
}

if (runningOnOpenshift) {
  app.enable('trust proxy', 1);

  // Redirect to https
  app.use((req, res, next) => {
    if (req.secure) {
      // request was via https, so do no special handling
      next();
    } else {
      // request was via http, so redirect to https
      res.redirect('https://' + req.hostname + req.url);
    }
  });
}

app.use(express.static('client/public'));

app.engine('hbs', exphbs({
  extname: '.hbs',
  defaultLayout: 'default',
  layoutsDir: 'server/views/layouts',
  partialsDir: 'server/views/partials'
}));
app.set('views', 'server/views');
app.set('view engine', 'hbs');

// Add the test account information to the login page and Google Analytics script
// when running as a project example on Openshift
app.locals.runningAsExample = runningOnOpenshift;

// Exposes package.json and env to the views
app.use((req, res, next) => {
  res.locals.pkg = pkg;
  res.locals.env = env;
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser(pkg.name));
app.use(session({
  name: 'session',
  resave: false,
  saveUninitialized: false,
  secret: pkg.name,
  cookie: {
    httpOnly: true,
    maxAge: 86400000, // 24 hours
    secure: runningOnOpenshift ? true : false
  },
  store: new MongoStore({
    mongooseConnection: mongoose.connection, // Reuse existing connection
    collection: 'sessions'
  })
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

passport.use(localStrategy);

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use('/', routes);

// Create a test account if running as an example on Openshift
if (runningOnOpenshift) {
  User.findOne(
    { email: 'test@gmail.com' },
    (err, user) => {
      if (err) {
        logger.error(`Error looking up for a test user account: ${err}`);
      } else if (!user) {
        const newUser = new User({
          email: 'test@gmail.com',
          password: 'test',
          passwordConfirmation: 'test',
          createdAt: new Date()
        });

        newUser.save(err => {
          if (err) {
            return logger.error(`Error creating a test user account: ${err}`);
          }
          logger.info('Successfully created a test user account');
        });
      } else {
        logger.info('Test user account already created');
      }
    }
  );
}

export default class Server extends EventEmitter {
  constructor() {
    super();

    this.server;
  }

  connect() {
    this.server = app.listen(port, ipAddress, err => {
      if (err) {
        logger.error(`Error creating Express server: ${err}`);
        return this.emit('error-express');
      }
      logger.info(chalk.green(`Server running on port: ${port}`));
      logger.info(chalk.green(`Environment: ${chalk.blue(`${env}`)}`));
    });
    mongoose.connect(mongoUri, err => {
      if (err) {
        logger.error(`Error connecting to the database: ${err}`);
        return this.emit('error-mongo');
      }
      logger.info(chalk.green('Connected to the database'));
      this.emit('connected');
    });
  }

  // Spawn the server in a separate node process
  spawn() {
    return new Promise((resolve, reject) => {
      // Color flag for Chalk
      this.server = fork('app.js', ['--color']);
      this.server.on('message', message => {
        if (message.event === 'connected') {
          resolve();
        } else if (message.event === 'error-mongo') {
          reject(message.event);
        } else if (message.event === 'error-express') {
          reject(message.event);
        }
      });
    });
  }

  kill() {
    // If server was opened with #connect, close Express connection
    if (this.server._connectionKey) {
      this.server.close();
    // Otherwise the server was spawned, kill it
    } else {
      this.server.kill();
    }

    logger.info(chalk.red('Server has been stopped'));
  }
}
