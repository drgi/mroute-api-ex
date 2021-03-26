const messages = {
  'jwt expired': 'Истек срок действия токена',
};
module.exports = (err) => {
  const message = messages[err.message] || err.message;
  return { code: 401, message };
};
