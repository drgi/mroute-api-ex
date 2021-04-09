const {
  findUserByEmail,
  registerNewUser,
  findUserById,
  findUserByRefreshToken,
} = require('./auth.db');
const { comparePassword, hashPassword } = require('./auth.password');
const {
  generateJWTToken,
  generateRefreshToken,
  verifyJWT,
} = require('./auth.tokens');
const { userFieldsForResponse } = require('../utils/user.filter');
const AuthError = require('./auth.error');

// Login
const login = async (email, password) => {
  const result = { error: null };
  const user = await findUserByEmail(email);
  if (!user) {
    throw new AuthError(`Пользователь с ${email} не найден в базе.`, {
      code: 400,
    });
  }
  // Compare pass
  const isValidPass = await comparePassword(password, user.password);
  if (!isValidPass) {
    throw new AuthError('Не верный пароль!', { code: 400 });
  }
  // Generate Tokens
  const token = generateJWTToken(user._id);
  const refreshToken = generateRefreshToken();
  // Push Refresh Token to User  ++++ функ дабавить новый токен
  user.tokens = [...user.tokens, { token: refreshToken }];
  // Save user in Db
  await user.save();
  // filter user fields for respose to client
  const filteredUser = userFieldsForResponse(user);
  // Prepare result
  Object.assign(result, { token, refreshToken, user: filteredUser });
  return result;
};

// Register
const register = async (newUser) => {
  const result = { error: null };
  // Validate?
  const requiredFields = ['email', 'name', 'password'];
  const validateFields = requiredFields.filter((f) =>
    !!newUser[f] ? false : f
  );
  if (validateFields.length > 0) {
    const message = `Обязательных полей ${validateFields.join(
      ','
    )} нет в запросе.`;
    throw new AuthError(message, { code: 400 });
  }
  // Hash password ???
  const user = registerNewUser(newUser);
  const token = generateJWTToken(user._id);
  const refreshToken = generateRefreshToken();
  // Push Refresh Token to User             ++++ функ дабавить новый токен
  user.tokens = [...user.tokens, { token: refreshToken }];
  // Save user in Db
  await user.save();
  // filter user fields for respose to client
  const filteredUser = userFieldsForResponse(user);
  // Prepare result
  Object.assign(result, { token, refreshToken, user: filteredUser });
  return result;
};
// Logout
const logout = async (userId, refreshToken) => {
  const result = { error: null };
  const user = await findUserById(userId);
  if (!user) {
    result.error = `Пользователь с ${userId} не найден.`;
    return result;
  }
  // Перенести в БД фн удалить токен
  user.tokens = user.tokens.filter((t) =>
    t.token !== refreshToken ? t : false
  );
  user.markModified('tokens');
  await user.save();
  result.ok = true;
  return result;
};
const logoutAll = async (userId) => {
  const result = { error: null };
  const user = await findUserById(userId);
  if (!user) {
    result.error = `Пользователь с ${userId} не найден.`;
    return result;
  }
  // Перенести в БД фн удалить все токены юзера
  user.tokens = [];
  await user.save();
  result.ok = true;
  return result;
};

// Refresh JWT Token
const refreshJWTToken = async (refreshToken) => {
  const result = { error: null };
  const user = await findUserByRefreshToken(refreshToken);
  if (!user) {
    result.error = `Не верный Токен`;
    return result;
  }
  user.tokens = user.tokens.filter((t) => t.token !== refreshToken);
  const token = generateJWTToken(user._id);
  const newRefreshToken = generateRefreshToken();
  // Push Refresh Token to User
  user.tokens = [...user.tokens, { token: newRefreshToken }];
  // Save user in Db
  await user.save();
  // Prepare result
  Object.assign(result, { token, newRefreshToken });
  return result;
};

const changePassword = async (userId, email, oldPass, newPass) => {
  const user = await findUserById(userId);
  if (user.email !== email) {
    const message = `Ваш email ${email} не совпадает с ID`;
    throw new AuthError(message, { code: 400 });
  }
  const isValidPass = await comparePassword(oldPass, user.password);
  if (!isValidPass) {
    throw new AuthError('Не верный пароль!', { code: 400 });
  }
  user.password = newPass;
  await user.save();
  return { succes: 'ok' };
};

// Auth Middleware
const verifyJWTMiddleware = async (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    req.authError = `В запросе нет заголовка Authorization`;
    next();
    return;
  }
  const token = authHeader.replace('Bearer ', '');
  verifyJWT(token, (err, userId) => {
    if (err) {
      return next(err);
    }
    //console.log('User ID Jwt mdlw', userId, 'Error', err?.message);

    if (userId) {
      req.authError = null;
      req.userId = userId;
      next();
    }
  });
};
module.exports = {
  login,
  register,
  logout,
  logoutAll,
  refreshJWTToken,
  verifyJWTMiddleware,
  changePassword,
};
