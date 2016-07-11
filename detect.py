from PIL import Image

mockup = Image.open('mockup.png')
mockup.convert('RGBA')

def get_pixel_matrix(pixels, width, height):
    """
    Accepts an array of (R,G,B,A) tuples and an image width/height and returns
    a matrix in the form of:
    [
        [(R,G,B,A), (R,G,B,A), (R,G,B,A), (R,G,B,A), (R,G,B,A)...],
        [(R,G,B,A), (R,G,B,A), (R,G,B,A), (R,G,B,A), (R,G,B,A)...],
        [(R,G,B,A), (R,G,B,A), (R,G,B,A), (R,G,B,A), (R,G,B,A)...],
        [(R,G,B,A), (R,G,B,A), (R,G,B,A), (R,G,B,A), (R,G,B,A)...],
        ...
    ]
    such that pixel values at x,y coordinates can be obtained in the form of
    matrix[y][x]
    """
    return [pixels[i * width:(i + 1) * width] for i in xrange(height)]

# Data is in the form a single long array filled with tuples of (R,G,B,A) values
pixel_data = mockup.getdata()

pixel_matrix = get_pixel_matrix(pixel_data)
# top
for pixel in pixel_data:
#     if (pixel[3] == 0):
#         print(pixel)

# print(get_pixel_matrix([1,2,3,4,5,6,7,8], 4, 2))
