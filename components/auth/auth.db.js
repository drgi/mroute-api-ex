const UserModel = require('../../models/user');

const findUserByEmail = async (email) => {
  const user = await UserModel.findOne({ email });
  return user;
};
const findUserById = async (id) => {
  try {
    const user = await UserModel.findById(id);
    return user;
  } catch (error) {
    //console.log('Find error', error);
    return null;
  }
  return user;
};
const registerNewUser = (newUser) => {
  const user = new UserModel(newUser);
  return user;
};

const findUserByRefreshToken = async (refreshToken) => {
  const user = await UserModel.findOne({ 'tokens.token': refreshToken });
  return user;
};
module.exports = {
  findUserByEmail,
  registerNewUser,
  findUserById,
  findUserByRefreshToken,
};
