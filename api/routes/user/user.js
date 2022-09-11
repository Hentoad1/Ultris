var express = require('express');
var router = express.Router();

var database = require('../../modules/database.js');

//USER
router.post('/logout', function(req, res, next) {
  database.genUUID(function(err, uuid){
    if (err) return next (err);

    console.log('logout');
    console.log(req.session);
    
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
  let passwordInvalid = verifyPassword(input.password);

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
        guest:false,
        lastLogged: Date.now()
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
        guest:false,
        lastLogged: Date.now()
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

function verifyUsername(input){
  let regex = /^[a-zA-Z0-9]+$/g;
  let username = input.toUpperCase();
  let result = regex.test(username);
  let response = null;

  if (!result){
    response = 'Username must contain only letters and numbers.';
  }else if (username.length > 15 || username.length < 3){
    response = "Username must be 3 to 15 characters long.";
  }else{
    const InnapropriatePhrases = ['FUCK']; //temporary
    const ReplacementPhrases = ['','#','##','###','####']; //temporary
    InnapropriatePhrases.forEach(function(word){
      let index = username.indexOf(word);
      if (index !== -1){
        username = username.replace(word, ReplacementPhrases[InnapropriatePhrases.length]);
      }
    });
  }

  return [response, username];
}

function verifyEmail(email, callback){
  let whitespaceRegex = /\s/g;
  let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  let valid = emailRegex.test(email) && !whitespaceRegex.test(email);
  
  let response = null;

  if (!valid){
    return callback(null, 'Please Enter a Valid Email.');
  }

  database.uniqueEmail(email, function(err, result){
    if (err) return callback(err);

    if (result){
      response = 'Email taken.';
    }
    callback(err, response);
  });
}

function verifyPassword(password){
  let response = '';

  if (password.length < 8){
      response = 'Your password must have 8 or more characters.';
  }else if (password.length >= 128){
      response = 'Your password must be less than 128 characters.';
  }

  return response;
}

module.exports = router;
