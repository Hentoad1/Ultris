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
  let input = req.body;

  verifyUsername(input.username, function(err, result){
    if (err) return next (err);

    let [usernameInvalid, username] = result;

    verifyPassword(input.password, function(err, result){
      if (err) return next (err);

      let [passwordInvalid] = result;

      let errorMessage = usernameInvalid || passwordInvalid;
      if (errorMessage){
        return res.send({
          error: errorMessage
        });
      }

      input.username = username;

      verifyEmail(input.email, function(err, response){
        if (err) return next (err);
    
        if (response.error){
          return res.send({
            error: "An error has occurred.",
            reset: true
          });
        }
        
        register(input, function(err, result){
          if (err) return next (err);
          
          req.session.user = {
            username: result.username,
            uuid: result.uuid,
            guest: false,
            verified: false //always will be false
          }
          req.session.save();
    
          res.send({redirect:{path:'/play',refresh:true}});
        });
      });
    });
  });
});

router.post('/email', function(req, res, next) {
  let email = req.body.email.toUpperCase();

  verifyEmail(email,function callback(err, response){
    if (err) return next (err)

    if (response.taken){
      res.send({result:{taken:true}});
    }else if (response.error){
      res.send({error:response.error});
    }else{
      res.send({result:{email}})
    }
  });
});

//LOGIN ROUTE FROM CLIENT
router.post('/login', function(req, res, next) {
  let input = req.body;

  login(input, function(err, result){
    if (err) return next (err);

    if (result){
      
      req.session.user = {
        username: result.username,
        uuid: result.uuid,
        guest:false,
        verified: result.verified === 1
      }
      req.session.save();

      res.send({redirect:{path:'/play',refresh:true}});
    }else{
      res.send({error:'Incorrect Login Information.'});
    }
  });
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

function login(input, callback){
  try {
    queryDB("SELECT * FROM account WHERE email = ?", input.email, function(err, result){
      if (err) return callback(err);
  
      let user = result[0];
  
      if (user){
        bcrypt.compare(input.password, user.password, function(err,match){
          if (err) return callback(err);
          
          if (match){
            callback(err, user);
          }else{
            callback(err, null);
          }
        });
      }else{
        return callback(err, null);
      }
    });
  } catch (error) {
    callback(error);
  }
}

function register(input, callback){
  try {
    bcrypt.hash(input.password, 10, function(err, hash) {
      if (err) return callback(err);
      input.password = hash;
      genUUID(function(err, result){
        if (err) return callback(err);
        input.uuid = result;
  
        queryDB("INSERT INTO account SET ?", [input], function(err, result){	
          callback(err,input);
        });
      });
    });
  } catch (error) {
    callback(error);
  }
}