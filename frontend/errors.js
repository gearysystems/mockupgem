'use strict'

function uploadFailedError() {
 return createErrorMessage(
  'image_upload_failed',
  'Something went wrong when trying to upload your image.'
 );
}

function invalidUploadFieldError() {
 return createErrorMessage(
  'invalid_upload_field',
  'The overlay image must be passed in the overlay_image field.'
 )
}

function invalidUploadRequestError() {
 return createErrorMessage(
  'invalid_upload_request',
  'The request must contain a valid mockup_name and overlay_image.'
 )
}

function invalidMockupNameError() {
 return createErrorMessage(
  'invalid_mockup_name',
  'The provided mockup name is not valid.'
 )
}

function createErrorMessage(errorCode, errorMessage) {
 return {
  error_code: errorCode,
  error_message: errorMessage
 }
}


module.exports = {
 uploadFailedError: uploadFailedError,
 invalidUploadFieldError: invalidUploadFieldError,
 invalidUploadRequestError: invalidUploadRequestError,
 invalidMockupNameError: invalidMockupNameError,
}
