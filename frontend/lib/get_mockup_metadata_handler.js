'use strict'

const mockupMetadata = require('./mockup_metadata.js');

function getMockupMetadataHandler(req, res) {
  return res.send(mockupMetadata.getMockupMetadata());
}

function getMockupMetadataByNameHandler(req, res) {
  return res.send(mockupMetadata.getMockupMetadataByName());
}

function getMockupMetadataByDeviceHandler(req, res) {
  return res.send(mockupMetadata.getMockupMetadataByDevice());
}

module.exports = {
  getMockupMetadataHandler: getMockupMetadataHandler,
  getMockupMetadataByNameHandler: getMockupMetadataByNameHandler,
  getMockupMetadataByDeviceHandler: getMockupMetadataByDeviceHandler,
}
