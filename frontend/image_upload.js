const busboy = require('connect-busboy');
const AWS = require('aws-sdk')
const uuid = require('node-uuid');
const errors = require('./errors');
const getMockupMetadata = require('./mockup_metadata').getRawMockupMetadata;
const logger = require('./logger');

const uploadBucket = 'mockup-gem-uploaded-images'
// 4 MB
const maxFileSize = 4000000
const imageDownloadURLPrefix = 'https://s3-us-west-2.amazonaws.com/mockup-gem-processed-images'

const imageUploadMiddleware = busboy({
 immediate: true,
 limits: {
  files: 1,
  fileSize: maxFileSize,
 }
});

function imageUploadHandler(req, res) {
  const mockupMetadata = getMockupMetadata();
  const uploadData = req.query;
  const mockupName = uploadData.mockup_name;
  const mockupNames = uploadData.mockup_names;

  // No mockup names provided
  if (mockupName === undefined && uploadData.mockup_names === undefined) {
    return res.send(errors.invalidUploadRequestError());
  }

  // Invalid mockup
  if (mockupName !== undefined && mockupMetadata[mockupName] === undefined) {
    return res.send(errors.invalidMockupNameError());
  }

  // Invalid mockup names
  if (mockupNames !== undefined && !Array.isArray(mockupNames)) {
    return res.send(errors.invalidMockupNameError());
  }

  // If multiple mockup names provided, check if any of them are invalid
  if (mockupNames !== undefined) {
    const invalidMockupFound = mockupNames.reduce(function(invalidMockup, mockupName) {
      if (invalidMockup === true) {
        return true;
      }

      return mockupMetadata[mockupName] === undefined;
    }, false);

    if (invalidMockupFound === true) {
      return res.send(errors.invalidMockupNameError());
    }
  }

  // No more than 10 mockups allowed at a time
  if (mockupNames !== undefined && mockupNames.length > 10) {
    return res.send(errors.tooManyMockupsError());
  }

  if (req.busboy === undefined) {
    return res.send(errors.invalidUploadRequestError());
  }

  const imageUUID = uuid.v4();

  var fileFound = false;
  req.busboy.on('file', function(fieldName, file, filename, encoding, mimetype) {
    fileFound = true;
    if (mockupNames !== undefined) {
      const multiMockupS3ImageKey = getMultiMockupS3ImageKey(mockupNames, imageUUID, mockupMetadata)
      // S3 only allows filenames up to 1024 bytes, but should be fine for now.
      if (multiMockupS3ImageKey.length > 1024) {
        return res.send(errors.tooManyMockupsError());
      }
      return streamToS3(multiMockupS3ImageKey, file, mockupNames);
    }
    // Handle single mockup case
    else {
      const singleMockupS3ImageKey = getSingleMockupS3ImageKey(mockupName, imageUUID, mockupMetadata);
      return streamToS3(singleMockupS3ImageKey, file, mockupName);
    }
  });

  req.busboy.on('finish', function() {
    if (fileFound === false) {
      return res.send(errors.invalidUploadRequestError());
    }

    if (mockupNames !== undefined) {
      var downloadUrlsResponse = {};
      mockupNames.forEach(function(mockupName) {
        const mockupExtension = mockupMetadata[mockupName].file_extension;
        downloadUrlsResponse[mockupName] = {
          full_image_download_url: getDownloadImageURL(mockupName, imageUUID, mockupExtension),
        };
      });
      return res.send(downloadUrlsResponse);
    }

    const mockupExtension = mockupMetadata[mockupName].file_extension;
    return res.send({
     download_url: getDownloadImageURL(mockupName, imageUUID, mockupExtension),
    });
  });
}

function streamToS3(s3ImageKey, fileStream, mockupNames) {
 var s3obj = new AWS.S3({
  params: {
   Bucket: uploadBucket,
   Key: s3ImageKey,
  }
 });

 // Connect the file stream directly to S3 SDK so upload is streamed instead
 // of being batched in memory.
 s3obj.upload({Body: fileStream}, function(err, data) {
  if (err) {
   logger.log(err);
  }
  logger.log(data);
 });
}

function getSingleMockupS3ImageKey(mockupName, imageUUID, mockupMetadata) {
 // If we reach this point, we've already determined we have the metadata
 const specificMockupMetadata = mockupMetadata[mockupName];
 const screenCoordinates = specificMockupMetadata['screenCoordinates'];
 const screenCoordinatesFilename = getScreenCoordinatesForFilename(screenCoordinates);
 return `${imageUUID}*${mockupName}*${screenCoordinatesFilename}`;
}

function getMultiMockupS3ImageKey(mockupNames, imageUUID, mockupMetadata) {
  screenCoordinatesForAllImages = mockupNames.map(function(mockupName) {
    const specificMockupMetadata = mockupMetadata[mockupName];
    const screenCoordinates = specificMockupMetadata['screenCoordinates'];
    return `${mockupName}*${getScreenCoordinatesForFilename(screenCoordinates)}`;
  });
  screenCoordinatesForAllImagesConcatenated = screenCoordinatesForAllImages.join('*');
  return `${imageUUID}*${screenCoordinatesForAllImagesConcatenated}`
}

/*
 {
  topLeft: [100, 200],
  topRight: [200, 300],
  bottomRight: [300, 400],
  bottomLeft: [400, 500],
 }
 TO
 100_200-200_300-300_400-400_500
*/
function getScreenCoordinatesForFilename(screenCoordinates) {
 topLeft = `${screenCoordinates['topLeft'][0]}_${screenCoordinates['topLeft'][1]}`
 topRight = `${screenCoordinates['topRight'][0]}_${screenCoordinates['topRight'][1]}`
 bottomRight = `${screenCoordinates['bottomRight'][0]}_${screenCoordinates['bottomRight'][1]}`
 bottomLeft = `${screenCoordinates['bottomLeft'][0]}_${screenCoordinates['bottomLeft'][1]}`
 return `${topLeft}.${topRight}.${bottomRight}.${bottomLeft}`
}

// TODO: Actually prefix it with the bucket name
/*
 Returns a url in the same format that the lambda function will name the
 overlayed image after processing it and storing it in S3. It also prefixes the
 S3 bucket name so once the image is processed the URL will immediately start
 working to download the image (or embed it in a script tag or whatever.)
*/
function getDownloadImageURL(mockupName, imageUUID, mockupExtension) {
 return `${imageDownloadURLPrefix}/${imageUUID}_${mockupName}.${mockupExtension}`
}

module.exports = {
 imageUploadMiddleware: imageUploadMiddleware,
 imageUploadHandler: imageUploadHandler
}
