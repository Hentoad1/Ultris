var database = require('./database.js');

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

function verifyPassword(password){
  let response = '';

  if (password.length < 8){
      response = 'Your password must have 8 or more characters.';
  }else if (password.length >= 128){
      response = 'Your password must be less than 128 characters.';
  }

  return [response, password];
}

function verifyEmail(email, callback){
  let whitespaceRegex = /\s/g;
  let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  let valid = emailRegex.test(email) && !whitespaceRegex.test(email);
  
  let response = null;

  if (!valid){
    return callback(null, 'Please Enter a Valid Email.');
  }



  /*database.uniqueEmail(email, function(err, result){
    if (err) return callback(err);

    if (result){
      response = 'Email taken.';
    }
    callback(err, response);
  });*/

  queryDB("SELECT EXISTS(SELECT * FROM account WHERE email = ?)", email, function (err, results) {
		if (err) return callback(err);

    let object = results[0]; //gives the object of the result, for example {"EXISTS(SELECT * FROM account WHERE username = 'example')":0}
    let result = Object.values(object)[0]; //gets the actual 0 or 1 value
					
    if (result === 1){
      response = 'Email taken.'
    }

    callback(null, response);
	});
}

module.exports = {verifyEmail, verifyPassword, verifyUsername};