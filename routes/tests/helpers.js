const UserModel = require('../../models/user');
const RouteModel = require('../../models/route');
const jwt = require('jsonwebtoken');
const { JWT } = require('../../config/');
const testRoutes = require('./testdata/routes/validForPub');
const { generateRoutes } = require('./testdata/routes/routes-generator');

// DB
//User
async function addUser(newUser) {
  const user = new UserModel(newUser);
  await user.save();
  return user;
}

async function removeUsedByEmail(email) {
  await UserModel.deleteOne({ email });
}

// RoutesDirs
async function addTestRoutes(count) {
  const routes = generateRoutes(count);
  console.log('Routes', routes);
  try {
    for (let route of routes) {
      const r = new RouteModel(route);
      await r.save();
    }
  } catch (err) {
    console.log('Route add Error', err);
  }
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

module.exports = {
  addUser,
  removeUsedByEmail,
  cookieParser,
  generateJWTToken,
  addTestRoutes,
};
