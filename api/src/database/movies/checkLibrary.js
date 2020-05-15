const debug = require('debug')('database:movies:check');
const populateMovies = require('./populateLibrary');
const { LIBRARIES } = require('../../config/config');
const MovieLibraries = require('../../models/MovieLibrary');

module.exports = async (id) => {
  return new Promise((resolve, reject) => {
    debug(`######### Checking ${LIBRARIES.MOVIES}${id} ############`);
    MovieLibraries[id].estimatedDocumentCount({}, (err, count) => {
      if (err === null && count !== 0) {
        debug('--- Movie count: ---', count);
        resolve({ success: true, error: null });
      } else {
        debug('--- Empty Movie Library, populating.... ---');
        resolve(populateMovies(id));
      };
    });
  });
};
