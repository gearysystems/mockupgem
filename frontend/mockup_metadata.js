/*
We're probably providing the metadata in too many forms here, but we'll stick with it
for now to see which form turns out to be most useful. In addition, it will be a little
annoying to keep all these functions in sync if we start changing the fields that
we return, might want to consider trying to abstract that away a little.


Also some of these transformations could be cleaned up with a dependency that added
functional utilities like lodash or something, but probably not worth bringing that
in at this point.
*/

fs = require('fs');
/*
screenCoordinates should be in this order:
top left, top right, bottom right, bottom left
*/
const metadataFile = fs.readFileSync('./mockup_metadata.json')
const rawMockupMetadata = JSON.parse(metadataFile);

module.exports = {
  // All mockup metadata keyed on mockup name
  rawMockupMetadata: rawMockupMetadata,
  // Mockup metdata keyed on mockup name, filtered to client-visible data
  mockupMetadataByName: getMockupMetadataByName(rawMockupMetadata),
  // Array of all mockup metadata, filtered to client-visible data
  mockupMetadata: getMockupMetadata(rawMockupMetadata),
  /*
  Mockup metadata keyed on device-type (array of mockup metadata for each device),
  filtered to client-visible data.
  */
  mockupMetadataByDevice: getMockupMetadataByDevice(rawMockupMetadata),
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
function getMockupMetadata(rawMockupMetadata) {
  var mockupMetadata = [];

  for (var mockupName in rawMockupMetadata) {
    mockupMetadata.push({
      'name': mockupName,
      'device': rawMockupMetadata[mockupName]['device'],
    });
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
  "some_mockup_name": {
  },
  "device": "iphone6"
},
*/
function getMockupMetadataByName(rawMockupMetadata) {
  var mockupMetdataByName = {};

  for (var mockupName in rawMockupMetadata) {
    mockupMetdataByName[mockupName] = {
        'device': rawMockupMetadata[mockupName]['device'],
    }
  }

  return mockupMetdataByName;
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
function getMockupMetadataByDevice(rawMockupMetadata) {
  var mockupMetadataByDevice = {};
  for (const mockupName in rawMockupMetadata) {
    mockupMetadata = rawMockupMetadata[mockupName];
    mockupDevice = mockupMetadata['device'];
    if (mockupMetadataByDevice[mockupDevice] === undefined) {
      mockupMetadataByDevice[mockupDevice] = [];
    }

    mockupMetadataByDevice[mockupDevice].push({
      'mockup_name': mockupName,
    })
  }

  return mockupMetadataByDevice;
}
