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

function createMockupsHandler(req, res) {
  const screenshotUUID = req.params.screenshotUUID;
  const templates = req.body.templates;

  // TODO: Limit number of templates a user can submit
  const inputIsValid = isInputValid(screenshotUUID, templates);
  if (inputIsValid === false) {
    return res.send(errors.invalidCreateMockupsRequestError());
  }

  generateMockups(screenshotUUID, templates);
  // TODO: Remove
  return res.send("ok");
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

  generateMockups(screenshotUUID, templates, function(err, data) {
    if (err) {
      return res.send(errors.createMockupsError());
    }

    // TODO: Genereate real response
    return res.send("It worked!");
  });

}

function generateMockups(screenshotUUID, templates, callback) {
  // TODO: Fill me in
  const lambda = new AWS.lambda();
  const createMockupParams = {
    // TODO: Put lambda function name here
    FunctionName: 'generateMockups',
    // Make invocation asynchronous
    InvocationType: 'event',
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
    if (err) {
     logger.log(err);
    }
    logger.log(data);
    callback(err, data);
  };
  lambda.invoke(createMockupParams, genereateMockupsCallback);
}

module.exports = {
  createMockupsHandler: createMockupsHandler,
}
