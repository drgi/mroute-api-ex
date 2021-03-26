const messages = {
  'jwt malformed': 'Токен авторизации не верного формата',
};
module.exports = (err) => {
  const message = messages[err.message] || err.message;
  return { code: 401, message };
};
