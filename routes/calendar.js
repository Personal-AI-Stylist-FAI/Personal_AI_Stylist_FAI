const express = require('express');
const path = require('path');
const fs = require('fs');
const multer=require('multer');
const sequelize = require("sequelize");
const Op = sequelize.Op;

const { isLoggedIn, isNotLoggedIn} = require('./middlewares');
const { Schedule, User, Codi_image, Preference} = require('../models');

const mysql = require('mysql');
const dbconfigg = require('C:/node_workspace/express-mysql-example/config/database.js');
const connection = mysql.createConnection(dbconfigg);

const router = express.Router();

//------------------------------------------------------------------------------------------이미지넣는부분

var storage2 = multer.diskStorage({ //같은 폴더안에 저장해달라는 의미.

    destination : function(req, file, cb){ //업로드한 이미지를 어디에 저장해달라고 정한것. 
      cb(null, 'public/images/calendar')
    },
    filename : function(req, file, cb){ //이미지폴더에 저장할때 저장일+파일 원래이름으로 저장
      cb(null,Date.now()+"-"+file.originalname )
    }
  
  });

var upload2 = multer({
    storage: storage2,
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        if(ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
            return callback(new Error('PNG, JPG만 업로드하세요'))
        }
        callback(null, true)
    }
});



//---------------------------------------------------------------------------------프런트에 추천목록&가격한도보낼 함수


// 추천 클래스 2차원 배열, RecommendationLevel_per_Class[26][11]
const RecommendationLevel_per_Class = new Array(25);
for (var i=0; i<RecommendationLevel_per_Class.length; i++){
  RecommendationLevel_per_Class[i] = new Array(15);
}

const ClassName = new Array(25);
for (var i=0; i<ClassName.length; i++){
  ClassName[i] = new Array(15);
}

async function Calculate_RecommendationLevel(PresentUserId){
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
//console.log(RecommendationLevel_per_Class3)


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
return final_recommend_list;


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
  //console.log(pricemax)
  return pricemax
}



const PythonShell =require( 'python-shell' );
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

function GettingCrawling1(pricemax, recommend_list){
  var options = {
    mode: 'text',
    //pythonPath: '',
    pythonOptions: ['-u'],
    //scriptPath: '',
    args: [pricemax, recommend_list]
  }

return new Promise(function(resolve, reject) {
PythonShell.PythonShell.run('C:/node_workspace/express-mysql-example/classifier/4to2.py', options, function A (err, results) {
    if (err) throw err;
    resolve(results);
  });
} )
}


//-----------------------------------------------------------------------------------------------------//그냥 캘린더
router.get('/', isLoggedIn, async (req, res,next)=> { 
    
    res.render('calendar.html');
  });
//--------------------------------------------------------------------------- 1. 전체 일정목록(일정종류-날짜) 
router.get('/getSchedule', isLoggedIn, async (req, res,next)=> { 
 
  const user = await User.findOne({where :{id: req.user.id}});
  //로그인한 유저의 스케줄목록
  const sched=await user.getSchedules({
    raw:true,
    attributes:['schedule_type','date'],
  }
  );
  res.send(sched);
});
//------------------------------------------------------------------- 2. 전체 이미지목록(이미지경로-날짜) 
router.get('/getCody', isLoggedIn, async (req, res,next)=> { 
  //로그인한 유저의 코디목록
  const user = await User.findOne({where :{id: req.user.id}});
  const codi=await user.getCodi_images({
    raw:true,
    attributes:['image_path','date'],
  }
  );
  //var codis = JSON.parse(JSON.stringify(codi));
  //console.log(codis);
  res.send(codi);
});

