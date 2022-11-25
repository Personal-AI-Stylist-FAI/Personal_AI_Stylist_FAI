const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const User = require('../models/user');
const Preference = require('C:/node_workspace/express-mysql-example/models/preference.js');
const { max } = require('../models/user');

const router = express.Router();

//회원가입
router.post('/signup', isNotLoggedIn, async (req, res, next) => { //isNotLoggedIn로그인 안한 사람만 접근할수 있도록_이걸 통과해야 그 뒤로 넘어갈수 있음. 
  const { email, name, password } = req.body;//프런트에서 이메일, 이름, 패스워드를 전달받는다.
  try {
    const exUser = await User.findOne({ where: { email } }); //근데 먼저 검사를 하는 것. 기존에 이 이메일로 가입한 사람이 있는지.
    if (exUser) {
      return res.redirect('/signup?error=exist');//만약에 있다면 이미 존재하는 가입자라는걸 알려야 하기때문에 리다이렉트시에 해당 이메일이 이미 존재하는 이메일 이구나 하고 프런트에서 이걸보고 알아서 처리해줘야함. 
    }
    const hash = await bcrypt.hash(password, 12);//만약 이메일이 없다면 회원가입 가능해야_비밀번호를 해시화하여 전달. 
    await User.create({
      email,
      name,
      password: hash,
    });
    User.max('id').then(async max => {
      const preference = await Preference.create({
        UserId: max,
        preferred_type: {"I": "1", "a": "1", "b": "1", "c": "1", "d": "1", "e": "1", "f": "1", "g": "1", "h": "1", "k": "1", "m": "1", "n": "1", "o": "1", "p": "1", "q": "1", "r": "1", "s": "1", "t": "1", "u": "1", "v": "1", "w": "1", "x": "1", "y": "1", "J_": "1", "W_": "1"},
        preferred_color:{"red": "1", "blue": "1", "gray": "1", "navy": "1", "pink": "1", "black": "1", "brown": "1", "green": "1", "ivory": "1", "white": "1", "orange": "1", "purple": "1", "yellow": "1", "skyblue": "1", "lightgreen": "1"},
          shopping_term: '1',
          price_max: '1',
          open_to_newstyle: '1',
        });
    })
    return res.redirect('/');//다시 홈으로 보낸다. 
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

/*로그인 요청이 들어왔다->

1. passport.authenticate('local',까지 실행되고
2. localstrategy로가서 쭉 실행하면서 (a)가입되지않은 회원인지, (b)비밀번호가 일치하지않는지, (c)로그인 성공인지 판별하고 done함수가 실행되는 순간 다시 돌아와서
3. 아래의 autherror콜백함수가 실행되고, 
4. 로그인이 성공한 경우에는 req.login(하는 순간 passport에 index로 가서 serializeUser로가서 유저의 id만 세션쿠키와 매칭되게 들고있고, 거기서 done하는 순간 다시 아래의 
5. loginError가서 최종적으로 로그인에러가 있는지 확인하고 로그인에 성공하면 다시 메인페이지로 돌려보내준다. 

*/

//로컬로그인
router.post('/login', isNotLoggedIn, (req, res, next) => {//미들웨어 확장 패턴._> 로그인 하지 않은 상태여야 로그인을 진행할 수있음. 
  passport.authenticate('local', (authError, user, info) => {//미들웨어_passport.authenticate('local'이 실행되면 passport에 index를 가고 거기에 local을 연결시켰기 때문에 거기로가서 로컬전략을 찾는다. 
    if (authError) {//서버에 에러가 있는 경우
      console.error(authError);
      return next(authError);
    }
    if (!user) {//로그인이 실패한경우에는 3번째 메세지를 담아서 프런트로 보낸다. _그러면 프런트개발자가 이 메세지를 보고 알아서 처리해야한다.
      return res.redirect(`/?loginError=${info.message}`);
    }
    return req.login(user, (loginError) => {//req.login(user 사용자 객체를 넣어줌. 이걸 하는 순간 어디로가냐면 passport에 index로 가서(a.해당파일로 이동하면 설명 마저 써있음.)
      if (loginError) {
        console.error(loginError);
        return next(loginError);
      }else{
          //세션쿠키를 브라우저로 보내준다. 그래서 로그인 성공하여 브라우저로 돌아가는 순간 브라우저에 세션쿠키가 전달되어있고, 그다음 요청부터는 세션쿠키가 브라우저에 들어가있어 서버가 그 요청을 누가 보낸건지 알수 있게 된다. 즉, 로그인 된 상태가 된다. 
          return res.redirect('/');//로그인 성공
          //console.log("로그인 성공");
          //return res.render("index.html");
      }     
    });
  })(req, res, next); // 미들웨어 내의 미들웨어에는 (req, res, next)를 붙입니다.
});

//로그아웃

router.get('/logout', isLoggedIn, (req, res) => {//로그인 한 사람만 로그아웃 할수 있음.
  req.logout(()=>{
    req.session.destroy(); //세션파괴. 
    res.redirect('/');
  }
   
  ); //세션쿠키가 사라진다. 서버에서 세션쿠키가 지워진다. 그건 로그아웃된거나 마찬가지. 
  
});

module.exports = router;