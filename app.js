const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
// DB connect
const db = require('./db/db')();

////Routes
const user = require('./routes/user');
const route = require('./routes/route');
const convertRoute = require('./routes/convertroute');
const auth = require('./routes/auth');
//Static file
const statics = express.static(__dirname + '/public');
const front = express.static(__dirname + '/static');

const cors = require('cors');

const port = 3000;

app.use(cookieParser());

app.use('/', front);
app.use('/public', statics);

app.use(express.json({ limit: '10mb' }));

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use('/auth', auth);
app.use('/user', user);
app.use('/route', route);
app.use('/convertroute', convertRoute);

// app.listen(port, () => {
//   console.log(`Mroute api run on http://localhost:${port}`);
// });

module.exports = app;
