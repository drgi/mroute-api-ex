const UserModel = require('../../models/user');

const getUserById = async (id) => {
  try {
    const user = await UserModel.findById(id);
    return user;
  } catch (err) {
    console.log('User DB module error', err);
    return null;
  }
};
module.exports = { getUserById };
