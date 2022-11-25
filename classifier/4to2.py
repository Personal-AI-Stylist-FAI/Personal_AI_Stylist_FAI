import sys
import urllib.request
import json

#백한테 받아오는 코드
clothes_crawling = sys.argv[2]
max_money = int(sys.argv[1])
#max_money = max_money.sl

eng_clothes_crawling_list=clothes_crawling.split(',')

#네이버 크롤링
client_id = "MIP0qVzeQ3beop3S8SSN"
client_secret = "WxT79nEKLT"

crawling_result = []

#현지 언니가 주는 키워드 4개에 대해서 반복
for cloth in eng_clothes_crawling_list : 
    
    encText = urllib.parse.quote(cloth)
    display = "50"
    exclude= "{used}:{rental}:{cbshop}" 
    #sort="sim"
    url = "https://openapi.naver.com/v1/search/shop?query=" + encText + "&display=" + display + exclude #+ sort
    request = urllib.request.Request(url)
    request.add_header("X-Naver-Client-Id",client_id)
    request.add_header("X-Naver-Client-Secret",client_secret)

    response = urllib.request.urlopen(request)
    
    #검색 결과 string -> json
    resonse_json = json.loads(response.read().decode('utf-8'))
    #검색 결과 중 필요한 부분만 가지고오기(item과 관련된 부분)
    item_array_list = resonse_json['items']
    
    count = 0
    while(count <2) : 
        for find_correct_money in item_array_list : 

            temp = []
            if(count == 2) : break
            if(int(find_correct_money['lprice']) <= max_money) : 
                temp.append(find_correct_money['link'])
                temp.append(find_correct_money['image'])
                temp.append(find_correct_money['lprice'])
                crawling_result.append(temp)
                count+= 1
            
#출력양식 :[] [이미지url1, 이미지src1, 이미지 가격1], [이미지url1, 이미지src1, 이미지 가격1] , [이미지url1, 이미지src1, 이미지 가격1] .., [이미지url1, 이미지src1, 이미지 가격1] ]           
print(crawling_result)
    

