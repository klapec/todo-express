import passport from 'passport';
import csrf from 'csurf';
import userCtrl from '../controllers/userCtrl';
import taskCtrl from '../controllers/taskCtrl';
import auth from '../middleware/auth';

export default app => {
  const csrfProtection = csrf({ cookie: true });

  app.use((req, res, next) => {
    res.locals.req = req;
    next();
  });

  // Checks whether the user is authenticated, if so - redirects to /tasks
  // Otherwise redirects to /login
  app.get('/', auth.requiresLogin, (req, res) => {
    res.redirect('/tasks');
  });

  app.get('/login', csrfProtection, userCtrl.login.get);
  app.post('/login', csrfProtection, passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: true
  }), userCtrl.login.post);

  app.get('/logout', userCtrl.logout.get);

  app.get('/signup', csrfProtection, userCtrl.signup.get);
  app.post('/signup', csrfProtection, userCtrl.signup.post);

  app.get('/tasks', auth.requiresLogin, taskCtrl.get);
  app.post('/tasks', auth.requiresLogin, taskCtrl.create);
  app.put('/tasks/:id', auth.requiresLogin, taskCtrl.update);
  app.delete('/tasks/:id', auth.requiresLogin, taskCtrl.remove);

  app.use((err, req, res, next) => {
    if (res.headersSent) {
      return next(err);
    }
    if (err.code === 'EBADCSRFTOKEN') {
      res.status(403);
      return res.render('error', { err });
    }

    res.status(500);
    res.render('error', { err });
  });

  app.use((req, res) => {
    res.status(404);
    res.render('error', {
      err: '404 Not Found'
    });
  });
};
