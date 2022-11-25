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
    ImageURLS = [];
    top = [];
    bottom = [];
    onepiece = [];
    outer = [];
 
    for (var i=0; i<result.length; i++){
      Classes[i] = result[i].class[0]
      ImageURLS[i] = result[i].image
    }

    console.log(Classes)

    ClassTop = ['a', 'b', 'c', 'd', 'e', 'f', 'w', 'W']
    ClassBottom = ['g', 'h', 'J_', 'k', 'l', 'm', 'n']
    ClassOnepiece = ['o', 'p', 'q', 'r']
    ClassOuter = ['s', 't', 'u', 'v', 'x', 'y']

    for (var i=0; i<Classes.length; i++){
      if (ClassTop.includes(Classes[i]) == true) {
        top.push(ImageURLS[i])
      }
      if (ClassBottom.includes(Classes[i]) == true) {
        bottom.push(ImageURLS[i])
      }
      if (ClassOnepiece.includes(Classes[i]) == true) {
        onepiece.push(ImageURLS[i])
      }
      if (ClassOuter.includes(Classes[i]) == true) {
        outer.push(ImageURLS[i])
      }
    }

    const myclosetresult = {
      user_name: user.name,
      top: top.slice(0, 6),
      bottom: bottom.slice(0, 6),
      onepiece: onepiece.slice(0, 6),
      outer: outer. slice(0, 6)
    }


    res.send(myclosetresult)
  })
});

module.exports = router;