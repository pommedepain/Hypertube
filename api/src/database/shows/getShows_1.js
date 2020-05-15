const debug = require('debug')('database:shows:get');
const axios = require('axios');

getShows = async () => {
  debug('--- Fetching Shows ---');
  return axios('https://tv-v2.api-fetch.website/exports/show')
    .then((res) => {
      if (res.status && res.data) {
        const list = res.data.split('\n');
        debug('---', list.length, 'shows to fetch ---');
        const shows = list.map((show, i) => {
          if (i !== list.length - 1 && i !== list.length -2) {
            const tmp = JSON.parse(show);
            if (!tmp.imdb_id.includes('tt')) {
              id = `tt${tmp.imdb_id}`;
            } else id = tmp.imdb_id;
            return {
              id,
              tvId: tmp.tvdb_id,
              title: tmp.title,
              year: tmp.year,
              synopsis: tmp.synopsis,
              runtime: tmp.runtime,
              seasons: tmp.num_seasons,
              episodes: tmp.episodes,
              genres: tmp.genres,
              images: tmp.images,
              rating: tmp.rating.percentage / 10,
              source: 'Popcorn',
              popularity: 0,
            };
          }
        });
        return shows;
      }
    })
    .catch((err) => {debug(err); return [];});
};

module.exports = getShows;
