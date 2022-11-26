const express = require('express');
const multer = require('multer');
const path = require("path"); 
const ejs = require('ejs');
const fs = require('fs');

const mysql = require('mysql');
const dbconfigg = require('C:/node_workspace/express-mysql-example/config/database.js');
const connection = mysql.createConnection(dbconfigg);

const {sequelize} = require('C:/node_workspace/express-mysql-example/models');
const { isLoggedIn, isNotLoggedIn, calendarRecommend } = require('./middlewares');
const { Schedule, User, Codi_image} = require('../models');


const router = express.Router();

router.get('/', isLoggedIn, (req, res) =>{
    res.render("mycloset.html")
});


const async = require('async');
const PythonShell = require('python-shell');
var class_value;
function GettingClass(image_loc){
    console.log(image_loc); //=>1
      var options = {
        mode: 'text',
        //pythonPath: '',
        pythonOptions: ['-u'],
        //scriptPath: '',
        args: [image_loc]
      }

return new Promise(function(resolve, reject) {
    PythonShell.PythonShell.run('C:\\node_workspace\\express-mysql-example\\classifier\\predictClass.py', options, function A (err, results) {
        if (err) throw err;
        class_value = results;
        console.log(class_value);
        resolve(class_value[2]);
      });
} )
}

var class_value2;
function GettingClass2(image_loc){
    console.log(image_loc); //=>1
      var options = {
        mode: 'text',
        //pythonPath: '',
        pythonOptions: ['-u'],
        //scriptPath: '',
        args: [image_loc]
      }

return new Promise(function(resolve, reject) {
    PythonShell.PythonShell.run('C:\\node_workspace\\express-mysql-example\\classifier\\predictColor.py', options, function A (err, results) {
        if (err) throw err;
        class_value2 = results;
        console.log(class_value2);
        resolve(class_value2[2]);
      });
} )
}

var storage = multer.diskStorage({
    destination: function (req, file, cb){
        cb(null, "public/images/");
    },
    filename: function (req, file, cb){
        const ext = path.extname(file.originalname);
        cb(null, path.basename(file.originalname, ext)+
        "-"+Date.now()+ext);
        //cb(null,Date.now()+"-"+file.originalname )
    },
});

var upload = multer({storage: storage});

//마이클로젯- 파일 업로드 라우터
const ImageType_1 = '사용자 등록'; const ImageType_2 = '크롤링';
router.post("/add", upload.single("closetimage"), isLoggedIn, async function(req, res, next){
      const user = await User.findOne({where :{id: req.user.id}});
      const loginedUserId = req.user.id;
      const userId = loginedUserId; // 로그인 part
    const ImageType= ImageType_1;
    // const Class = GettingClass("C:\\node_workspace\\express-mysql-example\\public\\images\\"+`${req.file.filename}`);
    // const Class = GettingClass(`${req.file}`);
    // const Class = "3";  //=> const 변수는 선언 "후에" 사용해야 한다
    // console.log(Class);
    //console.log(req.file);
    const price = null;
    const image = `${req.file.filename}`; //image 경로 만들기
    //console.log(image);
    const location = "C:\\node_workspace\\express-mysql-example\\public\\images\\"
    //const Class = GettingClass(imgfile);
    //console.log(`${location}${image}`);
    const Class = await GettingClass(`${location}${image}`)+await GettingClass2(`${location}${image}`)
    const datas = [userId, ImageType, Class, price, image]
    const sql = "INSERT INTO images(userId, ImageType, class, price, image) values(?, ?, ?, ?, ?)";

    connection.query(sql, datas, function(err, rows){
        if(err) throw err;
        else{
            console.log("rows: "+JSON.stringify(rows));

            res.redirect("/mycloset");
        }
    })

})

// ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ //

// 사용자가 마이클로젯에 등록한 의류를 프론트에 보내는 작업
// 프론트는 이 경로를 요청하여 서비스할 의류 정보를 받을 것
router.get('/myclosetclothes', isLoggedIn, async (req, res) =>{
  const user = await User.findOne({where :{id: req.user.id}});
  const loginedUserId = req.user.id;
  const sql = "SELECT class, image FROM images where UserId="+loginedUserId+" ORDER BY ImageId DESC"
  await connection.query(sql, async function(err, result){
    //console.log(result[0].class)
    Classes = [];
    Color = [];
    ImageURLS = [];
    top = [];
    bottom = [];
    onepiece = [];
    outer = [];
    
    for (var i=0; i<result.length; i++){
      End = result[i].length
      Classes[i] = result[i].class[0]
      if (Classes[i] == 'J'||Classes[i] == 'W'){
        Color[i] = result[i].class.slice(2, End)
      }else{
        Color[i] = result[i].class.slice(1, End)
      }
      ImageURLS[i] = result[i].image
    }

    console.log(Classes)

    ClassTop = ['a', 'b', 'c', 'd', 'e', 'f', 'w', 'W']
    ClassBottom = ['g', 'h', 'J', 'k', 'l', 'm', 'n']
    ClassOnepiece = ['o', 'p', 'q', 'r']
    ClassOuter = ['s', 't', 'u', 'v', 'x', 'y']

    var CN = {
      'a' : '민소매','b' : '반팔티셔츠','c' : '긴팔티셔츠','d' : '후드티','e' : '긴블라우스',
      'f' : '반팔블라우스','g' : '반바지','h' : '청바지','J' : '조거팬츠','k' : '슬랙스',
      'I' : '롱스커트','n' : '정장스커트','m' : '미니스커트','o' : '롱원피스','p' : '숏원피스',
      'q' : '짧은점프슈트','r' : '긴점프슈트','s' : '코트','t' : '가디건','u' : '패딩',
      'v' : '자켓','w' : '셔츠','W' : '체크셔츠','x' : '조끼','y' : '점퍼'
  }

  var CN2 = {
    'red' : '빨간색', 'orange' : '주황색', 'yellow' : '노랑색','lightgreen' : '연두색',
    'green' : '초록색','skyblue' : '하늘색','navy' : '남색','gray' : '회색','black' : '검은색',
    'white' : '흰색','brown' : '갈색','purple' : '보라','pink' : '분홍','ivory' : '아이보리',
    'blue': '파란색'
}

    for (var i=0; i<Classes.length; i++){
      if (ClassTop.includes(Classes[i]) == true) {
        top2 = { url: ImageURLS[i],
          classname: CN[Classes[i]],
          color: Color[i]
        }
        top.push(top2)
      }
      if (ClassBottom.includes(Classes[i]) == true) {
        bottom2 = { url: ImageURLS[i],
          classname: CN[Classes[i]],
          color: Color[i]
        }
        bottom.push(bottom2)
      }
      if (ClassOnepiece.includes(Classes[i]) == true) {
        onepiece2 = { url: ImageURLS[i],
          classname: CN[Classes[i]],
          color: Color[i]
        }
        onepiece.push(onepiece2)
      }
      if (ClassOuter.includes(Classes[i]) == true) {
        outer2 = { url: ImageURLS[i],
          classname: CN[Classes[i]],
          color: Color[i]
        }
        outer.push(outer2)
      }
    }

    const myclosetresult = {
      user_name: user.name,
      top: top.slice(0, 6),
      bottom: bottom.slice(0, 6),
      onepiece: onepiece.slice(0, 6),
      outer: outer. slice(0, 6)
    }
//console.log(myclosetresult)

    res.send(myclosetresult)
  })
});

module.exports = router;