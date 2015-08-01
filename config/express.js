// Main express config

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
import mongoConfig from '../config/mongo';
import pkg from '../package.json';

const MongoStore = require('connect-mongo')(session);
const env = process.env.NODE_ENV || 'development';

export default app => {
  app.use(express.static(path.resolve(__dirname, '..', 'public')));

  if (env === 'production') {
    const accessLogStream = fs.createWriteStream(path.resolve('logs/access.log'), {flags: 'a'});
    // We're behind Nginx proxy on production
    app.set('trust proxy', 1);
    // Log HTTP requests to access.log
    app.use(morgan('combined', {stream: accessLogStream}));
  } else if (env === 'development') {
    // Log HTTP requests to console on development
    app.use(morgan('dev'));
  }

  app.engine('hbs', exphbs({
    extname: '.hbs',
    defaultLayout: 'default'
  }));
  app.set('view engine', 'hbs');

  // Add the test account information to the login page and Google Analytics script
  // when running as a project example on heroku
  app.locals.runningAsExample = process.env.HEROKU_EXAMPLE;

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
      url: process.env.MONGOURI || mongoConfig.uri,
      collection: 'sessions'
    })
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  app.use(flash());
};
