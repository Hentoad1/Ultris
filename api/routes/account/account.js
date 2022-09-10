var express = require('express');
var router = express.Router();

var database = require('../../modules/database.js');

router.use(function(req, res, next){
  const session = req.session;
  const validUser = session.initalized && !session.user.guest;
  const needsRelog = session.user.lastLogged < (Date.now() - 1000 * 10/*60 * 60 * 24*/);

  return next(); //just for testing, remove later

  if (validUser){
    if (needsRelog){
      res.send({redirect:{path:'/dashboard/account/relog'}})
    }else{
      next();
    }
  }else{
    res.send({redirect:{path:'/login'}})
  }
});

router.post('/getInfo', function(req,res,rext){
  res.send({result:{username:'qqq'}});
});

router.post('*', function(req,res,next){

});

module.exports = router;
