var express = require('express');
var router = express.Router();
var {randomBytes} = require('crypto');
var bcrypt = require('bcrypt');

var {queryDB} = require('../../modules/database.js');
var {verifyEmail, verifyPassword, verifyUsername} = require('../../modules/verifyInfo.js');

//send all guests to the login page
router.use(function(req, res, next){
  const validUser = req.session.initalized && !req.session.user.guest;

  return next();

  if (validUser){
    next();
  }else{
    res.send({redirect:{path:'/login'}})
  }
});

router.post('/relog', function(req,res,next){
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
    queryDB("SELECT * FROM account WHERE uuid = ?", req.session.user.uuid, function(err, result){
      try {
        if (err) return next(err);
        let info = result[0];
        
        if (!req.session.user.verified){
          return next(); //if not verified, dont send a code, the email could be wrong
        }
        
        let buffer = randomBytes(0.5 * 6);
        let code = buffer.toString('hex').toUpperCase();
        console.log(code);
  
        req.session.token = {
          value:code,
          expiration:Date.now() + 1000 * 60 * 15
        }
    
        //generate params
        let params = new URLSearchParams();
        params.append('email',hideEmail(info.email));
    
        res.send({redirect:{path:'/dashboard/account/relog?' + params.toString()}});
      } catch (error) {
        next (error);
      }
    });
  }else{
    next();
  }
});

router.post('/getInfo', function(req,res,next){
  queryDB("SELECT * FROM account WHERE uuid = ?", req.session.user.uuid, function(err, result){
    if (err) return next(err);

    info = result[0];

    info.email = hideEmail(info.email);
    delete info.password;
    delete info.uuid;

    res.send({result:info});
  });
});

router.post('/setUsername', function(req,res,next){
  verifyUsername(req.body.username, function(err, result){
    if (err) return next (err);

    let [clientError, newUsername] = result;

    if (clientError){
      res.send({error:clientError});
    }else{
      //set username
      queryDB('UPDATE account SET username = ? WHERE uuid = ?',[newUsername, req.session.user.uuid], function(err,result){
        if (err) return next(err);
  
        res.send({result:newUsername,alert:'Your username has been updated'});
      });
    }
  });
});

router.post('/setPassword', function(req,res,next){
  queryDB("SELECT * FROM account WHERE uuid = ?",req.session.user.uuid, function(err, result){
    if (err) return next(err);

    let currentHash = result[0].password;

    bcrypt.compare(req.body.currentPassword, currentHash, function(err, same){
      if (err) return next (err);

      if (same){
        if (req.body.newPassword !== req.body.newPasswordConfirm){
          return res.send({error:'The passwords do not match'});
        }

        verifyPassword(req.body.newPassword, function(err, clientError){
          if (err) return next (err);

          if (clientError){
            res.send({error:clientError});
          }else{
            // set password
            bcrypt.hash(req.body.newPassword, 10, function(err, newHash) {
              if (err) return next (err);
              queryDB('UPDATE account SET password = ? WHERE uuid = ?',[newHash, req.session.user.uuid], function(err,result){
                if (err) return next(err);
        
                res.send({alert:'Your password has been updated'});
              });
            });
          }
        })
      }else{
        res.send({error:'The current password is incorrect'});
      }
    })
  })
});

router.post('/setEmail', function(req,res,next){
  try {
    verifyEmail(req.body.email, function(err, result){
      if (err) return next (err);
  
      if (result.error){
        res.send({error:result.error});
      }else{
        //set username
        queryDB('UPDATE account SET email = ? WHERE uuid = ?',[req.body.email, req.session.user.uuid], function(err,result){
          if (err) return next(err);
  
          res.send({alert:'Your email has been updated', result:{email:hideEmail(req.body.email)}});
        });
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post('*', function(req,res,next){

});

module.exports = router;

//an error being thrown here is fine, as it will be caught by the try catch because this is a synchronous function.
function hideEmail(email){
  let atIndex = email.indexOf('@');

  let start = email.slice(0,atIndex);
  let end = email.slice(atIndex);

  let dotIndex = end.indexOf('.');

  return start.slice(0,3) + '*****@***' + end.slice(dotIndex);
}
