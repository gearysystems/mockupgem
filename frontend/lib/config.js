'use strict'

const thumbnailsToGenerate = [
  {
    width: 1200,
    height: 1200,
  },
  {
    width: 800,
    height: 800,
  },
  {
    width: 600,
    height: 600,
  },
  {
    width: 400,
    height: 400,
  }
]

// AWS Region
const AWSRegion = 'us-west-2'
// Bucket for storing uploaded images from the legacy API
const imageUploadBucket = 'mockup-gem-uploaded-images'
// Bucket for storing processed images from the legacy API
const processedImagesS3Bucket = 'mockup-gem-processed-images'
// URL prefix processed images from the legacy API
const processedImagesS3URLPrefix = `https://s3-${AWSRegion}.amazonaws.com/${processedImagesS3Bucket}`
// Bucket we store new templates in that still need to be processed
const addTemplateS3Bucket = 'mockup-gem-admin-added-templates';
// Bucket that contains processed templates + the metadata file
const templatesS3Bucket = 'mockup-gem-mockup-images';
// Key for mockup metdata file in S3
const mockupMetdataS3Key = 'mockup_metadata.json';
// Key for uploaded screenshots S3 bucket
const screenshotUploadBucket = 'mockup-gem-uploaded-screenshots'
// URL prefix for accessing uploaded screenshots
const uploadScreenshotsS3URLPrefix = `https://s3-${AWSRegion}.amazonaws.com/${screenshotUploadBucket}`
// Key for processed mockups S3 bucket
const processedMockupsBucket = 'mockup-gem-processed-mockups'
// URL prefix for processed mockup images
const processedMockupsS3URLPrefix = `https://s3-${AWSRegion}.amazonaws.com/${processedMockupsBucket}`

// Interval for refreshing template metadata from S3
const templateMetadataRefreshIntervalInMinutes = 5;

// Max file upload size in bytes
const maxFileSize = 4000000

module.exports = {
  thumbnailsToGenerate: thumbnailsToGenerate,
  AWSRegion: AWSRegion,
  imageUploadBucket: imageUploadBucket,
  processedImagesS3Bucket: processedImagesS3Bucket,
  processedImagesS3URLPrefix: processedImagesS3URLPrefix,
  addTemplateS3Bucket: addTemplateS3Bucket,
  templatesS3Bucket: templatesS3Bucket,
  mockupMetdataS3Key: mockupMetdataS3Key,
  screenshotUploadBucket: screenshotUploadBucket,
  uploadScreenshotsS3URLPrefix: uploadScreenshotsS3URLPrefix,
  processedMockupsBucket: processedMockupsBucket,
  processedMockupsS3URLPrefix: processedMockupsS3URLPrefix,
  templateMetadataRefreshIntervalInMinutes: templateMetadataRefreshIntervalInMinutes,
  maxFileSize: maxFileSize,
}
