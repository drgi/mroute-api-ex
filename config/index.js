const config = require('rc');
const { join } = require('path');

module.exports = config('mroute-api', {
  JWT: {
    secret: 'jwtSecretKey',
    expired: 60 * 60,
  },
  DEFAULT_DIR: {
    root: join(__dirname, '..'),
    users: 'public/users',
    routes: 'public/routes',
    routeDirs: ['pointimages', 'routefiles', 'routeimages'],
  },
  FILE_NAME: {
    avatar: 'avatar',
  },
});
