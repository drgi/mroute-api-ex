const config = require('rc');

module.exports = config('mroute-api', {
  JWT: {
    secret: 'jwtSecretKey',
    expired: 60 * 60,
  },
  DEFAULT_DIR: {
    users: 'public/users',
    routes: 'public/routes',
  },
  FILE_NAME: {
    avatar: 'avatar',
  },
});
