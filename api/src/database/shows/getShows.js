const debug = require('debug')('database:shows:get');
const axios = require('axios');
const _ = require('lodash');

const { MAX_RETRY } = require('../../config/config');


const getLen = async () => {
  return axios.get('https://tv-v2.api-fetch.website/shows')
    .then((res) => {
      if (res.status === 200) {
        debug('show pages: ', res.data.length);
        return res.data.length;
      } return 0;
    })
    .catch((err) => {
      return 0;
    });
};


const getPopCornPages = async () => {
  const pages = await getLen();
  const batches = Array.from(Array(pages).keys());
  debug(batches);
  const shows = [];
  return batches.reduce(async (prev, next) => {
    await prev;
    debug(` --- Fetching page ${next + 1} ---`);
    return new Promise((resolve) => {
      axios.get(`https://tv-v2.api-fetch.website/shows/${next + 1}`)
        .then((res) => {
          if (res && res.status === 200 && res.data && res.data.length) {
            shows.push(res.data);
            resolve();
          } else {
            debug(` !--- error fetching page ${next + 1}  ---! `);
            debug(res);
            shows.push([{ lost: next + 1 }]);
            resolve();
          }
        })
        .catch((err) => {
          debug(` !--- error fetching page ${next + 1}  ---! `);
          shows.push([{ lost: next + 1 }]);
        });
    });
  },
  setTimeout(() => {
    Promise.resolve();
  }, 500))
    .then(() => shows);
};

const recoverLostPages = async (lostPages) => {
  const shows = [];
  return lostPages.reduce(async (prev, next) => {
    await prev;
    debug(next);
    return new Promise((resolve) => {
      axios.get(`https://tv-v2.api-fetch.website/shows/${next.lost}`)
        .then((res) => {
          if (res && res.status === 200 && res.data && res.data.length) {
            shows.push(res.data);
            resolve();
          } else {
            debug(` !--- error fetching page ${next.lost}  ---! `);
            shows.push([{ lost: next.lost }]);
            resolve();
          }
        })
        .catch((err) => {
          debug(` !--- error fetching page ${next.lost}  ---! `);
          shows.push([{ lost: next.lost }]);
        });
    });
  },
  setTimeout(() => {
    Promise.resolve();
  }, 250))
    .then(() => shows);
};

const getPages = async () => {
  const responses = await getPopCornPages();
  const shouldBefetched = responses.length;
  const pages = _.filter(responses, (page) => {if (page[0]._id) return true;});
  let lostPages = _.filter(responses, (page) => {if (page[0].lost) return true;});
  if (lostPages.length) {
    let i = 0;
    while (lostPages.length && i < MAX_RETRY) {
      const recovered = await recoverLostPages(lostPages);
      lostPages = _.filter(recovered, (page) => {if (page[0].lost) return true;});
      filtered = _.filter(recovered, (page) => {if (page && page[0].id) return true;});
      filtered.forEach((recoveredPage) => {
        pages.push(recoveredPage);
      });
      i += 1;
    }
    debug(filtered.length, pages.length, filtered[0].length);
    debug('--- fetched', pages.length + filtered.length, 'over', shouldBefetched, 'pages ---');
  } else debug('--- fetched', pages.length, 'over', shouldBefetched, 'pages ---');
  return pages;
};

const getShows = async () => {
  debug('--- Fetching shows ---');
  const tmp = [];
  const pages = await getPages();
  if (pages && pages.length) {
    pages.map((page, index) => {
      return page.map((show) => {
        if (!show.imdb_id.includes('tt')) {
          id = `tt${show.imdb_id}`;
        } else id = show.imdb_id;
        tmp.push({
          id,
          tvId: show.tvdb_id,
          title: show.title,
          year: show.year,
          synopsis: show.synopsis,
          runtime: show.runtime,
          seasons: show.num_seasons,
          episodes: show.episodes,
          genres: show.genres,
          images: show.images,
          rating: show.rating.percentage / 10,
          source: 'Popcorn',
          popularity: 0,
        });
      });
    });
    debug('---', tmp.length, 'shows fetched ---');
  } return tmp;
};


module.exports = getShows;
