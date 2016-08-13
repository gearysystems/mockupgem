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

// Bucket we store new templates in that still need to be processed
const addTemplateS3Bucket = 'mockup-gem-admin-added-templates';
// Bucket that contains processed templates + the metadata file
const templatesS3Bucket = 'mockup-gem-mockup-images';
// Key for mockup metdata file in S3
const mockupMetdataS3Key = 'mockup_metadata.json';

// Interval for refreshing template metadata from S3
const templateMetadataRefreshIntervalInMinutes = 5;

module.exports = {
  thumbnailsToGenerate: thumbnailsToGenerate,
  addTemplateS3Bucket: addTemplateS3Bucket,
  templatesS3Bucket: templatesS3Bucket,
  mockupMetdataS3Key: mockupMetdataS3Key,
  templateMetadataRefreshIntervalInMinutes: templateMetadataRefreshIntervalInMinutes,
}
