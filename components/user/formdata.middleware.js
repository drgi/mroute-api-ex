const multer = require('multer');

const storage = multer.memoryStorage();
const formDataParser = multer({ storage, fileFilter }).fields([
  { name: 'avaFile', maxCount: 1 },
]);

function fileFilter(req, file, cb) {
  //console.log('File Filter', file);
  cb(null, true);
  //cb(new multer.MulterError('Хуевый файл)'));
}
module.exports = formDataParser;
