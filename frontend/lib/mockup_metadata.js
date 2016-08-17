'use strict'

/*
We're probably providing the metadata in too many forms here, but we'll stick with it
for now to see which form turns out to be most useful. In addition, it will be a little
annoying to keep all these functions in sync if we start changing the fields that
we return, might want to consider trying to abstract that away a little.


Also some of these transformations could be cleaned up with a dependency that added
functional utilities like lodash or something, but probably not worth bringing that
in at this point.
*/

const fs = require('fs');
const AWS = require('aws-sdk')
const config = require('./config');
const thumbnailsToGenerate = config.thumbnailsToGenerate;
const logger = require('./logger');
/*
screenCoordinates should be in this order:
top left, top right, bottom right, bottom left
*/
const mockupsS3BucketName = 'https://s3-us-west-2.amazonaws.com/mockup-gem-mockup-images';
var rawMockupMetadata = {};
const mockupMetadataWithURLs = getMockupMetadataWithURLs(rawMockupMetadata);

// TODO: Fix the hacky bullshit I introduced by making metadata stored in S3
module.exports = {
  // All mockup metadata keyed on mockup name
  getRawMockupMetadata: function() {return rawMockupMetadata;},
  // Mockup metdata keyed on mockup name, filtered to client-visible data
  getMockupMetadataByName: function() {return getMockupMetadataWithURLs(rawMockupMetadata);},
  // Array of all mockup metadata, filtered to client-visible data
  getMockupMetadata: function() {return getMockupMetadata(getMockupMetadataWithURLs(rawMockupMetadata));},
  /*
  Mockup metadata keyed on device-type (array of mockup metadata for each device),
  filtered to client-visible data.
  */
  getMockupMetadataByDevice: function() {return getMockupMetadataByDevice(getMockupMetadataWithURLs(rawMockupMetadata));},
  // So the admin view can force the server to refresh the metadata
  updateMockupMetadata: updateMockupMetadata,
}

/*
{
  "some_mockup_name": {
    "screen_coordinates": {
      "top_left": [100, 200],
      ...
    }
  },
  "device": "iphone6",
  "file_extension": "png"
},
...
TO
{
  "some_mockup_name": {
    "screen_coordinates": {
      "top_left": [100, 200],
      ...
    }
  },
  "device": "iphone6",
  "full_image_url": "...",
  "thumbnail_450_300_url": "...",
},
*/
function getMockupMetadataWithURLs(rawMockupMetadata){
  var mockupMetadataWithURLs = {};

  for (var mockupName in rawMockupMetadata) {
    const mockupMetadata = rawMockupMetadata[mockupName]
    mockupMetadataWithURLs[mockupName] = {
      device: mockupMetadata.device,
      full_image_url: getFullsizeImageUrl(
        mockupName,
        mockupMetadata.file_extension,
        mockupsS3BucketName
      ),
    }
    thumbnailsToGenerate.forEach(function(thumbnailSize) {
      const mockupThumbnailKey = `thumbnail_${thumbnailSize.width}_${thumbnailSize.height}_url`
      mockupMetadataWithURLs[mockupName][mockupThumbnailKey] = getThumbnailImageUrl(
        mockupName,
        mockupsS3BucketName,
        thumbnailSize.width,
        thumbnailSize.height
      )
    });
  }

  return mockupMetadataWithURLs;
}

/*
{
  "some_mockup_name": {
    "screen_coordinates": {
      "top_left": [100, 200],
      ...
    }
  },
  "device": "iphone6",
  "file_extension": "png"
},
...
TO
[
  {
    "mockup_name": "some_mockup_name",
    "device": "iphone6",
    "full_image_url": "...",
    "thumbnail_450_300_url": "...",
  },
  ...
]
*/
function getMockupMetadata(mockupMetadataWithURLs) {
  var mockupMetadataToReturn = [];

  for (var mockupName in mockupMetadataWithURLs) {
    var mockupMetadata = copyObject(mockupMetadataWithURLs[mockupName]);
    mockupMetadata['mockup_name'] = mockupName;
    mockupMetadataToReturn.push(mockupMetadata);
  }

  return mockupMetadataToReturn;
}

/*
  {
    "some_mockup_name": {
      "screen_coordinates": {
        "top_left": [100, 200],
        ...
      }
    },
    "device": "iphone6",
    "file_extension": "png"
  },
  ...
  TO
  {
    "iphone6": [
      {
        "mockup_name": "some_mockup_name",
        "device": "iphone6",
        "full_image_url": "...",
        "thumbnail_450_300_url": "...",
      }
    ],
    ...
  }
*/
function getMockupMetadataByDevice(mockupMetadataWithURLs) {
  var mockupMetadataByDevice = {};
  for (var mockupName in mockupMetadataWithURLs) {
    var mockupMetadata = copyObject(mockupMetadataWithURLs[mockupName]);
    var mockupDevice = mockupMetadata['device'];

    if (mockupMetadataByDevice[mockupDevice] === undefined) {
      mockupMetadataByDevice[mockupDevice] = [];
    }

    delete mockupMetadata['device'];
    mockupMetadata['mockup_name'] = mockupName;
    mockupMetadataByDevice[mockupDevice].push(mockupMetadata);
  }

  return mockupMetadataByDevice;
}

function getFullsizeImageUrl(mockupName, file_extension, s3BucketName) {
  return `${s3BucketName}/${mockupName}.png`;
}

function getThumbnailImageUrl(mockupName, s3BucketName, width, height) {
  // Thumbnails are always jpg to save bandwidth
  return `${s3BucketName}/${mockupName}-thumbnail-${width}_${height}.jpg`;
}

function copyObject(object) {
  return JSON.parse(JSON.stringify(object));
}

// TODO: This is really hacky right now, fix it later after we're done testing.
function updateMockupMetadata() {
  const getTemplatesMetadataS3 = new AWS.S3({
    params: {
      Bucket: config.templatesS3Bucket,
      Key: config.mockupMetdataS3Key,
      ResponseContentType: 'text',
    }
  });

  getTemplatesMetadataS3.getObject(function(err, data) {
    if (err) {
      return logger.log(err);

    }
    logger.log("Updated metadata!");
    rawMockupMetadata = JSON.parse(data.Body.toString());
    return;
  });
}

updateMockupMetadata();
/*
setInterval is in milliseconds so multiply minutes * 60 to get seconds and then
multiply that by 1000 to get miliseconds.
*/
setInterval(updateMockupMetadata, config.templateMetadataRefreshIntervalInMinutes * 60 * 1000);
