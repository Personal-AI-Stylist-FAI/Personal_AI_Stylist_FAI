import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

import sys
import urllib.request
import json
from keras.models import load_model
import cv2
import numpy as np

from sklearn.model_selection import train_test_split

from keras.models import load_model

import tensorflow as tf
import warnings
warnings.filterwarnings("ignore", category=np.VisibleDeprecationWarning) 

#pricemax = sys.argv[1]
#recommend_list = sys.argv[2]

#백한테 받아오는 코드
eng_clothes_crawling = sys.argv[2]
max_money = int(sys.argv[1])

eng_clothes_crawling_list = eng_clothes_crawling.split(',')

#print()


#색종류 15개
clothes_color_code_to_korean = {
    'red' : '빨간색', 'orange' : '주황색', 'yellow' : '노랑색','lightgreen' : '연두색',
    'green' : '초록색','skyblue' : '하늘색','navy' : '남색','gray' : '회색','black' : '검은색',
    'white' : '흰색','brown' : '갈색','purple' : '보라','pink' : '분홍','ivory' : '아이보리',
    'blue': '파란색'
}

#옷 종류 25개 : 
clothes_type_code_to_korean = {
    'a' : '민소매','b' : '반팔티셔츠','c' : '긴팔티셔츠','d' : '후드티','e' : '긴블라우스',
    'f' : '반팔블라우스','g' : '반바지','h' : '청바지','J_' : '조거팬츠','k' : '슬랙스',
    'I' : '롱스커트','n' : '정장스커트','m' : '미니스커트','o' : '롱원피스','p' : '숏원피스',
    'q' : '짧은점프슈트','r' : '긴점프슈트','s' : '코트','t' : '가디건','u' : '패딩',
    'v' : '자켓','w' : '셔츠','W_' : '체크셔츠','x' : '조끼','y' : '점퍼'
}

#한국말로 바꾼 검색 키워드
clothes_crawling = []
kor_color = ""
kor_type = ""
kor_cloth=""
# 백한테 받아오는 영어 코드 -> 한국어 키워드 변환
for eng_cloth in eng_clothes_crawling_list :
    if(eng_cloth[0] == 'W' or eng_cloth[0] == 'J') :
        kor_type = clothes_type_code_to_korean[eng_cloth[:2]]
        kor_color = clothes_color_code_to_korean[eng_cloth[2:]]
        kor_cloth = kor_color+kor_type
        clothes_crawling.append(kor_cloth)
    else :
        kor_type = clothes_type_code_to_korean[eng_cloth[:1]]
        kor_color = clothes_color_code_to_korean[eng_cloth[1:]]
        kor_cloth = kor_color+kor_type
        clothes_crawling.append(kor_cloth)



#네이버 크롤링
client_id = "MIP0qVzeQ3beop3S8SSN"
client_secret = "WxT79nEKLT"

crawling_result = []

#(한국어로 변환된)채우가 주는 키워드 8개에 대해서 반복
for cloth in clothes_crawling : 
    
    encText = urllib.parse.quote(cloth)
    display = "50"
    url = "https://openapi.naver.com/v1/search/shop?query=" + encText + "&display=" + display
    
    request = urllib.request.Request(url)
    request.add_header("X-Naver-Client-Id",client_id)
    request.add_header("X-Naver-Client-Secret",client_secret)

    response = urllib.request.urlopen(request)
    
    #검색 결과 string -> json
    resonse_json = json.loads(response.read().decode('utf-8'))
    #검색 결과 중 필요한 부분만 가지고오기(item과 관련된 부분)
    item_array_list = resonse_json['items']
    
    count = 0
    while(count <3) : 
        for find_correct_money in item_array_list : 

            temp = []
            if(count == 3) : break
            if(int(find_correct_money['lprice']) <= max_money) :
                temp.append(find_correct_money['link'])
                temp.append(find_correct_money['image'])
                temp.append(find_correct_money['lprice'])
                crawling_result.append(temp)
                count+= 1
            
#출력양식 :[] [이미지url1, 이미지src1, 이미지 가격1], [이미지url1, 이미지src1, 이미지 가격1] , [이미지url1, 이미지src1, 이미지 가격1] .., [이미지url1, 이미지src1, 이미지 가격1] ]           
print(crawling_result)
 


