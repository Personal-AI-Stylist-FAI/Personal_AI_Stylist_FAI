import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
from flask import Flask, jsonify, request

# restAPI 구성
from flask_restx import Resource, Api, reqparse

import cv2
import numpy as np
from sklearn.model_selection import train_test_split
import tensorflow as tf

from keras.models import load_model
import sys
file_path = sys.argv[1]

import warnings
warnings.filterwarnings("ignore", category=np.VisibleDeprecationWarning) 


import shutil
from numpy import argmax

app = Flask(__name__)
api = Api(app)
app.config['DEBUG'] = True


group_folder_path = "C:\\node_workspace\\express-mysql-example\\classifier\\fashion_categories2\\"
categories = ["a", "b", "c", "d",
              "e", "f", "g", "h",
              "J_", "j", "k", "l",
              "m", "n", "o", "p",
              "q", "r", "s", "t",
              "u", "v", "w", "W_", "x", "y"
              ]

num_classes = len(categories)

image_w = 64
image_h = 64

X = []
Y = []

for idex, categorie in enumerate(categories):
    label = [0 for i in range(num_classes)]
    label[idex] = 1
    image_dir = group_folder_path + categorie + '\\'

    for top, dir, f in os.walk(image_dir):
        for filename in f:
            #print(image_dir + filename)
            img = cv2.imread(image_dir + filename, cv2.IMREAD_COLOR)
            img = cv2.resize(img, None, fx=image_w / img.shape[1], fy=image_h / img.shape[0])
            X.append(img / 256)
            Y.append(label)

X = np.array(X)
Y = np.array(Y)

X_train, X_test, Y_train, Y_test = train_test_split(X, Y, test_size=0.33)
xy = (X_train, X_test, Y_train, Y_test)

np.save("C:\\node_workspace\\express-mysql-example\\classifier\\img_data2.npy", xy)



import shutil
from numpy import argmax
from keras.models import load_model


def Dataization(img_path):
    image_w = 64
    image_h = 64
    img2 = cv2.imread(img_path)
    img2 = cv2.resize(img2, None, fx=image_w / img2.shape[1], fy=image_h / img2.shape[0])
    return (img2 / 256)

#---------------------------------------------------------------------#
#sys.argv의 0번째 값은 실행 스크립트의 경로이므로 1번째 값이 arg1이다
#node.js에서 넘겨준 파일 경로명 argv[1]를 file_path에 저장
#import sys
#file_path = sys.argv[1]
#file_path = '.\\'+'.\\public\\images\\0001-1655315050768.png'
#file_path = "C:\\node_workspace\\express-mysql-example\\public\\images\\0004-1655339655063.png"

#---------------------------------------------------------------------#

src = []
name = []
test = []

X2 = []
Y2 = []

'''
image_dir = "C:\\Users\\emily\\Pictures\\learning_clothes\\clothes\\"
for file in os.listdir(image_dir):
    if (file.find('.png')):
        src.append(image_dir + file)
        name.append(file)
        test.append(Dataization(image_dir + file))

test = np.array(test)
model = load_model('Gersang2.h5')
predict = np.argmax(model.predict(test), axis=-1)

for i in range(len(test)):
    print(name[i] + ":, Predict: " + str(categories[predict[i]]))
'''
X2 = []
Y2 = []

X2.append(Dataization(file_path))
X2 = np.array(X2)
model = load_model('C:\\node_workspace\\express-mysql-example\\classifier\\Gersang2.h5')
predict = np.argmax(model.predict(X2), axis=-1)
print(str(categories[predict[0]]))