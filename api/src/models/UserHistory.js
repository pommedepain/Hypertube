const Joi = require('@hapi/joi');
const mongoose = require('mongoose');
const debug = require('debug')('models:UserHistory');

const UserHistorySchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 18,
    match: /^[a-zA-Z-àæéëèêçàùûîïÀÆÉÈÊÇÀÛÙÜÎÏ0-9]{2,18}$/i,
    lowercase: true,
    trim: true,
  },
  movieHistory: [{
    _id: false,
    id: { type: String },
    date: { type: Date }
  }, ],
  tvShowHistory: [{
    _id: false,
    id: { type: String },
    date: { type: Date }
  }, ],
});

const UserHistory = mongoose.model('UserHistory', UserHistorySchema);

validate = (user) => {
  debug(user);
  const schema = Joi.object({
    username: Joi.string().regex(/^[a-zA-Z-àæéëèêçàùûîïÀÆÉÈÊÇÀÛÙÜÎÏ0-9]{2,18}$/i).required().min(2).max(18),
    movieHistory: Joi.string().allow('').optional(),
    tvShowHistory: Joi.string().allow('').optional(),
  });

  return schema.validate(user);
};

exports.UserHistory = UserHistory;
exports.validateHistory = validate;
