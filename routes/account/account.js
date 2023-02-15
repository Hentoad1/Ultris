var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var {randomBytes} = require('crypto');

var {queryDB} = require('../../modules/database.js');
var {verifyEmail, verifyPassword, verifyUsername, hideEmail} = require('../../modules/verifyInfo.js');
var {emailVerifyCode, emailVerifyLink} = require('../../modules/email.js');
var {generateToken} = require('../../modules/generateToken.js');


//send all guests to the login page
router.use(function(req, res, next){
  const validUser = req.session.initalized && !req.session.user.guest;

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
  if (req.session.secure.value && Date.now() < req.session.secure.expiration){
    return next();
  }

  queryDB("SELECT * FROM account WHERE uuid = ?", req.session.user.uuid).then(function(result){
    let info = result[0];
        
    if (!req.session.user.verified){
      return next(); //if not verified, dont send a code, the email could be wrong
    }
        
    let buffer = randomBytes(6 * 0.5);
    let code = buffer.toString('hex').toUpperCase();
    emailVerifyCode({code,to:req.session.user.email}).then(() => {
      req.session.token = {
        value:code,
        expiration:Date.now() + 1000 * 60 * 15
      }
      
      //generate params
      let params = new URLSearchParams();
      params.append('email',hideEmail(info.email));
      
      res.send({redirect:{path:'/dashboard/account/relog?' + params.toString()}});
    }).catch(next);
  }).catch(next);
});

router.post('/getInfo', function(req,res,next){
  queryDB("SELECT * FROM account WHERE uuid = ?", req.session.user.uuid).then(function(result){
    let info = result[0];

    info.email = hideEmail(info.email);
    info.verified = info.verified === 1;
    delete info.password;
    delete info.uuid;

    res.send({result:info});
  }).catch(next);
});

router.post('/setUsername', function(req,res,next){
  verifyUsername(req.body.username).then(function(result){
    let [clientError, newUsername] = result;

    if (clientError){
      return res.send({error:clientError});
    }
    
    queryDB('UPDATE account SET username = ? WHERE uuid = ?',[newUsername, req.session.user.uuid]).then(function(){
      res.send({result:newUsername,alert:'Your username has been updated'});
    }).catch(next);
  }).catch(next);
});

router.post('/setPassword', function(req,res,next){
  queryDB("SELECT * FROM account WHERE uuid = ?",req.session.user.uuid).then(function(result){
    let currentHash = result[0].password;

    bcrypt.compare(req.body.currentPassword, currentHash).then(function(match){
      if (!match){
        return res.send({error:'The current password is incorrect'});
      }
      
      if (req.body.newPassword !== req.body.newPasswordConfirm){
        return res.send({error:'The passwords do not match'});
      }

      verifyPassword(req.body.newPassword).then(function(clientError){
        if (clientError){
          return res.send({error:clientError});
        }

        bcrypt.hash(req.body.newPassword, 10).then(function(newHash){
          queryDB('UPDATE account SET password = ? WHERE uuid = ?',[newHash, req.session.user.uuid]).then(function(){
            res.send({alert:'Your password has been updated'});
          }).catch(next);
        }).catch(next);
      }).catch(next);
    }).catch(next);
  }).catch(next);
});

router.post('/setEmail', function(req,res,next){
  verifyEmail(req.body.email).then(function(result){
    if (result.error){
      return res.send({error:result.error});
    }

    //set username
    queryDB('UPDATE account SET email = ? WHERE uuid = ?',[req.body.email, req.session.user.uuid]).then(function(result){
      res.send({alert:'Your email has been updated', result:{email:hideEmail(req.body.email)}});
    }).catch(next);
  }).catch(next);
});

router.post('/verify', function(req,res,next){
  queryDB("SELECT * FROM account WHERE uuid = ?",req.session.user.uuid).then(function(result){
    let email = result[0].email;

    let token = generateToken(50);

    let expiration = new Date();
    expiration.setDate(expiration.getDate() + 1);

    let data = {
      uuid:req.session.user.uuid,
      email,
      token,
      expiration
    }

    queryDB('DELETE FROM verifytoken WHERE uuid = ?', req.session.user.uuid).then(function(){
      queryDB('INSERT INTO verifytoken SET ?', data).then(function(result){
        let link = `${req.protocol}://${req.get('host')}/verify?token=${token}`;
        
        emailVerifyLink({link,username:req.session.user.username,to:req.session.user.email}).then(() => {
          res.send({alert:`A verification email has been sent to ${hideEmail(email)}`});
        }).catch(next);
      }).catch(next);
    }).catch(next);
  }).catch(next);
});

module.exports = router;
