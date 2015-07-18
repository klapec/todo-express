import mongoose from 'mongoose';
import logger from '../helpers/logger';

const User = mongoose.model('User');
const login = {
  get(req, res) {
    const message = req.flash('userMessages').toString();
    res.render('users/login', {
      csrfToken: req.csrfToken(),
      message
    });
  },
  post(req, res) {
    return res.redirect('/tasks');
  }
};

const logout = {
  get(req, res) {
    req.logout();
    res.redirect('/');
  }
};

const signup = {
  get(req, res) {
    res.render('users/signup', {
      csrfToken: req.csrfToken(),
      user: new User()
    });
  },
  post(req, res) {
    const newUser = new User(req.body);
    newUser.createdAt = new Date();

    newUser.save((err, user) => {
      if (err) {
        logger.error(err);
        return res.render('users/signup', {
          error: err,
          user: newUser,
          title: 'Sign up'
        });
      }

      req.login(user, (err) => {
        if (err) logger.error(err);
        return res.redirect('/tasks');
      });
    });
  }
};

const userId = {
  get(req, res) {
    res.render('users/profile');
  }
};

export { login, logout, signup, userId };
