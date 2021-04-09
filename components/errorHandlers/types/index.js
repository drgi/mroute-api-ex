const HANDLERS = {};
const errorTypes = [
  { name: 'TokenExpiredError', path: 'token.expired' },
  { name: 'JsonWebTokenError', path: 'jwt.error' },
  { name: 'CastError', path: 'mongo.cast' },
  { name: 'AuthError', path: 'auth.error' },
  { name: 'MongoError', path: 'mongo.err' },
  { name: 'ValidationError', path: 'mongo-valid.err' },
];

errorTypes.forEach((e) => {
  const handler = require(`./${e.path}.js`);
  HANDLERS[e.name] = handler;
});

module.exports = HANDLERS;
