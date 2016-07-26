import cv2
import numpy
import boto3
import json

MOCKUP_IMAGE_BUCKET_NAME = 'mockup-gem-mockup-images'
PROCESSED_IMAGE_BUCKET_NAME = 'mockup-gem-processed-images'
s3 = boto3.client('s3')

def lambda_handler(event, context):
    overlay_image_event = event['Records'][0]
    overlay_image_bucket = overlay_image_event['s3']['bucket']['name']
    overlay_image_key = overlay_image_event['s3']['object']['key']

    filename_components = parse_filename_into_components(overlay_image_key)

    # Download overlay image
    overlay_image_download_path = '/tmp/{}'.format(overlay_image_key)
    s3.download_file(overlay_image_bucket, overlay_image_key, overlay_image_download_path)

    # Download mockup image
    # TODO: This file extension shouldnt be hard-coded, but we're only handling
    # pngs for now.
    mockup_image_key = '{}.png'.format(filename_components['mockup_name'])
    mockup_image_download_path = '/tmp/{}'.format(mockup_image_key)
    s3.download_file(MOCKUP_IMAGE_BUCKET_NAME, mockup_image_key, mockup_image_download_path)

    overlay_image = cv2.imread(overlay_image_download_path)
    background_image = cv2.imread(mockup_image_download_path)

    transformation_matrix = get_transformation_matrix(
        overlay_image,
        numpy.float32(filename_components['screen_coordinates']),
    )

    background_height, background_width = background_image.shape[:2]
    final_image = cv2.warpPerspective(
        overlay_image,
        transformation_matrix,
        (background_width, background_height),
        background_image,
        borderMode=cv2.BORDER_TRANSPARENT,
    )

    upload_key = get_upload_key(filename_components)
    processed_image_file_path = '/tmp/{}'.format(upload_key)
    cv2.imwrite(processed_image_file_path, final_image)
    s3.upload_file(processed_image_file_path, PROCESSED_IMAGE_BUCKET_NAME, upload_key)

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


def parse_filename_into_components(filename):
    """
    >>> test_string = '133186f6-aad3-46c0-a83c-40fd424e7f35*iphone6_rough_texture*560_139*801_227*646_643*399_551'

    >>> expected_response = {
    ...    'uuid': '133186f6-aad3-46c0-a83c-40fd424e7f35',
    ...    'mockup_name': 'iphone6_rough_texture',
    ...    'screen_coordinates': [[560, 139], [801, 227], [646, 643], [399, 551]],
    ... }

    >>> assert(parse_filename_into_components(test_string)) == expected_response
    """

    # 133186f6-aad3-46c0-a83c-40fd424e7f35*iphone6_rough_texture*560_139*801_227*646_643*399_551
    # TO
    # ['133186f6-aad3-46c0-a83c-40fd424e7f35', 'iphone6_rough_texture', '560_139', ... etc]
    split_filename = filename.split('*')

    return {
        'uuid': split_filename[0],
        'mockup_name': split_filename[1],
        'screen_coordinates': [
            parse_coord_string(split_filename[2]),
            parse_coord_string(split_filename[3]),
            parse_coord_string(split_filename[4]),
            parse_coord_string(split_filename[5]),
        ]
    }


def parse_coord_string(coord_string):
    """
    >>> parse_coord_string('560_139')
    [560, 139]
    """
    # 560_139 -> ['560', '139']
    split_top_left_coords_string = coord_string.split('_')
    return [int(split_top_left_coords_string[0]), int(split_top_left_coords_string[1])]


def get_upload_key(filename_components):
    # TODO: This file extension shouldnt be hard-coded, but we're only handling
    # pngs for now.
    return '{}_{}.png'.format(
        filename_components['uuid'],
        filename_components['mockup_name'],
    )
