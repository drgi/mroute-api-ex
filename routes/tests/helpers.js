const UserModel = require('../../models/user');

async function addUser(newUser) {
  const user = new UserModel(newUser);
  await user.save();
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

module.exports = { addUser, removeUsedByEmail, cookieParser };
