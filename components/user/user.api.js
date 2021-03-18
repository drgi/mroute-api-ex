const { userFieldsForResponse } = require('../utils/user.filter');
const { getUserById } = require('./user.db');

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
module.exports = { getUserProfileById };
