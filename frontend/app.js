'use strict'

const express = require('express');
const imageUpload = require('./image_upload');
const bodyParser = require('body-parser');
const logger = require('./logger');
const mockupMetadataHandlers = require('./get_mockup_metadata_handler');
const allowCORSMiddleware = require('./cors').allowCORSMiddleware;
const thumbs = require('./public/thumbs');


const app = express()
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json())
app.use(allowCORSMiddleware);

app.get('/', function(req, res) {
  res.send(thumbs.renderIndex([
    {url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Wiktionary_small.svg/350px-Wiktionary_small.svg.png', device: 'iphone6'},
    {url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Wiktionary_small.svg/350px-Wiktionary_small.svg.png', device: 'iphone5'},
    {url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Wiktionary_small.svg/350px-Wiktionary_small.svg.png', device: 'iphone5'},
    {url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Wiktionary_small.svg/350px-Wiktionary_small.svg.png', device: 'iphone4'},
    {url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Wiktionary_small.svg/350px-Wiktionary_small.svg.png', device: 'iphone4'}
  ], ['iphone6','iphone5','iphone4']));
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
