import passport from 'passport';
import csrf from 'csurf';
import * as userCtrl from '../controllers/userCtrl';
import taskCtrl from '../controllers/taskCtrl';
import auth from '../middleware/auth';

export default (app) => {
  const csrfProtection = csrf({ cookie: true });

  app.use((req, res, next) => {
    res.locals.req = req;
    next();
  });

  app.get('/', auth.requiresLogin, (req, res) => {
    res.redirect('/tasks');
  });

  app.get('/login', csrfProtection, userCtrl.login.get);
  app.post('/login', csrfProtection, passport.authenticate('local', {
    successRedirect: '/tasks',
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

  app.use((req, res) => {
    res.status(404).render('404');
  });
};
