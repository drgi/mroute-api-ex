const fs = require('fs');
const rimRaf = require('rimraf');
const { resolve, join, relative } = require('path');
const FSError = require('./errorsCalss/FSError');
const { DEFAULT_DIR, FILE_NAME } = require('../../config');

const makeDirForNewRoute = async (routeId) => {
  console.log('RouteId', routeId);

  if (!_checkDefaultDir()) {
    throw new FSError(`Не найдена папка ${DEFAULT_DIR.routes}`);
  }
  const routeDirPath = join(DEFAULT_DIR.root, DEFAULT_DIR.routes, routeId);
  console.log('Path', routeDirPath);

  if (!fs.existsSync(routeDirPath)) {
    await fs.promises.mkdir(routeDirPath);
  }
  const dirs = DEFAULT_DIR.routeDirs;
  for (let dirName of dirs) {
    const path = join(routeDirPath, dirName);
    if (!fs.existsSync(path)) {
      await fs.promises.mkdir(path);
    }
  }
};
const deleteRouteDir = async (routeId) => {
  const path = resolve(DEFAULT_DIR.root, DEFAULT_DIR.routes, routeId);
  console.log('Routedir For Delete: ', path);
  if (fs.existsSync(path)) {
    rimRaf(path, (err) => {
      if (err) {
        throw err;
      }
    });
  }
};
const addImagesToRoute = async (routeId, files) => {
  if (!_checkRouteDir(routeId)) {
    throw new FSError(`Не найдена папка маршрута${routeId}`);
  }
  const imagesDirPath = _getDefaultRouteImagesDirPath(routeId);

  if (!imagesDirPath) {
    throw new FSError(
      `Не найдена папка для изображений маршрута с ID ${routeId}`
    );
  }
  const routeImages = [];
  for (let file of files) {
    const image = await _writeFile(imagesDirPath, file);
    routeImages.push(image);
  }
  return routeImages;
};
const addImagesToPoint = (routeId, pointId, files) => {};
const deleteImageFromRoute = (routeId, files) => {};
const deleteImageFromPoint = (routeId, pointId, files) => {};
const _checkDefaultDir = () => {
  const path = resolve(DEFAULT_DIR.root, DEFAULT_DIR.routes);
  return fs.existsSync(path);
};
const _checkRouteDir = (routeId) => {
  const path = join(DEFAULT_DIR.root, DEFAULT_DIR.routes, routeId);
  console.log('Routedir Path:', path);

  return fs.existsSync(path);
};
const _getDefaultRouteImagesDirPath = (routeId) => {
  const path = join(
    DEFAULT_DIR.root,
    DEFAULT_DIR.routes,
    routeId,
    'routeimages'
  );
  return fs.existsSync(path) ? path : null;
};
const _writeFile = async (imagesDirPath, file) => {
  const filename = Date.now() + '.jpg';
  const pathToWrite = join(imagesDirPath, filename);
  const { buffer } = file;
  await fs.promises.writeFile(pathToWrite, buffer);
  delete file.buffer;
  const urlPath = relative(DEFAULT_DIR.root, pathToWrite);
  console.log('Url File path:', urlPath);

  file.path = urlPath;
  return file;
};

module.exports = { makeDirForNewRoute, deleteRouteDir, addImagesToRoute };
