const initMovieLibrary = require('./movies/checkLibrary');
const initShowLibrary = require('./shows/checkLibrary');
const updateMovieLibrary = require('./movies/updateLibrary');
const updateShowLibrary = require('./shows/updateLibrary');
const initUsers = require('./users/usersInit');

module.exports.init = () => {
  return Promise.all([
    initUsers(),
    initMovieLibrary(0),
    initShowLibrary(0),
  ]);
};

module.exports.update = () => {
  return Promise.all([
    initUsers(),
    updateMovieLibrary(0),
    updateShowLibrary(0),
  ]);
};
