var express = require('express');
var router = express.Router();

var database = require('../../modules/database.js');

router.use(function(req, res, next){
  const session = req.session;
  const validUser = session.initalized && !session.user.guest;
  const needsRelog = session.user.lastLogged < (Date.now() - 1000 * 10/*60 * 60 * 24*/);

  if (validUser){
    if (needsRelog){
      console.log('needed relog');
      res.send({redirect:{path:'/dashboard/account/relog'}})
    }else{
      console.log('sent next');
      next();
    }
  }else{
    console.log('sent to login');
    res.send({redirect:{path:'/login'}})
  }
});

router.post('*', function(req,res,next){

});

module.exports = router;
