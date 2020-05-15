const debug = require('debug')('database:shows:reset');
const ShowLibraries = require('../../models/ShowLibrary');
const { LIBRARIES } = require('../../config/config');

module.exports = (id) => {
  debug(`######### Reseting ${LIBRARIES.SHOWS}${id} ##########`);
  return new Promise((resolve) => {
    ShowLibraries[id].remove({})
      .then((res) => {debug(res.deletedCount); resolve();})
      .catch((err) => {debug(err); resolve();});
  });
};
