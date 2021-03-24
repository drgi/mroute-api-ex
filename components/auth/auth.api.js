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

const login = async (email, password) => {
  const result = { error: null };
  const user = await findUserByEmail(email);
  if (!user) {
    result.error = `Пользователь с ${email} не найден в базе.`;
    return result;
  }
  // Compare pass
  const isValidPass = await comparePassword(password, user.password);
  if (!isValidPass) {
    result.error = `Не верный пароль!`;
    return result;
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

const register = async (newUser) => {
  const result = { error: null };
  // Validate?
  const requiredFields = ['email', 'name', 'password'];
  const validateFields = requiredFields.filter((f) =>
    !!newUser[f] ? false : f
  );
  if (validateFields.length > 0) {
    result.error = `Обязательных полей ${validateFields.join(
      ','
    )} нет в запросе.`;
    return result;
  }
  // Hash password ???
  const user = registerNewUser(newUser);
  const token = generateJWTToken(user._id);
  const refreshToken = generateRefreshToken();
  // Push Refresh Token to User             ++++ функ дабавить новый токен
  user.tokens = [...user.tokens, { token: refreshToken }];
  // Save user in Db
  try {
    await user.save();
  } catch (error) {
    //console.log('Save error', error);
    if (error.code === 11000) {
      result.error = `Пользователь с ${newUser.email} уже зарегестрирован.`;
      return result;
    }
  }

  // filter user fields for respose to client
  const filteredUser = userFieldsForResponse(user);
  // Prepare result
  Object.assign(result, { token, refreshToken, user: filteredUser });
  return result;
};

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
const verifyJWTMiddleware = async (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    req.authError = `В запросе нет заголовка Authorization`;
    next();
    return;
  }
  const token = authHeader.replace('Bearer ', '');
  const { userId, error } = verifyJWT(token);
  if (error) {
    req.authError = error;
    next();
    return;
  }
  if (userId) {
    req.authError = null;
    req.userId = userId;
    next();
    return;
  }
};
module.exports = {
  login,
  register,
  logout,
  logoutAll,
  refreshJWTToken,
  verifyJWTMiddleware,
};
