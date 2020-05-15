const populateMovies = require('./populateLibrary');
const resetLibrary = require('./resetLibrary');

async function updateLibrary(id) {
  return resetLibrary(id)
    .then(() => populateMovies(id))
    .catch((err) => ({ success: false, err }));
}

module.exports = updateLibrary;
