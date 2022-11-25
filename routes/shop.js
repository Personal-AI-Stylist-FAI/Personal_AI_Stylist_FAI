const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const Preference = require('C:/node_workspace/express-mysql-example/models/preference.js');
const {sequelize} = require('C:/node_workspace/express-mysql-example/models');
const { isLoggedIn, isNotLoggedIn, calendarRecommend } = require('./middlewares');
const { Schedule, User, Codi_image} = require('../models');


// ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ //
router.get('/', isLoggedIn, (req, res) =>{
    res.render("shop.html")
});



// 추천 클래스 2차원 배열, RecommendationLevel_per_Class[26][11]
const RecommendationLevel_per_Class = new Array(25);
for (var i=0; i<RecommendationLevel_per_Class.length; i++){
  RecommendationLevel_per_Class[i] = new Array(15);
}

const ClassName = new Array(25);
for (var i=0; i<ClassName.length; i++){
  ClassName[i] = new Array(15);
}

async function Calculate_RecommendationLevel(PresentUserId, n){
  // 취향정보 값 조회
  var preferred = await Preference.findAll({
    raw: true, // 다른 정보 제외하고 dataValues만 받아오게끔
    attributes: ['preferred_type', 'preferred_color'],
    where: {userid: PresentUserId}});

  //  const prefer = JSON.parse(preferred)
  var prefer = JSON.parse(JSON.stringify(preferred))

  // 취향정보 테이블에서 해당 의류에 대한 취향점수 조회
 let num_type = Object.keys(prefer[0].preferred_type).length
 let num_color = Object.keys(prefer[0].preferred_color).length

 //console.log(Object.keys(prefer[0].preferred_type)[0])

// 이중 for문으로 375(25x15)개 클래스에 대한 추천도 배열 채우기
for (let i=0; i< num_type; i++){
  key = Object.keys(prefer[0].preferred_type)[i]
  level_type = parseInt(prefer[0].preferred_type[key])
  for (let j=0; j< num_color; j++){
    key2 = Object.keys(prefer[0].preferred_color)[j]
    level_color = parseInt(prefer[0].preferred_color[key2])
    RecommendationLevel_per_Class[i][j] = level_type*level_color
    ClassName[i][j] = key+key2

  }
}

//console.log(ClassName)
//console.log(RecommendationLevel_per_Class.sort())

// UI 상에서 한 줄에 추천되는 항목 개수는 6개
// 6x4=24, 즉 48 크기의 배열 필요
recommend_list = new Array(48);
num_80percent = Math.floor(48*0.8) // => 38개
num_rest = 48-num_80percent
frontier_list = new Array(num_80percent);
const ex = [];

//console.log(frontier_list)
max_level = 0;

// 일단 정렬 먼저
// 2차원 배열 -> 1차원 배열 전환
const RecommendationLevel_per_Class2 = RecommendationLevel_per_Class.reduce(function (acc, cur){
  return acc.concat(cur);
})

// 1차원 배열 추천도 순으로 내림차순 정렬
RecommendationLevel_per_Class2.sort(function(a, b)  {
  return b - a;
}); 
//console.log(RecommendationLevel_per_Class2)

// 배열 중복제거
const set = new Set(RecommendationLevel_per_Class2)
const RecommendationLevel_per_Class3 = [...set]


// 해당 1차원 배열 돌면서 frontier_list 다 채울 때까지 RecommendationLevel_per_Class 에서 해당값의 위치 추출
for (let i=0; i< num_80percent; i++){
  for (let a=0; a<RecommendationLevel_per_Class.length; a++ ){
    for (let b=0; b<ClassName.length; b++){
      if(RecommendationLevel_per_Class3[i] == RecommendationLevel_per_Class[a][b]) {
        ex.push(ClassName[a][b])
    }
  }
}
}

frontier_list = ex.slice(0, num_80percent)
//console.log(frontier_list)
end_list =[];
// 나머지 2할은 모든 요소에서 random하게 선택
const ClassName2 = ClassName.reduce(function (acc, cur){
  return acc.concat(cur);
})
for (var i=0; i< num_rest; i++){
  const random = Math.floor(Math.random()*ClassName2.length);
  end_list[i] = ClassName2[random]
}


// 최종 완성된 recommend_list 를 front에 전달
final_recommend_list =[];
recommend_list = frontier_list.concat(end_list);
//console.log(recommend_list)
for (var i=0; i< 24; i++){
  const random = Math.floor(Math.random()*24);
  final_recommend_list[i] = recommend_list[random]
}

//console.log(final_recommend_list)
if (n==1){
  return final_recommend_list;
}else{
  return frontier_list;

}


// 관건 => 추천도리스트를 얼마만에 계속 갱신할것인가
// 쇼핑주기와 별개로, 추천되는 항목에 다양성이 필요할 것 같기도..
// 쇼핑주기가 만약 1주라면? => 7일마다 새로운 항목으로 갱신

// recommend_list 바탕으로 mycloset에서 해당 클래스의 의류정보 받아옴
// 마이클로젯 기반의 추천리스트 front에 전달



}



