const busboy = require('connect-busboy');
const AWS = require('aws-sdk')
const uuid = require('node-uuid');
const errors = require('./errors');
const streamBuffers = require('stream-buffers');
const mockupMetadata = require('./mockup_metadata.js');

const uploadBucket = 'mockup-gem-uploaded-images'
// 4 MB
const maxFileSize = 4000000

const imageUploadMiddleware = busboy({
 immediate: true,
 limits: {
  files: 1,
  fileSize: maxFileSize
 }
});

/* I'm gonna apologize in advance for this code. If it seems overly complicated,
   keep in mind that it achieves these goals:
    1) Validate all form fields are present before allowing the image to be uploaded.
    2) Stream the file upload directly to S3 (we don't have to buffer in memory any
       more than the normal amount of buffering that streams do.)
   Accomplishing both these goals while working with raw streams required some
   surprisingly complex code.
*/
function imageUploadHandler(req, res) {
 var overlayImageFound = false;
 var mockupNameFound = false;
 var mockupNameIsValid = false;
 var mockupName;

 const imageUUID = uuid.v4();
 var s3ImageKey;

 /* If we make it to the end of the stream and don't have all the required fields
    then we reject the request.
 */
 req.busboy.on('finish', handleEndOfRequest);
 function handleEndOfRequest() {
  if (overlayImageFound === false || mockupNameFound === false) {
   return res.send(errors.invalidUploadRequestError());
  }

  if (mockupNameIsValid === false) {
   return res.send(errors.invalidMockupNameError());
  }

  mockupExtension = mockupMetadata[mockupName]['file_extension']
  return res.send({
   download_url: getDownloadImageURL(mockupName, imageUUID, mockupExtension),
  });
 }

 /* This promise won't resolve until all required fields have been validated at
    which point we can unpause the file upload stream and allow them to continue
    uploading. If the fields are invalid, it will reject and the file upload
    will be canceled.
 */
 const awaitMockupName = new Promise(waitForMockupName);
 function waitForMockupName(resolve, reject) {
  req.busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
   if (fieldname === 'mockup_name') {
    mockupNameFound = true;

    if (mockupMetadata[val] === undefined) {
     return reject('invalid_mockup_name')
    }

    mockupNameIsValid = true
    mockupName = val;
    // Generate the name we will use for the image in S3
    s3ImageKey = getS3ImageKey(mockupName, imageUUID);
    return resolve(val);
   } else {
    return reject('invalid_request');
   }
  });
 }

 /* This function will handle file upload events. Internally, it creates a new
    stream that buffers the file upload until we've resolved that all the
    required fields are present. Once that is determined, it will begin streaming
    the file upload to S3.
 */
 req.busboy.on('file', handleImageUpload);
 function handleImageUpload(fieldName, file, filename, encoding, mimetype) {
  if (fieldName !== 'overlay_image') {
   return res.send(errors.invalidUploadFieldError());
  }

  overlayImageFound = true;

  var imageUploadBuffer = new streamBuffers.ReadableStreamBuffer();
  imageUploadBuffer.pause();
  // Pipe the file upload stream into our buffer
  file.on('data', function(data) {
   imageUploadBuffer.put(data);
  });

  /* Once we have finished streaming the file, stop the buffer or the AWS SDK
     will keep waiting for more data to upload to S3.
  */
  file.on('end', function() {
   imageUploadBuffer.stop();
  });

  /* Wait for all the required fields before unpausing the stream and sending
     it to S3.
  */
  awaitMockupName
   .then(streamToS3)
   .catch(function(exception) {
    console.log(exception);
    return false;
   });

  function streamToS3(mockup_name) {
   // Resume the buffer since we've validated all the fields and want the data
   imageUploadBuffer.resume();
   var s3obj = new AWS.S3({
    params: {
     Bucket: uploadBucket,
     /* This will already be set because we waited for the awaitMockupName
        promise to resolve.
     */
     Key: s3ImageKey,
    }
   });

   // Connect the file stream directly to S3 SDK so upload is streamed instead
   // of being batched in memory.
   s3obj.upload({Body: imageUploadBuffer}, function(err, data) {
    if (err) {
     return res.send(errors.uploadFailedError());
    }
    console.log(data);
   });
  }
 }
}

function getS3ImageKey(mockupName, imageUUID) {
 // If we reach this point, we've already determined we have the metadata
 const specificMockupMetadata = mockupMetadata[mockupName];
 const screenCoordinates = specificMockupMetadata['screenCoordinates']
 const screenCoordinatesFilename = getScreenCoordinatesForFilename(screenCoordinates)
 return `${imageUUID}*${mockupName}*${screenCoordinatesFilename}`;
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
 return `${topLeft}*${topRight}*${bottomRight}*${bottomLeft}`
}

// TODO: Actually prefix it with the bucket name
/*
 Returns a url in the same format that the lambda function will name the
 overlayed image after processing it and storing it in S3. It also prefixes the
 S3 bucket name so once the image is processed the URL will immediately start
 working to download the image (or embed it in a script tag or whatever.)
*/
function getDownloadImageURL(mockupName, imageUUID, mockupExtension) {
 return `${imageUUID}_${mockupName}.${mockupExtension}`
}

module.exports = {
 imageUploadMiddleware: imageUploadMiddleware,
 imageUploadHandler: imageUploadHandler
}
