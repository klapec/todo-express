// Local passport strategy

import User from '../../models/user';
import logger from '../../helpers/logger';
import { Strategy as LocalStrategy } from 'passport-local';

export default new LocalStrategy(
  {
    passReqToCallback: true,
    usernameField: 'email',
    passwordField: 'password'
  },
  (req, email, password, done) => {
    User.findOne(
      { email },
      'email hashedPassword salt',
      (err, user) => {
        req.login.email = email;
        if (err) {
          logger.err(err);
          return done(err);
        }
        if (!user) {
          return done(null, false, req.flash('userMessages', 'Invalid email or unknown user'));
        }
        if (!user.authenticate(password)) {
          return done(null, false, req.flash('userMessages', 'Invalid password'), req.login.email);
        }
        delete req.login.email;
        return done(null, user);
      }
    );
  }
);
