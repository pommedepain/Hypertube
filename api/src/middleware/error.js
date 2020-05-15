const debug = require('../../node_modules/debug/src')('middleware:error');

// Wrapper middleware will call this one if an error occurs.

module.exports = (err, req, res, next) => {
  debug(err);
  return (
    res.status(200).json({
      success: false,
      payload: err.message,
    }));
};
