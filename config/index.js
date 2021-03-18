const config = require('rc');

module.exports = config('mroute-api', {
  JWT: {
    secret: 'jwtSecretKey',
    expired: 60 * 60,
  },
});
