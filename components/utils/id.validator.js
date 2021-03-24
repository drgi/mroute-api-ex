const mongoose = require('mongoose');
const validateId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

module.exports = { validateId };
