import cv2
import numpy
import boto3

MOCKUP_IMAGE_BUCKET_NAME = 'mockup-gem-mockup-images'
PROCESSED_IMAGE_BUCKET_NAME = 'mockup-gem-processed-images'

THUMBNAIL_WIDTH = 450
THUMBNAIL_HEIGHT = 300

s3 = boto3.client('s3')


def lambda_handler(event, context):
    overlay_image_event = event['Records'][0]
    overlay_image_bucket = overlay_image_event['s3']['bucket']['name']
    overlay_image_key = overlay_image_event['s3']['object']['key']

    filename_components = parse_filename_into_components(overlay_image_key)

    # Download overlay image
    overlay_image_download_path = '/tmp/{}'.format(overlay_image_key)
    s3.download_file(overlay_image_bucket, overlay_image_key, overlay_image_download_path)

    for mockup in filename_components['mockups']:
        # Download mockup images
        # TODO: This file extension shouldnt be hard-coded, but we're only handling
        # pngs for now.
        mockup_image_key = mockup['mockup_name']
        mockup_image_download_path = '/tmp/{}'.format(mockup_image_key)
        s3.download_file(MOCKUP_IMAGE_BUCKET_NAME, mockup_image_key, mockup_image_download_path)

        overlay_image = cv2.imread(overlay_image_download_path)
        background_image = cv2.imread(mockup_image_download_path)

        transformation_matrix = get_transformation_matrix(
            overlay_image,
            numpy.float32(mockup['screen_coordinates']),
        )

        background_height, background_width = background_image.shape[:2]
        final_image = cv2.warpPerspective(
            overlay_image,
            transformation_matrix,
            (background_width, background_height),
            background_image,
            borderMode=cv2.BORDER_TRANSPARENT,
        )
        thumbnail = generate_thumbnail(final_image)

        final_image_upload_key = get_overlay_upload_key(
            filename_components['uuid'],
            mockup['mockup_name'],
        )
        thumbnail_upload_key = get_thumbnail_upload_key(
            filename_components['uuid'],
            mockup['mockup_name'],
        )

        upload_to_s3(final_image, final_image_upload_key)
        upload_to_s3(thumbnail, thumbnail_upload_key)


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
    >>> test_string = '133186f6-aad3-46c0-a83c-40fd424e7f35*iphone6_rough_texture*560_139.801_227.646_643.399_551*iphone6_rough_texture*560_139.801_227.646_643.399_551'  # noqa

    >>> expected_response = {
    ...    'uuid': '133186f6-aad3-46c0-a83c-40fd424e7f35',
    ...    'mockups': [
    ...         {
    ...             'mockup_name': 'iphone6_rough_texture',
    ...             'screen_coordinates': [[560, 139], [801, 227], [646, 643], [399, 551]]
    ...         },
    ...         {
    ...             'mockup_name': 'iphone6_rough_texture',
    ...             'screen_coordinates': [[560, 139], [801, 227], [646, 643], [399, 551]]
    ...         }
    ...     ]
    ... }

    >>> assert(parse_filename_into_components(test_string)) == expected_response
    """

    # 133186f6-aad3-46c0-a83c-40fd424e7f35*iphone6_rough_texture*560_139*801_227*646_643*399_551
    # TO
    # ['133186f6-aad3-46c0-a83c-40fd424e7f35', 'iphone6_rough_texture', '560_139', ... etc]
    split_filename = filename.split('*')
    mockup_name_and_screen_cords = zip(split_filename[1::2], split_filename[2::2])
    mockups = [
        {
            'mockup_name': mockup_metdata[0],
            'screen_coordinates': parse_coord_string(mockup_metdata[1]),
        }
        for mockup_metdata
        in mockup_name_and_screen_cords
    ]
    return {
        'uuid': split_filename[0],
        'mockups': mockups,
    }


def parse_coord_string(coord_string):
    """
    >>> parse_coord_string('560_139.124_300.500_600.300_200')
    [[560, 139], [124, 300], [500, 600], [300, 200]]
    """
    # Remove brackets
    split_coords_string = coord_string.split('.')
    return [
        [int(coords.split('_')[0]), int(coords.split('_')[1])]
        for coords in split_coords_string
    ]


def get_overlay_upload_key(image_uuid, mockup_name):
    # TODO: This file extension shouldnt be hard-coded, but we're only handling
    # pngs for now.
    return '{}.png'.format(get_base_upload_key(image_uuid, mockup_name))


def get_thumbnail_upload_key(image_uuid, mockup_name):
    return '{}_thumbnail_{}_{}.jpg'.format(
        get_base_upload_key(image_uuid, mockup_name),
        THUMBNAIL_WIDTH,
        THUMBNAIL_HEIGHT,
    )


def get_base_upload_key(image_uuid, mockup_name):
    return '{}_{}'.format(
        image_uuid,
        mockup_name,
    )


def generate_thumbnail(image):
    return cv2.resize(image, (THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT))


def upload_to_s3(image, s3_upload_key):
    image_file_path = '/tmp/{}'.format(s3_upload_key)
    cv2.imwrite(image_file_path, image)
    s3.upload_file(image_file_path, PROCESSED_IMAGE_BUCKET_NAME, s3_upload_key)
