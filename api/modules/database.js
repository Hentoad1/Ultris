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

function uniqueEmail(input, callback){
	const con = mysql.createConnection(options);

    con.query("SELECT EXISTS(SELECT * FROM account WHERE email = ?)", input, function (err, results) {
		if (err) return callback(err);

        let object = results[0]; //gives the object of the result, for example {"EXISTS(SELECT * FROM account WHERE username = 'example')":0}
        let result = Object.values(object)[0]; //gets the actual 0 or 1 value
					
        callback(err, result === 1);
	});
}

function register(input, callback){
	const con = mysql.createConnection(options);
	var preHash = input.password;
	
	bcrypt.genSalt(10, function(err, salt) {
		if (err) return callback(err);
		bcrypt.hash(preHash, salt, function(err, hash) {
			if (err) return callback(err);
			input.password = hash;
			getUUID(function(err, result){
				if (err) return callback(err);
				input.uuid = result;

				con.query("INSERT INTO account SET ?", [input], function(err, result){	
					callback(err,input);
				});
			});
		});
	});
	
	
}

function login(input, callback){
	const con = mysql.createConnection(options);
	con.query("SELECT * FROM account WHERE email = ?", input.email, function(err, [user]){
		if (err) return callback(err);

		if (user){
			bcrypt.compare(input.password, user.password, function(err,match){
				if (err) return callback(err);
				
				if (match){
					callback(err, user);
				}else{
					callback(err, null);
				}
			});
		}else{
			return callback(err, null);
		}
		
		
	});
}

function getUUID(callback){
	const con = mysql.createConnection(options);
	let id = uuid.v4();

	con.query("SELECT EXISTS(SELECT * FROM account WHERE uuid = ?)", id, function (err, results) {
		if (err) return callback(err);

        let object = results[0];
        let result = Object.values(object)[0];

		if (result === 1){
			getUUID(callback); //try again
		}else{
			callback(err, id);
		}
	});
}

module.exports = {register, login, getUUID, uniqueEmail};