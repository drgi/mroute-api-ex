require('dotenv').config();

const generateRecoveryLetter = (email, name, resetPassToken) => {
  return {
    to: email,
    from: 'mail@moto-route.ru',
    template: 'forgot-password-email',
    subject: 'Сброс пароля',
    context: {
      url: `${process.env.HOST}/user/resetpassword/?key=${resetPassToken}`,
      name: name,
    },
  };
};
const generateLetterWithNewPass = (email, name, password) => {
  return {
    to: email,
    from: 'mail@moto-route.ru',
    template: 'reset-password-email',
    subject: 'Новый пароль',
    context: {
      email: email,
      name: name,
      password: password,
    },
  };
};

module.exports = { generateRecoveryLetter, generateLetterWithNewPass };
