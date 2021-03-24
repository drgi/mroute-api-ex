const crypto = require('crypto');

const generateRecoveryToken = () => {
  const resetPasswordToken = crypto.randomBytes(20).toString('hex');
  const resetPasswordExp = Date.now() + 3600000;
  return { resetPasswordExp, resetPasswordToken };
};

const generateTempPassword = () => {
  return crypto.randomBytes(4).toString('hex');
};

module.exports = { generateRecoveryToken, generateTempPassword };
