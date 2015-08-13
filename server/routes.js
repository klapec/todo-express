import { Router as router } from 'express';
import passport from 'passport';
import csrf from 'csurf';
import userCtrl from './controllers/userCtrl';
import taskCtrl from './controllers/taskCtrl';
import auth from './middleware/auth';

const routes = router();
const csrfProtection = csrf({ cookie: true });

routes.use((req, res, next) => {
  res.locals.req = req;
  next();
});

// Checks whether the user is authenticated, if so - redirects to /tasks
// Otherwise redirects to /login
routes.get('/', auth.requiresLogin, (req, res) => {
  res.redirect('/tasks');
});

routes.get('/login', csrfProtection, userCtrl.login.get);
routes.post('/login', csrfProtection, passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: true
}), userCtrl.login.post);

routes.get('/logout', userCtrl.logout.get);

routes.get('/signup', csrfProtection, userCtrl.signup.get);
routes.post('/signup', csrfProtection, userCtrl.signup.post);

routes.get('/tasks', auth.requiresLogin, taskCtrl.get);
routes.post('/tasks', auth.requiresLogin, taskCtrl.create);
routes.put('/tasks/:id', auth.requiresLogin, taskCtrl.update);
routes.delete('/tasks/:id', auth.requiresLogin, taskCtrl.remove);

routes.use((err, req, res, next) => {
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

routes.use((req, res) => {
  res.status(404);
  res.render('error', {
    err: '404 Not Found'
  });
});

export default routes;
