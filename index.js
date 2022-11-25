//const id = require('./search_user');
const express = require('express');
const ejs = require('ejs');
const mysql = require('mysql');
const session=require('express-session');
var cookieParser = require('cookie-parser');
var morgan = require('morgan');
const nunjucks = require('nunjucks');

const app = express();
let fs = require('fs');

const bodyParser = require('body-parser')
const multer = require("multer");
const path = require("path"); 
const passport =require("passport");
const dotenv=require("dotenv");
dotenv.config();

app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(express.json());
app.use(bodyParser.json());

const { sequelize } =require('./models');
const passportConfig=require('./passport');
const { runInNewContext } = require('vm');
passportConfig();//패스포트 설정



app.set('port', process.env.PORT || 3000);
app.use('/public', express.static("public"));
app.use(morgan('dev'));


app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
nunjucks.configure('views', {
  express: app,
  watch: true,
});
app.set('views', './views');



//node와 mysql연결_이부분이 없으면 연결되지 않는다. 
sequelize.sync({ force: false })//force: true로하면 테이블 삭제되고 다시 생성된다. 
  .then(() => {
    console.log('데이터베이스 연결 성공');
  })
  .catch((err) => {
    console.error(err);
  });

app.use(morgan('dev')); 
//db_config.connect(conn);
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
    resave:false,
    saveUninitialized:false,
    secret:process.env.COOKIE_SECRET,
    cookie:{
        httpOnly:true,
        secure:false,
    },
}));

app.get('/eco', (req, res) =>{
    res.render("eco.html")
});


//<-------------------------------------------->
// 라우터 파트
const mainRouter = require('./routes/main');
const authRouter = require('./routes/auth');
const calendarRouter = require('./routes/calendar');
const myclosetRouter = require('./routes/mycloset');
const mypageRouter = require('./routes/mypage');
const shopRouter = require('./routes/shop');

//라우터에 가기 전에 설정해줘야하고 express-session보다는 아래에 있어야한다. 왜냐면 express-session을 세션에 저장했고 passport는 그 세션을 받아서 처리 해줘야하기때문에, 그리고 미들웨어는 위에서 아래로 실행되기 때문에
app.use(passport.initialize());
app.use(passport.session());//_이 둘이 아래에 있음으로 얻을 수 있는 결과는 로그인 후에 그다음 요청부터 passport세션이 실행될때 deserialize가된다. 

app.use('/', mainRouter);
app.use('/auth', authRouter);
app.use('/calendar', calendarRouter);
app.use('/signup_about_shopping', mypageRouter);
app.use('/mycloset', myclosetRouter);
app.use('/shop', shopRouter);


app.use((req,res,next)=>{
    const error=new Error(`${req.method} ${req.url} 라우터가 없습니다. `);
    error.status=404;
    runInNewContext(error);
});



//에러처리 미들웨어_개발모드/비개발모드
app.use((err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = process.env.NODE_ENV !== 'production' ? err : {};
    res.status(err.status || 500);
    res.render('error');
  });

// localhost:3000 에서 실행
app.listen(app.get('port'), ()=> {
    console.log('Express server listening on port '+ app.get('port'));
})
