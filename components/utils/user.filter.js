const fields = ['_id', 'name', 'email', 'bike', 'avatar'];

const userFieldsForResponse = (user) => {
  const filteredUser = {};
  fields.forEach((f) => {
    if (user[f]) {
      filteredUser[f] = user[f];
    }
  });
  return filteredUser;
};
module.exports = { userFieldsForResponse };
