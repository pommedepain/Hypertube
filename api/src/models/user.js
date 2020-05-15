const Joi = require('../../node_modules/@hapi/joi/lib');
const mongoose = require('mongoose');
const debug = require('../../node_modules/debug/src')('models:user');
const jwt = require('jsonwebtoken');
const { JWT, SERVER } = require('../config/config');
const nodemailer = require('nodemailer');
const findOrCreate = require('mongoose-findorcreate');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({

  username: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 18,
    match: /^[a-zA-Z-àæéëèêçàùûîïÀÆÉÈÊÇÀÛÙÜÎÏ0-9]{2,18}$/i,
    lowercase: true,
    trim: true,
  },
  firstName: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 18,
    match: /^[a-zA-Z-àæéëèêçàùûîïÀÆÉÈÊÇÀÛÙÜÎÏ]{2,18}$/i,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 18,
    match: /^[a-zA-Z-àæéëèêçàùûîïÀÆÉÈÊÇÀÛÙÜÎÏ]{2,18}$/i,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    // required: true,
    match: /^(?=[^A-Z]*[A-Z])(?=[^!"#$%&'()*+,-.:;<=>?@[\]^_`{|}~]*[!"#$%&'()*+,-.:;<=>?@[\]^_`{|}~])(?=\D*\d).{7,150}$/,
    minlength: 7,
    maxlength: 150,
  },
  photo: {
    type: String,
    required: [true, 'You need to choose a profil picture.'],
    match: /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=.]+$/,
  },
  defaultLanguage: {
    type: String,
    enum: ['English', 'French', 'Arabic', 'Chinese', 'Spanish', 'German'],
    default: 'English',
  },
  isAdmin: Boolean,
  linkReset: {
    type: String,
    default: null,
  },
  fortyTwoId: Number,
  googleId: Number,
});

userSchema.methods.generateAuthToken = function(user) {
  let token = null;
  if (user) {
    token = jwt.sign({
      _id: user._id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      photo: user.photo,
      defaultLanguage: user.defaultLanguage,
      isAdmin: user.isAdmin,
      linkReset: user.linkReset,
    }, JWT.KEY);
  } else {
    token = jwt.sign({
      _id: this._id,
      username: this.username,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      photo: this.photo,
      defaultLanguage: this.defaultLanguage,
      isAdmin: this.isAdmin,
      linkReset: this.linkReset,
    }, JWT.KEY);
  }
  return (token);
};

userSchema.methods.sendResetLink = function(user) {
  return new Promise(async (resolve, reject) => {
    debug('user in sendResetLink(): ');
    debug(user);

    const token = await this.generateAuthToken(user);
    this.sendResetMail(token, user)
      .then((res) => resolve({ res: res, token: token }))
      .catch((err) => reject(err));
  });
};

userSchema.methods.sendResetMail = function(oldtoken, user) {
  return new Promise((resolve, reject) => {
    debug(`SENDING RESET MAIL TO: ${user.username}`);

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'cajulien.42.matcha@gmail.com',
        pass: 'Ff7midgar6',
      },
    });
    debug(`oldtoken : ${oldtoken}`);
    const token = oldtoken.replace(/\//gi, '_');
    debug(`token : ${token}`);
    transporter.sendMail({
      from: 'psentilh@student.42.fr',
      to: ['psentilh@student.42.fr', user.email],
      subject: 'Change of password for Hypertube',
      text: 'Hi',
      html: `Hi ${user.username}, to change your password for Hypertube, please click on
      <a href='http://localhost:${SERVER.PORT}/?_id=${user._id}&token=${token}'>this link</a>`,
    })
      .then((res) => {
        debug('ret from email sent:');
        debug(res.accepted);
        return resolve(res.accepted);
      })
      .catch((err) => reject(err));
  });
};

userSchema.methods.verifyPassword = function(password, user) {
  return new Promise(async (resolve, reject) => {
    debug(user);
    debug(password);
    const valid = await bcrypt.compare(password, user.password);
    debug('valid:', valid);
    resolve(valid);
  });
};

userSchema.plugin(findOrCreate);

const User = mongoose.model('User', userSchema);

validateUser = (user) => {
  const schema = Joi.object({
    username: Joi.string().regex(/^[a-zA-Z-àæéëèêçàùûîïÀÆÉÈÊÇÀÛÙÜÎÏ0-9]{2,18}$/i).required().min(2).max(18),
    firstName: Joi.string().regex(/^[a-zA-Z-àæéëèêçàùûîïÀÆÉÈÊÇÀÛÙÜÎÏ]{2,18}$/i).required().min(2).max(18),
    lastName: Joi.string().regex(/^[a-zA-Z-àæéëèêçàùûîïÀÆÉÈÊÇÀÛÙÜÎÏ]{2,18}$/i).required().min(2).max(18),
    email: Joi.string().email({ minDomainSegments: 2 }).required(),
    password: Joi.string().regex(/^[^`\\<>]{7,150}$/i).required().min(7).max(150),
    photo: Joi.string().regex(/^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=.]+$/).required(),
    defaultLanguage: Joi.string(),
    linkReset: Joi.string(),
  });

  return schema.validate(user);
};

exports.User = User;
exports.validate = validateUser;
