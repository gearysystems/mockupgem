'use strict'

const AWS = require('aws-sdk');
const errors = require('./errors');
const logger = require('./logger');
const getTemplatesMetadata = require('./mockup_metadata').getRawMockupMetadata;
const config = require('./config');

const thumbnailsToGenerate = config.thumbnailsToGenerate;

const processedMockupsS3URLPrefix = config.processedMockupsS3URLPrefix;

AWS.config.update({region: config.AWSRegion});

function createMockupsHandler(req, res) {
  const templatesMetadata = getTemplatesMetadata();
  const screenshotUUID = req.params.screenshotUUID;
  const templates = req.body.templates;

  const inputIsValid = isInputValid(screenshotUUID, templates, templatesMetadata);
  if (inputIsValid === false) {
    return res.status(400).send(errors.invalidCreateMockupsRequestError());
  }

  generateMockups(screenshotUUID, templates, templatesMetadata, function(err, data) {
    if (err) {
      return res.status(500).send(errors.createMockupsError());
    }

    return res.send(generateSuccesfulResponse(screenshotUUID, templates, thumbnailsToGenerate))
  });
}

function isInputValid(screenshotUUID, templates, templatesMetadata) {
  if (
      !screenshotUUID ||
      screenshotUUID.length !== 36 ||
      !Array.isArray(templates) ||
      templates.length === 0
  ) {
    console.log(screenshotUUID)
    console.log(templates)
    return false;
  }

  const containsInvalidTemplate = templates.reduce(function(containsInvalidTemplate, templateName) {
    if (containsInvalidTemplate === true) {
      return true;
    }

    return templatesMetadata[templateName] === undefined;
  }, false);

  if (containsInvalidTemplate === true) {
    return false;
  }
}

function generateMockups(screenshotUUID, templates, templatesMetadata, callback) {
  const lambda = new AWS.Lambda();
  const createMockupParams = {
    FunctionName: 'generateMockups',
    // Make invocation asynchronous
    InvocationType: 'Event',
    // Data to pass to lambda function. Must be a JSON string
    Payload: JSON.stringify({
      screenshot_uuid: screenshotUUID,
      thumbnails_to_generate: thumbnailsToGenerate,
      templates: templates.map(function(template) {
        const templateScreenCoordinates = templatesMetadata[template].screenCoordinates;
        return {
          template_name: template,
          screen_coordinates: {
            top_left: templateScreenCoordinates.topLeft,
            top_right: templateScreenCoordinates.topRight,
            bottom_right: templateScreenCoordinates.bottomRight,
            bottom_left: templateScreenCoordinates.bottomLeft
          }
        }
      })
    }),
  };
  const genereateMockupsCallback = function(error, data) {
    if (error) {
     logger.log(error);
    }
    logger.log(data);
    callback(error, data);
  };
  lambda.invoke(createMockupParams, genereateMockupsCallback);
}

function generateSuccesfulResponse(screenshotUUID, templates, generatedThumbnails) {
  var response = {};
  templates.forEach(function(template) {
    var thumbnails = {};
    generatedThumbnails.forEach(function(thumbnail) {
      thumbnails[`${thumbnail.width}x${thumbnail.height}`] = {
        url: `${processedMockupsS3URLPrefix}/${screenshotUUID}_${template}_thumbnail_${thumbnail.width}_${thumbnail.height}.jpg`,
        width: thumbnail.width,
        height: thumbnail.height,
      }
    })
    response[template] = {
      fullsize: {
        url: `${processedMockupsS3URLPrefix}/${screenshotUUID}_${template}.png`,
        width: 1200,
        height: 800,
      },
      thumbnails: thumbnails,
    }
  });

  return JSON.stringify(response);
}

module.exports = {
  createMockupsHandler: createMockupsHandler,
}
