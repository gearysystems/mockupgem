'use strict'

const express = require('express');
const imageUpload = require('./image_upload');
const bodyParser = require('body-parser');
const logger = require('./logger');
const mockupMetadataHandlers = require('./get_mockup_metadata_handler');
const allowCORSMiddleware = require('./cors').allowCORSMiddleware;
const thumbs = require('./public/thumbs');
const mockupMetadata = require('./mockup_metadata.js');


const app = express()
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json())
app.use(allowCORSMiddleware);

app.get('/', function(req, res) {
  res.send(thumbs.renderIndex(mockupMetadata.mockupMetadataByDevice));
});


// API endpoints
app.post('/api/upload', imageUpload.imageUploadMiddleware, imageUpload.imageUploadHandler);
app.get('/api/mockup-metadata', mockupMetadataHandlers.getMockupMetadataHandler);
app.get('/api/mockup-metadata-by-name', mockupMetadataHandlers.getMockupMetadataByNameHandler);
app.get('/api/mockup-metadata-by-device', mockupMetadataHandlers.getMockupMetadataByDeviceHandler);

const port = process.env.PORT || 3000
app.listen(port, function() {
 logger.log(`Started listening on port: ${port}`);
});
