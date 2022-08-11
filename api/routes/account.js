var express = require('express');
var router = express.Router();

var database = require('../custom_modules/database.js');

router.post('/register', function(req, res, next) {
  let input = req.body;
  let output = {success:true};

  input.username = input.username.toUpperCase();

  output.success = verifyUsername(input.username, output) &&
  verifyPassword(input.password, output) &&
  verifyEmail(input.email, output);

  if (!output.success){
    res.send(output);
    return; //end here because an error has occured.
  }

  database.testUsername(input.username, function(taken){
    if (taken){
      output.usernameError = 'This Username has already been taken.';
      output.usernameValid = false;

      res.send(output);
      return; //end here because an error has occured.
    }

    database.register(input, function(success, result){
      if (success){
        req.session.uuid = result.uuid;
        req.session.username = result.username;
        req.session.save();
      }else{
        output.success = false;
        output.serverError = 'Account failed to be created.';
        res.send(output);
        res.end();
      }
    });
  });
});

router.post('/login', function(req, res, next) {
  let input = req.body;
  let output = {};

  input.username = input.username.toUpperCase();



  database.login(input, function(valid, result){
    output.success = valid;
    if (valid){
      req.session.uuid = result.uuid;
      req.session.username = result.username;
      req.session.save();
    }else{
      output.serverError = 'Incorrect Login Information.';
    }
    res.send(output);
  });
});

router.post('/logout', function(req, res, next) {
  req.session.destroy(function(err){
    if (err) throw err;

    res.end();
  });
});

router.post('/username', function(req, res, next) {
  let input = req.body;
  let output = {};
  
  input.username = input.username.toUpperCase();

  let validFormatting = verifyUsername(input.username, output);
  if (!validFormatting){
    res.send(output);
    return; //end here because an error has occured.
  }

  database.testUsername(input.username, function(taken){
    if (taken){
      output.usernameError = 'This Username has already been taken.';
      output.usernameValid = false; 
    }

    res.send(output);
  });
});

router.post('/', function(req, res, next) {
  let loggedIn = req.session.username !== undefined;
  let username = loggedIn ? req.session.username : 'GUEST';

  let output = {
    loggedIn,
    username
  };

  res.send(output);
});

function verifyUsername(username, output){
  let regex = /[^a-zA-Z0-9]/g;
  let result = username.match(regex);
  let valid = false;
  let message = '';

  if (result != null && result.length > 0){
    let charSet = new Set(result); // make it into a set to avoid repeats
    let chars = Array.from(charSet).join('');
    let text = chars.length == 1 ? 'Invalid Character:' : 'Invalid Characters:';
    message = (text + " '" + chars + "'");
  }else if (username.length > 15){
    message = ("Username Must be 15 Characters or less.");
  }else if (username == ''){
    message = ("Please Enter a Username.");
  }else {
    valid = true; //async database call here
    output.usernameError = message;
    output.usernameValid = valid;
    return valid;
  }

  output.usernameError = message;
  output.usernameValid = valid;
  return valid;
}

function verifyPassword(password, output){
  let error = '';
  let valid = false;

  if (password.length < 8){
      error = 'Your password must have 8 or more characters.';
  }else if (password.length >= 128){
      error = 'Your password must be less than 128 characters.';
  }else{
      valid = true;
  }
  output.passwordValid = valid;
  output.passwordError = error;

  return valid;
}

function verifyEmail(email, output){
  let atIndex = email.indexOf('@');
  let singleAtSign = atIndex === email.lastIndexOf('@');

  let dotIndex = email.lastIndexOf('.');

  let correctPosition = dotIndex - atIndex > 1;

  let valid = email === '' || (singleAtSign && correctPosition);
  

  output.emailValid = valid;
  output.emailError = valid ? '' : 'Please Enter a Valid Email.';

  return valid;
}

module.exports = router;
