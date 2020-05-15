const debug = require('debug')('routes:shows');
const express = require('express');
const wrapper = require('../middleware/wrapper');
const ShowLibraries = require('../models/ShowLibrary');
const { IMDB } = require('../config/config');
const router = express.Router();
const axios = require('axios');
const _ = require('lodash');


const additionalInfos = async (shows) => {
  const added = shows.map((show) => {
    return axios.get(`http://www.omdbapi.com/?apikey=82d3dbb5&i=${show.id}`)
      .then((response) => {
        if (response.status === 200) {
          return { show, additionalInfos: response.data };
        } return show;
      })
      .catch((err) => show);
  });
  return Promise.all(added);
};

module.exports = (id) => {
  router.use(express.json());
  router.use(express.urlencoded({ extended: true }));
  router.get('/', wrapper(async (req, res) => {
    debug(' --- Requesting shows --- ');
    const query = ShowLibraries[id].find({}).limit(50);
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
        ShowLibraries[id].find({
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

  // router.get('/infos/:id', wrapper(async (req, res) => {
  //   const key = IMDB.KEY;
  //   const doc = await ShowLibraries[id].findOne({ id: req.params.id });
  //   debug(doc.genres);
  //   if (doc.additionnalInfos.length === 0) {
  //     axios.get(`http://www.omdbapi.com/?apikey=${key}&i=${req.params.id}`)
  //       .then((response) => {
  //         doc.additionnalInfos = response.data;
  //         const seasons = Array.from(Array(parseInt(doc.additionnalInfos[0].totalSeasons)).keys());
  //         doc.seasons = seasons.map((season) => {
  //           return { season: season+1, episodes: _.filter(doc.episodes.map((episode) => {
  //             if (episode.season === season + 1) {
  //               const tmp = Object.keys(episode.torrents).map((key, i) => {
  //                 episode.torrents[key].quality = key;
  //                 episode.torrents[key].hash = episode.torrents[key].url;
  //                 return episode.torrents[key];
  //               });
  //               episode.torrents = tmp;
  //               return { episodeNumber: episode.episode, episode };
  //             }
  //           }), (episode) => {if (episode) return true;}),
  //           };
  //         });
  //         doc.save();
  //         return res.status(200).json({
  //           success: true,
  //           payload: doc.additionnalInfos[0],
  //           seasons: doc.seasons,
  //         });
  //       })
  //       .catch((err) => {
  //         return res.status(200).json({
  //           success: false,
  //           payload: err,
  //         });
  //       });
  //   } else {
  //     return res.status(200).json({
  //       success: true,
  //       payload: doc.additionnalInfos[0],
  //       seasons: doc.seasons,
  //     });
  //   }
  // }));

  router.get('/infos/:id', wrapper(async (req, res) => {
    const key = IMDB.KEY;
    const doc = await ShowLibraries[id].findOne({ id: req.params.id });
    if (doc.episodes.length === 0) {
      axios.get(`https://tv-v2.api-fetch.website/show/${doc.id}`)
        .then((response) => {
          doc.episodes = response.data.episodes;
          doc.save();
          return axios.get(`http://www.omdbapi.com/?apikey=${key}&i=${req.params.id}`);
        })
        .then((response) => {
          doc.additionnalInfos = response.data;
          const seasons = Array.from(Array(parseInt(doc.additionnalInfos[0].totalSeasons)).keys());
          doc.seasons = seasons.map((season) => {
            return { season: season+1, episodes: _.filter(doc.episodes.map((episode) => {
              if (episode.season === season + 1) {
                const tmp = Object.keys(episode.torrents).map((key, i) => {
                  episode.torrents[key].quality = key;
                  episode.torrents[key].hash = episode.torrents[key].url;
                  return episode.torrents[key];
                });
                episode.torrents = tmp;
                return { episodeNumber: episode.episode, episode };
              }
            }), (episode) => {if (episode) return true;}),
            };
          });
          doc.save();
          debug(doc.seasons[0].episodes[0].episode.torrents);
          return res.status(200).json({
            success: true,
            payload: doc.additionnalInfos[0],
            seasons: doc.seasons,
          });
        });
    } else {
      debug(doc.seasons[0].episodes[0].episode.torrents);
      return res.status(200).json({
        success: true,
        payload: doc.additionnalInfos[0],
        seasons: doc.seasons,
      });
    }
  }));


  router.get('/count', wrapper(async (req, res) => {
    ShowLibraries[id].estimatedDocumentCount({}, (err, count) => {
      if (err === null && count !== 0) {
        debug('--- TVShow count: ---', count);
        return res.status(200).json({
          success: true,
          payload: count,
        });
      } throw new Error(err);
    });
  }));

  router.get('/popular', wrapper(async (req, res) => {
    const key = TVDB.KEY;
    debug(key);
    axios.get(`https://api.themoviedb.org/3/tv/popular?api_key=${key}&language=en-US&page=1`)
      .then((response) => {
        if (response.status === 200) {
          result = response.data;
        } else result = [];
        return res.status(200).json({
          success: true,
          payload: result,
        });
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
      const tmp = req.query.genres.split(',');
      const genres = tmp.map((genre) => (genre.toLowerCase()));
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
    ShowLibraries[id].paginate(search, options)
      .then((result) => {
        return res.status(200).json({
          success: true,
          payload: result,
        });
      });
  }));

  router.get('/page=:page', wrapper(async (req, res) => {
    debug(` --- Requesting page ${req.params.page} ---`);
    const query = ShowLibraries[id].find({}).skip(req.params.page * 10).limit(10);
    // limit to not overload browser with 15000 shows....
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

  return router;
};
