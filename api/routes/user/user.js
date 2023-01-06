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

  res.send({redirect:{path:'/play',refresh:true}});
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

      userData.username = username;

      verifyEmail(userData.email).then(function(response){
        if (response.error){
          return res.send({
            error: "An error has occurred.",
            reset: true
          });
        }
        
        //register
        bcrypt.hash(userData.password, 10).then(function(hash){
          userData.password = hash;
          genUUID().then(function(result){
            userData.uuid = result;
      
            queryDB("INSERT INTO account SET ?", [userData]).then(function(){
              let defaultScoreData = {
                uuid: userData.uuid,
                username: userData.username,
                date:(new Date).toLocaleDateString('en-US')
              }	

              queryDB("INSERT INTO sprint SET ?", [defaultScoreData]).catch(next);

              queryDB("INSERT INTO blitz SET ?", [defaultScoreData]).catch(next);

              req.session.user = {
                username: userData.username,
                uuid: userData.uuid,
                guest: false,
                verified: false //always will be false
              }
              
              res.send({redirect:{path:'/play',refresh:true,reload:true}});
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
          email: user.email,
          guest:false,
          verified: user.verified === 1
        }
        res.send({redirect:{path:'/play',refresh:true,reload:true}});
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