//calender 페이지 랜더링
app.get('/calender', function(req, res,next){
    const sql1="SELECT * FROM schedule; ";
    const sql2="SELECT * FROM codi_image; ";
    const sql="SELECT * FROM schedule; " + "SELECT * FROM codi_image; "
  
  conn.query(sql,function(err,results,fields){
    var sql1_result=results[0];
    var sql2_result=results[1];
    /*
    for(var i = 0; i < sql1_result.length ; i++){
      console.log(sql1_result[i],sql1_result[i].date, sql1_result[i].schedule_type_id);
  }
    for(var i = 0; i < sql2_result.length ; i++){
    console.log(sql2_result[i],sql2_result[i].date, sql2_result[i].codi_image_name);
  }*/
  res.render('calender.ejs',{
  postschedule: results[0],
  postimage: results[1] })
    });
    //
  });
  app.post('/calender/addschedule', function(req, res,next){
      var body = req.body;
      console.log(body);
      const userId=0;
      const datesch=body.datesch;
      const scheduletype=body.scheduletype;
      const vlog=body.vlog;
      console.log(datesch)
      var sql = 'INSERT INTO schedule VALUES(?, ?, ?, ?)';
      var datas = [userId, datesch, scheduletype, vlog];
      console.log(sql);
      conn.query(sql, datas, function(err) {
          if(err) {
          console.log(datas);
          console.log('query is not excuted. insert fail...\n' + err);}
          
          else {
          res.redirect('/calender');}
      });
  });
  
  
  
  /*
  
  // 삭제
  app.get('/delete/:ImageId', (req, res)=>{
      const sql = "DELETE FROM images WHERE ImageId = ?";
      connection.query(sql, [req.params.ImageId], function(err, result, fields){
          if(err) throw err;
          console.log(result);
          res.redirect('/images');
      })
  })
  */
  
  
  
  
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
  
  
  
  app.post('/calender/addcody', upload2.single('addimage'), function(req, res, next){
  
      var body = req.body;
      console.log(body);
    
      const codi_image_id=0;
      const userId=0;
      const dates=body.date;
      const image=`/image/${req.file.filename}`;
    
    
      const datas=[codi_image_id,image, dates, userId]
      var sql = 'INSERT INTO codi_image VALUES(?, ?, ?, ?)';
      
      console.log(sql);
      conn.query(sql, datas, function(err) {
          if(err) {
            console.log('query is not excuted. insert fail...\n' + err);
            //res.status(500).send('Internal Server Error');
          }
          else {
            console.log(datas);
            res.redirect('/calender');
          }
      });  
      });