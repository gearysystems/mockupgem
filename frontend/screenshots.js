const busboy = require('connect-busboy');
const AWS = require('aws-sdk');
const uuid = require('node-uuid');
const errors = require('./errors');
const logger = require('./logger');

const screenshotUploadBucket = 'mockup-gem-uploaded-screenshots'
// 4 MB
const maxFileSize = 4000000

const screenshotUploadMiddleware = busboy({
  immediate: true,
  limits: {
    files: 1,
    filesize: maxFileSize,
  }
});


function screenshotUploadHandler(req, res) {
  if (req.busboy === undefined) {
    return res.send(errors.invalidScreenshotUploadRequestError());
  }

  // Generate UUID
  screenshotUUID = uuid.v4();
  req.busboy.on('file', function(fieldName, fileStream, filename, encoding, mimetype) {
    // Stream to S3
    s3Object = new AWS.S3({
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
    })
  });
}

module.exports = {
  screenshotUploadMiddleware: screenshotUploadMiddleware,
  screenshotUploadHandler: screenshotUploadHandler,
}
