const multer = require('multer');

const storage = multer.memoryStorage();
const formDataParser = multer(storage).fields([
  { name: 'avaFile', maxCount: 1 },
]);

module.exports = formDataParser;
