'use strict'

const express = require('express');
const middleware = require('./lib/middleware');
const routes = require('./lib/routes');
const logger = require('./lib/logger');

// TODO: Set $NODE_ENV=production in ELB
// TODO: Add TLS
// TODO: Add password to admin page
const app = express()
middleware.setupMiddleware(app);
routes.setupRoutes(app);

const port = process.env.PORT || 3000
app.listen(port, function() {
 logger.log(`Started listening on port: ${port}`);
});
