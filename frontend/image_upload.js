var busboy = require('connect-busboy');
var AWS = require('aws-sdk')
var uuid = require('node-uuid');
var errors = require('./errors');
var streamBuffers = require('stream-buffers');

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

function imageUploadHandler(req, res) {
 var overlay_image_found = false;
 var mockup_name_found = false;

 const awaitMockupName = new Promise(function(resolve, reject) {
  req.busboy.on('finish', function() {
   console.log('hi');
   if (overlay_image_found === false || mockup_name_found === false) {
    console.log('here');
    // reject('yolo');
    // resolve(Promise.reject());
    reject('stuff')
    console.log('rejected!');
    // req.unpipe(busboy);
    return res.send(errors.invalidUploadRequestError());
   }
   res.send()
  })
  req.busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
   if (fieldname === 'mockup_name') {
    console.log(fieldname);
    mockup_name_found = true;
    return resolve(val);
   } else {
    console.log('rejected 1');
    return reject();
   }
  });
 });

 req.busboy.on('file', function(fieldName, file, filename, encoding, mimetype) {
  console.log('file hanlder started');
  if (fieldName !== 'overlay_image') {
   console.log(fieldName);
   return res.send(errors.invalidUploadFieldError());
  }
  overlay_image_found = true;
  var readBuf = new streamBuffers.ReadableStreamBuffer();

  readBuf.pause();
  file.on('data', function(data) {
   readBuf.put(data);
  });

  file.on('end', function() {
   console.log('end');
   readBuf.stop();
   // if (overlay_image_found === false || mockup_name_found === false) {
   //  return res.send(errors.invalidUploadRequestError());
   // }
   // return res.send();
  });

  awaitMockupName
   .then(handleFileUpload)
   .catch(function(e) {
    console.log(e);
    return res.send(errors.invalidUploadRequestError());
   });

  function handleFileUpload(mockup_name) {
   readBuf.resume();
   console.log('Resumed buffer');
   var s3obj = new AWS.S3({
    params: {
     Bucket: uploadBucket,
     Key: getS3ImageKey(mockup_name, filename),
    }
   });

   // Connect the file stream directly to S3 SDK so upload is streamed instead
   // of being batched in memory.
   console.log('starting upload');
   s3obj.upload({Body: readBuf}, function(err, data) {
    if (err) {
     return res.send(errors.uploadFailedError());
    }
    console.log(data);
   });
   console.log('tried to upload');

   // file.on('end', function() {
   //  console.log('end');
   //  streamBuf.end();
   //  if (overlay_image_found === false || mockup_name_found === false) {
   //   return res.send(errors.invalidUploadRequestError());
   //  }
   //  return res.send();
   // });
  }
 });
}

function getS3ImageKey(mockup_name, filename) {
 const splitFilename = filename.split('.');
 // Currently ignoring their original file extension but may be useful later.
 const originalFileExtension = splitFilename.length >= 2 ? splitFilename.pop() : 'unknown';
 const imageUuid = uuid.v4();
 return `${imageUuid}-${mockup_name}-${originalFileExtension}`;
}

module.exports = {
 imageUploadMiddleware: imageUploadMiddleware,
 imageUploadHandler: imageUploadHandler
}
