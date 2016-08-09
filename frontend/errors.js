'use strict'

function uploadFailedError() {
 return createErrorMessage(
  'image_upload_failed',
  'Something went wrong when trying to upload your image.'
 );
}

function createMockupsError() {
  return createErrorMessage(
    'create_mockups_failed',
    'Something went wrong when trying to create mockups.'
  )
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

function tooManyMockupsError() {
  return createErrorMessage(
    'too_many_mockups',
    'No more than 10 mockups can be generated at a time.'
  )
}

function invalidScreenshotUploadRequestError() {
  return createErrorMessage(
    'invalid_screenshot_upload',
    'A screenshot must be provided.'
  )
}

function invalidCreateMockupsRequestError() {
  return createErrorMessage(
    'invalid_create_mockups_request',
    'The request must contain a valid UUID in the URL and array of mockups in the body.'
  )
}

function invalidAdminAddTemplateError() {
  return createErrorMessage(
    'invalid_admin_add_template_request',
    'The request was not valid.'
  )
}

function adminAddTemplateMetadataError() {
  return createErrorMessage(
    'admin_add_template_metadata_error',
    'Something went wrong when trying to modify the templates metadata in S3.'
  )
}

function adminAddtemplateLambdaError() {
  return createErrorMessage(
    'admin_template_template_lambda_error',
    'Something went wrong when trying to invoke the Lambda function.'
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
 invalidScreenshotUploadRequestError: invalidScreenshotUploadRequestError,
 invalidCreateMockupsRequestError: invalidCreateMockupsRequestError,
 createMockupsError: createMockupsError,
 invalidAdminAddTemplateError: invalidAdminAddTemplateError,
 adminAddTemplateMetadataError: adminAddTemplateMetadataError,
 adminAddtemplateLambdaError: adminAddtemplateLambdaError,
}
