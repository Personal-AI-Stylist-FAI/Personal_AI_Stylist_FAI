//미듦웨어는  (req, res, next) 가 있는 함수라고 생각하셈.  

const { User, Schedule } = require("../models");

//로그인 했나 판단하는 미들웨어
exports.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) { //로그인됨. 
      next();
    } else {
      res.render('index_without_login.html');
      //res.status(403).send('로그인 필요'); //next가 없으니까 여기서 끝남. 
    }
  };

//로그인 안했나 판단하는 미들웨어
  exports.isNotLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
      next(); //로그인이 안되어있으면 next
    } else {
      const message = encodeURIComponent('로그인한 상태입니다.');
      res.redirect(`/?error=${message}`);
    }
  };

  /*
******추천
1. 로그인된 유저 파악(id로)
2. 스케줄테이블에서 해당 유저id가들어있는 행 찾기
3. 그 데이터중 오늘 날짜와 비교하여 오늘 날짜와 간격이 가장 좁고 더 빠른 날짜 고르기 
4. 해당 날짜에 등록된 스케줄타입확인
5. 일상이면 4567반환, 업무면 2345반환이런식으로 구현
6. 반환된 값을 프런트에서 크롤링 
& closet이미지테이블에 가서 해당 유저id들어있는 행 찾고, 그 이후 해당 클래스값이 들어있는 imagepath찾아 해당 이미지 보여주기. 
formdata를 get한다고 치면...?
*/
  exports.calendarRecommend= async (req,res,next)=>{
    //유저아이디받기
    //해당 유저아이디가 들어있는 row 전체를 조회하기
    //const user = await User.findOne({where :{id: req.user.id}});
    const everySchedule=await Schedule.findAll({where:{ UserId: req.user.id }});
    const [results, metadata] = await sequelize.query("UPDATE users SET y = 42 WHERE x = 12");
    
    //그 전체 중에 date를 오늘날짜보다 같거나 크면서 차이가 가장 적은 row를 골라서 
    //거기에 들어있는 스케줄타입이랑 date을 변수에 담기. 
    //해당 date에서 '달'에 해당하는 게 가을겨울여름봄면? 
    //만약스케줄타입이 일상이면->
    //업무면 ->  ..클래스 를 반환하되, 
    //

  };