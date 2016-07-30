from __future__ import unicode_literals
import os
import cv2
import copy
from PIL import Image
import numpy
import json
from prompt_toolkit import prompt
from prompt_toolkit.shortcuts import confirm
from itertools import permutations
import time
from shared import *

def main():
    with open('mockup_metadata.json', 'r') as mockup_metadata_file:
        existing_mockup_metadata_string = mockup_metadata_file.read()
    existing_mockup_metadata = load_existing_mockup_metadata(
        existing_mockup_metadata_string,
    )

    new_mockup_metadata = copy.deepcopy(existing_mockup_metadata)
    overlay_image = cv2.imread('screenshot.png')

    mockup_images = os.listdir('.')
    for image_filename in mockup_images:
        if image_filename in FILES_TO_IGNORE:
            continue
        filename_components = parse_filename_into_components(image_filename)
        if filename_components['mockup_name'] in existing_mockup_metadata:
            continue
        loaded_image = cv2.imread(image_filename)
        prepped_image = get_prepped_image(loaded_image)
        try:
            screen_contour = get_screen_contour(prepped_image)
        except Exception:
            print("Could not locate screen in {}".format(image_filename))
            continue

        screen_coords = get_screen_coord_from_contour(
            screen_contour,
            filename_components['orientation'],
        )

        screen_coords_for_overlay = [
            screen_coords['topLeft'],
            screen_coords['topRight'],
            screen_coords['bottomRight'],
            screen_coords['bottomLeft'],
        ]

        render_image(loaded_image.copy(), overlay_image, numpy.float32(screen_coords_for_overlay))
        acceptable_answer = confirm('Was the image acceptable? (y/n)')
        if acceptable_answer is False:
            should_rotate_answer = confirm('Do you want to try and rotate the image? (y/n)')
            if should_rotate_answer is False:
                continue
            for permutation in permutations(screen_coords_for_overlay):
                render_image(loaded_image.copy(), overlay_image, numpy.float32(permutation))
                answer = confirm('Was the image acceptable? (y/n)')
                # Coordinates should not be in the correct order such that they
                # can be as used top left, top right, bottom right, bottom left
                print('all permutations')
                print(permutation)
                if answer is True:
                    print('selected permutation')
                    print(permutation)
                    screen_coords = {
                        'topLeft': [permutation[0][0], permutation[0][1]],
                        'topRight': [permutation[1][0], permutation[1][1]],
                        'bottomRight': [permutation[2][0], permutation[2][1]],
                        'bottomLeft': [permutation[3][0], permutation[3][1]],
                    }
                    print('new screen coords')
                    print(screen_coords)
                    break

        print('actual screen coords')
        print(screen_coords)
        image_mockup_metadata = {
            'screenCoordinates': screen_coords,
            'device': filename_components['device'],
            # 'dimensions': image_dimensions,
            'file_extension': filename_components['file_extension'],
        }

        new_mockup_metadata[filename_components['mockup_name']] = image_mockup_metadata
        # os.rename(image_filename, 'processed/' + filename_components['mockup_name'] + '.' + filename_components['file_extension'])

    print(new_mockup_metadata)
    with open('mockup_metadata.json', 'w') as mockup_metadata_file:
        mockup_metadata_file.write(json.dumps(new_mockup_metadata))

    print("Wrote new metadata to mockup_metadata.json")

def load_existing_mockup_metadata(mockup_metadata_string):
    """
    >>> example_mockup_metadata = '''{
    ...    "mockup_name1": {
    ...        "screenCoordinates": {
    ...            "topLeft": 100,
    ...            "topRight": 100,
    ...            "bottomRight": 100,
    ...            "bottomLeft": 100
    ...        },
    ...        "device": "iphone",
    ...        "dimensions": {
    ...            "width": 300,
    ...            "height": 400
    ...        }
    ...    }
    ... }'''

    >>> expected_response =  {
    ...    u'mockup_name1': {
    ...         u'screenCoordinates': {
    ...             u'topLeft': 100,
    ...             u'topRight': 100,
    ...             u'bottomRight': 100,
    ...             u'bottomLeft': 100
    ...         },
    ...         u'device': u'iphone',
    ...         u'dimensions': {
    ...             u'width': 300,
    ...             u'height': 400
    ...         }
    ...     }
    ... }

    >>> loaded_mockup_data = load_existing_mockup_metadata(example_mockup_metadata)

    >>> assert loaded_mockup_data == expected_response
    """
    try:
        return json.loads(mockup_metadata_string)
    except ValueError:
        return {}

