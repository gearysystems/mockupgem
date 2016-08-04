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
const thumbnailsToGenerate = require('./config').thumbnailsToGenerate;

/*
screenCoordinates should be in this order:
top left, top right, bottom right, bottom left
*/
const mockupsS3BucketName = 'https://s3-us-west-2.amazonaws.com/mockup-gem-mockup-images';
const metadataFile = fs.readFileSync('./mockup_metadata.json')
const rawMockupMetadata = JSON.parse(metadataFile);
const mockupMetdataWithURLs = getMockupMetadataWithURLs(rawMockupMetadata);

module.exports = {
  // All mockup metadata keyed on mockup name
  rawMockupMetadata: rawMockupMetadata,
  // Mockup metdata keyed on mockup name, filtered to client-visible data
  mockupMetadataByName: mockupMetdataWithURLs,
  // Array of all mockup metadata, filtered to client-visible data
  mockupMetadata: getMockupMetadata(mockupMetdataWithURLs),
  /*
  Mockup metadata keyed on device-type (array of mockup metadata for each device),
  filtered to client-visible data.
  */
  mockupMetadataByDevice: getMockupMetadataByDevice(mockupMetdataWithURLs),
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
    mockupMetadata = rawMockupMetadata[mockupName]
    mockupMetadataWithURLs[mockupName] = {
      device: mockupMetadata.device,
      full_image_url: getFullsizeImageUrl(
        mockupName,
        mockupMetadata.file_extension,
        mockupsS3BucketName
      ),
    }
    thumbnailsToGenerate.forEach(function(thumbnailSize) {
      mockupThumbnailKey = `thumbnail_${thumbnailSize.width}_${thumbnailSize.height}_url`
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
    "device": "iphone6"
  },
  ...
]
*/
function getMockupMetadata(mockupMetdataWithURLs) {
  var mockupMetadata = [];

  for (var mockupName in mockupMetdataWithURLs) {
    mockupMetdata = copyObject(mockupMetdataWithURLs[mockupName]);
    mockupMetdata['mockup_name'] = mockupName;
    mockupMetadata.push(mockupMetdata);
  }

  return mockupMetadata;
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
      {"mockup_name": "some_mockup_name"}
    ],
    ...
  }
*/
function getMockupMetadataByDevice(mockupMetdataWithURLs) {
  var mockupMetadataByDevice = {};
  for (var mockupName in mockupMetdataWithURLs) {
    mockupMetadata = copyObject(mockupMetdataWithURLs[mockupName]);
    mockupDevice = mockupMetadata['device'];

    if (mockupMetadataByDevice[mockupDevice] === undefined) {
      mockupMetadataByDevice[mockupDevice] = [];
    }

    delete mockupMetdata['device'];
    mockupMetdata['mockup_name'] = mockupName;
    mockupMetadataByDevice[mockupDevice].push(mockupMetdata);
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
