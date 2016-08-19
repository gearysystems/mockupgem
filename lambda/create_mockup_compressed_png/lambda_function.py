import cv2
import numpy
import boto3

from PIL import Image
from PIL import ImageFilter

SCREENSHOT_IMAGES_BUCKET_NAME = 'mockup-gem-uploaded-screenshots'
TEMPLATE_IMAGES_BUCKET_NAME = 'mockup-gem-mockup-images'
PROCESSED_IMAGE_BUCKET_NAME = 'mockup-gem-processed-mockups'

s3 = boto3.client('s3')


def lambda_handler(event, context):
    # Event should look like:
    #    {
    #        "screenshot_uuid": "<SCREENSHOT_UUID>",
    #        "thumbnails_to_generate": [
    #           {"thumbnail_width": 450, "thumbnail_height": 300}
    #        ],
    #        "templates": [
    #            {
    #                "template_name": "<TEMPLATE_NAME>",
    #                "screen_coordinates": [[int, int], [int, int], [int, int], [int, int]]
    #            }
    #        ]
    #    }
    screenshot_uuid = event['screenshot_uuid']
    templates = event['templates']
    thumbnails_to_generate = event['thumbnails_to_generate']

    # Download screenshot
    screenshot_image_download_path = '/tmp/{}'.format(screenshot_uuid)
    s3.download_file(SCREENSHOT_IMAGES_BUCKET_NAME, screenshot_uuid, screenshot_image_download_path)

    # Generate download paths for all templates
    templates_data = [
        # TODO: Make this a function
        {
            'name': template['template_name'],
            'download_path': '/tmp/{}'.format(template['template_name']),
            'screen_coordinates': [
                template['screen_coordinates']['top_left'],
                template['screen_coordinates']['top_right'],
                template['screen_coordinates']['bottom_right'],
                template['screen_coordinates']['bottom_left'],
            ],
        }
        for template
        in templates
    ]

    # IMREAD_UNCHANGED prevents the transparency layer from being lost
    screenshot = cv2.imread(screenshot_image_download_path, cv2.IMREAD_UNCHANGED)
    for template_data in templates_data:
        # TODO: Should change mockups bucket to not store file extension so its
        # more generic
        template_name = template_data['name']
        template_s3_image_key = template_name
        template_image_download_path = '/tmp/{}'.format(template_name)
        s3.download_file(
            TEMPLATE_IMAGES_BUCKET_NAME,
            template_s3_image_key,
            template_image_download_path,
        )
        template = cv2.imread(template_image_download_path, cv2.IMREAD_UNCHANGED)
        transformation_matrix = get_transformation_matrix(
            screenshot,
            numpy.float32(template_data['screen_coordinates']),
        )

        template_height, template_width = template.shape[:2]
        final_image = cv2.warpPerspective(
            screenshot,
            transformation_matrix,
            (template_width, template_height),
            template,
            borderMode=cv2.BORDER_TRANSPARENT,
        )

        final_image_upload_key = get_screenshot_upload_key(
            screenshot_uuid,
            template_data['name'],
        )
        upload_cv2_image_to_s3(final_image, final_image_upload_key)

        final_image_filepath = '/tmp/{}'.format(final_image_upload_key)
        # Write to disk so Pillow can load it
        cv2.imwrite(final_image_filepath, final_image)
        final_image_PIL = Image.open(final_image_filepath)
        compressed_final_image = generate_compressed_png(final_image_PIL)

        for thumbnail in thumbnails_to_generate:
            thumbnail_width = thumbnail['width']
            thumbnail_height = thumbnail['height']

            thumbnail_upload_key = get_thumbnail_upload_key(
                screenshot_uuid,
                template_data['name'],
                thumbnail_width,
                thumbnail_height,
            )

            thumbnail = compressed_final_image.resize(
                (thumbnail_width, thumbnail_height),
                Image.ANTIALIAS,
            )

            upload_PIL_image_to_s3(thumbnail, thumbnail_upload_key)


def get_transformation_matrix(
    overlay_image,
    screen_coordinates,
):
    overlay_height, overlay_width = overlay_image.shape[:2]
    overlay_coordinates = get_overlay_coordinates(
        overlay_width,
        overlay_height,
    )

    return cv2.getPerspectiveTransform(
        overlay_coordinates,
        screen_coordinates,
    )


def get_overlay_coordinates(overlay_width, overlay_height):
    return numpy.float32([
        [0, 0],
        [overlay_width, 0],
        [overlay_width, overlay_height],
        [0, overlay_height],
    ])


def get_screenshot_upload_key(image_uuid, template_name):
    # TODO: This file extension shouldnt be hard-coded, but we're only handling
    # pngs for now.
    return '{}.png'.format(get_base_upload_key(image_uuid, template_name))


def get_thumbnail_upload_key(image_uuid, template_name, width, height):
    return '{}_thumbnail_{}_{}.png'.format(
        get_base_upload_key(image_uuid, template_name),
        width,
        height,
    )


def get_base_upload_key(image_uuid, template_name):
    return '{}_{}'.format(
        image_uuid,
        template_name,
    )


def generate_thumbnail(image, width, height):
    return cv2.resize(image, (width, height))


def generate_compressed_png(png):
    filtered = png.filter(ImageFilter.EDGE_ENHANCE)
    compressed = filtered.convert('P', palette=Image.ADAPTIVE, colors=256)
    return compressed


def upload_cv2_image_to_s3(image, s3_upload_key):
    image_file_path = '/tmp/{}'.format(s3_upload_key)
    cv2.imwrite(image_file_path, image)
    s3.upload_file(image_file_path, PROCESSED_IMAGE_BUCKET_NAME, s3_upload_key)


def upload_PIL_image_to_s3(image, s3_upload_key):
    image_file_path = '/tmp/{}'.format(s3_upload_key)
    image.save(image_file_path, "PNG")
    s3.upload_file(image_file_path, PROCESSED_IMAGE_BUCKET_NAME, s3_upload_key)
