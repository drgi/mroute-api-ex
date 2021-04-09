module.exports = (err) => {
  let e = err.message.match(/-[а-я0-9\s]+/gi);
  e = e.map((line) => `<li>${line}</li>`);
  const message = `<ul><h6>Публикация не возможна!</h6>${e.join('')}</ul>`;
  return { code: 200, message };
};
