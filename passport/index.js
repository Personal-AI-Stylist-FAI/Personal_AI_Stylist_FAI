const passport=require("passport");
const local=require('./localStrategy');//로그인을 어찌할지 저장해둔 파일. 근데 이건 sns없이 직접가입하는 로컬방식. 
const User =require('../models/user');

module.exports = () => {
    passport.serializeUser((user, done) => {//a.이게 실행된다. (auth.js에서 a찾으면 내용이 이어진다.) req.login(user에서 넣어준 user객체가 여기로 온다. 
      done(null, user.id); //세션에 유저의 id만 저장_이거만 하는 이유는 세션에 저장가능한 메모리는 한정되어있기때문에, 통채로 저장하기보다 id값만 저장해두고 해당 id에 맞는 정보를 필요에따라 불러오기 위함이다. 사실 실무에선 메모리에 조차 저장하면 안된다. 별도의 db가 필요(15장) 해당 문장 대신에 done(null, user); 라고 하면 user통채로 세션에 저장된다. 
    });//여기는 id만 추리고
  
    passport.deserializeUser((id, done) => {//필요할때 서버메모리에서 들고있는 정보 {id:3,'connect.sid:s%345453687456837'}_세션id와 세션쿠키(브라우저로 감. 브라우저에서 요청을 보낼때 마다 이 쿠키를 가이 보낸다.)
      User.findOne({ where: { id } }) //필요시에 사용자 정보를 복구하는 부분. 
        .then(user => done(null, user)) //유저 찾아 전체 정보를 복구하고 req.user라는 속성으로 접근이 가능해진다. 미들웨어에서 req.user하면 로그인한 사용자의 정보가 나온다. req.isAuthenticated() 함수를 실행하면 로그인이 되었을땐 true가 나온다. 
        .catch(err => done(err));
    });
  
    local();
  };
