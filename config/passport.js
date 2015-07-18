import passport from 'passport';
import mongoose from 'mongoose';
import local from './passport/local';

const User = mongoose.model('User');

export default () => {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });

  passport.use(local);
};
