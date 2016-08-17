'use strict'

const busboy = require('connect-busboy');
const AWS = require('aws-sdk');
const uuid = require('node-uuid');
const errors = require('./errors');
const logger = require('./logger');
const config = require('./config');

const screenshotUploadBucket = config.screenshotUploadBucket;
const uploadScreenshotsS3URLPrefix = config.uploadScreenshotsS3URLPrefix;
const maxFileSize = config.maxFileSize;

const screenshotUploadMiddleware = busboy({
  immediate: true,
  limits: {
    files: 1,
    filesize: maxFileSize,
  }
});

function screenshotUploadHandler(req, res) {
  if (req.busboy === undefined) {
    return res.status(400).send(errors.invalidScreenshotUploadRequestError());
  }

  // Generate UUID
  const screenshotUUID = uuid.v4();
  req.busboy.on('file', function(fieldName, fileStream, filename, encoding, mimetype) {
    // Stream to S3
    const s3Object = new AWS.S3({
      params: {
        Bucket: screenshotUploadBucket,
        Key: screenshotUUID,
      }
    });

    s3Object.upload({Body: fileStream}, function(err, data) {
      if (err) {
        logger.log(err);
      }
      logger.log(data);
    });
  });

  req.busboy.on('finish', function() {
    res.send({
      'screenshot_uuid': screenshotUUID,
      'screenshot_url': `${uploadScreenshotsS3URLPrefix}/${screenshotUUID}`
    })
  });
}

module.exports = {
  screenshotUploadMiddleware: screenshotUploadMiddleware,
  screenshotUploadHandler: screenshotUploadHandler,
}
