var express = require('express');
var router = express.Router();

var database = require('../modules/database.js');


//LOGOUT BUTTON
router.post('/logout', function(req, res, next) {
  database.getUUID(function(err, uuid){
    if (err) return next (err);

    req.session.username = 'GUEST';
    req.session.uuid = uuid;
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
      err: errorMessage
    });
  }

  input.username = username;

  verifyEmail(input.email, function(err, response){
    if (err) return next (err);
    if (response){
      return res.send({
        err: "An error has occurred.",
        reset: true
      });
    }
    
    database.register(input, function(err, result){
      if (err) return next (err);
      
      req.session.data = {
        username: result.username,
        uuid: result.uuid,
        lastLogged: Date.now()
      }
      req.session.save();
      res.send(result);
    });
  });
});

router.post('/email', function(req, res, next) {
  let email = req.body.email.toUpperCase();

  verifyEmail(email,function callback(err, response){
    if (err) return next (err)

    res.send({err:response,email})
  });
});

//LOGIN ROUTE FROM CLIENT
router.post('/login', function(req, res, next) {
  let input = req.body;

  database.login(input, function(err, result){
    if (err) return next (err);

    if (result){
      
      req.session.data = {
        username: result.username,
        uuid: result.uuid,
        lastLogged: Date.now()
      }
      req.session.save();

      res.send({err:null});
    }else{
      res.send({err:'Incorrect Login Information.'});
    }
  });
});

//ACCOUNT ROUTE FROM CLIENT
router.post('/secure', function(req, res, next) {
  if (req.session.username ?? 'GUEST' === 'GUEST'){
    res.send({err:'You must be logged in to access this page.'});
    return;
  }

  let loggedInRecently = req.session.lastLogged > Date.now() - (1000 * 60 * 60 * 24);


  let output = {
    secure: loggedInRecently
  };

  res.send(output);
});

//MAIN API
router.post('/', function(req, res, next) {
  let session = req.session.data ?? {};

  res.send({
    username: session.username,
    guest: !(session.lastLogged ?? false)
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
