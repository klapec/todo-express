import mongoose from 'mongoose';
import logger from '../helpers/logger';

const User = mongoose.model('User');
const userCtrl = {
  login: {
    // Renders the login page, passing in the csrf token
    // to the template
    get(req, res) {
      const message = req.flash('userMessages').toString();
      res.render('users/login', {
        csrfToken: req.csrfToken(),
        message
      });
    },
    // Redirects to /tasks upon successfully validated
    // and authenticated POST /login request
    post(req, res) {
      return res.redirect('/tasks');
    }
  },

  logout: {
    // Handles logging out using the method provided by Passport
    get(req, res) {
      req.logout();
      res.redirect('/');
    }
  },

  signup: {
    // Renders the signup page, passing in the csrf token to the template
    get(req, res) {
      res.render('users/signup', {
        csrfToken: req.csrfToken()
      });
    },

    // Creates a new user
    post(req, res) {
      const newUser = new User(req.body);
      newUser.createdAt = new Date();

      newUser.save((err, user) => {
        if (err) {
          // Renders back the signup page on error (including validation error)
          return res.render('users/signup', {
            error: err,
            csrfToken: req.csrfToken(),
            // Sends back the new user info for restoring valid input back
            user: newUser
          });
        }

        // Log in the new user on success
        // Redirect to /tasks
        req.login(user, err => {
          if (err) logger.error(err);
          return res.redirect('/tasks');
        });
      });
    }
  }
};

export default userCtrl;
