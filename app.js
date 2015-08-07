import fs from 'fs';
import express from 'express';
import mongoose from 'mongoose';
import connectMongo from 'connect-mongo';
import passport from 'passport';
import session from 'express-session';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import exphbs from 'express-handlebars';
import flash from 'connect-flash';
import routes from './routes';
import localStrategy from './config/passport/local';
import User from './models/user';
import logger from './helpers/logger';
import defaultUri from './config/mongo';
import pkg from './package.json';

const app = express();
const MongoStore = connectMongo(session);
const port = process.env.PORT || 3000;
const mongoUri = process.env.MONGO_URI || defaultUri;
const env = process.env.NODE_ENV || 'development';
const runningOnHeroku = process.env.HEROKU_EXAMPLE || false;

const connect = () => {
  mongoose.connect(mongoUri, { server: { socketOptions: { keepAlive: 1 }}});
};
connect();

const db = mongoose.connection;

db.on('connected', () => {
  logger.info('Connected to the database');
});
db.on('error', err => {
  logger.error(`Error connecting to database: ${err}`);
});

if (env === 'production') {
  const accessLogStream = fs.createWriteStream('./logs/access.log', {flags: 'a'});
  // We're behind Nginx proxy on production
  app.set('trust proxy', 1);
  // Log HTTP requests to access.log
  app.use(morgan('combined', {stream: accessLogStream}));
} else if (env === 'development') {
  // Log HTTP requests to console on development
  app.use(morgan('dev'));
}

app.use(express.static('public'));

app.engine('hbs', exphbs({
  extname: '.hbs',
  defaultLayout: 'default'
}));
app.set('view engine', 'hbs');

// Add the test account information to the login page and Google Analytics script
// when running as a project example on heroku
app.locals.runningAsExample = runningOnHeroku;

// Exposes package.json and env to the views
app.use((req, res, next) => {
  res.locals.pkg = pkg;
  res.locals.env = env;
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(session({
  name: 'session',
  resave: false,
  saveUninitialized: false,
  secret: pkg.name,
  cookie: {
    maxAge: 86400000 // 24 hours
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

// Start the server
app.listen(port, () => {
  logger.info(`Server listening on port: ${port}`);
  logger.info(`Environment: ${env}`);
});

// Create a test account if running as an example on heroku
if (runningOnHeroku) {
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

export default app;
