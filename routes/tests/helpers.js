const UserModel = require('../../models/user');
const jwt = require('jsonwebtoken');
const { JWT } = require('../../config/');

async function addUser(newUser) {
  const user = new UserModel(newUser);
  await user.save();
  return user;
}

async function removeUsedByEmail(email) {
  await UserModel.deleteOne({ email });
}

function cookieParser(cookie) {
  const entries = cookie[0]
    .split(';')
    .map((c) => c.trim())
    .map((k) => {
      if (k.includes('=')) {
        return k.split('=');
      } else {
        return [k, true];
      }
    });
  return Object.fromEntries(entries);
}

function generateJWTToken(userId, expired = null) {
  const token = jwt.sign({ userId }, JWT.secret, {
    expiresIn: expired || JWT.expired,
  });
  return token;
}

module.exports = { addUser, removeUsedByEmail, cookieParser, generateJWTToken };
