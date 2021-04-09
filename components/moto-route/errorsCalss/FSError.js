module.exports = class FSError extends Error {
  constructor(message, code, type = 'RouteRequest') {
    super();
    this.type = type;
    this.message = message;
    this.code = code;
  }
};
