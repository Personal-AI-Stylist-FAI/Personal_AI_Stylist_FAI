from keras.models import load_model
import cv2
import numpy as np

import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
import warnings
warnings.filterwarnings("ignore", category=np.VisibleDeprecationWarning) 

import sys
file_path = sys.argv[1]


def Dataization(img_path):
    image_w = 64
    image_h = 64
    img2 = cv2.imread(img_path, cv2.IMREAD_COLOR)
    img2 = cv2.resize(img2, None, fx=image_w / img2.shape[1], fy=image_h / img2.shape[0])
    X2.append(img2 / 256)


# file_path = "C:\\node_workspace\\express-mysql-example\\public\\images\\0004-1655339655063.png"
categories = ["red", "orange", "yellow", "lightgreen",
              "green", "skyblue", "blue", "navy",
              "gray", "black", "white", "brown",
              "purple", "pink", "ivory"
              ]

X2 = []
Y2 = []

Dataization(file_path)
X2 = np.array(X2)
model = load_model('C:\\node_workspace\\express-mysql-example\\classifier\\Gersang.h5')
predict = np.argmax(model.predict(X2), axis=-1)
print(str(categories[predict[0]]))