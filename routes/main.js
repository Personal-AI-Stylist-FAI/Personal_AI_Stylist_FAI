const express = require('express');
const sequelize = require("sequelize");
const multer = require("multer");
const path = require("path"); 

const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const mysqll = require('mysql');
const { Schedule, User, Codi_image, Preference} = require('../models');
const dbconfigg = require('../config/database.js');
const connection = mysqll.createConnection(dbconfigg);
const router = express.Router();
const Op = sequelize.Op;

router.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});
router.get('/',isLoggedIn,async(req,res,next)=>{
  res.render('index.html');
});
router.get('/getRecent9', isLoggedIn, async(req,res,next)=>{
  
  const loginedUserId= req.user.id;
  console.log(loginedUserId);
  
  //---------------------------------------------------------------------1. 옷장속 옷 최신 9개 & 옷 대분류 전달
  const sql = "SELECT class, image FROM images WHERE UserId=" + loginedUserId + " ORDER BY ImageId DESC LIMIT 9";
  await connection.query(sql, async function(err, result){
    var classes=[];
    var type=[];
    var mainCategory=[];
    var imgs=[];
    var fin_results=[];

    if(result.length==0){
      fin_results={
          img: null,
          type: null,
          class: null,
          mainCategory: null
      }
    }else{
      for (var i=0; i<result.length; i++){
        classes[i] = result[i].class[0];
        imgs[i]=result[i].image;
        
        if(classes[i]=='a'){
          type[i]="민소매";
          mainCategory[i]="상의";
        }else if(classes[i]=='b'){
          type[i]="반팔티셔츠";
          mainCategory[i]="상의";
        }else if(classes[i]=='c'){
          type[i]="긴팔티셔츠";
          mainCategory[i]="상의";
        }else if(classes[i]=='d'){
          type[i]="후드티";
          mainCategory[i]="상의";
        }else if(classes[i]=='e'){
          type[i]="긴블라우스";
          mainCategory[i]="상의";
        }else if(classes[i]=='f'){
          type[i]="반팔블라우스";
          mainCategory[i]="상의";
        }else if(classes[i]=='g'){
          type[i]="반바지";
          mainCategory[i]="하의";
        }else if(classes[i]=='h'){
          type[i]="청바지";
          mainCategory[i]="하의";
        }else if(classes[i]=='J'){
          type[i]="조거팬츠";
          mainCategory[i]="하의";
        }else if(classes[i]=='k'){
          type[i]="슬랙스";
          mainCategory[i]="하의";
        }else if(classes[i]=='l'){
          type[i]="롱스커트";
          mainCategory[i]="하의";
        }else if(classes[i]=='m'){
          type[i]="미니스커트";
          mainCategory[i]="하의";
        }else if(classes[i]=='n'){
          type[i]="정장스커트";
          mainCategory[i]="하의";
        }else if(classes[i]=='o'){
          type[i]="롱원피스";
          mainCategory[i]="원피스";
        }else if(classes[i]=='p'){
          type[i]="숏원피스";
          mainCategory[i]="원피스";
        }else if(classes[i]=='q'){
          type[i]="짧은점프슈트";
          mainCategory[i]="원피스";
        }else if(classes[i]=='r'){
          type[i]="긴점프슈트";
          mainCategory[i]="원피스";
        }else if(classes[i]=='s'){
          type[i]="코트";
          mainCategory[i]="아우터";
        }else if(classes[i]=='t'){
          type[i]="가디건";
          mainCategory[i]="아우터";
        }else if(classes[i]=='u'){
          type[i]="패딩";
          mainCategory[i]="아우터";
        }else if(classes[i]=='v'){
          type[i]="자켓";
          mainCategory[i]="아우터";
        }else if(classes[i]=='w'){
          type[i]="셔츠";
          mainCategory[i]="상의";
        }else if(classes[i]=='W'){
          type[i]="체크셔츠";
          mainCategory[i]="상의";
        }else if(classes[i]=='x'){
          type[i]="조끼";
          mainCategory[i]="상의";
        }else if(classes[i]=='y'){
          type[i]="점퍼";
          mainCategory[i]="아우터";
        }
        
        fin_results[i]={
          img: imgs[i],
          type: type[i],
          class: result[i].class,
          mainCategory: mainCategory[i]
        }
      }
    }
    
    
       if(err) throw err;
        else{
          console.log(fin_results);
          res.send(fin_results);
        }
  })
});

router.get('/get4Info', isLoggedIn, async (req, res, next) => {
  const user = await User.findOne({where :{id: req.user.id}});
  const today_date=new Date();
  

  //---------------------------------------------------------------------2. 최근접미래일정{날짜/종류}
  const nearestSched=await user.getSchedules({
    raw:true,
    attributes:['schedule_type','date'],
    where:{ date: {[Op.gte]: today_date}},
    order:[['date','ASC']],
    limit:1,
  });
  
  
  //---------------------------------------------------------------------3. 최근접미래코디{이미지경로만}
  const nearestCodi=await user.getCodi_images({
    raw:true,
    attributes:['image_path'],
    where:{ date: {[Op.gte]: today_date}},
    order:[['date','ASC']],
    limit:1,
  });


  //---------------------------------------------------------------------4. 쇼핑예산/주기/열린정도
  const user3Pref = await Preference.findOne({
    raw:true,
    attributes: ['price_max','shopping_term', 'open_to_newstyle'],
    where: {UserId: req.user.id}});
  
  const indexPageResult={
    user_name: user.name,
    nearestSched: nearestSched,
    nearestCodi: nearestCodi,
    user3Pref: user3Pref,
  }

  res.send(indexPageResult);
});

router.get('/login',isNotLoggedIn, (req, res,next) => {
  res.render('login.html');
});

router.get('/signup', isNotLoggedIn, (req, res,next) => {
  res.render('signup.html');
});


module.exports = router;