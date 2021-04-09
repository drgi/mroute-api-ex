const User = require('../models/user');
const jwt = require('jsonwebtoken');
const { JWT } = require('../config/index');
const JWT_KEY = JWT.secret;

const auth = async (req, res, next) => {
  const token = req.header('Authorization').replace('Bearer ', '');
  //console.log(token)
  let decoded;
  jwt.verify(token, JWT_KEY, (err, decodedJWT) => {
    if (err) {
      return next(err);
    }
    decoded = decodedJWT;
  });
  if (!decoded) return;
  try {
    const user = await User.findOne({
      _id: decoded.userId,
    });
    if (!user) {
      throw new Error('Пользователь не найден');
    }
    req.user = user;
    req.token = token;
    next();
  } catch (e) {
    next(e);
    //return res.status(401).send({ error: e.message });
  }
};

module.exports = auth;
