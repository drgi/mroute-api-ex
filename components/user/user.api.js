const { userFieldsForResponse } = require('../utils/user.filter');
const { validateId } = require('../utils/id.validator');
const {
  getUserById,
  getUserEmailById,
  findUserRoutes,
  findUserRouteDrafts,
  addRecoveryToken,
  findUserAndResetPassword,
} = require('./user.db');
const formDataParser = require('./formdata.middleware');
const { saveAvatar } = require('./user.fs');
const {
  sendMailForRecovery,
  sendMailWithNewPassword,
} = require('./mailer/mailer.api');
const {
  generateRecoveryToken,
  generateTempPassword,
} = require('./recovery.token');

const getUserProfileById = async (userId) => {
  const result = { error: null };
  const user = await getUserById(userId);
  if (!user) {
    result.error = `Пользователь с ${userId} не найден:(`;
    return result;
  }
  const filteredUser = userFieldsForResponse(user);
  return Object.assign(result, { user: filteredUser });
};

const getUserRoute = async (userId, params) => {
  const result = { error: null };
  const userEmail = await getUserEmailById(userId);
  if (!userEmail) {
    result.error = `Пользователя с ${userId}, нет в БД или Id не верный`;
    return result;
  }
  const routes = await findUserRoutes(userEmail);
  result.routes = routes || [];
  return result;
};

const getUserRouteDrafts = async (userId) => {
  const result = { error: null };
  const userEmail = await getUserEmailById(userId);
  if (!userEmail) {
    result.error = `Пользователя с ${userId}, нет в БД или Id не верный`;
    return result;
  }
  const routes = await findUserRouteDrafts(userEmail);
  result.routes = routes || [];
  return result;
};

const patchUserProfile = async (userId, fieldForUpdate, avaFile) => {
  const result = { error: null };
  const user = await getUserById(userId);
  if (!user) {
    result.error = `Пользователь с Id ${userId}, не найден.`;
    return result;
  }
  if (avaFile) {
    //upload file
    const url = await saveAvatar(userId, avaFile);
    fieldForUpdate.avatar = url;
  }
  Object.assign(user, fieldForUpdate);
  await user.save();
  const filteredUser = userFieldsForResponse(user);
  return { user: filteredUser };
};

const requestPassRecovery = async (email) => {
  const token = generateRecoveryToken(); // { resetPasswordExp, resetPasswordToken }
  const user = await addRecoveryToken(email, token);
  if (!user) {
    return { error: `Email ${email} не зарегестрирован` };
  }
  // Send mail
  const { name, resetPasswordToken } = user;
  const sendMail = await sendMailForRecovery(email, name, resetPasswordToken);
  if (!sendMail) {
    return { error: `Не удалось отправить письмо с для воостановления пароля` };
  }
  return { succes: 'ok' };
};

const resetUserPassword = async (key) => {
  const tempPass = generateTempPassword();
  const user = await findUserAndResetPassword(key, tempPass);
  if (!user) {
    return { error: 'Пользователь не найден или итек срок восстановления' };
  }
  const { email, name } = user;
  const sendMail = await sendMailWithNewPassword(email, name, tempPass);
  if (!sendMail) {
    return { error: `Не удалось отправить письмо с для воостановления пароля` };
  }

  return { succes: 'ok' };
};

// MiddleWare
const parseFormDataAndFile = (req, res, next) => {
  formDataParser(req, res, (err) => {
    if (err) {
      // Случилась ошибка Multer при загрузке.
      console.log('Multer Error', err);
      next(err);
    }
    next();
    return;
  });
};
module.exports = {
  getUserProfileById,
  getUserRoute,
  getUserRouteDrafts,
  parseFormDataAndFile,
  patchUserProfile,
  requestPassRecovery,
  resetUserPassword,
};
