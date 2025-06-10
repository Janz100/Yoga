const jwt = require('jsonwebtoken');

const isLoggedIn = (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) {
    return res.redirect('/login');
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach user info to req.user
    next();
  } catch (err) {
    return res.redirect('/login');
  }
};


const isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.isAdmin) {
        return next();
    }
    res.redirect('/login');
};

module.exports = {
    isLoggedIn,
    isAdmin
};