import os
import cv2
from shared import *
from shutil import copyfile

thumbnail_sizes_to_generate = [
    [1200, 1200],
    [800, 800],
    [600, 600],
    [400, 400],
]

def main():
    mockup_images = os.listdir('./processed')
    for image_name in mockup_images:
        if image_name in FILES_TO_IGNORE:
            continue
        full_image_filename = './processed/{}'.format(image_name)

        mockup_image = cv2.imread(full_image_filename)
        for thumbnail_size in thumbnail_sizes_to_generate:
            create_thumbnail(mockup_image, image_name, thumbnail_size[0], thumbnail_size[1])

def create_thumbnail(mockup_image, image_name, width, height):
    thumbnail = cv2.resize(mockup_image, (width, height))
    thumbnail_filename = '{}-thumbnail-{}_{}'.format(
        image_name,
        width,
        height,
    )
    thumbnail_folder_filename = 'thumbnails/{}.{}'.format(thumbnail_filename, 'jpg')
    cv2.imwrite(
        thumbnail_folder_filename,
        thumbnail,
        [int(cv2.IMWRITE_JPEG_QUALITY), 80]
    )
    copyfile(thumbnail_folder_filename, 'processed/{}'.format(thumbnail_filename))

main()
