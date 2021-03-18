const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { JWT } = require('../../config/index');

const generateJWTToken = (userId) => {
  const token = jwt.sign({ userId }, JWT.secret, { expiresIn: JWT.expired });
  return token;
};
const generateRefreshToken = () => {
  const refreshToken = crypto.randomBytes(20).toString('hex');
  return refreshToken;
};
const verifyJWT = (token) => {
  const result = { error: null };
  try {
    const decoded = jwt.verify(token, JWT.secret);
    Object.assign(result, decoded);
    return result;
  } catch (err) {
    console.log('JWT verify Error', err);
    result.error = err.message;
    return result;
  }
};
module.exports = { generateJWTToken, generateRefreshToken, verifyJWT };
