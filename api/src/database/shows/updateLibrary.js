const populateShows = require('./populateLibrary');
const resetLibrary = require('./resetLibrary');

async function updateLibrary(id) {
  return resetLibrary(id)
    .then(() => populateShows(id))
    .catch((err) => ({ success: false, err }));
}

module.exports = updateLibrary;
