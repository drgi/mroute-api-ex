const messages = {
  'Cast to ObjectId failed for value "invaid id" at path "_id" for model "UserModel"': (
    err
  ) => {
    return `Ошибка поиска в БД: ID ${err.value} не верный`;
  },
};
module.exports = (err) => {
  //console.log('Mongo cast ', err);
  const handler = messages[err.message] ? messages[err.message](err) : null;
  const message = handler || err.message;
  return { code: 400, message };
};
