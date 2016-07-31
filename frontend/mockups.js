const AWS = require('aws-sdk');
const errors = require('./errors');
const logger = require('./logger');
const templatesMetadata = require('./mockup_metadata').rawMockupMetadata;

function createMockupsHandler(req, res) {
  const screenshotUUID = req.params.screenshotUUID;
  const templates = req.body.templates;
  // TODO: Add test cases for this
  if (screenshotUUID.length !== 36 || !Array.isArray(templates)) {
    return res.send(errors.invalidCreateMockupsRequestError());
  }
  // TODO: Add test case for this
  const containsInvalidTemplate = templates.reduce(function(containsInvalidTemplate, templateName) {
    if (containsInvalidTemplate === true) {
      return true;
    }

    return templatesMetadata[templateName] === undefined;
  }, false);

  if (containsInvalidTemplate === true) {
    return res.send(errors.invalidCreateMockupsRequestError());
  }

  // TODO: Remove
  return res.send("ok");
}

module.exports = {
  createMockupsHandler: createMockupsHandler,
}
