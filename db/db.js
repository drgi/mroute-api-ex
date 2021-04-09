const mongoose = require('mongoose');
// const MONGO_URL =
//   'mongodb+srv://mroute:3946646@mroute.ae14d.mongodb.net/mroute?retryWrites=true&w=majority';
const MONGO_URL = 'mongodb://localhost:27017/mroute-test';
function connectToDB() {
  mongoose
    .connect(MONGO_URL, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    })
    .catch((e) => {
      console.log(e);
    });
  return mongoose;
}
module.exports = connectToDB;
