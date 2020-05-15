const debug = require('debug')('routes:movies');
const express = require('express');
const wrapper = require('../middleware/wrapper');
const MovieLibraries = require('../models/MovieLibrary');
const router = express.Router();
const axios = require('axios');
const { IMDB } = require('../config/config')
const auth = require('../middleware/auth');
const _ = require('lodash');
const admin = require('../middleware/admin');

const additionalInfos = async (movies) => {
  const added = movies.map((movie) => {
    return axios.get(`http://www.omdbapi.com/?apikey=82d3dbb5&i=${movie.id}`)
      .then((response) => {
        if (response.status === 200) {
          return { movie, additionalInfos: response.data };
        } return movie;
      })
      .catch((err) => movie);
  });
  return Promise.all(added);
};

module.exports = (id) => {
  router.use(express.json());
  router.use(express.urlencoded({ extended: true }));
  router.get('/', wrapper(async (req, res) => {
    debug(' --- Requesting movies --- ');
    const query = MovieLibraries[id].find({}).limit(50);
    query.exec((err, docs) => {
      if (err !== null) {
        throw new Error('Something went wrong');
      } debug(' -- Success --');
      return res.status(200).json({
        success: true,
        payload: docs,
      });
    });
  }));

  router.get('/history', wrapper(async (req, res) => {
    debug(` --- history route ---`);
    if (req.query.IDs) {
      const idArray = req.query.IDs.split(',');
      if (idArray.length) {
        MovieLibraries[id].find({
          'id': { $in: idArray },
        }).then((docs) => {
          const ordered = idArray.map((id) => {
            return docs.find((el) => el.id === id);
          });
          return res.status(200).json({
            success: true,
            payload: ordered,
          });
        });
      } else {
        return res.status(200).json({
          success: false,
          payload: 'No IDs provided',
        });
      }
    } else {
      return res.status(200).json({
        success: false,
        payload: 'No IDs provided',
      });
    }
  }));

  router.get('/infos/:id', wrapper(async (req, res) => {
    const key = IMDB.KEY;
    debug(key);
    const doc = await MovieLibraries[id].findOne({ id: req.params.id });
    if (doc.additionnalInfos.length === 0) {
      axios.get(`http://www.omdbapi.com/?apikey=${key}&i=${req.params.id}`)
        .then((response) => {
          doc.additionnalInfos = response.data;
          debug(doc.additionnalInfos);
          doc.save();
          return res.status(200).json({
            success: true,
            payload: doc.additionnalInfos[0],
          });
        })
        .catch((err) => {
          return res.status(200).json({
            success: false,
            payload: err,
          });
        });
    } else {
      return res.status(200).json({
        success: true,
        payload: doc.additionnalInfos[0],
      });
    }
  }));

  router.get('/count', wrapper(async (req, res) => {
    MovieLibraries[id].estimatedDocumentCount({}, (err, count) => {
      if (err === null && count !== 0) {
        debug('--- Movie count: ---', count);
        return res.status(200).json({
          success: true,
          payload: count,
        });
      } throw new Error(err);
    });
  }));

  router.get('/search/page=:page', wrapper(async (req, res) => {
    debug(` --- Search route ---`);
    debug(req.query);
    const search = {
      year: { $gte: req.query.yMin, $lte: req.query.yMax },
      rating: { $gte: req.query.rMin, $lte: req.query.rMax },
    };
    if (req.query.genres) {
      const genres = req.query.genres.split(',');
      debug(genres);
      search.genres = { '$all': genres };
    }
    if (req.query.query) {
      search.title = new RegExp(req.query.query, 'i');
    }
    debug(search);
    if (req.query.query) {
      options = {
        page: req.params.page,
        limit: 30,
        sort: { title: 1 },
      };
    } else {
      options = {
        page: req.params.page,
        limit: 30,
        sort: { popularity: -1 },
      };
    }
    MovieLibraries[id].paginate(search, options)
      .then((result) => {
        return res.status(200).json({
          success: true,
          payload: result,
        });
      });
  }));

  router.get('/page=:page', wrapper(async (req, res) => {
    debug(` --- Requesting page ${req.params.page} ---`);
    const query = MovieLibraries[id].find({}).skip(req.params.page * 10).limit(10);
    query.exec((err, docs) => {
      if (err !== null) {
        throw new Error('Something went wrong');
      } debug(' -- Success --');
      additionalInfos(docs).then((result) => {
        return res.status(200).json({
          success: true,
          payload: result,
        });
      });
    });
  }));

  router.get('/:genres/:pageNumber', auth, wrapper(async (req, res) => {
    debug('sorting movies by genres');
    debug(`Looking for genre: ${req.params.genres} on page: ${req.params.pageNumber}`);
    const query = MovieLibraries[id]
      .find({ genres: req.params.genres })
      .sort({ title: 1 });
    await query.exec((err, docs) => {
      const tmp = _.chunk(docs, 50);
      if (err !== null) {
        throw new Error('Something went wrong');
      } debug('Success');
      debug(`Movies fetched: ${tmp[req.params.pageNumber - 1].length} on total of: ${docs.length}`);
      additionalInfos(tmp[req.params.pageNumber - 1]).then((result) => {
        return res.status(200).json({
          success: true,
          totalMovies: docs.length,
          totalPages: tmp.length,
          payload: result,
        });
      });
    });
  }));

  router.delete('/:id', [auth, admin], async (req, res) => {
    const movie = await MovieLibraries[id].findByIdAndRemove(req.params.id);
    if (!movie) return res.status(404).send('The movie with the given id doesn\'t exists');
    res.send(movie);
  });

  return router;
};
