const debug = require('debug')('database:movies:reset');
const MovieLibraries = require('../../models/MovieLibrary');
const { LIBRARIES } = require('../../config/config');

module.exports = (id) => {
  debug(`######### Reseting ${LIBRARIES.MOVIES}${id} ##########`);
  return new Promise((resolve) => {
    MovieLibraries[id].remove({})
      .then((res) => {debug(res.deletedCount); resolve();})
      .catch((err) => {debug(err); resolve();});
  });
};
