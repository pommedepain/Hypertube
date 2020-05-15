const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  filmId: { type: String, required: true },
  userName: { type: String, required: true },
  text: { type: String, required: true },
  date: { type: Date, default: new Date() },
});

module.exports = mongoose.model('Comment', commentSchema);