//--------------------------------------------------------------------------------- 3. 최근접미래 일정종류만
router.get('/getRecentSchedule', isLoggedIn, async (req, res,next)=> { 
  //로그인한 유저가 등록한 일정중 가장 근접한 미래에 대한 일정
  const user = await User.findOne({where :{id: req.user.id}});
  const today_date=new Date();
  const nearestSched=await user.getSchedules({
    raw:true,
    attributes:['schedule_type'],
    where:{ date: {[Op.gte]: today_date}},
    order:[['date','ASC']],
    limit:1,
  });
  //var nearestScheds = JSON.parse(JSON.stringify(nearestSched));
  //console.log(nearestScheds);
  res.send(nearestSched);
});
//--------------------------------------------------------------------------------------------5. 크롤링 추천
  router.get('/getScheduleCrawling', isLoggedIn, async (req, res,next)=> {  
    const today_date=new Date();
    const user = await User.findOne({where :{id: req.user.id}});
    const loginedUserId=req.user.id;
    const pricemax = await getpricemax(loginedUserId)

    const ScheduleDate4Recommend= await user.getSchedules({
      raw:true,
      attributes:['date'],
      where:{ date: {[Op.gte]: today_date}},
      order:[['date','ASC']],
      limit:1,
    });

    const ScheduleType4Recommend= await user.getSchedules({
      raw:true,
      attributes:['schedule_type'],
      where:{ date: {[Op.gte]: today_date}},
      order:[['date','ASC']],
      limit:1,
    });

    if(ScheduleDate4Recommend[0]==null && ScheduleType4Recommend[0]==null){
      var result_list={
        price_max: null,
        scheduletype: null,
        img: null,
      };
      console.log(ScheduleType4Recommend);
      console.log(ScheduleDate4Recommend);
      //result_list.push(result);
      res.send(result_list);
    }else{
    var ScheduleDate4Recommends = JSON.parse(JSON.stringify(ScheduleDate4Recommend));
    var ScheduleDate4Recommends1 = Object.values(ScheduleDate4Recommends[0])[0];
    var ScheduleDate4Recommends2 = new Date(ScheduleDate4Recommends1);
    var monthh=ScheduleDate4Recommends2.getMonth()+1;

    console.log(ScheduleType4Recommend[0]);
    console.log(ScheduleDate4Recommends);

    var ScheduleType4Recommends = JSON.parse(JSON.stringify(ScheduleType4Recommend));
    var ScheduleType4Recommends1 =  Object.values(ScheduleType4Recommends[0])[0];

    //-----------------------------------장례식
    var arr_top_hot=['검정 반팔티셔츠','검정 긴티셔츠','검정 긴블라우스','검정 반팔블라우스','검정 셔츠'];//장례식 겨울제외(봄,여름,가을)
    var arr_top_cold=['검정 긴티셔츠','검정 긴블라우스','검정 셔츠'];//장례식 겨울
    var arr_bottom=['검정 슬랙스','검정 정장치마'];//계절상관없이
    var arr_outer_spring=['검정 가디건','검정 자켓','검정코트']//장례식 나머지 계절 아우터 (여름제외)
    var arr_outer_hot=['검정 여름 가디건','검정 린넨 자켓']//장례식 여름에만
    

    //봄상의
    var funeral_spring_top=['검정 반팔티셔츠','검정 긴티셔츠','검정 긴블라우스','검정 반팔블라우스','검정 셔츠'];
    //봄하의
    var funeral_spring_bottom=['검정 슬랙스','검정 정장치마'];
    //봄아우터
    var funeral_spring_outer=['검정 가디건','검정 자켓','검정코트'];
    var f_spring_r=[];

    //여름상의
    var funeral_summer_top=['검정 반팔티셔츠','검정 긴티셔츠','검정 긴블라우스','검정 반팔블라우스','검정 셔츠'];
    //여름하의
    var funeral_summer_bottom=['검정 슬랙스','검정 정장치마'];
    //여름아우터
    var funeral_summer_outer=['검정 여름 가디건','검정 린넨 자켓'] //장례식 여름에만
    var f_summer_r=[];

    //가을상의
    var funeral_fall_top=['검정 반팔티셔츠','검정 긴티셔츠','검정 긴블라우스','검정 반팔블라우스','검정 셔츠'];
    //가을하의
    var funeral_fall_bottom=['검정 슬랙스','검정 정장치마'];
    //가을아우터
    var funeral_fall_outer=['검정 가디건','검정 자켓','검정코트'];
    var f_fall_r=[];

    //겨울상의
    var funeral_winter_top=['검정 긴티셔츠','검정 긴블라우스','검정 셔츠'];
    //겨울하의
    var funeral_winter_bottom=['검정 슬랙스','검정 정장치마'];
    //겨울아우터
    var funeral_winter_outer=['검정 가디건','검정 자켓','검정코트'];
    var f_winter_r=[];


//------------------------------------업무: 
    //옷종류: 자켓, 셔츠, 블라우스, 슬랙스, 정장치마, 반팔티셔츠, 긴티셔츠, 긴블라우스, 반팔블라우스
    //색상: 흰, 남, 회, 검, 갈, 아이보리
    var work_top_hot=[" 셔츠",  " 반팔티셔츠", " 긴티셔츠", " 긴블라우스", " 반팔블라우스"]; //업무 겨울제외
    var work_top_cold=[" 셔츠", " 긴티셔츠", " 긴블라우스"]; //업무 겨울
    var work_bottom=[" 슬랙스", " 정장치마"];//항상
    var work_outer_hot=[" 린넨 자켓"];//업무 아우터 여름
    var work_type_outer=[" 자켓"];//업무 아우터 여름제외
    var work_color=["화이트", "네이비", "그레이", "블랙", "브라운", "아이보리"]; //색상
    
//봄상의
var work_spring_top=[];
//봄하의
var work_spring_bottom=[];
//봄아우터
var work_spring_outer=[];
var w_spring_r=[];

for(i=0;i<work_color.length;i++){
  for(j=0;j<work_top_hot.length;j++){
    var re=work_color[i] + work_top_hot[j];
    work_spring_top.push(re);
  }
}
for(i=0;i<work_color.length;i++){
  for(j=0;j<work_bottom.length;j++){
    var re=work_color[i] + work_bottom[j];
    work_spring_bottom.push(re);
  }
}
for(i=0;i<work_color.length;i++){
  for(j=0; j<work_type_outer.length;j++){
    var re=work_color[i] + work_type_outer[j];
    work_spring_outer.push(re);
  }
}



//여름상의
var work_summer_top=[];
//여름하의
var work_summer_bottom=[];
//여름아우터
var work_summer_outer=[]//장례식 여름에만
var w_summer_r=[];


for(i=0;i<work_color.length;i++){
  for(j=0;j<work_top_hot.length;j++){
    var re=work_color[i] + work_top_hot[j];
    work_summer_top.push(re);
  }
}
for(i=0;i<work_color.length;i++){
  for(j=0;j<work_bottom.length;j++){
    var re=work_color[i] + work_bottom[j];
    work_summer_bottom.push(re);
  }
}
for(i=0;i<work_color.length;i++){
  for(j=0;j<work_outer_hot.length;j++){
    var re=work_color[i] + work_outer_hot[j];
    work_summer_outer.push(re);
  }
}

//가을상의
var work_fall_top=[];
//가을하의
var work_fall_bottom=[];
//가을아우터
var work_fall_outer=[];
var w_fall_r=[];


for(i=0;i<work_color.length;i++){
  for(j=0;j<work_top_hot.length;j++){
    var re=work_color[i] + work_top_hot[j];
    work_fall_top.push(re);
  }
}
for(i=0;i<work_color.length;i++){
  for(j=0;j<work_bottom.length;j++){
    var re=work_color[i] + work_bottom[j];
    work_fall_bottom.push(re);
  }
}
for(i=0;i<work_color.length;i++){
  for(j=0;j<work_type_outer.length;j++){
    var re=work_color[i] + work_type_outer[j];
    work_fall_outer.push(re);
  }
}

//겨울상의
var work_winter_top=[];
//겨울하의
var work_winter_bottom=[];
//겨울아우터
var work_winter_outer=[];
var w_winter_r=[];


for(i=0;i<work_color.length;i++){
  for(j=0;j<work_top_cold.length;j++){
    var re=work_color[i] + work_top_cold[j];
    work_winter_top.push(re);
  }
}
for(i=0;i<work_color.length;i++){
  for(j=0;j<work_bottom.length;j++){
    var re=work_color[i] + work_bottom[j];
    work_winter_bottom.push(re);
  }
}
for(i=0;i<work_color.length;i++){
  for(j=0;j<work_type_outer.length;j++){
    var re=work_color[i] + work_type_outer[j];
    work_winter_outer.push(re);
  }
}

    //결혼식: 
    //옷종류: 자켓, 셔츠, 블라우스, 슬랙스, 정장치마, 반팔티셔츠, 긴티셔츠, 긴블라우스, 반팔블라우스, 롱원피스, 롱스커트
    //색상: 흰, 남, 회, 검, 갈, 아이보리, 민트, 연두,하늘,  (연분홍,연노랑 
    var wedding_type_top_hot=[" 셔츠",  " 반팔티셔츠", " 긴티셔츠", " 긴블라우스", " 반팔블라우스" ]; //5결혼식 겨울제외
    var wedding_type_top_cold=[" 셔츠", " 긴티셔츠", " 긴블라우스"];//3결혼식 겨울
    var wedding_type_bottom=[" 슬랙스", " 정장치마", " 롱스커트"]; //3항상
    var wedding_type_onepiece_sp=[" 반팔 정장 원피스", " 가을 정장 원피스"]; //2봄
    var wedding_type_onepiece_sm=[" 반팔 정장 원피스"]; //1여름
    var wedding_type_onepiece_fa=[" 가을 정장 원피스"]; //1가을,겨울
    var wedding_type_outer_hot=[" 린넨 자켓"," 얇은 가디건"];//2여름
    var wedding_type_outer_cold=[" 자켓"," 가디건"," 코트"]; //3봄가을겨울
    var wedding_color=["네이비", "그레이", "블랙", "브라운", "아이보리", "민트", "연두색","하늘색", "연분홍","연노랑"];//10
    var wedding_color_one=["네이비", "그레이", "블랙", "브라운", "베이지"];//5
    
//봄상의
var wedd_spring_top=[];
//봄하의
var wedd_spring_bottom=[];
//봄아우터
var wedd_spring_outer=[];
//봄원피스
var wedd_spring_onpiece=[];
var wed_spring_r=[];

for(i=0;i<wedding_color.length;i++){
  for(j=0;j<wedding_type_top_hot.length;j++){
    var re=wedding_color[i] + wedding_type_top_hot[j];
    wedd_spring_top.push(re);
  }
}
for(i=0;i<wedding_color.length;i++){
  for(j=0;j<wedding_type_bottom.length;j++){
    var re=wedding_color[i] + wedding_type_bottom[j];
    wedd_spring_bottom.push(re);
  }
}
for(i=0;i<wedding_color.length;i++){
  for(j=0;j<wedding_type_outer_cold.length;j++){
    var re=wedding_color[i] + wedding_type_outer_cold[j];
    wedd_spring_outer.push(re);
  }
}
for(i=0;i<wedding_color_one.length;i++){
  for(j=0;j<wedding_type_onepiece_sp.length;j++){
    var re=wedding_color_one[i] + wedding_type_onepiece_sp[j];
    wedd_spring_onpiece.push(re);
  }
}

//여름상의
var wedd_summer_top=[];
//여름하의
var wedd_summer_bottom=[];
//여름아우터
var wedd_summer_outer=[];
//여름원피스
var wedd_summer_onpiece=[];
var wed_summer_r=[];


for(i=0;i<wedding_color.length;i++){
  for(j=0;j<wedding_type_top_hot.length;j++){
    var re=wedding_color[i] + wedding_type_top_hot[j];
    wedd_summer_top.push(re);
  }
}
for(i=0;i<wedding_color.length;i++){
  for(j=0;j<wedding_type_bottom.length;j++){
    var re=wedding_color[i] + wedding_type_bottom[j];
    wedd_summer_bottom.push(re);
  }
}
for(i=0;i<wedding_color_one.length;i++){
  for(j=0;j<wedding_type_outer_hot.length;j++){
    var re=wedding_color_one[i] + wedding_type_outer_hot[j];
    wedd_summer_outer.push(re);
  }
}
for(i=0;i<wedding_color_one.length;i++){
  for(j=0;j<wedding_type_onepiece_sm.length;j++){
    var re=wedding_color_one[i] + wedding_type_onepiece_sm[j];
    wedd_summer_onpiece.push(re);
  }
}


//가을상의
var wedd_fall_top=[];
//가을하의
var wedd_fall_bottom=[];
//가을아우터
var wedd_fall_outer=[];
//가을원피스
var wedd_fall_onepiece=[];
var wed_fall_r=[];


for(i=0;i<wedding_color.length;i++){
  for(j=0;j<wedding_type_top_hot.length;j++){
    var re=wedding_color[i] + wedding_type_top_hot[j];
    wedd_fall_top.push(re);
  }
}
for(i=0;i<wedding_color_one.length;i++){
  for(j=0;j<wedding_type_bottom.length;j++){
    var re=wedding_color_one[i] + wedding_type_bottom[j];
    wedd_fall_bottom.push(re);
  }
}
for(i=0;i<wedding_color_one.length;i++){
  for(j=0;j<wedding_type_outer_cold.length;j++){
    var re=wedding_color_one[i] + wedding_type_outer_cold[j];
    wedd_fall_outer.push(re);
  }
}
for(i=0;i<wedding_color_one.length;i++){
  for(j=0;j<wedding_type_onepiece_fa.length;j++){
    var re=wedding_color_one[i] + wedding_type_onepiece_fa[j];
    wedd_fall_onepiece.push(re);
  }
}

//겨울상의
var wedd_winter_top=[];
//겨울하의
var wedd_winter_bottom=[];
//겨울아우터
var wedd_winter_outer=[];
//겨울원피스
var wedd_winter_onepiece=[];

var wed_winter_r=[];

for(i=0;i<wedding_color.length;i++){
  for(j=0;j<wedding_type_top_cold.length;j++){
    var re=wedding_color[i] + wedding_type_top_cold[j];
    wedd_winter_top.push(re);
  }
}
for(i=0;i<wedding_color_one.length;i++){
  for(j=0;j<wedding_type_bottom.length;j++){
    var re=wedding_color_one[i] + wedding_type_bottom[j];
    wedd_winter_bottom.push(re);
  }
}
for(i=0;i<wedding_color_one.length;i++){
  for(j=0;j<wedding_type_outer_cold.length;j++){
    var re=wedding_color_one[i] + wedding_type_outer_cold[j];
    wedd_winter_outer.push(re);
  }
}
for(i=0;i<wedding_color_one.length;i++){
  for(j=0;j<wedding_type_onepiece_fa.length;j++){
    var re=wedding_color_one[i] + wedding_type_onepiece_fa[j];
    wedd_winter_onepiece.push(re);
  }
}

    
    if(ScheduleType4Recommends1=="장례식"){
      if(monthh>=3 &&monthh<=5){//봄
        //상의2
        while(funeral_spring_top.length > 3){
          var movenum = funeral_spring_top.splice(Math.floor(Math.random() * funeral_spring_top.length),1)[0];
          f_spring_r.push(movenum);
        }
        //하의1
        while(funeral_spring_bottom.length > 1){
          var movenum = funeral_spring_bottom.splice(Math.floor(Math.random() * funeral_spring_bottom.length),1)[0];
          f_spring_r.push(movenum);
        }
        //아우터1
        while(funeral_spring_outer.length > 2){
          var movenum = funeral_spring_outer.splice(Math.floor(Math.random() * funeral_spring_outer.length),1)[0];
          f_spring_r.push(movenum);
        }   
        //크결과    
        var crawlingresult= await GettingCrawling1(pricemax, f_spring_r);
        console.log(crawlingresult);
        
         
        urls = [];
        images = [];
        prices = [];
        items = [];

        crawlingresult = crawlingresult[0].split(',');
        //console.log(crawlingresult);

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
            if (index==23){
              value = value.replace(']]', '');
              items.push(value)
            }
            else{
              value = value.replace(']', '');
              items.push(value)
            }
          }
        })
        var result = [];
        for(i=0; i<items.length; i+=3){
          result.push(items.slice(i, i+3))
        }
        var final_data = [];
        console.log(result[0])

        for (var i=0; i<result.length; i++){
          a = result[i]
          final_data.push({
            "url": a[0].slice(2, -1),
            "imageurl": a[1].slice(2, -1),
            "price": a[2].slice(2, -1)
        })
}

console.log(final_data.length);
console.log(final_data);


res.send(final_data);
      
        
      }else if(monthh>=6 &&monthh<=8){//여름
        //상의2
        while(funeral_summer_top.length > 3){
          var movenum = funeral_summer_top.splice(Math.floor(Math.random() * funeral_summer_top.length),1)[0];
          f_summer_r.push(movenum);
        }
        //하의1
        while(funeral_summer_bottom.length > 1){
          var movenum = funeral_summer_bottom.splice(Math.floor(Math.random() * funeral_summer_bottom.length),1)[0];
          f_summer_r.push(movenum);
        }
        //아우터1
        while(funeral_summer_outer.length > 1){
          var movenum = funeral_summer_outer.splice(Math.floor(Math.random() * funeral_summer_outer.length),1)[0];
          f_summer_r.push(movenum);
        }
        //크결과    
        var crawlingresult= await GettingCrawling1(pricemax, f_summer_r);
        console.log(crawlingresult);

         
        urls = [];
        images = [];
        prices = [];
        items = [];

        crawlingresult = crawlingresult[0].split(',');
        //console.log(crawlingresult);

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
            if (index==23){
              value = value.replace(']]', '');
              items.push(value)
            }
            else{
              value = value.replace(']', '');
              items.push(value)
            }
          }
        })
        var result = [];
        for(i=0; i<items.length; i+=3){
          result.push(items.slice(i, i+3))
        }
        var final_data = [];
        console.log(result[0])

        for (var i=0; i<result.length; i++){
          a = result[i]
          final_data.push({
            "url": a[0].slice(2, -1),
            "imageurl": a[1].slice(2, -1),
            "price": a[2].slice(2, -1)
        })
}

