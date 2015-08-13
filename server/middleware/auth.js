// Authentication middleware
// Checks whether the request is done by an authenticated user
// using a method provided by Passport
// Redirects to /login if not

const auth = {
  requiresLogin(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/login');
  }
};

export default auth;