def parse_filename_into_components(filename):
    """
    >>> example_input_1 = "1-iphone_black_table-iphone-right.png"

    >>> expected_output_1 = {
    ...    'mockup_name': 'iphone_black_table',
    ...    'device': 'iphone',
    ...    'orientation': 'right',
    ...    'file_extension': 'png',
    ... }

    >>> example_input_2 = "iphone_black_table-iphone-right.png"

    >>> expected_output_2 = {
    ...    'device': 'iphone',
    ...    'file_extension': 'png',
    ...    'orientation': 'right',
    ...    'mockup_name': 'iphone_black_table',
    ... }

    assert parse_filename_into_components(example_input_1) == expected_output_1

    assert parse_filename_into_components(example_input_2) == expected_output_2
    """
    print(filename)
    filename_components = filename.split('-')
    print(filename_components)
    offset = 1 if len(filename_components) == 4 else 0

    orientation = filename_components[offset+2].split('.')[0]
    file_extension = filename_components[offset+2].split('.')[1]

    return {
        'mockup_name': filename_components[offset],
        'device': filename_components[offset+1],
        'orientation': orientation,
        'file_extension': file_extension,
    }


def get_prepped_image(image, convertToGrayscale=False):
    if convertToGrayscale:
        image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    # Removes noise while preserving edges
    filtered_image = cv2.bilateralFilter(image, 50, 50, 50)
    # Find edges in image
    return cv2.Canny(filtered_image, 30, 200)

def get_screen_contour(image):
    (contours, _) = cv2.findContours(
        image.copy(),
        cv2.RETR_TREE,
        cv2.CHAIN_APPROX_SIMPLE
    )
    largest_contours = sorted(contours, key = cv2.contourArea, reverse = True)[:10]

    for contour in largest_contours:
        contour_perimiter = cv2.arcLength(contour, True)
        approximate_contour = cv2.approxPolyDP(contour, 0.01 * contour_perimiter, True)

        # if our approximated contour has four points, then
        # we can assume that we have found our screen
        if len(approximate_contour) == 4:
        	return approximate_contour

    raise Exception("Could not detect screen!")


def get_screen_coord_from_contour(screen_contour, orientation):
    # Convert contour to an array of [x, y] pairs
    screen_coordinates = [[int(x[0][0]), int(x[0][1])] for x in screen_contour]

    # If screen is almost perfectly vertical or rotated right, then the
    # contours will be in this order:
    # top left, bottom left, bottom right, top right
    if orientation == 'right':
        return {
            'topLeft': screen_coordinates[0],
            'topRight': screen_coordinates[3],
            'bottomRight': screen_coordinates[2],
            'bottomLeft': screen_coordinates[1],
        }
    # If screen is rotated left, then the screen contours will be in this order:
    # top right, top left, bottom left, bottom right
    else:
        return {
            'topLeft': screen_coordinates[0],
            'topRight': screen_coordinates[3],
            'bottomRight': screen_coordinates[2],
            'bottomLeft': screen_coordinates[1],
        }

def render_image(loaded_image, overlay_image, screen_coords_for_overlay):
    transformation_matrix = get_transformation_matrix(
        overlay_image,
        screen_coords_for_overlay,
    )

    background_height, background_width = loaded_image.shape[:2]
    final_image = cv2.warpPerspective(
        overlay_image,
        transformation_matrix,
        (background_width, background_height),
        loaded_image,
        borderMode=cv2.BORDER_TRANSPARENT,
    )

    cv2.imshow("example", final_image)
    cv2.waitKey(0)
    # Stupid hack. There is a bug in cv2 where the window wont close if you
    # wait for user input directly after showing the image.
    # http://stackoverflow.com/questions/30684412/opencv-python-image-window-does-not-close
    # https://github.com/opencv/opencv/issues/4535
    for i in range(1,10):
        cv2.destroyAllWindows()
        cv2.waitKey(1)

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

if __name__ == '__main__':
    main()
