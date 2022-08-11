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

function testUsername(input, callback){
	const con = mysql.createConnection(options);

    con.query("SELECT EXISTS(SELECT * FROM account WHERE username = ?)", input, function (err, results) {
		if (err) throw err;

        let object = results[0]; //gives the object of the result, for example {"EXISTS(SELECT * FROM account WHERE username = 'example')":0}
        let result = Object.values(object)[0]; //gets the actual 0 or 1 value
					
        callback(result === 1);
	});
}

function register(input, callback){
	const con = mysql.createConnection(options);
	var preHash = input.password;
	
	bcrypt.genSalt(10, function(err, salt) {
		bcrypt.hash(preHash, salt, function(err, hash) {
			input.password = hash;
			getUUID(function(id){
				input.uuid = id;

				con.query("INSERT INTO account SET ?", [input], function(err, result){	
					if (err) throw err
						
					callback(err === null,input);
				});
			});
		});
	});
	
	
}

function login(input, callback){
	const con = mysql.createConnection(options);
	con.query("SELECT * FROM account WHERE username = ?", input.username, function(err, result){
		if (err) throw err;
		

		let userData = result[0]; 
		console.log(userData);

		if (userData == null){
			callback(false);
			return;
		}
		
		bcrypt.compare(input.password, result[0].password, function(err,result){
			if (err) throw err;
			
			callback(result,userData);
		});
	});
}


function getUUID(callback){
	const con = mysql.createConnection(options);
	let id = uuid.v4();

	con.query("SELECT EXISTS(SELECT * FROM account WHERE uuid = ?)", id, function (err, results) {
		if (err) throw err;

        let object = results[0];
        let result = Object.values(object)[0];

		if (result === 1){
			getUUID(callback); //try again
		}else{
			callback(id);
		}
	});
}

module.exports = {testUsername, register, login, getUUID};