console.log(final_data.length);
console.log(final_data);


res.send(final_data);
      }else if(monthh>=9 && monthh<=10){//가을
        //상의2
        while(funeral_fall_top.length > 3){
          var movenum = funeral_fall_top.splice(Math.floor(Math.random() * funeral_fall_top.length),1)[0];
          f_fall_r.push(movenum);
        }
        //하의1
        while(funeral_fall_bottom.length > 1){
          var movenum = funeral_fall_bottom.splice(Math.floor(Math.random() * funeral_fall_bottom.length),1)[0];
          f_fall_r.push(movenum);
        }
        //아우터1
        while(funeral_fall_outer.length > 2){
          var movenum = funeral_fall_outer.splice(Math.floor(Math.random() * funeral_fall_outer.length),1)[0];
          f_fall_r.push(movenum);
        }
        //크결과    
        var crawlingresult= await GettingCrawling1(pricemax, f_fall_r);
        console.log(crawlingresult);
        
         
        urls = [];
        images = [];
        prices = [];
        items = [];

        crawlingresult = crawlingresult[0].split(',');
        //console.log(crawlingresult);

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
            if (index==23){
              value = value.replace(']]', '');
              items.push(value)
            }
            else{
              value = value.replace(']', '');
              items.push(value)
            }
          }
        })
        var result = [];
        for(i=0; i<items.length; i+=3){
          result.push(items.slice(i, i+3))
        }
        var final_data = [];
        console.log(result[0])

        for (var i=0; i<result.length; i++){
          a = result[i]
          final_data.push({
            "url": a[0].slice(2, -1),
            "imageurl": a[1].slice(2, -1),
            "price": a[2].slice(2, -1)
        })
}

