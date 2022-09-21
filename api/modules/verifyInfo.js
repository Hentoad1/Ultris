var {queryDB} = require('./database.js');

function verifyUsername(input){
  return new Promise(function(resolve, reject){
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

    resolve([response, username]);
  });
}

function verifyPassword(password){
  return new Promise(function(resolve, reject){
    let response = '';

    if (password.length < 8){
        response = 'Your password must have 8 or more characters.';
    }else if (password.length >= 128){
        response = 'Your password must be less than 128 characters.';
    }
    
    resolve(response);
  });
}


//async needs try catch after it
function verifyEmail(email){
  return new Promise(function(resolve, reject){
    let whitespaceRegex = /\s/g;
    let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let valid = emailRegex.test(email) && !whitespaceRegex.test(email);

    if (!valid){
      return resolve({error:'Please Enter a Valid Email.'});
    }

    queryDB("SELECT EXISTS(SELECT * FROM account WHERE email = ?)", email).then(function(results){
      let object = results[0]; //gives the object of the result, for example {"EXISTS(SELECT * FROM account WHERE username = 'example')":0}
      let result = Object.values(object)[0]; //gets the actual 0 or 1 value

      let response = {taken:false, error:null};
      if (result === 1){
        response = {taken:true, error:'Email is already in use.'}
      }

      resolve(response);
    }).catch(reject);
  });
}

module.exports = {verifyEmail, verifyPassword, verifyUsername};