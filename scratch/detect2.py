import cv2
from PIL import Image
import numpy

def find_transform_coefficients(pa, pb):
    """Return the coefficients required for a transform from start_points to end_points.

    args:
        start_points -> Tuple of 4 values for start coordinates
        end_points --> Tuple of 4 values for end coordinates

    http://stackoverflow.com/questions/14177744/how-does-perspective-transformation-work-in-pil
    """
    matrix = []
    for p1, p2 in zip(pa, pb):
        matrix.append([p1[0], p1[1], 1, 0, 0, 0, -p2[0]*p1[0], -p2[0]*p1[1]])
        matrix.append([0, 0, 0, p1[0], p1[1], 1, -p2[1]*p1[0], -p2[1]*p1[1]])

    A = numpy.matrix(matrix, dtype=numpy.float)
    B = numpy.array(pb).reshape(8)

    res = numpy.dot(numpy.linalg.inv(A.T * A) * A.T, B)
    return numpy.array(res).reshape(8)

image = cv2.imread('mockup3.png')
background_height, background_width = image.shape[:2]

# image = cv2.resize(image, (400, 400))
background_image = Image.open('mockup3.png')

overlay_image = Image.open('123.png')
overlay_image.convert('RGBA')
# overlay_image = overlay_image.resize((background_width, background_height))

overlay_width, overlay_height = overlay_image.size
# overlay_image.thumbnail((180, 200))

edged = cv2.Canny(image, 30, 200)
# cv2.imshow('image', edged)
# cv2.waitKey()

(cnts, _) = cv2.findContours(edged.copy(), cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
cnts = sorted(cnts, key = cv2.contourArea, reverse = True)[:10]
screenCnt = None

for cnt in cnts:
    peri = cv2.arcLength(cnt, True)
    approx = cv2.approxPolyDP(cnt, 0.02 * peri, True)

    # if our approximated contour has four points, then
    # we can assume that we have found our screen
    if len(approx) == 4:
    	screenCnt = approx
    	break

rectCoords = [x[0].tolist() for x in screenCnt]
print(rectCoords)
# for x in screenCnt:
#     print(x[0])
# rect = cv2.minAreaRect(cnt)
# centerCoords, dimensionCoords, rotation = rect
# rect_width, rect_height = dimensionCoords
# rect_center_x, rect_center_y = centerCoords[0], centerCoords[1]
# boxCoords = cv2.cv.BoxPoints(rect)
# print(width, height, rotation)

# boxCoords = list(boxCoords)
# boxCoords[1], boxCoords[2] = boxCoords[2], boxCoords[1]
# boxCoords = tuple(boxCoords)
new_coefficients = find_transform_coefficients(
    [(0,0),(overlay_width,0),(overlay_width, overlay_height),(0, overlay_height)],
    # TODO: omg fix this
    rectCoords,
)
# print(rect_width)
# print(rect_height)
# overlay_image.resize((rect_width, rect_height))
overlay_image.show()
overlay_image = overlay_image.transform(
    (overlay_width, overlay_height),
    Image.AFFINE,
    data=new_coefficients
)
# overlay_image = overlay_image.rotate(rotation)
# overlay_image = overlay_image.resize((2000, 2000))
overlay_image.show()

# new_overlay_image = Image.new('RGB', (background_width, background_height))
# overlay_image.show()
# new_overlay_image.paste(overlay_image, (0, 0))
# new_overlay_image.show()
# new_image = Image.new('RGBA', (background_width, background_height))
# new_image.paste(background_image, (0, 0))
# overlay_image.show()
# new_image.paste(overlay_image, (0,0))
# new_image.paste(new_overlay_image, (0,0))
# Image.alpha_composite(new_image, new_overlay_image)
# new_image.show()
# new_overlay_image.show()

# print(screenCnt)
# cv2.drawContours(image, [screenCnt], -1, (0, 255, 0), 3)
# cv2.drawContours(image, [numpy.int0(boxCoords)], 0, (0, 255, 0), 2)
# cv2.imshow("Game Boy Screen", image)
# cv2.waitKey(0)