console.log(final_data.length);
console.log(final_data);


res.send(final_data);
      }else if(monthh<3 || monthh>=11){//겨울
        //상의2
        while(funeral_winter_top.length > 1){
          var movenum = funeral_winter_top.splice(Math.floor(Math.random() * funeral_winter_top.length),1)[0];
          f_winter_r.push(movenum);
        }
        //하의1
        while(funeral_winter_bottom.length > 1){
          var movenum = funeral_winter_bottom.splice(Math.floor(Math.random() * funeral_winter_bottom.length),1)[0];
          f_winter_r.push(movenum);
        }
        //아우터1
        while(funeral_winter_outer.length > 2){
          var movenum = funeral_winter_outer.splice(Math.floor(Math.random() * funeral_winter_outer.length),1)[0];
          f_winter_r.push(movenum);
        }  
       
         //크결과    
         var crawlingresult= await GettingCrawling1(pricemax, f_winter_r);
         console.log(crawlingresult);
         
         
         urls = [];
         images = [];
         prices = [];
         items = [];
 
         crawlingresult = crawlingresult[0].split(',');
         //console.log(crawlingresult);
 
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
             if (index==23){
               value = value.replace(']]', '');
               items.push(value)
             }
             else{
               value = value.replace(']', '');
               items.push(value)
             }
           }
         })
         var result = [];
         for(i=0; i<items.length; i+=3){
           result.push(items.slice(i, i+3))
         }
         var final_data = [];
         console.log(result[0])
 
         for (var i=0; i<result.length; i++){
           a = result[i]
           final_data.push({
             "url": a[0].slice(2, -1),
             "imageurl": a[1].slice(2, -1),
             "price": a[2].slice(2, -1)
         })
}

console.log(final_data.length);
console.log(final_data);


res.send(final_data);
      }
    }else if(ScheduleType4Recommends1=="업무"){
      if(monthh>=3 && monthh<=5){
        //상의2
        while(work_spring_top.length > 28){
          var movenum = work_spring_top.splice(Math.floor(Math.random() * work_spring_top.length),1)[0];
          w_spring_r.push(movenum);
        }
        //하의1
        while(work_spring_bottom.length > 11){
          var movenum = work_spring_bottom.splice(Math.floor(Math.random() * work_spring_bottom.length),1)[0];
          w_spring_r.push(movenum);
        }
        //아우터1
        while(work_spring_outer.length > 5){
          var movenum = work_spring_outer.splice(Math.floor(Math.random() * work_spring_outer.length),1)[0];
          w_spring_r.push(movenum);
        }       
         //크결과    
         var crawlingresult= await GettingCrawling1(pricemax, w_spring_r);
         console.log(crawlingresult);

         
         urls = [];
         images = [];
         prices = [];
         items = [];
 
         crawlingresult = crawlingresult[0].split(',');
         //console.log(crawlingresult);
 
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
             if (index==23){
               value = value.replace(']]', '');
               items.push(value)
             }
             else{
               value = value.replace(']', '');
               items.push(value)
             }
           }
         })
         var result = [];
         for(i=0; i<items.length; i+=3){
           result.push(items.slice(i, i+3))
         }
         var final_data = [];
         console.log(result[0])
 
         for (var i=0; i<result.length; i++){
           a = result[i]
           final_data.push({
             "url": a[0].slice(2, -1),
             "imageurl": a[1].slice(2, -1),
             "price": a[2].slice(2, -1)
         })
}

console.log(final_data.length);
console.log(final_data);


res.send(final_data);
        
      }else if(monthh>=6 && monthh<=8){
        //상의2
        while(work_summer_top.length > 28){
          var movenum = work_summer_top.splice(Math.floor(Math.random() * work_summer_top.length),1)[0];
          w_summer_r.push(movenum);
        }
        //하의1
        while(work_summer_bottom.length > 11){
          var movenum = work_summer_bottom.splice(Math.floor(Math.random() * work_summer_bottom.length),1)[0];
          w_summer_r.push(movenum);
        }
        //아우터1
        while(work_summer_outer.length > 5){
          var movenum = work_summer_outer.splice(Math.floor(Math.random() * work_summer_outer.length),1)[0];
          w_summer_r.push(movenum);
        }       
        //크결과    
        var crawlingresult= await GettingCrawling1(pricemax, w_summer_r);
        console.log(crawlingresult);

         
        urls = [];
        images = [];
        prices = [];
        items = [];

        crawlingresult = crawlingresult[0].split(',');
        //console.log(crawlingresult);

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
            if (index==23){
              value = value.replace(']]', '');
              items.push(value)
            }
            else{
              value = value.replace(']', '');
              items.push(value)
            }
          }
        })
        var result = [];
        for(i=0; i<items.length; i+=3){
          result.push(items.slice(i, i+3))
        }
        var final_data = [];
        console.log(result[0])

        for (var i=0; i<result.length; i++){
          a = result[i]
          final_data.push({
            "url": a[0].slice(2, -1),
            "imageurl": a[1].slice(2, -1),
            "price": a[2].slice(2, -1)
        })
}

console.log(final_data.length);
console.log(final_data);


res.send(final_data);
       
      }else if(monthh>=9 && monthh<=10){
        //상의2
        while(work_fall_top.length > 28){
          var movenum = work_fall_top.splice(Math.floor(Math.random() * work_fall_top.length),1)[0];
          w_fall_r.push(movenum);
        }
        //하의1
        while(work_fall_bottom.length > 11){
          var movenum = work_fall_bottom.splice(Math.floor(Math.random() * work_fall_bottom.length),1)[0];
          w_fall_r.push(movenum);
        }
        //아우터1
        while(work_fall_outer.length > 5){
          var movenum = work_fall_outer.splice(Math.floor(Math.random() * work_fall_outer.length),1)[0];
          w_fall_r.push(movenum);
        }       
        //크결과    
        var crawlingresult= await GettingCrawling1(pricemax, w_fall_r);
        console.log(crawlingresult);

         
        urls = [];
        images = [];
        prices = [];
        items = [];

        crawlingresult = crawlingresult[0].split(',');
        //console.log(crawlingresult);

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
            if (index==23){
              value = value.replace(']]', '');
              items.push(value)
            }
            else{
              value = value.replace(']', '');
              items.push(value)
            }
          }
        })
        var result = [];
        for(i=0; i<items.length; i+=3){
          result.push(items.slice(i, i+3))
        }
        var final_data = [];
        console.log(result[0])

        for (var i=0; i<result.length; i++){
          a = result[i]
          final_data.push({
            "url": a[0].slice(2, -1),
            "imageurl": a[1].slice(2, -1),
            "price": a[2].slice(2, -1)
        })
}

console.log(final_data.length);
console.log(final_data);


res.send(final_data);
       
      }else if(monthh<3 || monthh>=11){
        //상의2
        while(work_winter_top.length > 16){
          var movenum = work_winter_top.splice(Math.floor(Math.random() * work_winter_top.length),1)[0];
          w_winter_r.push(movenum);
        }
        //하의1
        while(work_winter_bottom.length > 11){
          var movenum = work_winter_bottom.splice(Math.floor(Math.random() * work_winter_bottom.length),1)[0];
          w_winter_r.push(movenum);
        }
        //아우터1
        while(work_winter_outer.length > 5){
          var movenum = work_winter_outer.splice(Math.floor(Math.random() * work_winter_outer.length),1)[0];
          w_winter_r.push(movenum);
        }       
         //크결과    
         var crawlingresult= await GettingCrawling1(pricemax, w_winter_r);
         
        urls = [];
        images = [];
        prices = [];
        items = [];

        crawlingresult = crawlingresult[0].split(',');
        //console.log(crawlingresult);

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
            if (index==23){
              value = value.replace(']]', '');
              items.push(value)
            }
            else{
              value = value.replace(']', '');
              items.push(value)
            }
          }
        })
        var result = [];
        for(i=0; i<items.length; i+=3){
          result.push(items.slice(i, i+3))
        }
        var final_data = [];
        console.log(result[0])

        for (var i=0; i<result.length; i++){
          a = result[i]
          final_data.push({
            "url": a[0].slice(2, -1),
            "imageurl": a[1].slice(2, -1),
            "price": a[2].slice(2, -1)
        })
}

