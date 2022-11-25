const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

const User = require('../models/user');

module.exports = () => {
  passport.use(new LocalStrategy({//auth.js에 로컬로그인부분이 실행되면 여기가 연결되어 실행되게 된다. 
    usernameField: 'email', //req.body.email (즉, 프런트의 요청 바디에서 이메일과 패스워드를 보내줘야함)_usernameField: 'id', //req.body.id 이런식으로 둘이 일치해야한다. 
    passwordField: 'password', //req.body.password
  }, async (email, password, done) => {
    try {
      const exUser = await User.findOne({ where: { email } });//로그인할때도 이 이메일을 가진 사람이 있는지 확인하고
      if (exUser) {//이메일이 있을 때
        const result = await bcrypt.compare(password, exUser.password);//bcrypt.compare로 입력한 비밀번호와 해시화된 디비에 저장된 비밀번호와 비교한다. 
        if (result) {//결과가 참 또는 거짓으로 나온다. 
          done(null, exUser);//비밀번호 일치_1.서버에러가 없다면 2.유저객체를 넣어줌
        } else {
          done(null, false, { message: '비밀번호가 일치하지 않습니다.' });//비밀번호 불일치_
        }
      } else {//이메일을 가진 사람이 없으면 가입되지않은 회원이라고 알림
        done(null, false, { message: '가입되지 않은 회원입니다.' });//done함수는 인수를 3개읽는다._1.서버에러 2.??,3.메세지=> 이 함수 호출하면 그제서야 auth.js의 /login의 (authError,user,info)~~거기로 가서 실행된다. 
      }
    } catch (error) {
      console.error(error);
      done(error);
    }
  }));
};