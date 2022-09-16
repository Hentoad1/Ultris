var express = require('express');
var router = express.Router();

var database = require('../../modules/database.js');
var {verifyEmail, verifyPassword, verifyUsername} = require('../../modules/verifyInfo.js');

//USER
router.post('/logout', function(req, res, next) {
  database.genUUID(function(err, uuid){
    if (err) return next (err);
    
    req.session.initalized = undefined;
    req.session.user = {};
    req.session.save();

    res.end();
  });
});

//REGISTER ROUTE FROM CLIENT
router.post('/register', function(req, res, next) {
  let input = req.body;

  let [usernameInvalid, username] = verifyUsername(input.username);
  let [passwordInvalid] = verifyPassword(input.password);

  let errorMessage = usernameInvalid || passwordInvalid;
  if (errorMessage){
    return res.send({
      error: errorMessage
    });
  }

  input.username = username;

  verifyEmail(input.email, function(err, response){
    if (err) return next (err);
    if (response){
      return res.send({
        error: "An error has occurred.",
        reset: true
      });
    }
    
    database.register(input, function(err, result){
      if (err) return next (err);
      
      req.session.user = {
        username: result.username,
        uuid: result.uuid,
        guest:false
      }
      req.session.save();

      res.send({redirect:{path:'/play',refresh:true}});
    });
  });
});

router.post('/email', function(req, res, next) {
  let email = req.body.email.toUpperCase();

  verifyEmail(email,function callback(err, response){
    if (err) return next (err)

    if (response){
      res.send({error:response});
    }else{
      res.send({result:{email}})
    }
  });
});

//LOGIN ROUTE FROM CLIENT
router.post('/login', function(req, res, next) {
  let input = req.body;

  database.login(input, function(err, result){
    if (err) return next (err);

    if (result){
      
      req.session.user = {
        username: result.username,
        uuid: result.uuid,
        guest:false
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
