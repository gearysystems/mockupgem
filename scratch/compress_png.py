from PIL import Image
from PIL import ImageFilter
from PIL import ImagePalette
import cv2


cv2_image = cv2.imread('test1.png', cv2.IMREAD_UNCHANGED)
cv2.imwrite('test1_cv2.png', cv2_image)
image = Image.open('test1_cv2.png')
result = image.filter(ImageFilter.EDGE_ENHANCE)
result = result.convert('P', palette=Image.ADAPTIVE, colors=256)
result.save('test1_compressed.png')
