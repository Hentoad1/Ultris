var {queryDB} = require('./database.js');

const AcceptableUsernameChars = new RegExp(/^[a-zA-Z0-9]*$/);

function verifyUsername(input){
  return new Promise(function(resolve, reject){
    let username = input.toUpperCase();
    let result = AcceptableUsernameChars.test(username);
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

const LocalChars = new RegExp(/^[a-zA-Z0-9!#$%&'*+\-\/=?^_`{|}~.]*$/);
const DomainChars = new RegExp(/^[a-zA-Z0-9-.]*$/);

function verifyEmail(email){
  return new Promise(function(resolve, reject){
    function getValidity(){
      if (email.includes(`"`)){
        return false;
      }
      
      let atIndex = email.indexOf('@');
      if (atIndex === -1){
        return false;
      }
      
      let local = email.slice(0,atIndex);
      let domain = email.slice(atIndex + 1);
      
      console.log(local);
      console.log(domain);
      
      if (local.length > 64 || local.startsWith('.') || local.endsWith('.') || local.includes('..')){
        return false;
      }
      
      if (domain.length > 63 || domain.startsWith('-') || domain.endsWith('-')){
        return false;
      }
      
      if (!LocalChars.test(domain)){
        return false;
      }
      
      if (!DomainChars.test(domain)){
        return false;
      }
      
      return true;
    }
    
    let valid = getValidity();

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

//an error being thrown here is fine, as it will be caught by the try catch because this is a synchronous function.
function hideEmail(email){
  let atIndex = email.indexOf('@');

  let start = email.slice(0,atIndex);
  let end = email.slice(atIndex);

  let dotIndex = end.indexOf('.');

  return start.slice(0,3) + '*****@***' + end.slice(dotIndex);
}

module.exports = {verifyEmail, verifyPassword, verifyUsername, hideEmail};