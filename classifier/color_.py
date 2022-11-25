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
#file_path = sys.argv[1]

import warnings
warnings.filterwarnings("ignore", category=np.VisibleDeprecationWarning) 


import shutil
from numpy import argmax

app = Flask(__name__)
api = Api(app)
app.config['DEBUG'] = True

group_folder_path = ".\\color_categories\\"
categories = ["red", "orange", "yellow", "lightgreen",
              "green", "skyblue", "blue", "navy",
              "gray", "black", "white", "brown",
              "purple", "pink", "ivory"
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
            print(image_dir + filename)
            img = cv2.imread(image_dir + filename, cv2.IMREAD_COLOR)
            img = cv2.resize(img, None, fx=image_w / img.shape[1], fy=image_h / img.shape[0])
            X.append(img / 256)
            Y.append(label)

X = np.array(X)
Y = np.array(Y)

X_train, X_test, Y_train, Y_test = train_test_split(X, Y)
xy = (X_train, X_test, Y_train, Y_test)

np.save("C:\\node_workspace\\express-mysql-example\\classifier\\img_data.npy", xy)


import shutil
from numpy import argmax
from keras.models import load_model


def Dataization(img_path):
    image_w = 64
    image_h = 64
    img2 = cv2.imread(img_path)
    img2 = cv2.resize(img2, None, fx=image_w / img2.shape[1], fy=image_h / img2.shape[0])
    return (img2 / 256)


src = []
name = []
test = []

X2 = []
Y2 = []

'''
X2.append(Dataization(file_path))
X2 = np.array(X2)
model = load_model('C:\\node_workspace\\express-mysql-example\\classifier\\Gersang.h5')
predict = np.argmax(model.predict(X2), axis=-1)
print(str(categories[predict[0]]))
'''

