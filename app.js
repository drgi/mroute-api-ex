const express = require('express');
const app = express();

////Routes
const user = require('./routes/user');
const route = require('./routes/route');
const convertRoute = require('./routes/convertroute');
//Static file
const static = express.static(__dirname + '/public');
const front = express.static(__dirname + '/static');

const cors = require('cors');
require('./db/db');

const port = 3000;

app.use('/', front);
app.use('/public', static);

app.use(express.json({ limit: '10mb' }));

app.use(cors());

app.use('/user', user);
app.use('/route', route);
app.use('/convertroute', convertRoute);

app.listen(port, () => {
  console.log(`Mroute api run on http://localhost:${port}`);
});
