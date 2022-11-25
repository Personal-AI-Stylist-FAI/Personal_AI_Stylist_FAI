from keras.models import load_model
import cv2
import numpy as np

import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
import warnings
warnings.filterwarnings("ignore", category=np.VisibleDeprecationWarning) 

import sys
pricemax = sys.argv[1]
ecommend_list = sys.argv[2]
# print(ecommend_list)
pricemax=int(pricemax)
print(type(pricemax))


list = ecommend_list.split(',')
#print(type(list))
#print(list)
#print(list[0])


'''
import urllib.request
client_id = "MIP0qVzeQ3beop3S8SSN"
client_secret = "WxT79nEKLT"

encText = urllib.parse.quote("청바지")
display = "10"

url = "https://openapi.naver.com/v1/search/shop?query=" + encText + "&display=" + display
            
request = urllib.request.Request(url)
request.add_header("X-Naver-Client-Id",client_id)
request.add_header("X-Naver-Client-Secret",client_secret)
import json
response = urllib.request.urlopen(request)
r_object = json.loads(response.read().decode('utf-8'))
items = r_object['items']

print(items[0])
item = []
final_list = []


for i in range(len(items)):
    if items[i]['lprice']<=pricemax:
        item.append(items[i]['link'])
        item.append(items[i]['image'])
        item.append(items[i]['lprice'])
        
    final_list.append(item)
    item = []
            
print(final_list)

'''