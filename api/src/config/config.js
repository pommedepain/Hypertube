const debug = require('debug')('config');
const dotenv = require('dotenv');
dotenv.config();

const ENV = process.env.NODE_ENV || 'production';
debug(`######## Server environment is ${ENV} ##########`);

if (ENV === 'development') {
  EXPIRATION = 3600000;
  CRON = {
    MOVIES: '0 */20 * * * *',
    SHOWS: '0 */30 * * * *',
    CLEAN: '0 */10 * * * *',
  };
} else {
  EXPIRATION = 2592000000;
  CRON = {
    MOVIES: '0 0 * * *',
    SHOWS: '30 0 * * *',
    CLEAN: '0 1 * * *',
  };
}

const SERVER = {
  PORT: process.env.PORT || '4000',
};

const DATABASE = {
  HOST: process.env.DATABASE_HOST || 'localhost',
  NAME: process.env.DATABASE_NAME || 'Hypertube',
  OPTIONS: { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true },
};

const MAIL = {
  USER: process.env.MAIL_USER,
  PASS: process.env.MAIL_PWD,
};

const JWT = {
  KEY: process.env.JWT_KEY,
};

const IMDB = {
  KEY: process.env.IMDB_KEY,
};

const TVDB = {
  KEY: process.env.MOVIEDB_KEY,
};

const LIBRARIES = {
  MOVIES: 'movie_library',
  SHOWS: 'show_library',
  ANIMES: 'anime_library',
};

const PHOTO = {
  CLOUD_NAME: 'dbpfljjgh',
  API_KEY: '778269699341895',
  API_SECRET: 'Hdieu5tunYlG98oQfHdmDGjhbmg',
};

const MAX_RETRY = 2;

const FORTYTWO = {
  APP_ID: process.env.FORTYTWO_APP_UID,
  APP_SECRET: process.env.FORTYTWO_APP_SECRET,
};

const GOOGLE = {
  GOOGLE_ID: process.env.GOOGLE_ID,
  GOOGLE_SECRET: process.env.GOOGLE_SECRET,
};

const FB = {
  FACEBOOK_APP_ID: process.env.FB_ID,
  FACEBOOK_APP_SECRET: process.env.FB_SECRET,
};

const GIT = {
  ID: process.env.GIT_ID,
  SECRET: process.env.GIT_SECRET,
};


module.exports = {
  SERVER, DATABASE, MAIL, JWT, ENV, CRON, LIBRARIES, MAX_RETRY, PHOTO, IMDB, TVDB, FORTYTWO, GOOGLE, FB, GIT, EXPIRATION,
};

