const AWS = require('aws-sdk');
const errors = require('./errors');
const logger = require('./logger');
const templatesMetadata = require('./mockup_metadata').rawMockupMetadata;

const thumbnailsToGenerate = [
  {
    width: 450,
    height: 300
  }
]

const processedMockupsS3URLPrefix = 'https://s3-us-west-2.amazonaws.com/mockup-gem-processed-mockups'

AWS.config.update({region: 'us-west-2'});

function createMockupsHandler(req, res) {
  const screenshotUUID = req.params.screenshotUUID;
  const templates = req.body.templates;

  // TODO: Limit number of templates a user can submit
  const inputIsValid = isInputValid(screenshotUUID, templates);
  if (inputIsValid === false) {
    return res.send(errors.invalidCreateMockupsRequestError());
  }

  generateMockups(screenshotUUID, templates, function(err, data) {
    if (err) {
      return res.send(errors.createMockupsError());
    }

    return res.send(generateSuccesfulResponse(screenshotUUID, templates, thumbnailsToGenerate))
  });
}

function isInputValid(screenshotUUID, templates) {
  if (screenshotUUID.length !== 36 || !Array.isArray(templates)) {
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

function generateMockups(screenshotUUID, templates, callback) {
  // TODO: Fill me in
  const lambda = new AWS.Lambda();
  const createMockupParams = {
    // TODO: Put lambda function name here
    FunctionName: 'generateMockups',
    // Make invocation asynchronous
    InvocationType: 'Event',
    // Data to pass to lambda function. Must be a JSON string
    // TODO: Make a function
    Payload: JSON.stringify({
      screenshot_uuid: screenshotUUID,
      thumbnails_to_generate: thumbnailsToGenerate,
      templates: templates.map(function(template) {
        templateScreenCoordinates = templatesMetadata[template].screenCoordinates;
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
