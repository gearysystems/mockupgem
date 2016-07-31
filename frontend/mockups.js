const AWS = require('aws-sdk');
const errors = require('./errors');
const logger = require('./logger');
const templatesMetadata = require('./mockup_metadata').rawMockupMetadata;

function createMockupsHandler(req, res) {
  const screenshotUUID = req.params.screenshotUUID;
  const templates = req.body.templates;

  const inputIsValid = isInputValid(screenshotUUID, templates);
  if (inputIsValid === false) {
    return res.send(errors.invalidCreateMockupsRequestError());
  }

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

  return true;
}

module.exports = {
  createMockupsHandler: createMockupsHandler,
}
