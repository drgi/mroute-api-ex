const errorLib = require('./types');
const DEFAULT_HANDLER = (err) => {
  const message = `UNHANDLED ERROR, TYPE: ${err.constructor.name}, MESSAGE: ${err.message}`;
  return { code: 418, message };
};
const errorHandler = (err) => {
  const errorInstance = err.constructor.name;
  const handler = errorLib[errorInstance] || DEFAULT_HANDLER;
  return handler(err);
};
module.exports = { errorHandler };
