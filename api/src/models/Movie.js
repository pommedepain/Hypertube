const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  hash: { type: String, required: true },
  downloaded: { type: Boolean, required: true },
  folder: { type: String, required: true },
  date: { type: Date, default: new Date() },
});

module.exports = mongoose.model('Movie', movieSchema);
