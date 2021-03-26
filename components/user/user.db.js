const UserModel = require('../../models/user');
const RouteModel = require('../../models/route');

const USER_ROUTE_FIELDS = ['nameTranslit', 'name', 'description', 'avatar'];
const getUserById = async (id) => {
  try {
    const user = await UserModel.findById(id);
    return user;
  } catch (err) {
    console.log('User DB module error', err);
    return null;
  }
};
const getUserEmailById = async (id) => {
  try {
    const user = await UserModel.findById(id).lean().select('email');
    return user.email;
  } catch (err) {
    console.log('User DB module error', err.message);
    throw err;
  }
};

const getUserByEmail = async (email) => {
  try {
    const user = await UserModel.findOne({ email });
    return user;
  } catch (err) {
    console.log('User DB module error', err.message);
    return null;
  }
};
const findUserRoutes = async (email) => {
  const routes = await RouteModel.find({
    'author.email': email,
    isDraft: false,
  })
    .lean()
    .select(USER_ROUTE_FIELDS.join(' '));
  return routes;
};
const findUserRouteDrafts = async (email) => {
  const routes = await RouteModel.find({
    'author.email': email,
    isDraft: true,
  })
    .lean()
    .select(USER_ROUTE_FIELDS.join(' '));
  return routes;
};

const addRecoveryToken = async (email, token) => {
  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return null;
    }
    Object.assign(user, token);
    await user.save();
    return user;
  } catch (err) {
    console.log('User DB module error', err.message);
    return null;
  }
};

const findUserAndResetPassword = async (key, tempPass) => {
  try {
    const user = await UserModel.findOne({
      resetPasswordToken: key,
      resetPasswordExp: { $gt: Date.now() },
    });
    if (user) {
      user.password = tempPass;
      user.resetPasswordToken = undefined;
      user.resetPasswordExp = undefined;
      user.tokens = [];
      await user.save();
    }
    return user;
  } catch (err) {
    console.log('findUserForResetPassword', err);
    return null;
  }
};

module.exports = {
  getUserById,
  getUserEmailById,
  findUserRoutes,
  findUserRouteDrafts,
  getUserByEmail,
  addRecoveryToken,
  findUserAndResetPassword,
};
