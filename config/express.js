import fs from 'fs';
import path from 'path';
import express from 'express';
import passport from 'passport';
import session from 'express-session';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import exphbs from 'express-handlebars';
import flash from 'connect-flash';
import config from '../config/config';
import pkg from '../package.json';

const MongoStore = require('connect-mongo')(session);
const env = process.env.NODE_ENV || 'development';

export default (app) => {
  app.use(express.static(config.root + '/public'));

  if (env === 'production') {
    const accessLogStream = fs.createWriteStream(path.resolve('logs/access.log'), {flags: 'a'});
    // We're behind Nginx proxy on production
    app.set('trust proxy', 1);
    // Log HTTP requests to access.log
    app.use(morgan('combined', {stream: accessLogStream}));
  } else {
    // Log HTTP requests to console on development/testing env
    app.use(morgan('dev'));
  }

  app.engine('hbs', exphbs({
    extname: '.hbs',
    defaultLayout: 'default'
  }));
  app.set('view engine', 'hbs');

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
      url: config.db,
      collection: 'sessions'
    })
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  app.use(flash());
};