console.log(final_data.length);
console.log(final_data);


res.send(final_data);


      }

    }else if(ScheduleType4Recommends1=="결혼"){
      if(monthh>=3 && monthh<=5){
        //상의1
        while(wedd_spring_top.length > 49){
          var movenum = wedd_spring_top.splice(Math.floor(Math.random() * wedd_spring_top.length),1)[0];
          wed_spring_r.push(movenum);
        }
        //하의1
        while(wedd_spring_bottom.length > 29){
          var movenum = wedd_spring_bottom.splice(Math.floor(Math.random() * wedd_spring_bottom.length),1)[0];
          wed_spring_r.push(movenum);
        }
        //아우터1
        while(wedd_spring_outer.length > 29){
          var movenum = wedd_spring_outer.splice(Math.floor(Math.random() * wedd_spring_outer.length),1)[0];
          wed_spring_r.push(movenum);
        } 
        //원피스1
        while(wedd_spring_onpiece.length > 9){
          var movenum = wedd_spring_onpiece.splice(Math.floor(Math.random() * wedd_spring_onpiece.length),1)[0];
          wed_spring_r.push(movenum);
        }         
         //크결과    
         var crawlingresult= await GettingCrawling1(pricemax, wed_spring_r);
         console.log(crawlingresult);

         
         urls = [];
         images = [];
         prices = [];
         items = [];
 
         crawlingresult = crawlingresult[0].split(',');
         //console.log(crawlingresult);
 
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
             if (index==23){
               value = value.replace(']]', '');
               items.push(value)
             }
             else{
               value = value.replace(']', '');
               items.push(value)
             }
           }
         })
         var result = [];
         for(i=0; i<items.length; i+=3){
           result.push(items.slice(i, i+3))
         }
         var final_data = [];
         console.log(result[0])
 
         for (var i=0; i<result.length; i++){
           a = result[i]
           final_data.push({
             "url": a[0].slice(2, -1),
             "imageurl": a[1].slice(2, -1),
             "price": a[2].slice(2, -1)
         })
}

console.log(final_data.length);
console.log(final_data);


res.send(final_data);
      }else if(monthh>=6 && monthh<=8){
        //상의1
        while(wedd_summer_top.length > 49){
          var movenum = wedd_summer_top.splice(Math.floor(Math.random() * wedd_summer_top.length),1)[0];
          wed_summer_r.push(movenum);
        }
        //하의1
        while(wedd_summer_bottom.length > 29){
          var movenum = wedd_summer_bottom.splice(Math.floor(Math.random() * wedd_summer_bottom.length),1)[0];
          wed_summer_r.push(movenum);
        }
        //아우터1
        while(wedd_summer_outer.length > 9){
          var movenum = wedd_summer_outer.splice(Math.floor(Math.random() * wedd_summer_outer.length),1)[0];
          wed_summer_r.push(movenum);
        } 
        //원피스1
        while(wedd_summer_onpiece.length > 4){
          var movenum = wedd_summer_onpiece.splice(Math.floor(Math.random() * wedd_summer_onpiece.length),1)[0];
          wed_summer_r.push(movenum);
        }         
        //크결과    
        var crawlingresult= await GettingCrawling1(pricemax, wed_summer_r);
        console.log(crawlingresult);

         
        urls = [];
        images = [];
        prices = [];
        items = [];

        crawlingresult = crawlingresult[0].split(',');
        //console.log(crawlingresult);

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
            if (index==23){
              value = value.replace(']]', '');
              items.push(value)
            }
            else{
              value = value.replace(']', '');
              items.push(value)
            }
          }
        })
        var result = [];
        for(i=0; i<items.length; i+=3){
          result.push(items.slice(i, i+3))
        }
        var final_data = [];
        console.log(result[0])

        for (var i=0; i<result.length; i++){
          a = result[i]
          final_data.push({
            "url": a[0].slice(2, -1),
            "imageurl": a[1].slice(2, -1),
            "price": a[2].slice(2, -1)
        })
}

console.log(final_data.length);
console.log(final_data);


res.send(final_data);

      }else if(monthh>=9 && monthh<=10){
        //상의1
        while(wedd_fall_top.length > 49){
          var movenum = wedd_fall_top.splice(Math.floor(Math.random() * wedd_fall_top.length),1)[0];
          wed_fall_r.push(movenum);
        }
        //하의1
        while(wedd_fall_bottom.length > 14){
          var movenum = wedd_fall_bottom.splice(Math.floor(Math.random() * wedd_fall_bottom.length),1)[0];
          wed_fall_r.push(movenum);
        }
        //아우터1
        while(wedd_fall_outer.length > 14){
          var movenum = wedd_fall_outer.splice(Math.floor(Math.random() * wedd_fall_outer.length),1)[0];
          wed_fall_r.push(movenum);
        } 
        //원피스1
        while(wedd_fall_onepiece.length > 4){
          var movenum = wedd_fall_onepiece.splice(Math.floor(Math.random() * wedd_fall_onepiece.length),1)[0];
          wed_fall_r.push(movenum);
        }         
        //크결과    
        var crawlingresult= await GettingCrawling1(pricemax, wed_fall_r);
        console.log(crawlingresult);

         
        urls = [];
        images = [];
        prices = [];
        items = [];

        crawlingresult = crawlingresult[0].split(',');
        //console.log(crawlingresult);

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
            if (index==23){
              value = value.replace(']]', '');
              items.push(value)
            }
            else{
              value = value.replace(']', '');
              items.push(value)
            }
          }
        })
        var result = [];
        for(i=0; i<items.length; i+=3){
          result.push(items.slice(i, i+3))
        }
        var final_data = [];
        console.log(result[0])

        for (var i=0; i<result.length; i++){
          a = result[i]
          final_data.push({
            "url": a[0].slice(2, -1),
            "imageurl": a[1].slice(2, -1),
            "price": a[2].slice(2, -1)
        })
}

console.log(final_data.length);
console.log(final_data);


res.send(final_data);

      }else if(monthh<3 || monthh>=11){
         //상의1
         while(wedd_winter_top.length > 29){
          var movenum = wedd_winter_top.splice(Math.floor(Math.random() * wedd_winter_top.length),1)[0];
          wed_winter_r.push(movenum);
        }
        //하의1
        while(wedd_winter_bottom.length > 14){
          var movenum = wedd_winter_bottom.splice(Math.floor(Math.random() * wedd_winter_bottom.length),1)[0];
          wed_winter_r.push(movenum);
        }
        //아우터1
        while(wedd_winter_outer.length > 14){
          var movenum = wedd_winter_outer.splice(Math.floor(Math.random() * wedd_winter_outer.length),1)[0];
          wed_winter_r.push(movenum);
        } 
        //원피스1
        while(wedd_winter_onepiece.length > 4){
          var movenum = wedd_winter_onepiece.splice(Math.floor(Math.random() * wedd_winter_onepiece.length),1)[0];
          wed_winter_r.push(movenum);
        }         
         //크결과    
         var crawlingresult= await GettingCrawling1(pricemax, wed_winter_r);
         //console.log(crawlingresult);
         
         
         urls = [];
         images = [];
         prices = [];
         items = [];
 
         crawlingresult = crawlingresult[0].split(',');
         //console.log(crawlingresult);
 
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
             if (index==23){
               value = value.replace(']]', '');
               items.push(value)
             }
             else{
               value = value.replace(']', '');
               items.push(value)
             }
           }
         })
         var result = [];
         for(i=0; i<items.length; i+=3){
           result.push(items.slice(i, i+3))
         }
         var final_data = [];
         console.log(result[0])
 
         for (var i=0; i<result.length; i++){
           a = result[i]
           final_data.push({
             "url": a[0].slice(2, -1),
             "imageurl": a[1].slice(2, -1),
             "price": a[2].slice(2, -1)
         })
}

