import cv2

test_image = cv2.imread('test.png')
resized_image = cv2.resize(test_image, (450, 300))
cv2.imwrite('resized.jpg', resized_image)
