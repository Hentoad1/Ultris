var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');

var {genUUID, queryDB} = require('../../modules/database.js');
var {verifyEmail, verifyPassword, verifyUsername} = require('../../modules/verifyInfo.js');

//USER
router.post('/logout', function(req, res, next) {
  req.session.initalized = undefined;
  req.session.user = {};
  req.session.save();

  res.end();
});

//REGISTER ROUTE FROM CLIENT
router.post('/register', function(req, res, next) {
  let userData = req.body;
  verifyUsername(userData.username).then(function(result){
    let [usernameInvalid, username] = result;
    
    verifyPassword(userData.password).then(function(result){
      let passwordInvalid = result;

      let errorMessage = usernameInvalid || passwordInvalid;
      if (errorMessage){
        return res.send({
          error: errorMessage
        });
      }

      input.username = username;

      verifyEmail(input.email).then(function(response){
        if (response.error){
          return res.send({
            error: "An error has occurred.",
            reset: true
          });
        }
        
        //register
        bcrypt.hash(input.password, 10).then(function(hash){
          input.password = hash;
          genUUID().then(function(result){
            input.uuid = result;
      
            queryDB("INSERT INTO account SET ?", [input]).then(function(){	
              req.session.user = {
                username: result.username,
                uuid: result.uuid,
                guest: false,
                verified: false //always will be false
              }
              
              res.send({redirect:{path:'/play',refresh:true}});
            }).catch(next);
          }).catch(next);
        }).catch(next);
      }).catch(next);
    }).catch(next);
  }).catch(next);
});

router.post('/email', function(req, res, next) {
  let email = req.body.email.toUpperCase();

  verifyEmail(email).then(function(response){
    if (response.taken){
      res.send({result:{taken:true}});
    }else if (response.error){
      res.send({error:response.error});
    }else{
      res.send({result:{email}})
    }
  }).catch(next);
});

//LOGIN ROUTE FROM CLIENT
router.post('/login', function(req, res, next) {
  queryDB("SELECT * FROM account WHERE email = ?", req.body.email).then(function([user]){
    if (!user){
      return res.send({error:'Incorrect Login Information.'});
    }
    bcrypt.compare(req.body.password, user.password).then(function(match){
      if (match){
        req.session.user = {
          username: user.username,
          uuid: user.uuid,
          guest:false,
          verified: user.verified === 1
        }
        res.send({redirect:{path:'/play',refresh:true}});
      }else{
        res.send({error:'Incorrect Login Information.'});
      }
    }).catch(next);
  }).catch(next);
});

//MAIN API
router.post('/', function(req, res, next) {
  let session = req.session.user ?? {};

  res.send({
    username: session.username,
    guest: session.guest
  });
});

module.exports = router;