const serverless = require('serverless-http');
const dotenv = require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const setupMock = require('./mock-server');
const db = require('./models');
const jwtAuth = require('./middlewares/auth');

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(jwtAuth(db).unless({ path: /api\/v1\/login/ }));

setupMock();

require('./api/project')(app, db);
require('./api/class')(app, db);
require('./api/image')(app, db);
require('./api/auth')(app, db);

const port = process.env.PORT || 7777;

app.listen(port, () => console.log(`App listening on port ${port}`));

module.exports.app = app;

module.exports.handler = serverless(app, {
  request: function(request, event, context) {
    context.callbackWaitsForEmptyEventLoop = false;
    request.context = event.requestContext;
  }
});
