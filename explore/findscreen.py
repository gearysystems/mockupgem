import cv2
from PIL import Image
import numpy
from imutils.perspective import order_points

def main():
    background_image = cv2.imread('side.png')
    prepped_background_image = get_prepped_background_image(background_image)
    screen_contour = get_screen_contour(prepped_background_image)

    overlay_image = cv2.imread('screenshot.png')
    transformation_matrix = get_transformation_matrix(
        prepped_background_image,
        overlay_image,
        screen_contour,
        'right'
    )

    background_height, background_width = background_image.shape[:2]
    final_image = cv2.warpPerspective(
        overlay_image,
        transformation_matrix,
        (background_width, background_height),
        background_image,
        borderMode=cv2.BORDER_TRANSPARENT,
    )

    # cv2.imwrite("test.jpg", final_image)
    cv2.imshow("final", final_image)
    cv2.waitKey(0)

def get_prepped_background_image(image, convertToGrayscale=False):
    if convertToGrayscale:
        image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    # Removes noise while preserving edges
    # filtered_image = cv2.bilateralFilter(image, 17, 17, 17)
    filtered_image=image
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
            (x,y),(MA,ma),angle = cv2.fitEllipse(contour)
            print(angle)
            return approximate_contour

    raise Exception("Could not detect screen!")

def get_transformation_matrix(background_image, overlay_image, screen_contour, orientation='right'):
    overlay_height, overlay_width = overlay_image.shape[:2]

    screen_coordinates = numpy.float32(
        order_points([numpy.float32(x[0]) for x in screen_contour])
    )

    overlay_coordinates = get_overlay_coordinates(
        overlay_width,
        overlay_height,
        orientation,
    )

    return cv2.getPerspectiveTransform(
        overlay_coordinates,
        screen_coordinates,
    )

def get_overlay_coordinates(overlay_width, overlay_height, orientation):
    return numpy.float32([
        [0, 0],
        [overlay_width, 0],
        [overlay_width, overlay_height],
        [0, overlay_height],
    ])
    # If screen is almost perfectly vertical or rotated right, then the
    # contours will be in this order:
    # top left, bottom left, bottom right, top right
    if orientation == 'right':
        return numpy.float32([
            [0, 0],
            [0, overlay_height],
            [overlay_width, overlay_height],
            [overlay_width, 0],
        ])
    # If screen is rotated left, then the screen contours will be in this order:
    # top right, top left, bottom left, bottom right
    else:
        return numpy.float32([
            [overlay_width, 0],
            [0, 0],
            [0, overlay_height],
            [overlay_width, overlay_height],
        ])
main()
