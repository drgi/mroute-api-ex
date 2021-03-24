const transporter = require('./mailer.init');
const {
  generateRecoveryLetter,
  generateLetterWithNewPass,
} = require('./letter.generator');

const sendMailForRecovery = async (email, name, token) => {
  const letter = generateRecoveryLetter(email, name, token);
  try {
    const result = await _sendLetter(letter);
    return true;
  } catch (err) {
    console.log('Send letter Error: ', err);
    return null;
  }
};

const sendMailWithNewPassword = async (email, name, newPass) => {
  const letter = generateLetterWithNewPass(email, name, newPass);
  try {
    const result = await _sendLetter(letter);
    return true;
  } catch (err) {
    console.log('Send letter Error: ', err);
    return null;
  }
};

const _sendLetter = async (letter) => {
  return await transporter.sendMail(letter);
};
module.exports = { sendMailForRecovery, sendMailWithNewPassword };