console.log(final_data.length);
console.log(final_data);


res.send(final_data);
      }

    }else if(ScheduleType4Recommends1=="일상"){
      var recommend_list = await Calculate_RecommendationLevel(loginedUserId);
      console.log(recommend_list);
      
    var crawlingresult= await GettingCrawling(pricemax, recommend_list);
      
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
          items.push(value)
        }
        else{
          value = value.replace(']', '');
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
//console.log(result[0])
console.log(result.slice(0, 8))
result=result.slice(0, 8);
for (var i=0; i<result.length; i++){
  a = result[i]
  final_data.push({
    "url": a[0].slice(2, -1),
    "imageurl": a[1].slice(2, -1),
    "price": a[2].slice(2, -1)
})
}

res.send(final_data)


  }}
    
  });
//--------------------------------------------------------------------------------------4. 옷장기반 추천
  router.get('/getScheduleMycloset', isLoggedIn, async (req, res,next)=> {  
    const today_date=new Date();
    const user = await User.findOne({where :{id: req.user.id}});
    const loginedUserId=req.user.id;
    console.log(loginedUserId);

    const ScheduleDate4Recommend= await user.getSchedules({
      raw:true,
      attributes:['date'],
      where:{ date: {[Op.gte]: today_date}},
      order:[['date','ASC']],
      limit:1,
    });
    
    const ScheduleType4Recommend= await user.getSchedules({
      raw:true,
      attributes:['schedule_type'],
      where:{ date: {[Op.gte]: today_date}},
      order:[['date','ASC']],
      limit:1,
    });

     //장례식-> 
     var arr_top_hot=['bblack','cblack','eblack','fblack','wblack'];//장례식 상의 봄여름가을
     var arr_top_cold=['cblack','eblack','wblack'];//장례식 상의 겨울
     var arr_bottom=['kblack','nblack'];//계절상관없이
     var arr_outer=['tblack','vblack','sblack']//장례식 아우터 봄가을겨울
     
     var funeral_spring=arr_top_hot.concat(arr_bottom,arr_outer);
     var funeral_summer=arr_top_hot.concat(arr_top_cold,arr_bottom);
     var funeral_fall=arr_top_hot.concat(arr_top_cold,arr_bottom,arr_outer);
     var funeral_winter=arr_top_cold.concat(arr_outer,arr_bottom);


     //업무: 
     //옷종류: 자켓, 셔츠, 블라우스, 슬랙스, 정장치마, 반팔티셔츠, 긴티셔츠, 긴블라우스, 반팔블라우스
     //색상: 흰, 남, 회, 검, 갈, 아이보리

     var work_top_hot=["wwhite",  "bwhite", "cwhite", "ewhite", "fwhite",
     "wnavy", "bnavy", "cnavy", "enavy", "fnavy",
     "wgray",  "bgray", "cgray", "egray", "fgray",
     "wblack",  "bblack", "cblack", "eblack", "fblack",
     "wbrown",  "bbrown", "cbrown", "ebrown", "fbrown",
     "fivory","wivory",  "bivory", "civory", "eivory"]; //업무 겨울제외

     var work_top_cold=
     ["wwhite", "cwhite", "ewhite",
     "wnavy", "cnavy", "enavy",
     "wgray", "cgray", "egray",
     "wblack", "cblack", "eblack",
     "wbrown", "cbrown", "ebrown",
     "wivory", "civory", "eivory"]; //업무 겨울

     var work_bottom=
     ["kwhite", "nwhite",
     "knavy", "nnavy",
     "kgray", "ngray",
     "kblack", "nblack",
     "kbrown", "nbrown",
     "kivory", "nivory",]; //항상
     var work_outer=["vwhite", "vnavy", "vgray", "vblack", "vbrown", "vivory"]; //항상
     var work_color=["white", "navy", "gray", "black", "brown", "ivory"]; //색상
   

     var work_spring=work_top_hot.concat(work_bottom,work_outer);
     var work_summer=work_top_hot.concat(work_bottom,work_outer);
     var work_fall=work_top_hot.concat(work_bottom,work_outer);
     var work_winter=work_top_cold.concat(work_bottom,work_outer);
     //var funeral_list=arr_top_hot.concat(arr_top_cold,arr_bottom,arr_outer_spring);
 
     //결혼식: 
     //옷종류: 자켓, 셔츠, 블라우스, 슬랙스, 정장치마, 반팔티셔츠, 긴티셔츠, 긴블라우스, 반팔블라우스, 롱원피스, 롱스커트
     //색상: 흰, 남, 회, 검, 갈, 아이보리, 민트, 연두,하늘,  (연분홍,연노랑 
     var wedding_type_top_hot=["bnavy", "bgray", "bblack", "bbrown", "bivory", "bskyblue","blightgreen","fnavy", "fgray", "fblack", "fbrown", "fivory", "fskyblue","flightgreen"]; //결혼식 겨울제외
     var wedding_type_top_cold=["wnavy", "wgray", "wblack", "wbrown", "wivory", "wskyblue","wlightgreen","cnavy", "cgray", "cblack", "cbrown", "civory", "cskyblue","clightgreen", "enavy", "egray", "eblack", "ebrown", "eivory", "eskyblue","elightgreen"]; //결혼식 겨울
     var wedding_type_bottom=["knavy", "kgray", "kblack", "kbrown", "kivory", "kskyblue","klightgreen","nnavy", "ngray", "nblack", "nbrown", "nivory", "nskyblue","nlightgreen", "onavy", "ogray", "oblack", "obrown", "oivory", "oskyblue","olightgreen"]; //항상
     var wedding_type_outer_hot=["vnavy", "vgray", "vblack", "vbrown", "vivory", "vskyblue","vlightgreen","tnavy", "tgray", "tblack", "tbrown", "tivory", "tskyblue","tlightgreen"]; //여름
     var wedding_type_outer=["vnavy", "vgray", "vblack", "vbrown", "vivory", "vskyblue","vlightgreen","tnavy", "tgray", "tblack", "tbrown", "tivory", "tskyblue","tlightgreen","snavy", "sgray", "sblack", "sbrown", "sivory", "sskyblue","slightgreen"]; //나머지
     var wedding_color=["navy", "gray", "black", "brown", "ivory", "skyblue","lightgreen"];
     
     var wedding_spring=wedding_type_top_hot.concat(wedding_type_bottom,wedding_type_outer);
     var wedding_summer=wedding_type_top_hot.concat(wedding_type_bottom,wedding_type_outer_hot);
     var wedding_fall=wedding_type_top_hot.concat(wedding_type_bottom,wedding_type_outer);
     var wedding_winter=wedding_type_top_cold.concat(wedding_type_bottom,wedding_type_outer);

if(ScheduleDate4Recommend[0]==null && ScheduleType4Recommend[0]==null){
  var result_list={
    scheduletype: null,
    img: null,
  };
  console.log(ScheduleType4Recommend);
  console.log(ScheduleDate4Recommend);
  //result_list.push(result);
  res.send(result_list);
}else{
    
     var ScheduleDate4Recommends = JSON.parse(JSON.stringify(ScheduleDate4Recommend));
     var ScheduleDate4Recommends1 = Object.values(ScheduleDate4Recommends[0])[0];
     var ScheduleDate4Recommends2 = new Date(ScheduleDate4Recommends1);
     var monthh=ScheduleDate4Recommends2.getMonth()+1;
 
     var ScheduleType4Recommends = JSON.parse(JSON.stringify(ScheduleType4Recommend));
     var ScheduleType4Recommends1 =  Object.values(ScheduleType4Recommends[0])[0];
 
    if(ScheduleType4Recommends1=="장례식"){
      if(monthh>=3 && monthh<=5){
        //장례식 봄에 해당하는 배열을 돌기. 
        const sql="SELECT image FROM images WHERE class IN ( 'bblack','cblack','eblack','fblack','wblack','kblack','nblack','tblack','vblack','sblack') AND UserId="+loginedUserId+" ORDER BY ImageId DESC LIMIT 4";
         connection.query(sql, async function(err, result){
          var result_list={
            scheduletype: ScheduleType4Recommends1,
            img: result,
          };
          //result_list.push(result);
          res.send(result_list);
        })
      }else if(monthh>=6 &&monthh<=8){
        const sql="SELECT image FROM images WHERE class IN ('bblack','cblack','eblack','fblack','wblack','kblack','nblack','tblack','vblack','sblack') AND UserId="+loginedUserId+" ORDER BY ImageId DESC LIMIT 4";
         connection.query(sql, async function(err, result){
          var result_list={
            scheduletype: ScheduleType4Recommends1,
            img: result,
          };
          //result_list.push(result);
          res.send(result_list);
        })
      }else if(monthh>=9 &&monthh<=10){
        const sql="SELECT image FROM images WHERE class IN ('bblack', 'cblack', 'eblack', 'fblack', 'wblack', 'cblack', 'eblack', 'wblack', 'kblack', 'nblack', 'tblack', 'vblack', 'sblack') AND UserId="+loginedUserId+" ORDER BY ImageId DESC LIMIT 4";
         connection.query(sql, async function(err, result){
          var result_list={
            scheduletype: ScheduleType4Recommends1,
            img: result,
          };
          //result_list.push(result);
          res.send(result_list);
        })
      }else if(monthh<3 ||monthh>=11){
        const sql="SELECT image FROM images WHERE class IN ('cblack', 'eblack', 'wblack', 'tblack', 'vblack', 'sblack', 'kblack', 'nblack') AND UserId="+loginedUserId+" ORDER BY ImageId DESC";
        console.log(sql);
         connection.query(sql, async function(err, result){
          var result_list={
            scheduletype: ScheduleType4Recommends1,
            img: result,
          };
          //result_list.push(result);
          res.send(result_list);
        });
      }
    }else if(ScheduleType4Recommends1=="업무"){
      if(monthh>=3 &&monthh<=5){
        const sql="SELECT image FROM images WHERE class IN ('wwhite', 'bwhite', 'cwhite', 'ewhite', 'fwhite', 'wnavy', 'bnavy', 'cnavy', 'enavy', 'fnavy', 'wgray', 'bgray', 'cgray', 'egray', 'fgray', 'wblack', 'bblack', 'cblack', 'eblack', 'fblack', 'wbrown', 'bbrown', 'cbrown', 'ebrown', 'fbrown', 'fivory', 'wivory', 'bivory', 'civory', 'eivory', 'kwhite', 'nwhite', 'knavy', 'nnavy', 'kgray', 'ngray', 'kblack', 'nblack', 'kbrown', 'nbrown', 'kivory', 'nivory', 'vwhite', 'vnavy', 'vgray', 'vblack', 'vbrown', 'vivory') AND UserId="+loginedUserId+" ORDER BY ImageId DESC LIMIT 4";
        console.log(sql);
         connection.query(sql, async function(err, result){
          var result_list={
            scheduletype: ScheduleType4Recommends1,
            img: result,
          };
          //result_list.push(result);
          res.send(result_list);
        });
      }else if(monthh>=6 &&monthh<=8){
        const sql="SELECT image FROM images WHERE class IN ('wwhite', 'bwhite', 'cwhite', 'ewhite', 'fwhite', 'wnavy', 'bnavy', 'cnavy', 'enavy', 'fnavy', 'wgray', 'bgray', 'cgray', 'egray', 'fgray', 'wblack', 'bblack', 'cblack', 'eblack', 'fblack', 'wbrown', 'bbrown', 'cbrown', 'ebrown', 'fbrown', 'fivory', 'wivory', 'bivory', 'civory', 'eivory', 'kwhite', 'nwhite', 'knavy', 'nnavy', 'kgray', 'ngray', 'kblack', 'nblack', 'kbrown', 'nbrown', 'kivory', 'nivory', 'vwhite', 'vnavy', 'vgray', 'vblack', 'vbrown', 'vivory') AND UserId="+loginedUserId+" ORDER BY ImageId DESC LIMIT 4";
        console.log(sql);
         connection.query(sql, async function(err, result){
          var result_list={
            scheduletype: ScheduleType4Recommends1,
            img: result,
          };
          //result_list.push(result);
          res.send(result_list);
        });
      }else if(monthh>=9 &&monthh<=10){
        const sql="SELECT image FROM images WHERE class IN ('wwhite', 'bwhite', 'cwhite', 'ewhite', 'fwhite', 'wnavy', 'bnavy', 'cnavy', 'enavy', 'fnavy', 'wgray', 'bgray', 'cgray', 'egray', 'fgray', 'wblack', 'bblack', 'cblack', 'eblack', 'fblack', 'wbrown', 'bbrown', 'cbrown', 'ebrown', 'fbrown', 'fivory', 'wivory', 'bivory', 'civory', 'eivory', 'kwhite', 'nwhite', 'knavy', 'nnavy', 'kgray', 'ngray', 'kblack', 'nblack', 'kbrown', 'nbrown', 'kivory', 'nivory', 'vwhite', 'vnavy', 'vgray', 'vblack', 'vbrown', 'vivory') AND UserId="+loginedUserId+" ORDER BY ImageId DESC LIMIT 4";
        console.log(sql);
         connection.query(sql, async function(err, result){
          var result_list={
            scheduletype: ScheduleType4Recommends1,
            img: result,
          };
          //result_list.push(result);
          res.send(result_list);
        });
      }else if(monthh<3 ||monthh>=11){
        const sql="SELECT image FROM images WHERE class IN ('wwhite', 'cwhite', 'ewhite', 'wnavy', 'cnavy', 'enavy', 'wgray', 'cgray', 'egray', 'wblack', 'cblack', 'eblack', 'wbrown', 'cbrown', 'ebrown', 'wivory', 'civory', 'eivory', 'kwhite', 'nwhite', 'knavy', 'nnavy', 'kgray', 'ngray', 'kblack', 'nblack', 'kbrown', 'nbrown', 'kivory', 'nivory', 'vwhite', 'vnavy', 'vgray', 'vblack', 'vbrown', 'vivory') AND UserId="+loginedUserId+" ORDER BY ImageId DESC LIMIT 4";
        console.log(sql);
         connection.query(sql, async function(err, result){
          var result_list={
            scheduletype: ScheduleType4Recommends1,
            img: result,
          };
          //result_list.push(result);
          res.send(result_list);
        });
      }

    }else if(ScheduleType4Recommends1=="결혼"){
      if(monthh>=3 &&monthh<=5){
        const sql="SELECT image FROM images WHERE class IN ('bnavy', 'bgray', 'bblack', 'bbrown', 'bivory', 'bskyblue', 'blightgreen', 'fnavy', 'fgray', 'fblack', 'fbrown', 'fivory', 'fskyblue', 'flightgreen', 'knavy', 'kgray', 'kblack', 'kbrown', 'kivory', 'kskyblue', 'klightgreen', 'nnavy', 'ngray', 'nblack', 'nbrown', 'nivory', 'nskyblue', 'nlightgreen', 'onavy', 'ogray', 'oblack', 'obrown', 'oivory', 'oskyblue', 'olightgreen', 'vnavy', 'vgray', 'vblack', 'vbrown', 'vivory', 'vskyblue', 'vlightgreen', 'tnavy', 'tgray', 'tblack', 'tbrown', 'tivory', 'tskyblue', 'tlightgreen', 'snavy', 'sgray', 'sblack', 'sbrown', 'sivory', 'sskyblue', 'slightgreen') AND UserId="+loginedUserId+" ORDER BY ImageId DESC LIMIT 4";
        console.log(sql);
         connection.query(sql, async function(err, result){
          var result_list={
            scheduletype: ScheduleType4Recommends1,
            img: result,
          };
          //result_list.push(result);
          res.send(result_list);
        });
      }else if(monthh>=6 &&monthh<=8){
        const sql="SELECT image FROM images WHERE class IN ('bnavy', 'bgray', 'bblack', 'bbrown', 'bivory', 'bskyblue', 'blightgreen', 'fnavy', 'fgray', 'fblack', 'fbrown', 'fivory', 'fskyblue', 'flightgreen', 'knavy', 'kgray', 'kblack', 'kbrown', 'kivory', 'kskyblue', 'klightgreen', 'nnavy', 'ngray', 'nblack', 'nbrown', 'nivory', 'nskyblue', 'nlightgreen', 'onavy', 'ogray', 'oblack', 'obrown', 'oivory', 'oskyblue', 'olightgreen', 'vnavy', 'vgray', 'vblack', 'vbrown', 'vivory', 'vskyblue', 'vlightgreen', 'tnavy', 'tgray', 'tblack', 'tbrown', 'tivory', 'tskyblue', 'tlightgreen') AND UserId="+loginedUserId+" ORDER BY ImageId DESC LIMIT 4";
        console.log(sql);
         connection.query(sql, async function(err, result){
          var result_list={
            scheduletype: ScheduleType4Recommends1,
            img: result,
          };
          //result_list.push(result);
          res.send(result_list);
        });

      }else if(monthh>=9 &&monthh<=10){
        const sql="SELECT image FROM images WHERE class IN ('bnavy', 'bgray', 'bblack', 'bbrown', 'bivory', 'bskyblue', 'blightgreen', 'fnavy', 'fgray', 'fblack', 'fbrown', 'fivory', 'fskyblue', 'flightgreen', 'knavy', 'kgray', 'kblack', 'kbrown', 'kivory', 'kskyblue', 'klightgreen', 'nnavy', 'ngray', 'nblack', 'nbrown', 'nivory', 'nskyblue', 'nlightgreen', 'onavy', 'ogray', 'oblack', 'obrown', 'oivory', 'oskyblue', 'olightgreen', 'vnavy', 'vgray', 'vblack', 'vbrown', 'vivory', 'vskyblue', 'vlightgreen', 'tnavy', 'tgray', 'tblack', 'tbrown', 'tivory', 'tskyblue', 'tlightgreen', 'snavy', 'sgray', 'sblack', 'sbrown', 'sivory', 'sskyblue', 'slightgreen') AND UserId="+loginedUserId+" ORDER BY ImageId DESC LIMIT 4";
        console.log(sql);
         connection.query(sql, async function(err, result){
          var result_list={
            scheduletype: ScheduleType4Recommends1,
            img: result,
          };
          //result_list.push(result);
          res.send(result_list);
        });

      }else if(monthh<3 ||monthh>=11){
        const sql="SELECT image FROM images WHERE class IN ('wnavy', 'wgray', 'wblack', 'wbrown', 'wivory', 'wskyblue', 'wlightgreen', 'cnavy', 'cgray', 'cblack', 'cbrown', 'civory', 'cskyblue', 'clightgreen', 'enavy', 'egray', 'eblack', 'ebrown', 'eivory', 'eskyblue', 'elightgreen', 'knavy', 'kgray', 'kblack', 'kbrown', 'kivory', 'kskyblue', 'klightgreen', 'nnavy', 'ngray', 'nblack', 'nbrown', 'nivory', 'nskyblue', 'nlightgreen', 'onavy', 'ogray', 'oblack', 'obrown', 'oivory', 'oskyblue', 'olightgreen', 'vnavy', 'vgray', 'vblack', 'vbrown', 'vivory', 'vskyblue', 'vlightgreen', 'tnavy', 'tgray', 'tblack', 'tbrown', 'tivory', 'tskyblue', 'tlightgreen', 'snavy', 'sgray', 'sblack', 'sbrown', 'sivory', 'sskyblue', 'slightgreen') AND UserId="+loginedUserId+" ORDER BY ImageId DESC LIMIT 4";
        console.log(sql);
         connection.query(sql, async function(err, result){
          var result_list={
            scheduletype: ScheduleType4Recommends1,
            img: result,
          };
          //result_list.push(result);
          res.send(result_list);
        });
      }

    }else if(ScheduleType4Recommends1=="일상"){
      const sql = "SELECT class FROM images where UserId="+loginedUserId;
      await connection.query(sql, async function(err, result){
        Classes = [];
        for (var i=0; i<result.length; i++){
          Classes[i] = result[i].class
        }
        const recommend_list = await Calculate_RecommendationLevel(loginedUserId) // 추천도 리스트 받아오기 (24개 클래스)
        RecommendImageId = []; // 마이클로젯 기반으로 최종 추천할 리스트
        for (var i=0; i<recommend_list.length; i++){ // 24
          for (var j=0; j<Classes.length; j++){ // 가변적
            if (recommend_list[i] == Classes[j]){ //24개와 사용자 등록 클래스를 일일이 비교 => 일치했다?
              RecommendImageId.push(j+1) // 추천 리스트에 추가
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
            myclosetlist.push(result);
            var result_list={
              scheduletype: ScheduleType4Recommends1,
              img: myclosetlist[0],
            };
            //result_list.push(result);
            res.send(result_list);
            //res.send(myclosetlist)
          })
    })
    }}
    
});

//-----------------------------------------------------------------------------------------------코디추가
router.post('/addcody', isLoggedIn, upload2.single('addimage'), async (req, res,next)=>{
    try{
      const addcodypost=await Codi_image.create({
        image_path:`${req.file.filename}`,
        date: req.body.date,
        UserId: req.user.id,
      });
      res.redirect('/calendar');
    }catch(error){
      res.redirect('/calendar');
      //console.error(error);
      //next(error);
    }
    
    });
//------------------------------------------------------------------------------------------------일정추가
    router.post('/addschedule',isLoggedIn, async (req, res,next)=>{
      try{
        const addschedulepost=await Schedule.create({
          date:req.body.datesch,
          schedule_type: req.body.scheduletype,
          UserId: req.user.id,
        });
        res.redirect('/calendar');
      }catch(error){
        
        //console.error(error);
        
        //next(error);
        res.redirect('/calendar');
      }
  }); 


//------------------------------------------------------------------------------------------------일정 수정/삭제 & 코디 수정/삭제
//수정, 삭제부분 
router.delete('/deleteSchedule',isLoggedIn, async (req, res,next)=>{
  try{
    const user = await User.findOne({where :{id: req.user.id}});
    const deleteSchedule=await Schedule.destroy({
      where: {
        date: req.body.date,  
        UserId: req.user.id
      },
    });
    
    //로그인한 유저의 스케줄목록
    const sched=await user.getSchedules({
      raw:true,
      attributes:['schedule_type','date'],
    }
    );
    res.send(sched);

    //res.redirect('/calendar');
  }catch(error){
    console.error(error);
    next(error);
  }
});

router.delete('/deleteCody',isLoggedIn, async (req, res,next)=>{
  try{
    const user = await User.findOne({where :{id: req.user.id}});
    const deleteCody=await Codi_image.destroy({
      where: {
        date: req.body.date,  
        UserId: req.user.id
      },
    });

    const codi=await user.getCodi_images({
      raw:true,
      attributes:['image_path','date'],
    });
    res.send(codi);

    //res.redirect('/calendar');
  }catch(error){
    console.error(error);
    next(error);
  }
});

  module.exports = router;