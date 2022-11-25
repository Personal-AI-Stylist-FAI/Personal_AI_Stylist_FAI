import urllib.request

client_id = "MIP0qVzeQ3beop3S8SSN"
client_secret = "WxT79nEKLT"

encText = urllib.parse.quote("청바지")
display = "10"

url = "https://openapi.naver.com/v1/search/shop?query=" + encText + "&display=" + display
            
request = urllib.request.Request(url)
request.add_header("X-Naver-Client-Id",client_id)
request.add_header("X-Naver-Client-Secret",client_secret)

response = urllib.request.urlopen(request)
            
print(response.read().decode('utf-8'))