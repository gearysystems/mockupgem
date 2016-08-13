import cv2
import boto3

s3 = boto3.client('s3')


def lambda_handler(event, context):
    """
    Event should look like:
    {
        "template_uuid": "<TEMPLATE_UUID>",
        "final_template_name": "<FINAL_TEMPLATE_NAME>",
        "thumbnails_sizes_to_generate": [
            {"thumbnail_width": 450, "thumbnail_height": 300},
            ...
        ],
        "thumbnail_file_format": "jpg",
        "fullsize_template_format": "png",
        "thumbnail_quality": 80,
        "unprocessed_templates_s3_bucket": "<S3_BUCKET_NAME>",
        "processed_templates_s3_bucket": "<S3_BUCKET_NAME>"

    }
    """
    template_uuid = event['template_uuid']
    final_template_name = event['final_template_name']
    thumbnail_sizes_to_generate = event['thumbnail_sizes_to_generate']
    thumbnail_file_format = event['thumbnail_file_format']
    fullsize_template_format = event['fullsize_template_format']
    thumbnail_quality = event['thumbnail_quality']
    unprocessed_templates_s3_bucket = event['unprocessed_templates_s3_bucket']
    processed_templates_s3_bucket = event['processed_templates_s3_bucket']

    template_image_path = '/tmp/{}'.format(template_uuid)
    s3.download_file(unprocessed_templates_s3_bucket, template_uuid, template_image_path)
    template_image = cv2.imread(template_image_path)

    for thumbnail_size in thumbnail_sizes_to_generate:
        thumbnail_filename, thumbnail_file_path = create_thumbnail(
            template_image,
            final_template_name,
            thumbnail_file_format,
            thumbnail_quality,
            thumbnail_size['thumbnail_width'],
            thumbnail_size['thumbnail_height'],
        )
        s3.upload_file(
            thumbnail_file_path,
            processed_templates_s3_bucket,
            thumbnail_filename,
        )
    # Also put a copy of the full size image in the S3 bucket as well
    s3.upload_file(
        template_image_path,
        processed_templates_s3_bucket,
        '{}.{}'.format(final_template_name, fullsize_template_format),
    )
    # Also upload a version of the template without the file extension because
    # our create_mockup lambda function is expecting it that way.
    s3.upload_file(
        template_image_path,
        processed_templates_s3_bucket,
        '{}'.format(final_template_name),
    )


def create_thumbnail(
    template_image,
    image_name,
    thumbnail_file_format,
    thumbnail_quality,
    width,
    height,
):
    thumbnail = cv2.resize(template_image, (width, height))
    thumbnail_filename = '{}-thumbnail-{}_{}.{}'.format(
        image_name,
        width,
        height,
        thumbnail_file_format,
    )

    thumbnail_file_path = '/tmp/{}'.format(thumbnail_filename)
    cv2.imwrite(
        thumbnail_file_path,
        thumbnail,
        [int(cv2.IMWRITE_JPEG_QUALITY), thumbnail_quality]
    )
    return thumbnail_filename, thumbnail_file_path
