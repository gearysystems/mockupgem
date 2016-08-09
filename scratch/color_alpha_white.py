import cv2
import numpy
from PIL import Image

# test_image = cv2.imread('iphone6_gold_minimal_straight.png', -1)

test_image = Image.open('iphone6_gold_minimal_straight.png')
back = Image.new('RGBA', (1200, 1200), (255, 255, 255))
back.paste(test_image, mask=test_image.split()[3])
back.show()
# back = Image.open('iphone6_gold_minimal_straight.png').convert('RGB')
# white_image = np.zeros((300, 300, 3), np.uint8)
# white_image[:] = (255, 255, 255)
# v2.addWeighted(white_image, alpha, test_image, 1 - alpha,0, output)
# red = test_image[:, :, 0]
# blue = test_image[:, :, 1]
# green = test_image[:, :, 2]
# alpha = test_image[:, :, 3]
# for x in alpha:
#     for y in x:
#         y = 255
# test = [x if x == 0 else 10 for x in alpha.flatten()]
# print(test)
# print(len(test))
# for i, value in enumerate(alpha):
#     for j, thing in enumerate(value):
#         if (thing == 0):
#             red[i][j] = 255
#             blue[i][j] = 255
#             green[i][j] = 255

# test = zip(red, blue, green, alpha)
# test = [(red[zipped[0]], blue[0], green[0], alpha) for zipped in enumerate(test)]
# print(test[0])
# index 0 is index
# index 1 is row of values
# test_1 = [i for i in enumerate(alpha)]
# index 0 is nested index
# index 1 is (outer index, row of values)
# test_2 = [i for i in enumerate(test_1)]
# print(test_2)[0]
# j[0] is a row number
# j[1] is a row of values
#
# test = [j for j in enumerate([i for i in enumerate(alpha)])]
# print(len(test))
# for item in test:
#     print(item)
    # red[item[0]][item[1]] = 255
    # blue[item[0]][item[1]] = 255
    # green[item[0]][item[1]] = 255
# test = [j[1][1][j[0]] for j in enumerate([i for i in enumerate(alpha)])]
# for item in test:
#     print(item)
#     break
# test = [item for item in numpy.ndenumerate(alpha)]
# for item in test:
#     red[item[0][0]][item[0][1]] = 255
#     blue[item[0][0]][item[0][1]] = 255
#     green[item[0][0]][item[0][1]] = 255
# test = [(i, j) for j in enumerate([i in range(len(alpha))])]
# print(test)

# for i in range(len(alpha)):
#     for x in range(len(alpha[i])):
#         if (alpha[x][i] == 0):
#             red[x][i] = 255
#             blue[x][i] = 255
#             green[x][i] = 255

# cv2.imwrite('alpha.jpg', test_image)
