const bcrypt = require('bcrypt');
// Password compare
const comparePassword = (password, hash) => {
  return bcrypt.compare(password, hash); // Promise
};
// Password hash
const hashPassword = (password) => {
  return bcrypt.hashSync(password);
};
module.exports = {
  comparePassword,
  comparePassword,
};
