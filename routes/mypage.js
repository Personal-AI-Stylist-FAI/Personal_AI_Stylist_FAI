const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const bodyParser = require('body-parser')
router.use(bodyParser.urlencoded({
    extended: true
}))
router.use(bodyParser.json());


// 마이 페이지 부분 //
// ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ //

// 모델 정의
const Preference = require('C:/node_workspace/express-mysql-example/models/preference.js');
const {sequelize} = require('C:/node_workspace/express-mysql-example/models');

const Op = sequelize.Op;

const { isLoggedIn, isNotLoggedIn, calendarRecommend } = require('./middlewares');
const { Schedule, User, Codi_image} = require('../models');

router.get('/',  (req, res, next) => {
  try {
    res.render("signup_about_shopping.html");
  } catch (err) {
    console.error(err);
    next(err);
  }
});


router.post('/', isLoggedIn, async (req, res, next) =>{
    const user = await User.findOne({where :{id: req.user.id}});
    const loginedUserId = req.user.id;
    const PresentUserId = loginedUserId
    const request = req.body.shoppingtime;
    const request2 = req.body.shoppingmoney;
    const request3 = req.body.shoppingstyle;
    console.log(request, request2, request3);
    //const show_preference = await Preference.findUserId()
    //console.log("취향정보 테이블 다 털었다", show_preference)
   // 라디오 버튼 그룹에서, 선택한 버튼의 value 값을 받고 싶다면?
   // **노드 문법: request.body."라디오버튼 group의 name"

    const userExists = await Preference.findOne({where: {userid: loginedUserId}});

    if (userExists){
      try{
        const preference = await Preference.update({
            shopping_term: request,
            price_max: request2,
            open_to_newstyle: request3},{
            where: {userid: PresentUserId}
          });
          res.redirect("/signup_about_shopping")
        } catch (err) {
          console.error(err);
          next(err);
        }
    } else {
      try{
      const preference = await Preference.create({
        UserId: PresentUserId,
        preferred_type: {"type":0},
        preferred_color:{"color":0},
          shopping_term: request,
          price_max: request2,
          open_to_newstyle: request3,
        });
      } catch (err) {
        console.error(err);
        next(err);
      }
    }
  })
  
// 의류 종류에 대한 선호도
router.post('/shopping_preference', isLoggedIn, async (req, res, next) =>{
  const user = await User.findOne({where :{id: req.user.id}});
  const loginedUserId = user.id;
  const PresentUserId = loginedUserId

  const sleeveless = req.body.sleeveless;
  const shortt = req.body.shortt;
  const longt = req.body.longt;
  const hoodt = req.body.hoodt;
  const longblouse = req.body.longblouse;
  const shortblouse = req.body.shortblouse;
  const shirt = req.body.shirt;
  const checkshirt = req.body.checkshirt;
  const shortpants = req.body.shortpants;
  const jeans = req.body.jeans;
  const joggerpants = req.body.joggerpants;
  const slacks = req.body.slacks;
  const longskirt = req.body.longskirt;
  const miniskirt = req.body.miniskirt;
  const suitskirt = req.body.suitskirt;
  const longdress = req.body.longdress;
  const shortdress = req.body.shortdress;
  const shortjumpsuit = req.body.shortjumpsuit;
  const longjumpsuit = req.body.longjumpsuit;
  const coat = req.body.coat;
  const cardigan = req.body.cardigan;
  const padding = req.body.padding;
  const jacket = req.body.jacket;
  const vest = req.body.vest;
  const jumper = req.body.jumper;
  console.log(sleeveless, shortt, longt);

  const userExists = await Preference.findOne({where: {userid: loginedUserId}});

  if (userExists){
    try{
      const preference = await Preference.update({
        preferred_type:{
          "a": sleeveless,
          "b": shortt,
          "c": longt,
          "d": hoodt,
          "e": longblouse,
          "f": shortblouse,
          "g": shortpants,
          "h": jeans,
          "J_": joggerpants,
          "k": slacks,
          "I": longskirt,
          "m": miniskirt,
          "n": suitskirt,
          "o": shortdress,
          "p": longdress,
          "q": shortjumpsuit,
          "r": longjumpsuit,
          "s": coat,
          "t": cardigan,
          "u": padding,
          "v": jacket,
          "w": shirt,
          "W_": checkshirt,
          "x": vest,
          "y": jumper,
        }},
         { "where": {UserId: loginedUserId}}
        );
        res.redirect("/signup_about_shopping")
      } catch (err) {
        console.error(err);
        next(err);
      }
  } else {
    res.write("<script>alert('쇼핑 성격 먼저 지정하세요.')</script>");
   // res.render('signup_about_shopping.html')
  }
})
// 의류 색상에 대한 선호도
router.post('/color_personality', isLoggedIn, async (req, res, next) =>{
  const user = await User.findOne({where :{id: req.user.id}});
  const loginedUserId = user.id;
  const PresentUserId = loginedUserId

  const red = req.body.red;
  const orange = req.body.orange;
  const yellow = req.body.yellow;
  const lightgreen = req.body.lightgreen;
  const green = req.body.green;
  const skyblue = req.body.skyblue;
  const blue = req.body.blue;
  const navy = req.body.navy;
  const gray = req.body.gray;
  const black = req.body.black;
  const white = req.body.whitecolor;
  const brown = req.body.brown;
  const purple = req.body.purple;
  const pink = req.body.pink;
  const ivory = req.body.ivory;

  const userExists = await Preference.findOne({where: {userid: loginedUserId}});

  if (userExists){
    try{
      const preference = await Preference.update({
        preferred_color:{
          "red": red,
          "orange": orange,
          "yellow": yellow,
          "lightgreen": lightgreen,
          "green": green,
          "skyblue": skyblue,
          "blue": blue,
          "navy": navy,
          "gray": gray,
          "black": black,
          "white": white,
          "brown": brown,
          "purple": purple,
          "pink": pink,
          "ivory": ivory,
        }},
         { "where": {UserId: loginedUserId}}
        );
        res.redirect("/signup_about_shopping")
      } catch (err) {
        console.error(err);
        next(err);
      }
  } else {
    res.write("<script>alert('쇼핑 성격 먼저 지정하세요.')</script>");
  }
})

// 사용자가 입력한 마이페이지 데이터가 유지되도록 프론트에 보내주는 서버
router.get('/mypagedata', isLoggedIn, async (req, res, next) =>{
  const user = await User.findOne({where :{id: req.user.id}});
  const loginedUserId = req.user.id;
  const PresentUserId = loginedUserId
    const userExists = await Preference.findOne({where: {UserId: loginedUserId}});
  
    if (userExists){
      try{
        var preferred = await Preference.findAll({
          raw: true, // 다른 정보 제외하고 dataValues만 받아오게끔
          attributes: ['preferred_type', 'preferred_color', 'price_max', 'shopping_term', 'open_to_newstyle'],
          where: {UserId: PresentUserId}});
      }
      catch (err) {
        console.error(err);
        next(err);
      }
  }
  
    res.send(preferred)
  
  })

module.exports = router;