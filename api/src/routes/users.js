const _ = require('lodash');
const Joi = require('../../node_modules/@hapi/joi/lib');
const bcrypt = require('bcrypt');
const express = require('../../node_modules/express');
const debug = require('../../node_modules/debug/src')('routes:users');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const { User, validate } = require('../models/user');
const wrapper = require('../middleware/wrapper');
mongoose.set('useFindAndModify', false);
router.use(express.json());

/* GET INFOS of an existing user for displaying profils in Front */
router.get('/one_user/:username', auth, wrapper(async (req, res) => {
  debug('route /:username for CLEM');
  debug(`search for: ${req.params.username}`);
  const user = await User.find({ username: req.params.username });
  if (!user) throw new Error('User with the given username doesn\'t exists in our db.');

  const userResponse = {
    username: user[0].username,
    firstName: user[0].firstName,
    lastName: user[0].lastName,
    photo: user[0].photo,
    defaultLanguage: user[0].defaultLanguage,
  };

  debug(userResponse);
  res.send({ success: true, result: userResponse });
}));

/* GET all existing users */
router.get('/', auth, async (req, res) => {
  debug('Get all infos on all users');
  const users = await User.find().sort('username');
  res.send(users);
});

/* GET specific value for all users */
router.get('/all_users/:value', auth, wrapper(async (req, res) => {
  debug('route get specific value for all users');
  debug(req.params.value);
  const value = await User.find().select(req.params.value);
  if (!value) throw new Error('The parameter with the given value doesn\'t exists in the DB');
  debug(value);
  res.send({ success: true, payload: value });
}));

/* GET infos of an existing user for AUTHENTIFICATION */
router.get('/me', auth, async (req, res) => {
  debug('me route param:');
  debug(req.body);
  const user = await User.findById(req.user._id).select('-password');
  debug('Result of query:');
  debug(user);
  res.send(user);
});

/* GET infos of an existing user from username for RESETING PASSWORD */
router.get('/sendReset/:username', wrapper(async (req, res) => {
  debug('Request to send reset pwd mail to :', req.params.username);

  const salt = await bcrypt.genSalt(10);
  const linkReset = await bcrypt.hash(req.params.username, salt);

  const user = await User.findOneAndUpdate({ username: req.params.username }, {
    linkReset: linkReset,
  }, { new: true });

  if (!user) throw new Error('The user with the given ID doesn\'t exists in the DB');
  debug('user:');
  debug(user);

  user.sendResetLink(user)
    .then((result) => res.status(200).json({ success: true, payload: { value: 'sendReset', dest: result.res } }))
    .catch((err) => debug(err));
}));

/* GET infos of an existing user for his/her personnal verification */
router.get('/infos/:id', auth, wrapper(async (req, res) => {
  debug('GET infos of an existing user for his/her personnal verification');
  debug(req.params.id);
  const user = await User.find({ _id: req.params.id });
  if (!user) throw new Error('User with the given username doesn\'t exists in our db.');

  const userResponse = {
    username: user[0].username,
    firstName: user[0].firstName,
    lastName: user[0].lastName,
    email: user[0].email,
    photo: user[0].photo,
    defaultLanguage: user[0].defaultLanguage,
    isAdmin: user[0].isAdmin,
    linkReset: user[0].linkReset,
  };

  res.send({ success: true, result: userResponse });
}));

/* POST a new user */
router.post('/', async (req, res) => {
  debug(`Client sent :`);
  debug(req.body);
  const { error } = validate(req.body);
  debug(error);
  if (error) return res.send({ success: false, payload: error });

  const isKnown = await User.findOne({ username: req.body.username });
  if (isKnown) {
    debug('Username already taken');
    return res.send({ success: false, payload: 'Username already taken' });
  }

  const user = new User(_.pick(req.body, [
    'username',
    'firstName',
    'lastName',
    'email',
    'password',
    'photo',
    'defaultLanguage',
  ]));

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  await user.save();

  const token = user.generateAuthToken();
  res
    .header('x-auth-token', token)
    .send({ token: token, username: user.username, success: true });
});

