const busboy = require('connect-busboy');
const AWS = require('aws-sdk')
const uuid = require('node-uuid');
const errors = require('./errors');
const logger = require('./logger');

const uploadBucket = 'mockup-gem-uploaded-screenshots'
// 4 MB
const maxFileSize = 4000000

const screenshotUploadMiddleware = busboy({
  immediate: true,
  limits: {
    files: 1,
    filesize: maxFileSize,
  }
});


// function screenshotUploadHandler(req, res) {
// }
