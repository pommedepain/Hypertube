const mongoose = require('mongoose');
const { LIBRARIES } = require('../config/config');
const mongoosePaginate = require('mongoose-paginate-v2');

const movieSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true, dropDups: true },
  title: { type: String, required: true },
  englishTitle: { type: String, required: true },
  year: { type: Number, required: true },
  rating: { type: Number, required: true },
  runtime: { type: Number, required: true },
  genres: { type: [String], required: true },
  synopsis: { type: String, default: 'There is no synopsis for this movie' },
  language: { type: String, required: true },
  smallCover: { type: String, required: true },
  mediumCover: { type: String, required: true },
  largeCover: { type: String, required: true },
  state: { type: String, required: true },
  trailer: { type: String, required: true },
  torrents: { type: [], required: true },
  popularity: { type: Number, required: true },
  source: { type: String, required: true },
  additionnalInfos: [],

});
movieSchema.plugin(mongoosePaginate);

const MovieLibrary0 = mongoose.model(`${LIBRARIES.MOVIES}0`, movieSchema);
const MovieLibrary1 = mongoose.model(`${LIBRARIES.MOVIES}1`, movieSchema);

module.exports = [MovieLibrary0, MovieLibrary1];
