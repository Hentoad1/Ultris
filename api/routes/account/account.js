var express = require('express');
var router = express.Router();

var database = require('../../modules/database.js');

router.use(function(req, res, next){
  const session = req.session;
  const validUser = session.initalized && !session.user.guest;
  const needsRelog = session.user.lastLogged < (Date.now() - 1000 * 10/*60 * 60 * 24*/);

  //return next(); //just for testing, remove later

  if (validUser){
    if (needsRelog){
      database.getInfo(req.session.user.uuid, function(err, info){
        if (err) return next(err);
    
        let params = new URLSearchParams();
        params.append('email',info.email);

        res.send({redirect:{path:'/dashboard/account/relog?' + params.toString()}})
      });
    }else{
      next();
    }
  }else{
    res.send({redirect:{path:'/login'}})
  }
});

router.post('/getInfo', function(req,res,rext){
  database.getInfo(req.session.user.uuid, function(err, info){
    if (err) return next(err);

    console.log('pre formatted');
    console.log(info);

    info.email = hideEmail(info.email);
    delete info.password;
    delete info.uuid;

    console.log('post format')
    console.log(info);

    res.send({result:info});
  });
});

router.post('*', function(req,res,next){

});

function hideEmail(email){
  let atIndex = email.indexOf('@');

  let start = email.slice(0,atIndex);
  let end = email.slice(atIndex);

  let dotIndex = end.indexOf('.');

  return start.slice(0,3) + '*****@***' + end.slice(dotIndex);
}

module.exports = router;
