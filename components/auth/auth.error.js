const AuthError = class AuthError extends Error {
  constructor(message, options) {
    super(message);
    Object.assign(this, options);
  }
};
module.exports = AuthError;
