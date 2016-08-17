'use strict'

const bodyParser = require('body-parser');

function setupMiddleware(app) {
  app.use(bodyParser.urlencoded({extended: true}));
  app.use(bodyParser.json())
  app.use(allowCORSMiddleware);
}

function allowCORSMiddleware(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
}

module.exports = {
  setupMiddleware: setupMiddleware,
  allowCORSMiddleware: allowCORSMiddleware,
}
