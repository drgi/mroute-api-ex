const messages = {};
module.exports = (err) => {
  const message = messages[err.message] || err.message;
  const code = err.code || 500;
  return { code, message };
};