async function getpricemax(PresentUserId){
  const price_max= await Preference.findAll({
    raw: true,
    attributes: ['price_max'], 
    where: {userid: PresentUserId}});
  const a = price_max[0].price_max
  pricemax = 0
  switch(a){
    case '1':
      pricemax = 10000;
      break;
    case '2':
      pricemax = 30000;
      break;
    case '3':
      pricemax = 50000;
      break;
    case '4':
      pricemax = 100000;
      break;
    case '5':
      pricemax = 1000000000;
      break;
  }
  return pricemax
}


const PythonShell = require('python-shell');
function GettingCrawling(pricemax, recommend_list){
  var options = {
    mode: 'text',
    //pythonPath: '',
    pythonOptions: ['-u'],
    //scriptPath: '',
    args: [pricemax, recommend_list]
  }

return new Promise(function(resolve, reject) {
PythonShell.PythonShell.run('C:/node_workspace/express-mysql-example/classifier/8to24.py', options, function A (err, results) {
    if (err) throw err;
    resolve(results);
  });
} )
}




// 프론트에서 이 주소로 ajax 요청 보내면 될듯
// 프론트 서버에 사용자 가격한도와 추천리스트를 전송하는 url
router.get('/recommendationlist', isLoggedIn, async (req, res) =>{
  const user = await User.findOne({where :{id: req.user.id}});
    const loginedUserId = req.user.id;
    const PresentUserId = loginedUserId
    const pricemax = await getpricemax(PresentUserId)
    recommend_list = await Calculate_RecommendationLevel(PresentUserId, 1)
    recommend_list = recommend_list.slice(0, 8)
    crawlingresult = await GettingCrawling(pricemax, recommend_list)
    //console.log(crawlingresult)
    // url, image, price
    urls = [];
    images = [];
    prices = [];
    items = [];

    crawlingresult = crawlingresult[0].split(',')
    //console.log(crawlingresult)

    crawlingresult.forEach((value, index) =>{
      if (index%3==0){
        if (index==0){
          value = value.replace('[[', ' ');
          items.push(value)
        }
        else{
          value = value.replace('[', '');
         items.push(value)
        }
      }
      if (index%3==1){
        items.push(value)
      } 
      if (index%3==2){
        if (index==71){
          value = value.replace(']]', '');
          value = value.replace(' ', '');
          items.push(value)
        }
        else{
          value = value.replace(']', '');
          value = value.replace(' ', '');
          items.push(value)
        }
      }
    })
    var result = [];
for(i=0; i<items.length; i+=3){
  result.push(items.slice(i, i+3))
}
var final_data = [];
//console.log(result)
console.log(result)

for (var i=0; i<result.length; i++){
  a = result[i]
  final_data.push({
    "url": a[0].slice(2, -1),
    "imageurl": a[1].slice(2, -1),
    "price": a[2].slice(1, -1)
})
}

res.send(final_data)
});

const mysql = require('mysql');
const dbconfigg = require('C:/node_workspace/express-mysql-example/config/database.js');
const { url } = require('inspector');
const connection = mysql.createConnection(dbconfigg);

// 프론트에서 이 주소로 ajax 요청 보내면 될듯
// 프론트 서버에 마이클로젯 기반 추천리스트 전송하는 URL
// 취향기반 추천리스트와 마이클로젯에 등록된 의류를 비교하여
// 추천클래스 리스트에 해당하는 마이클로젯 의류가 있을 경우 추천리스트에 포함
// ImageId를 통해 사용자가 등록한 해당 이미지의 경로를 전송
// 마이클로젯에서 추천도리스트에 맞는 의류가 있는지 찾기
router.get('/findfrommycloset', isLoggedIn, async (req, res) =>{
    const user = await User.findOne({where :{id: req.user.id}});
    const loginedUserId = req.user.id;
    const PresentUserId = loginedUserId
    const sql = "SELECT class, ImageId FROM images where UserId="+PresentUserId
    await connection.query(sql, async function(err, result){
        Classes = [];
        ImageId = [];
        for (var i=0; i<result.length; i++){
          Classes[i] = result[i].class
          ImageId[i] = result[i].ImageId
        }
        const recommend_list = await Calculate_RecommendationLevel(PresentUserId, 2) // 추천도 리스트 받아오기 (24개 클래스)
        RecommendImageId = []; // 마이클로젯 기반으로 최종 추천할 리스트
        for (var i=0; i<recommend_list.length; i++){ // 24
          for (var j=0; j<Classes.length; j++){ // 가변적
            if (recommend_list[i] == Classes[j]){ //24개와 사용자 등록 클래스를 일일이 비교 => 일치했다?
              RecommendImageId.push(ImageId[j]) // 추천 리스트에 추가
            }
          }
        }
        const set = new Set(RecommendImageId)
        const rI = [...set]; // RecommendImageId의 중복 제거
        
        console.log(recommend_list)
        console.log(Classes)
        console.log(rI)
        myclosetlist = [];
        const sql = "SELECT image FROM images where ImageId IN ("+rI+")"
          connection.query(sql, async function(err, result){
           // myclosetlist = [];
            myclosetlist.push(result)
            res.send(myclosetlist)
          })
    })
  });

module.exports = router;