const messages = {
  11000: (err) => {
    const value = JSON.stringify(err.keyValue);
    return `Пользователь с ${value}, уже зарегестрирован.`;
  },
};
module.exports = (err) => {
  const message = messages[err.code] ? messages[err.code](err) : err.message;
  return { code: 400, message };
};
