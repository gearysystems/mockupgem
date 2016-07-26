import json
import urllib
import boto3
import uuid

s3 = boto3.client('s3')

UPLOAD_BUCKET = 'mockup-gem-uploaded-images'
DOWNLOAD_BUCKET = 'mockup-gem-downloaded-images'

def lambda_handler(event, context):
    mockup_name = event['mockup_image']
    overlay_image_extension = event['overlay_image_extension']

    image_uuid = str(uuid.uuid4())

    presigned_url = s3.generate_presigned_url(
        'put_object',
        Params={
            # S3 bucket to upload image to
            'Bucket': UPLOAD_BUCKET,
            # Uploaded image name
            'Key': "{}-{}.{}".format(
                mockup_name,
                image_uuid,
                overlay_image_extension,
            ),
        },
        # Link expires after 3600 seconds
        ExpiresIn=3600,
        HttpMethod='PUT',
    )

    return {
        # URL that can be used to upload an image
        "upload_url": presigned_url,
        # URL that can be used to download the processed image
        "download_url": "https://s3.amazonaws.com/{}/{}.{}".format(
            DOWNLOAD_BUCKET,
            image_uuid,
            overlay_image_extension,
        ),
    }
