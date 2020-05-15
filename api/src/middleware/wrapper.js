const debug = require('../../node_modules/debug/src')('middleware:wrapper');

// Wraps all routes

module.exports = function asyncMiddleware(route) {
  return async (req, res, next) => (
    route(req, res)
      .catch((err) => {
        debug(err);
        next(err);
      })
  );
};
