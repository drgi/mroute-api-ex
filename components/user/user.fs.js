const fs = require('fs');
const { resolve, join } = require('path');
const { DEFAULT_DIR, FILE_NAME } = require('../../config');

const USER_DIR = (userId) => {
  return resolve(__dirname, `../../${DEFAULT_DIR.users}/${userId}`);
};

const createUserDir = async (userId) => {
  path = USER_DIR(userId);
  try {
    await fs.promises.mkdir(path);
    return path;
  } catch (err) {
    console.log('User DIR create Error: ', err.message);
    return null;
  }
};

const checkUserDir = async (userId) => {
  return fs.existsSync(USER_DIR(userId));
};

const changeUserAvatar = async (path, file) => {
  try {
    const pathToFile = resolve(path, FILE_NAME.avatar + '.jpg');
    if (fs.existsSync(pathToFile)) {
      await fs.promises.unlink(pathToFile);
    }
    await fs.promises.writeFile(pathToFile, file.buffer);
    return true;
  } catch (err) {
    //console.log('Write file Error: ', err);
    return null;
  }
};

const userAvatarUrl = (userId) => {
  return join(DEFAULT_DIR.users, userId, FILE_NAME.avatar + '.jpg');
};

const saveAvatar = async (userId, file) => {
  let dirPath = USER_DIR(userId);
  if (!checkUserDir(userId)) {
    dirPath = await createUserDir(userId);
  }
  if (!dirPath) {
    return { error: `Ошибка создания каталога для ID ${userId}` };
  }
  const result = await changeUserAvatar(dirPath, file);
  if (result) {
    return userAvatarUrl(userId);
  } else {
    return null;
  }
};

module.exports = { saveAvatar };
