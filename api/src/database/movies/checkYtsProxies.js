const debug = require('debug')('database:movies:proxies');
const axios = require('axios');

const proxies = [
  'https://ytss.unblocked.is/api',
  'https://ytss.unblocked.ms/api',
  'https://yts.unblocked.llc/api',
  'https://yts.unblocked.vet/api',
  'https://yts.unblocked.gdn/api',
  'http://www.yify-movies.net/api',
  'https://yts.unblocked.pub/api',
  'https://yts.unblocked.team/api',
  'https://yts.bypassed.in/api',
  'https://www4.yify.is/api',
  'http://www.yify-movies.net/api',
  // 'https://yts.ae/api', //unreliable
  'https://yts.ws/api',
  'https://yts.lt/api',
  'https://yts.am/api',
  'https://yts.gs/api',
  'http://yify.rocks/api',
  'https://yts.sc/api',
  'http://yify.live/api',
  'http://yify.is/api',
  'https://yifymovies.me/api',
  'https://yts-proxy.now.sh',
];

module.exports = async () => {
  debug('####### Checking Proxies #######');
  const promises = proxies.map((proxy) => {
    return new Promise((resolve) => {
      axios.get(`${proxy}/v2/list_movies.json`)
        .then((res) => {
          if (res && res.status === 200 && res.data.data) {
            resolve({ proxy, up: true, movieCount: res.data.data.movie_count });
          } resolve({ proxy, up: false });
        })
        .catch((err) => resolve({ proxy, up: false }));
    });
  });
  return Promise.all(promises);
};
