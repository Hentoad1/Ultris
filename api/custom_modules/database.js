var mysql = require('mysql2');
var uuid = require("uuid");
var bcrypt = require("bcrypt");

const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: process.env.DATABASE_PASSWORD,
    database:'main',
    port:'3306'
});
  
function testUsername(input, callback){
    con.query("SELECT EXISTS(SELECT * FROM account WHERE username = ?)", input, function (err, results) {
		if (err) throw err;

        let object = results[0]; //gives the object of the result, for example {"EXISTS(SELECT * FROM account WHERE username = 'example')":0}
        let result = Object.values(object)[0]; //gets the actual 0 or 1 value
					
        callback(result === 1);
	});
}

function register(input, callback){
	var preHash = input.password;
	
	bcrypt.genSalt(10, function(err, salt) {
		bcrypt.hash(preHash, salt, function(err, hash) {
			input.password = hash;
			genUniqueUUID(function(id){
				input.uuid = id;

				con.query("INSERT INTO account SET ?", [input], function(err, result){	
					if (err) throw err
						
					callback(err === null,input);
				});
			});
			
			
			/*var defaults = {
				uuid: data.uuid,
				DAS:133,
				ARR:10,
				DCD:0,
				SDF:1,
				ISDF:true,
				keybinds:'Escape,r,ArrowLeft,ArrowRight,ArrowDown,ArrowUp,a,z,c, '
			};
			
			
			con.query("INSERT INTO controls SET ?", defaults, function(err, result){	
				if (err) throw err;
			});*/
		});
	});
	
	
}

function login(input, callback){
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


function genUniqueUUID(callback){
	let id = uuid.v4();

	con.query("SELECT EXISTS(SELECT * FROM account WHERE uuid = ?)", id, function (err, results) {
		if (err) throw err;

        let object = results[0];
        let result = Object.values(object)[0];

		if (result === 1){
			genUniqueUUID(callback); //try again
		}else{
			callback(id);
		}
	});

}

module.exports = {testUsername, register, login};