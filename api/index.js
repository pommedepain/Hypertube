const debug = require('debug')('index');
const mongoose = require('mongoose');
const Server = require('./src/models/Server');
const { UserHistory } = require('./src/models/UserHistory');
const Comment = require('./src/models/Comment');
const { init, update } = require('./src/database/start');
const { DATABASE, JWT } = require('./src/config/config');

if (!JWT.KEY) {
  debug('FATAL ERROR: jwtPrivateKey is not defined');
  process.exit(1);
}

const checkDbConnection = async () => {
  return mongoose.connect(`mongodb://${DATABASE.HOST}/${DATABASE.NAME}`, DATABASE.OPTIONS, (err) => {
    if (err) debug(err);
  });
};

checkDbConnection()
  .then(() => {
    return Promise.all([Comment.remove({}), UserHistory.remove({})]);
  })
  .then(() => {
    if (process.env.START === 'update') {
      return update();
    } return init();
  })
  .then((res) => {
    if (res[0].success === true && res[1].success === true && res[2].success === true) {
      debug('######  Starting server #####');
      new Server().listen();
    } else return process.exit(0);
  })
  .catch((err) => {
    debug(err);
    return process.exit(0);
  });
