const jwt = require('jsonwebtoken');
const { JWT } = require('../config/config');
const debug = require('debug')('middleware:auth');

module.exports = function(req, res, next) {
  const token = req.header('x-auth-token');
  debug(`Token: ${token}`);
  if (!token) return res.status(401).send('Access denied. No token provided.');

  try {
    const decoded = jwt.verify(token, JWT.KEY);
    req.user = decoded;
    next();
  } catch (ex) {
    res.status(400).send('Invalid token.');
  }
};
