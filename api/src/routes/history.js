const express = require('../../node_modules/express');
const debug = require('../../node_modules/debug/src')('routes:history');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const { UserHistory, validateHistory } = require('../models/UserHistory');
const wrapper = require('../middleware/wrapper');
mongoose.set('useFindAndModify', false);
router.use(express.json());

/* GET HISTORY of current user */
router.get('/:username', auth, wrapper(async (req, res) => {
  debug('Get history of current user');
  const user = await UserHistory.findOne({ username: req.params.username });
  if (!user) throw new Error('User with the given username doesn\'t exists in our db.');
  // debug(user);

  res.send({ success: true, movies: user.movieHistory, tvShow: user.tvShowHistory });
}));

/* Put UPDATE HISTORY of an existing user */
router.put('/add/:type', auth, wrapper(async (req, res) => {
  debug('Update history for ' + req.body.username);

  const userFound = await UserHistory.findOne({ username: req.body.username }, function(err, datas) {
    if (datas) {
      // debug(`Success found user:`);
      // debug(datas);
      // debug('sending:');
      if (req.params.type === 'Movie') {
        // debug('MOVIE');
        // debug(req.body.movieHistory[0].toString());
        datas.movieHistory = [...datas.movieHistory, { id: req.body.movieHistory.toString(), date: Date.now() }];
      } else if (req.params.type === 'TVShow') {
        // debug('TVSHOW');
        // debug(req.body.tvShowHistory[0].toString());
        datas.tvShowHistory = [...datas.tvShowHistory, { id: req.body.tvShowHistory.toString(), date: Date.now() }];
      }
      datas.save(function(err) {
        if (err) return debug(err);
        else debug('SAVED TO HISTORY');
      });
    } else debug('No one found: ' + err);
  });

  if (!userFound) {
    debug(`New history for ${req.body.username}:`);
    const { error } = validateHistory(req.body);
    if (error) throw new Error(error.details[0].message);

    if (req.params.type === 'Movie') {
      debug('MOVIE');
      const newUser = new UserHistory({
        username: req.body.username,
        movieHistory: { id: req.body.movieHistory, date: Date.now() },
        tvShowHistory: [],
      });
      debug(newUser);
      await newUser.save();
    } else if (req.params.type === 'TVShow') {
      debug('TVSHOW');
      const newUser = new UserHistory({
        username: req.body.username,
        movieHistory: [],
        tvShowHistory: { id: req.body.tvShowHistory, date: Date.now() },
      });
      debug(newUser);
      await newUser.save();
    }
  }

  res.send({ success: true });
}));

module.exports = router;
