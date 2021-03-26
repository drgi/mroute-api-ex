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
const verifyJWT = (token, cb) => {
  const result = {};
  try {
    const { userId } = jwt.verify(token, JWT.secret);
    //Object.assign(result, decoded);
    cb(null, userId);
  } catch (err) {
    cb(err);
  }
};
module.exports = { generateJWTToken, generateRefreshToken, verifyJWT };
