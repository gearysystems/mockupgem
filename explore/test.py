from skimage import morphology
import cv2
import numpy as np
import sys


def get_image():
    size = (w, h) = (100, 100)
    img = np.zeros(size, np.uint8)
    cv2.rectangle(img, (10, 10), (19, 19), (128), -1)
    cv2.rectangle(img, (30, 20), (39, 39), (128), -1)
    cv2.rectangle(img, (40, 30), (49, 49), (128), -1)
    cv2.rectangle(img, (50, 70), (89, 79), (128), -1)
    return img


def show_image(img):
    cv2.imshow('result', img), cv2.waitKey(0)


if __name__ == '__main__':
    img = get_image()
    show_image(img)

    labels = morphology.label(img, background=0)
    label_number = 0
    while True:
        temp = np.uint8(labels==label_number) * 255
        if not cv2.countNonZero(temp):
            break
        show_image(temp)
        label_number += 1

    cv2.destroyAllWindows()
