import os
import cv2
from shared import *

thumbnail_sizes_to_generate = [
    [450, 300]
]

def main():
    mockup_images = os.listdir('./mockup_images')
    for image_name in mockup_images:
        if image_name in FILES_TO_IGNORE:
            continue

        full_image_filename = './mockup_images/{}'.format(image_name)

        mockup_name, mockup_file_extension = image_name.split('.')
        mockup_image = cv2.imread(full_image_filename)
        for thumbnail_size in thumbnail_sizes_to_generate:
            create_thumbnail(mockup_image, mockup_name, thumbnail_size[0], thumbnail_size[1])

def create_thumbnail(mockup_image, mockup_name, width, height):
    thumbnail = cv2.resize(mockup_image, (width, height))
    cv2.imwrite(
        'thumbnails/{}-thumbnail-{}_{}.{}'.format(
            mockup_name,
            width,
            height,
            'jpg',
        ),
        thumbnail,
    )

main()
