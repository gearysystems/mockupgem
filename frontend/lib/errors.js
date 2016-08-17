'use strict'

/**
* @swagger
* definition:
*   upload_failed_error:
*     properties:
*       error_code:
*         type: string
*         enum:
*           - "image_upload_failed"
*       error_message:
*         type: string
*         enum:
*           - "Something went wrong when trying to upload your image."
*/
function uploadFailedError() {
 return createErrorMessage(
  'image_upload_failed',
  'Something went wrong when trying to upload your image.'
 );
}

/**
* @swagger
* definition:
*   create_mockups_error:
*     properties:
*       error_code:
*         type: string
*         enum:
*           - "create_mockups_failed"
*       error_message:
*         type: string
*         enum:
*           - "Something went wrong when trying to create mockups."
*/
function createMockupsError() {
  return createErrorMessage(
    'create_mockups_failed',
    'Something went wrong when trying to create mockups.'
  )
}

/**
* @swagger
* definition:
*   invalid_upload_field_error:
*     properties:
*       error_code:
*         type: string
*         enum:
*           - "invalid_upload_field"
*       error_message:
*         type: string
*         enum:
*           - "The overlay image must be passed in the overlay_image field."
*/
function invalidUploadFieldError() {
 return createErrorMessage(
  'invalid_upload_field',
  'The overlay image must be passed in the overlay_image field.'
 )
}

/**
* @swagger
* definition:
*   invalid_upload_request_error:
*     properties:
*       error_code:
*         type: string
*         enum:
*           - "invalid_upload_request"
*       error_message:
*         type: string
*         enum:
*           - "The request must contain a valid mockup_name and overlay_image."
*/
function invalidUploadRequestError() {
 return createErrorMessage(
  'invalid_upload_request',
  'The request must contain a valid mockup_name and overlay_image.'
 )
}

/**
* @swagger
* definition:
*   invalid_mockup_name_error:
*     properties:
*       error_code:
*         type: string
*         enum:
*           - "invalid_mockup_name"
*       error_message:
*         type: string
*         enum:
*           - "The provided mockup name is not valid."
*/
function invalidMockupNameError() {
 return createErrorMessage(
  'invalid_mockup_name',
  'The provided mockup name is not valid.'
 )
}

/**
* @swagger
* definition:
*   too_many_mockups_error:
*     properties:
*       error_code:
*         type: string
*         enum:
*           - "too_many_mockups"
*       error_message:
*         type: string
*         enum:
*           - "No more than 10 mockups can be generated at a time."
*/
function tooManyMockupsError() {
  return createErrorMessage(
    'too_many_mockups',
    'No more than 10 mockups can be generated at a time.'
  )
}

/**
* @swagger
* definition:
*   invalid_screenshot_upload_request_error:
*     properties:
*       error_code:
*         type: string
*         enum:
*           - "invalid_screenshot_upload"
*       error_message:
*         type: string
*         enum:
*           - "A screenshot must be provided."
*/
function invalidScreenshotUploadRequestError() {
  return createErrorMessage(
    'invalid_screenshot_upload',
    'A screenshot must be provided.'
  )
}

/**
* @swagger
* definition:
*   invalid_create_mockups_request_error:
*     properties:
*       error_code:
*         type: string
*         enum:
*           - "invalid_create_mockups_request"
*       error_message:
*         type: string
*         enum:
*           - "The request must contain a valid UUID in the URL and array of mockups in the body."
*/
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
