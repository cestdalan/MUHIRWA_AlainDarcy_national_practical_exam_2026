// Middleware to protect routes and verify active sessions
module.exports = (req, res, next) => {
  if (req.session && req.session.user) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized: Access is denied due to invalid credentials or missing session.' });
  }
};
