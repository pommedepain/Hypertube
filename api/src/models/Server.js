const debug = require('debug')('models:ServerClass');
const express = require('express');
const cors = require('cors');
const users = require('../routes/users');
const history = require('../routes/history');
const auth = require('../routes/auth');
const photo = require('../routes/photo');
const comment = require('../routes/comment');
const video = require('../routes/video');
const MovieLibraries = require('../routes/MovieLibrary');
const ShowLibraries = require('../routes/ShowLibrary');
const updateMovieLibrary = require('../database/movies/updateLibrary');
const updateShowLibrary = require('../database/shows/updateLibrary');
const Movie = require('../models/Movie');
const error = require('../middleware/error');
const cron = require('node-cron');
const fs = require('fs');
const { SERVER, CRON, EXPIRATION } = require('../config/config');

class Server {
  constructor() {
    this.app = express();
    this.app.use(cors());
    this.app.use(express.urlencoded({ extended: true }));
    this.inUse = { movies: 0, shows: 0, animes: 0 };
    this.app.use('/', express.static('./public'));
    this.app.use(express.static(process.env.FILMPATH));
    this.app.use('/API/users', users);
    this.app.use('/API/history', history);
    this.app.use('/API/auth', auth);
    this.app.use('/API/photo', photo);
    this.app.use('/API/comment', comment);
    this.app.use('/Video', video);
    this.app.use('/API/MovieLibrary', MovieLibraries(this.inUse.movies));
    this.app.use('/API/TVShowLibrary', ShowLibraries(this.inUse.shows));

    // ** MOVIES CLEANUP **
    cron.schedule(CRON.CLEAN, () => {
      debug('--- Starting Cleanup ---');
      Movie.find({}, (err, result) => {
        const date = new Date();
        const timestamp = date.getTime();
        result.forEach((film) => {
          debug(film);
          console.log(`${Date.parse(film.date) + EXPIRATION} < ${timestamp}`);
          debug('film age:', Date.parse(film.date));
          debug('expiration period;', EXPIRATION);
          debug('now :', timestamp);
          if (Date.parse(film.date) + EXPIRATION < timestamp) {
            film.delete();
            fs.readdir(film.folder, (err, files) => {
              console.log(`deleting directory ${film.folder}`);
              if (err) debug(err);
              for (const file of files) {
                fs.unlink(`${film.folder}/${file}`, (err) => {
                  if (err) debug(err);
                });
              }
            });
          }
        });
      });
    });

    // ** MOVIES UPDATES **
    cron.schedule(CRON.MOVIES, () => {
      debug(`--- In Use: Movie library ${this.inUse.movies} ---`);
      this.inUse.movies = (this.inUse.movies + 1) % 2;
      updateMovieLibrary(this.inUse.movies)
        .then((res) => {
          if (res.success === true) {
            debug(` -- Updated Movie library ${this.inUse.movies} --`);
            this.app.use('/MovieLibrary', MovieLibraries(this.inUse.movies));
            debug(`--- In Use: Movie library ${this.inUse.movies} ---`);
          } else {
            debug('--- An error occurred during update, switching delayed ---');
            this.inUse.movies = (this.inUse.movies + 1) % 2;
          }
        })
        .catch((err) => {
          debug('--- An error occurred during update, switching delayed ---');
          this.inUse.movies = (this.inUse.movies + 1) % 2;
        });
    });

    // ** SHOWS UPDATES **
    cron.schedule(CRON.SHOWS, () => {
      debug(`--- In Use: Show library ${this.inUse.shows} ---`);
      this.inUse.shows = (this.inUse.shows + 1) % 2;
      updateShowLibrary(this.inUse.shows)
        .then((res) => {
          if (res.success === true) {
            debug(` -- Updated Show library ${this.inUse.shows} --`);
            this.app.use('/ShowLibrary', ShowLibraries(this.inUse.shows));
            debug(`--- In Use: Show Library ${this.inUse.shows} ---`);
          } else {
            debug('--- An error occurred during update, switching delayed ---');
            this.inUse.shows = (this.inUse.shows + 1) % 2;
          }
        })
        .catch((err) => {
          debug('--- An error occurred during update, switching delayed ---');
          this.inUse.shows = (this.inUse.shows + 1) % 2;
        });
    });

    this.app.use(error); // after this one should be 404 handler middleware
  }

  listen() {
    this.app.listen(SERVER.PORT, () => debug(`*-- Listening on port ${SERVER.PORT}... --*`));
  }
}

module.exports = Server;
