'use strict'

const express = require('express');
const imageUpload = require('./image_upload');
const bodyParser = require('body-parser');
const logger = require('./logger');
const mockupMetadataHandlers = require('./get_mockup_metadata_handler');
const allowCORSMiddleware = require('./cors').allowCORSMiddleware;
const thumbs = require('./public/thumbs');
const mockupMetadata = require('./mockup_metadata.js');
const screenshots = require('./screenshots.js');
const mockups = require('./mockups.js');
const adminHandlers = require('./admin.js');

// TODO: Set $NODE_ENV=production in ELB
// TODO: Add TLS
// TODO: Add password to admin page

const app = express()
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json())
app.use(allowCORSMiddleware);

// Admin endpoints for adding new templates
app.get('/admin/templates', adminHandlers.getAdminTemplates);
app.post('/admin/templates', adminHandlers.addTemplateUploadMiddleware, adminHandlers.postAdminTemplates);

// Single-endpoint mockup generation
app.post('/api/v1/upload', imageUpload.imageUploadMiddleware, imageUpload.imageUploadHandler);

// Screenshots/mockups
app.post('/api/v1/screenshots', screenshots.screenshotUploadMiddleware, screenshots.screenshotUploadHandler);
app.post('/api/v1/screenshots/:screenshotUUID/mockups', mockups.createMockupsHandler);

// Template metadata
app.get('/api/v1/templates', mockupMetadataHandlers.getMockupMetadataHandler);
app.get('/api/v1/templates-by-name', mockupMetadataHandlers.getMockupMetadataByNameHandler);
app.get('/api/v1/templates-by-device', mockupMetadataHandlers.getMockupMetadataByDeviceHandler);

const port = process.env.PORT || 3000
app.listen(port, function() {
 logger.log(`Started listening on port: ${port}`);
});
