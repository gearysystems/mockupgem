const mockupMetadata = require('./mockup_metadata.js');

function getMockupMetadataHandler(req, res) {
  return res.send(mockupMetadata.mockupMetadata);
}

function getMockupMetadataByNameHandler(req, res) {
  return res.send(mockupMetadata.mockupMetadataByName);
}

function getMockupMetadataByDeviceHandler(req, res) {
  return res.send(mockupMetadata.mockupMetadataByDevice);
}

module.exports = {
  getMockupMetadataHandler: getMockupMetadataHandler,
  getMockupMetadataByNameHandler: getMockupMetadataByNameHandler,
  getMockupMetadataByDeviceHandler: getMockupMetadataByDeviceHandler,
}
