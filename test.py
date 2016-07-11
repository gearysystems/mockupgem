import numpy
import matfunc as mt
from PIL import Image

background_image = Image.open('background.jpeg')
overlay_image = Image.open('foreground.png')
background_thumbnail = background_image.thumbnail((400, 400))
overlay_thumbnail = overlay_image.thumbnail((180, 200))

new_image = Image.new('RGB', (400, 400))

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

new_coefficients = find_transform_coefficients(
    [(0,0),(180,0),(180,200),(0,200)],
    [(-20,0),(160,0),(180,200),(0,200)]
)
print(new_coefficients)
overlay_image = overlay_image.transform(
    (180, 200),
    Image.AFFINE,
    data=new_coefficients
)
overlay_image.show()
# new_image.paste(background_image, (0, 0))
# new_image.paste(overlay_image, (90,54))
# new_image.show()
