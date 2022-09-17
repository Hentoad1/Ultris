var mysql = require('mysql2');
var uuid = require("uuid");
var bcrypt = require("bcrypt");

const options = {
	host: "localhost",
	user: "root",
	password: process.env.DATABASE_PASSWORD,
	database:'main',
	port:'3306'
}

function genUUID(callback){
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
}

function queryDB(...query){
  let callback = query.pop();

  let connection = mysql.createConnection(options);
  connection.query(...query, function(err, result) {
    connection.end();

    callback(err, result);
  });
}



module.exports = {genUUID, queryDB};