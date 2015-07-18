const auth = {
  requiresLogin(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/login');
  }
};

export default auth;
