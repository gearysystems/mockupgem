import cv2
from PIL import Image
import numpy

image = cv2.imread('mockup.png')
background_height, background_width = image.shape[:2]
edged_image = cv2.Canny(image, 30, 200)

(contours, _) = cv2.findContours(edged_image.copy(), cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
contours = sorted(contours, key = cv2.contourArea, reverse = True)[:10]
screenCnt = None

for contour in contours:
    peri = cv2.arcLength(contour, True)
    approx = cv2.approxPolyDP(contour, 0.02 * peri, True)

    # if our approximated contour has four points, then
    # we can assume that we have found our screen
    if len(approx) == 4:
    	screenCnt = approx
    	break

cv2.drawContours(image, [screenCnt], -1, (0, 255, 0), 3)
# cv2.imshow("Screen Location", image)
# cv2.waitKey(0)

screenCoords = numpy.asarray(
    [numpy.asarray(x[0], dtype=numpy.float32) for x in screenCnt],
    dtype=numpy.float32
)

overlay_image = cv2.imread('screenshot.png')
# cv2.imshow("Overlay image", overlay_image)
overlay_height, overlay_width = image.shape[:2]
# cv2.waitKey(0)
input_coordinates = numpy.float32([[0, 0], [overlay_width, 0], [0, overlay_height]])
    # numpy.asarray([0, overlay_height], dtype=numpy.float32)
# ])

print(screenCoords)
screenCoords = numpy.float32([
    screenCoords[1],
    screenCoords[0],
    screenCoords[3],
])

transformation_matrix = cv2.getAffineTransform(
    input_coordinates,
    screenCoords,
)
# print(transformMatrix)
print(screenCoords)

# warped_image = numpy.zeros((background_height, background_width,3), numpy.uint8)
warped_image = cv2.warpAffine(
    overlay_image,
    transformation_matrix,
    (background_width, background_height),
)
final = cv2.addWeighted(warped_image, 0.5, image, 0.5, 1)
cv2.imshow("Overlay image", final)
cv2.waitKey(0)
