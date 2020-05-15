const passport = require('passport');
const debug = require('debug')('config');
const LocalStrategy = require('passport-local').Strategy;
const FortyTwoStrategy = require('passport-42').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User } = require('../models/user');
const { FORTYTWO, GOOGLE, SERVER } = require('../config/config');


passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ username: username }, (err, user) => {
      if (err) { return done(err); }
      else if (!user) { debug('here3'); return done(null, false); }
      user.verifyPassword(password, user)
        .then((res) => {
          if (res === true) return done(null, user);
          else {
            debug('here2');
            return done(null, false);
          }
        })
        .catch((err) => { debug('here1', err); done(null, false) });
    });
  }
));

passport.use(new FortyTwoStrategy({
  clientID: FORTYTWO.APP_ID,
  clientSecret: FORTYTWO.APP_SECRET,
  callbackURL: `http://localhost:${SERVER.PORT}/API/auth/42/callback`,
  profileFields: {
    'id': function (obj) { return String(obj.id); },
    'username': 'login',
    'email': 'email',
    'photo': 'image_url',
    'firstName': 'first_name',
    'lastName': 'last_name',
  }
},
async (accessToken, refreshToken, profile, cb) => {
  debug(profile.firstName);
  let username = profile.username;
  const isKnown42 = await User.findOne({ fortyTwoId: profile.id });
  if (!isKnown42) {
    let isKnown = await User.findOne({ username: username });
    let i = 0;
    while (isKnown) {
      username = `${username}${i}`;
      i += 1;
      isKnown = await User.findOne({ username: username });
    }
    User.findOrCreate({
      fortyTwoId: profile.id,
      username: username,
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      photo: profile.photo,
    }, (err, user) => {
      // debug(user);
      return cb(err, user);
    });
  } else {
    return cb(null, isKnown42);
  }
},
));

passport.use(new GoogleStrategy({
  clientID: GOOGLE.GOOGLE_ID,
  clientSecret: GOOGLE.GOOGLE_SECRET,
  callbackURL: `http://localhost:${SERVER.PORT}/api/auth/google/callback`,
  scope: [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
  ],
},
async (token, tokenSecret, profile, done) => {
  debug(profile);
  let username = profile.displayName.replace(' ', '').substring(0, 15);
  debug(username);
  const isKnownGoogle = await User.findOne({ googleId: profile.id });
  if (!isKnownGoogle) {
    let isKnown = await User.findOne({ username: username });
    let i = 0;
    while (isKnown) {
      username = `${username}${i}`;
      i += 1;
      isKnown = await User.findOne({ username: username });
    }
    User.findOrCreate({
      googleId: profile.id,
      username,
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      email: profile.emails[0].value,
      photo: profile.photos[0].value,
    }, (err, user) => {
      // debug(user);
      return done(err, user);
    });
  } else {
    return done(null, isKnownGoogle);
  }
},
));

module.exports = passport;

