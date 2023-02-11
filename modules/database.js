var mysql = require('mysql2');
var uuid = require("uuid");

const options = {
	host: process.env.DATABASE_HOST,
	user: process.env.DATABASE_USER,
	password: process.env.DATABASE_PASSWORD,
	database:'main',
	port:'3306'
}

function genUUID(callback){
  if (typeof callback === 'function'){
    throw new Error('Callback was provided, change to Promise');
  }

  return new Promise(function(resolve, reject){
    let id = uuid.v4();

    queryDB("SELECT EXISTS(SELECT * FROM account WHERE uuid = ?)", id).then(function(results){
      let object = results[0];
      let result = Object.values(object)[0];

      if (result === 1){
        resolve(genUUID()); //try again
      }else{
        resolve(id);
      }
    }).catch(reject);
  })
}

function queryDB(...query){
  if (typeof query[query.length - 1] === 'function'){
    throw new Error('Callback was provided, change to Promise');
  }

  return new Promise((resolve, reject) => {

    let connection = mysql.createConnection(options);
    connection.query(...query, function(err, result) {
      connection.end();
      if (err) return reject (err);

      resolve(result);
    });
  });
}

module.exports = {genUUID, queryDB};