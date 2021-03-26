const errorMessage = require('./error.message');
module.exports = {
  JsonWebTokenError: (err) => {
    const { message } = err;
    return { code: 401, message: errorMessage[message] };
  },
  TokenExpiredError: (err) => {
    const { message } = err;
    return { code: 401, message: errorMessage[message] };
  },

  undefined: (err) => {
    return { code: 500, message: `Unknown Error type: ${err.message}` };
  },
};
