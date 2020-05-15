import axios from 'axios';

export default async () => {
  const total = {};
  return Promise.all([
    axios.get('/API/MovieLibrary/count')
    .then((res) => {
      total.movieCount = res.data.payload;
      return res.data.payload
    }),
    axios.get('/API/TVShowLibrary/count')
    .then((res) => {
      total.showCount = res.data.payload;
      return res.data.payload
    }),
  ]).then((res) => (total));
};
