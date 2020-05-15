const mongoose = require('mongoose');
const { LIBRARIES } = require('../config/config');
const mongoosePaginate = require('mongoose-paginate-v2');


const showSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true, dropDups: true },
  tvId: { type: String, required: false },
  title: { type: String, required: false },
  year: { type: String, required: false },
  runtime: { type: String, required: false },
  genres: { type: [String], required: false },
  synopsis: { type: String, default: 'There is no synopsis for this movie' },
  images: { type: {} },
  seasons: { type: Number, required: false },
  source: { type: String, required: false },
  rating: Number,
  popularity: Number,
  episodes: [],
  seasons: [],
  additionnalInfos: [],
});
showSchema.plugin(mongoosePaginate);


const ShowLibrary0 = mongoose.model(`${LIBRARIES.SHOWS}0`, showSchema);
const ShowLibrary1 = mongoose.model(`${LIBRARIES.SHOWS}1`, showSchema);

module.exports = [ShowLibrary0, ShowLibrary1];
