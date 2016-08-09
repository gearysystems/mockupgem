'use strict'

const path = require('path');
const busboy = require('connect-busboy');
const errors = require('./errors.js');
const uuid = require('node-uuid');
const AWS = require('aws-sdk');
const logger = require('./logger');

/*
  TODO: Cleanup this endpoint. Its kind of messy, but its an admin endpoint
  so I'm not too worried about it.
*/

// Bucket we store new templates in that still need to be processed
const addTemplateS3Bucket = 'mockup-gem-admin-added-templates';
// Bucket that contains processed templates + the metadata file
const templatesS3Bucket = 'mockup-gem-test';
// Key for mockup metdata file in S3
const mockupMetdataS3Key = 'mockup_metadata.json';
// 4 MB
const maxFileSize = 4000000

const thumbnailSizesToGenerate = [
    {thumbnail_width: 1200, thumbnail_height: 1200},
    {thumbnail_width: 800, thumbnail_height: 800},
    {thumbnail_width: 600, thumbnail_height: 600},
    {thumbnail_width: 400, thumbnail_height: 400}
]

const addTemplateUploadMiddleware = busboy({
  immediate: true,
  limits: {
    files: 1,
    filesize: maxFileSize,
  }
});

// TODO: Cleanup the callback hell by breaking out into separate functions
function getAdminTemplates(req, res) {
  return res.sendFile(path.join(__dirname, './public/admin/templates', 'index.html'));
}

function  postAdminTemplates(req, res) {
  if (req.busboy === undefined) {
    return res.send(errors.invalidAdminAddTemplateError());
  }
  var templateName = null;
  var templateDevice = null;
  var topLeft = null;
  var topRight = null;
  var bottomRight = null;
  var bottomLeft = null;

  req.busboy.on('field', function(key, value, keyTruncated, valueTruncated) {
    switch (key) {
      case 'template_name':
        templateName = value;
        break;
      case 'device_name':
        templateDevice = value;
        break;
      case 'top_left':
        topLeft = parseFloat(value);
        break;
      case 'top_right':
        topRight = parseFloat(value);
        break;
      case 'bottom_right':
        bottomRight = parseFloat(value);
        break;
      case 'bottom_left':
        bottomLeft = parseFloat(value);
        break;
      default:
        break;
    }
  });

  /*
  Note this endpoint only works if the image is the last field in the form.
  This is fine since its just a simple admin page and we control in which
  order the fields come from the client side.
  */
  req.busboy.on('file', function(fieldName, fileStream, filename, encoding, mimetype) {
    const newTemplateUUID = uuid.v4();
    // Upload image to S3
    const uploadNewTemplateS3 = new AWS.S3({
      params: {
        Bucket: addTemplateS3Bucket,
        Key: newTemplateUUID,
      }
    });

    uploadNewTemplateS3.upload({Body: fileStream}, function(err, data) {
      if (err) {
        logger.log(err);
        return res.send(errors.uploadFailedError());
      }
      logger.log(data);

      // Invoke lambda function to process images
      invokeProcessTemplatesLambda(
        newTemplateUUID,
        templateName,
        thumbnailSizesToGenerate,
        function(error) {
          if (error) {
            return res.send(error);
          }
          return updateMockupMetadata(
            templateName,
            templateDevice,
            topLeft,
            topRight,
            bottomRight,
            bottomLeft,
            function(responseToReturn) {res.send(responseToReturn)}
          )
        }
      );
    });
  });
}

function invokeProcessTemplatesLambda(
  templateUUID,
  templateName,
  thumbnailSizesToGenerate,
  callback
) {
  const lambda = new AWS.Lambda();
  const processNewTemplateParams = {
    FunctionName: 'processNewTemplate',
    // Make invocation asynchronous
    InvocationType: 'Event',
    // Data to pass to lambda function. Must be a JSON string
    Payload: JSON.stringify({
      template_uuid: templateUUID,
      final_template_name: templateName,
      thumbnail_sizes_to_generate: thumbnailSizesToGenerate,
      thumbnail_file_format: 'jpg',
      fullsize_template_format: 'png',
      thumbnail_quality: 80,
      // These are both constants at the top of the file
      unprocessed_templates_s3_bucket: addTemplateS3Bucket,
      processed_templates_s3_bucket: templatesS3Bucket,
    }),
  };
  const processNewTemplateCallback = function(error, data) {
    if (error) {
     logger.log(error);
     callback(errors.adminAddtemplateLambdaError());
    }
    logger.log(data);
    // Invoking with no parameter means there were no errors
    callback();
  };
  lambda.invoke(processNewTemplateParams, processNewTemplateCallback);
}

function updateMockupMetadata(
  templateName,
  templateDevice,
  topLeft,
  topRight,
  bottomRight,
  bottomLeft,
  callback
) {
  // Load existing metadata
  const getTemplatesMetadataS3 = new AWS.S3({
    params: {
      Bucket: templatesS3Bucket,
      Key: mockupMetdataS3Key,
      ResponseContentType: 'text',
    }
  });

  getTemplatesMetadataS3.getObject(function(err, data) {
    if (err) {
      logger.log(err);
      return callback(errors.adminAddTemplateMetadataError());
    }
    logger.log(data);

    // Modify metadata
    var templateMetadata = JSON.parse(data.Body.toString());
    logger.log(templateMetadata);

    templateMetadata[templateName] = {
      screenCoordinates: {
        topLeft: topLeft,
        topRight: topRight,
        bottomRight: bottomRight,
        bottomLeft: bottomLeft,
      },
      device: templateDevice,
    }

    logger.log(templateMetadata);

    // Write metadata back to S3
    return uploadMetadataBackToS3(templateMetadata, callback)
  });
}

function uploadMetadataBackToS3(newMetadata, callback) {
  const uploadMetadataS3 = new AWS.S3({
    params: {
      Bucket: templatesS3Bucket,
      Key: mockupMetdataS3Key,
    }
  });

  uploadMetadataS3.upload({Body: JSON.stringify(newMetadata)}, function(err, data) {
    if (err) {
      logger.log(err);
      return callback(errors.adminAddTemplateMetadataError());
    }
    logger.log(data);
    return callback(';)');
  });

}

module.exports = {
  addTemplateUploadMiddleware: addTemplateUploadMiddleware,
  getAdminTemplates: getAdminTemplates,
  postAdminTemplates: postAdminTemplates,
}
