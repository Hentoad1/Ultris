var mysql = require('mysql2');
var uuid = require("uuid");

const options = {
	host: "localhost",
	user: "root",
	password: process.env.DATABASE_PASSWORD,
	database:'main',
	port:'3306'
}

function genUUID(){
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
  return new Promise((resolve, reject) => {

    let connection = mysql.createConnection(options);
    connection.query(...query, function(err, result) {
      connection.end();
      if (err) return reject (err);

      resolve(result);
    });
  });
}

/*function genUUID(callback){
  try {
    let id = uuid.v4();

    queryDB("SELECT EXISTS(SELECT * FROM account WHERE uuid = ?)", id, function (err, results) {
      if (err) return callback(err);

      let object = results[0];
      let result = Object.values(object)[0];

      if (result === 1){
        genUUID(callback); //try again
      }else{
        callback(err, id);
      }
    });
  } catch (error) {
    callback(error);
  }
}*/

/*function queryDB(...query){
  try {
    let callback = query.pop();

    let connection = mysql.createConnection(options);
    connection.query(...query, function(err, result) {
      connection.end();

      callback(err, result);
    });
  } catch (error) {
   callback(error); 
  }
}*/



module.exports = {genUUID, queryDB};