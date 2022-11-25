import os
import cv2
import numpy as np
from sklearn.model_selection import train_test_split
import tensorflow as tf


X_train, X_test, Y_train, Y_test = np.load('./img_data2.npy', allow_pickle=True)

X_train = X_train.reshape((X_train.shape[0], 64, 64, 3))
X_test = X_test.reshape((X_test.shape[0], 64, 64, 3))

model = tf.keras.Sequential([
    tf.keras.layers.Conv2D(32, (3, 3), padding="same", activation='relu', input_shape=(64, 64, 3)),
    tf.keras.layers.Conv2D(64, (3, 3), activation='relu'),
    # tf.keras.layers.Conv2D(64, (3, 3), activation='relu'),
    # tf.keras.layers.Dense(128, input_shape=(28, 28), activation="relu"),
    tf.keras.layers.MaxPooling2D((2, 2)),
    tf.keras.layers.Dropout(0.2),  # 노드중 20% 제거(가장 쉬운 오버피팅 해결 방법)
    tf.keras.layers.Conv2D(128, (3, 3), padding="same", activation='relu'),
    tf.keras.layers.MaxPooling2D((2, 2)),  # (2,2)가 pooling 크기
    tf.keras.layers.Flatten(),
    tf.keras.layers.Dense(128, activation="relu"),
    tf.keras.layers.Dropout(0.2),
    tf.keras.layers.Dense(26, activation="softmax"),
])

model.summary()  # 모델 아웃라인 출력 (트레이닝하기 전 -> 이거 출력하려면 input_shape 추가해줘야함)

# img_data.npy가 원핫인코딩 방식인듯 ㅇㅇ
# [1, 0, 0] [0, 1, 0] [0, 0, 1]
model.compile(loss="categorical_crossentropy", optimizer="adam", metrics=['accuracy'])
model.fit(X_train, Y_train, validation_data=(X_test, Y_test), epochs=15)

model.save('Gersang2.h5')
score = model.evaluate(X_train, Y_train)
print(score)