validateUpdate = (user) => {
  const schema = Joi.object({
    username: Joi.string().regex(/^[a-zA-Z-àæéëèêçàùûîïÀÆÉÈÊÇÀÛÙÜÎÏ0-9]{2,18}$/i).min(2).max(18).required(),
    firstName: Joi.string().regex(/^[a-zA-Z-àæéëèêçàùûîïÀÆÉÈÊÇÀÛÙÜÎÏ]{2,18}$/i).min(2).max(18).required(),
    lastName: Joi.string().regex(/^[a-zA-Z-àæéëèêçàùûîïÀÆÉÈÊÇÀÛÙÜÎÏ]{2,18}$/i).min(2).max(18).required(),
    email: Joi.string().email({ minDomainSegments: 2 }).required(),
    photo: Joi.string().regex(/^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=.]+$/).required(),
    defaultLanguage: Joi.string().required(),
  });

  return schema.validate(user);
};

/* Put UPDATE INFOS of an existing USER */
router.put('/:id', auth, wrapper(async (req, res) => {
  debug('Update user:');
  const { error } = validateUpdate(req.body);
  if (error) return res.send({ success: false, payload: error.details[0].message });

  const user = await User.findOneAndUpdate({ _id: req.params.id }, {
    username: req.body.username,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    photo: req.body.photo,
    defaultLanguage: req.body.defaultLanguage,
  }, { new: true });

  if (!user) throw new Error('The user with the given ID doesn\'t exists in the DB');

  const token = user.generateAuthToken();
  res.send({ success: true, payload: user, token: token });
}));

validatePassword = (user) => {
  const schema = Joi.object({
    username: Joi.string().regex(/^[a-zA-Z-àæéëèêçàùûîïÀÆÉÈÊÇÀÛÙÜÎÏ0-9]{2,18}$/i).required().min(2).max(18),
    firstName: Joi.string().regex(/^[a-zA-Z-àæéëèêçàùûîïÀÆÉÈÊÇÀÛÙÜÎÏ]{2,18}$/i).required().min(2).max(18),
    lastName: Joi.string().regex(/^[a-zA-Z-àæéëèêçàùûîïÀÆÉÈÊÇÀÛÙÜÎÏ]{2,18}$/i).required().min(2).max(18),
    email: Joi.string().email({ minDomainSegments: 2 }).required(),
    password: Joi.string().regex(/^[^`\\<>]{7,150}$/i).required().min(7).max(150),
    photo: Joi.string().regex(/^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=.]+$/).required(),
    defaultLanguage: Joi.string(),
    linkReset: Joi.string().required(),
  });

  return schema.validate(user);
};

/* Put UPDATE PASSWORD of an existing user */
router.put('/update_password/:id', auth, wrapper(async (req, res) => {
  debug('Update password route triggered');
  const { error } = validatePassword(req.body);
  if (error) throw new Error(error.details[0].message);

  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash(req.body.password, salt);
  debug('password crypted: ' + password);

  const userFound = await User.find({ _id: req.params.id });
  debug('userFound:');
  debug(userFound);

  if (!userFound) throw new Error('The user with the given ID doesn\'t exists in the DB');
  if (userFound[0].linkReset !== req.body.linkReset) throw new Error('Bad Link.');

  const user = await User.findOneAndUpdate({ _id: req.params.id }, {
    password: password,
    linkReset: null,
  }, { new: true });

  const token = user.generateAuthToken();
  debug('token: ' + token);

  res.send({ success: true, payload: token, username: user.username });
}));

/* DELETE an existing USER */
router.delete('/:id', auth, wrapper(async (req, res) => {
  const user = await User.findByIdAndRemove(req.params.id);

  if (!user) throw new Error('The user with the given id doesn\'t exists in the DB');

  res.send(user);
}));

module.exports = router;
