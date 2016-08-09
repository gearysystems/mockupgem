from PIL import Image
from PIL import ImageFilter
from PIL import ImagePalette



image = Image.open('test_big.png')
result = image.filter(ImageFilter.EDGE_ENHANCE)
result = result.convert('P', palette=Image.ADAPTIVE, colors=256)
result.save('test_big_compressed5.png')
