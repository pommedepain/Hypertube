const debug = require('debug')('database:shows:check');
const populateShows = require('./populateLibrary');
const { LIBRARIES } = require('../../config/config');
const ShowLibraries = require('../../models/ShowLibrary');

module.exports = async (id) => {
  return new Promise((resolve, reject) => {
    debug(`######### Checking ${LIBRARIES.SHOWS}${id} ############`);
    ShowLibraries[id].estimatedDocumentCount({}, (err, count) => {
      if (err === null && count !== 0) {
        debug('--- Show count: ---', count);
        resolve({ success: true, error: null });
      } else {
        debug('--- Empty Show Library, populating.... ---');
        resolve(populateShows(id));
      };
    });
  });
};
