var express = require('express');
var crypto = require('crypto');
var router = express.Router();

var database = require('../../modules/database.js');
var {verifyEmail, verifyPassword, verifyUsername} = require('../../modules/verifyInfo.js');

//send all guests to the login page
router.use(function(req, res, next){
  const validUser = req.session.initalized && !req.session.user.guest;

  if (validUser){
    next();
  }else{
    res.send({redirect:{path:'/login'}})
  }
});

router.post('/relog', function(req,res,rext){
  if (req.session.token.value === req.body.token && Date.now() < req.session.token.expiration){
    req.session.secure = {
      value:true,
      expiration:Date.now() + 1000 * 60 * 60
    };
    
    res.send({redirect:{path:'/dashboard/account/'}});
  }else{
    res.send({error:'The code is incorrect or has expired.'})
  }

});

router.use(function(req, res, next){
  if (!req.session.secure.value || Date.now() > req.session.secure.expiration){
    database.getInfo(req.session.user.uuid, function(err, info){
      if (err) return next(err);
      
      crypto.randomBytes(0.5 * 6,function(err, buffer){
        if (err) next (err);

        let code = buffer.toString('hex').toUpperCase();
        console.log(code);

        req.session.token = {
          value:code,
          expiration:Date.now() + 1000 * 60 * 15
        }
  
        //generate params
        let params = new URLSearchParams();
        params.append('email',hideEmail(info.email));
  
        res.send({redirect:{path:'/dashboard/account/relog?' + params.toString()}})
      });
    });
  }else{
    next();
  }
});

router.post('/getInfo', function(req,res,rext){
  database.getInfo(req.session.user.uuid, function(err, info){
    if (err) return next(err);

    info.email = hideEmail(info.email);
    delete info.password;
    delete info.uuid;

    res.send({result:info});
  });
});

router.post('/setUsername', function(req,res,rext){
  let [clientError, username] = verifyUsername(req.body.username);

  if (clientError){
    res.send({error:clientError});
  }else{
    //set username

    res.send({result:username});
  }

});

router.post('/setPassword', function(req,res,rext){
  if (req.body.newPassword !== req.body.newPasswordConfirm){
    return res.send({error:'The Passwords Do not Match'});
  }

  let [clientError, password] = verifyUsername(req.body.username);

  if (clientError){
    res.send({error:clientError});
  }else{
    //set username

    res.send({result:password});
  }
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
