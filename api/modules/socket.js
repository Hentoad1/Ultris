const { v1: uuidv1, v1 }  = require('uuid');
var io = null;


const rooms = new Map();
class Room{
	constructor(name,owner,automated){
		//room information
		this.name = name;
		this.owner = owner; //owner should be an object with uuid and username.
		this.automated = automated;
		//customizable settings
		this.settings = {
			private:true,
			name:this.automated ? this.name : owner.username + "'s Room",
			custom:!this.automated
		}
		//lobby states
		this.countingDown = false;
		this.breakCountdown = false;
		//game variables
		this.totalUsers = new Set();
		this.spectatingUsers = new Set(); // these are users who are choosing to sit out every round.
		this.deadUsers = new Set();
		this.aliveUsers = new Set();
		this.startingPlayers = 0;
		this.playerDeathList = [];
		//set the room object in the rooms map.
		rooms.set(this.name,this);
	}
	
	update(){
		let totalAlive = this.aliveUsers.size;
		let totalDead = this.deadUsers.size;
		let totalPlayers = totalAlive + totalDead;
		
		
		if (totalAlive == 1){ //sends over leaderboard data
			let finalPlayer = Array.from(this.aliveUsers)[0];
			this.playerDeathList.unshift(finalPlayer);
			let playerData = this.playerDeathList.map(user =>
				({
					username:user.username,
					linesSent:user.socket.boardData.linesSent,
					linesReceived:user.socket.boardData.linesReceived
				})
			);
			io.in(this.name).emit('end',playerData);
			this.deadUsers.add(finalPlayer);
			this.aliveUsers.clear();
		}
		
		
		if (!this.countingDown && totalAlive <= 1 && totalPlayers > 1){
			if (this.automated){
				this.beginCountdown();
			}
		}else if (this.countingDown && totalPlayers < 2){ //this should cancel the countdown in the event that a player leaves while the match is starting.
			this.breakCountdown = true;
		}else if (totalPlayers > 1){
			this.breakCountdown = false;
		}
	}

	async beginCountdown(){
		this.countingDown = true;
		this.breakCountdown = false;
			
		for (let i = 10; i > 0; i--){
			io.in(this.name).emit('countdown',i);
			await new Promise(r => setTimeout(r,1000));
			if (this.breakCountdown){
				io.in(this.name).emit('message','server','[SERVER]','There are no longer enough players left to start the game. The countdown has been canceled.');
				io.in(this.name).emit('countdown','');
				this.breakCountdown = false;
				this.countingDown = false;
				return;
			}
		}
			
		this.aliveUsers =  new Set([...this.aliveUsers, ...this.deadUsers]); //reset the alive users to include the dead users.
		this.aliveUsers.forEach(this.resetUser); //resets the user data.
		this.deadUsers.clear(); //clear the dead users.
		this.playerDeathList = []; //reset the player death list.

		this.startingPlayers = this.aliveUsers.size; //save the number of players at the start of the game.
			
		const userData = [...this.aliveUsers].map(e => ({pid:e.pid, username:e.username})); //send the user data to the clients.
		io.in(this.name).emit('updateUsers',userData);

		let bagSalt = Math.random();
		let currentDate = Date.now();
		let gameStartDate = currentDate + 1000 * 15;
		io.in(this.name).emit('start',gameStartDate,bagSalt); //starts the game
			
		this.countingDown = false; //reset the counting down flag.
	}

	expire(){
		if (typeof this.killExpire === 'function'){
			this.killExpire();
		}

		new Promise(function(resolve,reject){
			setTimeout(resolve,10 * 60 * 1000,true);
			this.killExpire = (() => resolve(false));
		}.bind(this)).then(function(result){
			if (result){
				this.killExpire = null;
				rooms.delete(this.name);
			}
		}.bind(this));
	}

	//USER FUNCTIONS
	addUser(socket){
		let pid = this.generatePID();
		let obj = {
			id:socket.id,
			pid:pid,
			username:socket.username,
			socket:socket
		};
		this.totalUsers.add(obj);
		this.deadUsers.add(obj);
		this.resetUser(obj);
		
		io.in(this.name).emit('server message', 'Welcome ' + socket.username + ' to the room!');
		let usernames = [...this.totalUsers].map(e => e.username);
		io.in(this.name).emit('update lobby', usernames);

		this.update();
		
		if (this.countingDown){
			socket.emit('server message', 'The game should begin shortly.');
		}else{
			if (this.totalUsers.size < 2){
				socket.emit('server message', 'There are currently not enough players to start, please wait for more to join and the game will begin.');
			}else{
				socket.emit('server message', 'You have joined during the middle of the match, you will be able to play after the current round finishes.');
				
				//allow the player to spectate
				
				//generate user data
				let userData = [];
				let boardData = [];
				this.aliveUsers.forEach(function(data){
					userData.push({pid:data.pid, username:data.username});
					boardData.push({pid:data.pid, board:data.socket.boardData.board});
				});
				
				socket.emit('updateUsers',userData,true); // spectate is true in this case.
			
				socket.emit('recieve boards',boardData); // spectate is true in this case.
			}
		}
		
		if (typeof this.killExpire === 'function'){
			this.killExpire();
		}

		return obj;
	}
	
	removeUser(obj){
		this.totalUsers.delete(obj); //remove the user from all of the sets.
		this.spectatingUsers.delete(obj);
		this.deadUsers.delete(obj);
		this.aliveUsers.delete(obj);

		io.in(this.name).emit('remove user', obj.pid);
		
		let usernames = [...this.totalUsers].map(e => e.username);
		io.in(this.name).emit('update lobby', usernames);
		
		if (this.totalUsers.size === 0 && !this.automated){
			this.expire();
		}

		this.update();
	}
	
	killUser(obj){
		if (this.aliveUsers.delete(obj)){
			io.in(this.name).emit('remove user', obj.pid);
			this.deadUsers.add(obj);
			this.playerDeathList.unshift(obj);
			this.update();
		}
	}
	
	resetUser(obj){
		obj.socket.boardData = {
			board:undefined,
			b2b:0,
			combo:0,
			garbage:0,
			garbageQueue:0,
			linesSent:0,
			linesReceived:0,
			desyncs:0
		};
	}
	
	setActive(obj){
		this.spectatingUsers.delete(obj);
		this.deadUsers.add(obj);
		
		this.resetUser(obj);
		
		obj.socket.emit('server message', 'You will now participate in the next match.');
	}
	
	setInActive(obj){
		this.aliveUsers.delete(obj);
		this.deadUsers.delete(obj);
		this.spectatingUsers.add(obj);
		
		obj.socket.emit('server message', 'You will now automatically spectate every future match.');
	}
	
	//MISC FUNCTIONS
	generatePID(){
		do {
			var pid = v1();
		} while (groupContainsID(this.totalUsers,pid));
		
		function groupContainsID(group, id){
			let match = false;
			group.forEach(e => match = match || e.pid == id);
			return match;
		}
		return pid;
	}
}

new Room('quickplay',{},true);

function bind(input){
	io = input;
	io.on('connection',function(socket){
		socket.username = socket.request.session.username ?? 'GUEST';
		socket.uuid = socket.request.session.uuid ?? null;

		socket.boardData = {};

		socket.on('join room',function(code,callback){
			if (!rooms.has(code)){
				callback(null,'Room does not exist.');
				return;
			}
			let room = rooms.get(code);
			let outgoingData = Object.assign({},room.settings);
			outgoingData.admin = (room.owner.uuid === socket.uuid && socket.uuid !== null);//need fix
			console.log(socket.uuid);
			callback(outgoingData,false);


			//add rest of the listeners for procesing the game
			socket.join(code);
			socket.room = code;
			
			var currentRoom = room;
			var roomObject = currentRoom.addUser(socket);

			socket.publicID = roomObject.pid;
		
			socket.emit('sendPID', socket.publicID);
			
			socket.on('defeat',function(){
				currentRoom.killUser(roomObject);
			});
			
			socket.on('spectate', function(){
				currentRoom.setInActive(roomObject);
			});
			
			socket.on('play', function(){
				currentRoom.setActive(roomObject);
			});
			
			socket.on('disconnect', function(){
				currentRoom.removeUser(roomObject);
			});
			
			socket.on('send message', function(message){ // MESSAGES
				io.in(socket.room).emit('message','userMessage',socket.username,message);
			});
			
			//MANAGE GAME EVENTS
			socket.on('sync garbage',function(queueLen){ 
				socket.boardData.garbageQueue = queueLen;
			});
			
			socket.on('send board', (board) => {
				if (socket.boardData.garbageQueue > 0){
					var change = Math.min(socket.boardData.garbageQueue,8);
					socket.boardData.garbageQueue -= change;
					socket.boardData.garbage += change;
				}
				
				
				if (socket.boardData.board !== undefined){
					if (getColoredTotal(socket.boardData.board) != getColoredTotal(board) - 4){
						socket.boardData.desyncs++;
						console.log('COLOR DESYNC');
					}
					if (getGarbageRows(board) != socket.boardData.garbage){
						socket.boardData.desyncs++;
						console.log('GARBAGE DESYNC');
						console.log(getGarbageRows(board));
						socket.boardData.garbage = getGarbageRows(board);
						socket.emit('request garbage');
					}
					
					
					
					/*
					valid move = 
					number of blocks on the board aligns
					the peice is not in a completely enclosed space (doesnt work for crazy kick systems)
					*/
					
					
					
					socket.boardData.board = board;
					socket.broadcast.emit('recieve board',board,socket.publicID);
				}else if (socket.boardData.board === undefined){
					socket.boardData.board = board;
					socket.broadcast.emit('recieve board',board,socket.publicID);
				}
				
				
				
				
				socket.boardData.combo = 0;
			});
			
			socket.on('cleared line', function(board,cords,x,y,color,testKick3,lastMove){
				if (socket.boardData.board !== undefined){
					const isT = Math.abs(getSum(cords)) == 1;
					const pc = getSum(board) == 0;
					
					//deep copies the array
					var clonedBoard = [];
					for (let i = 0; i < socket.boardData.board.length; i++){
						clonedBoard[i] = socket.boardData.board[i].slice();
					}
					//adds in the peice being placed
					cords.forEach((e) => clonedBoard[y + e[1]][x + e[0]] = color);
					//clears out filled lines, it just works
					
					var lines = 0;
					for (let i = 0; i < clonedBoard.length; i++){
						let flag = true;
						let garbageCleared = false;
						for (let j = 0; j < 10; j++){
							flag = clonedBoard[i][j] != 0 && flag;
							garbageCleared = garbageCleared || clonedBoard[i][j] == 9;
						}
						if (flag){
							for (let a = i;a < clonedBoard.length - 1;a++){
								clonedBoard[a]  = clonedBoard[a + 1].slice();
							}
							i--;
							lines++;
							socket.boardData.garbage -= garbageCleared ? 1 : 0;
						}
						
					}
					if (lines == undefined || lines == 0){
						console.log('ERROR');
						console.log('error point: ' + lines);
						console.log('x: ' + x);
						console.log('y: ' + y);
						console.log(cords);
						console.log(socket.boardData.board);
					}
					
					
					
					
					
					
					
					
					
					
					
					
					
					const normalLines = [0,1,2,4];
					const tspinLines = [2,4,6];
					var b2bmove = false;
					
					
					var outgoingLines = 0;
					if (isT && lastMove == 'rotate'){
						
						
						const tipCord = cords.reduce((a,b) => [a[0] + b[0], a[1] + b[1]]);
						const sideCord = [tipCord[1], tipCord[0]];
						
						let kick3 = testKick3;
						const kick3Tests = [[1,1],[-1,1],[0,3]];
						kick3Tests.forEach(e => kick3 = kick3 && socket.boardData.board[y + e[1]][x + e[0]] != 0);
						kick3 = kick3 && socket.boardData.board[y + 2][x] == 0;
						
						
						
						/*const corners = [
						board[y + tipCord[1] + sideCord[1]][x + tipCord[0] + sideCord[0]] == 0,
						board[y + tipCord[1] - sideCord[1]][x + tipCord[0] - sideCord[0]] == 0,
						board[y - tipCord[1] + sideCord[1]][x - tipCord[0] + sideCord[0]] == 0,
						board[y - tipCord[1] - sideCord[1]][x - tipCord[0] - sideCord[0]] == 0
						];*/
						var corners = [];
						
						const boolToNegative = [-1,1];
						for (let i = 0; i < 4; i++){
							const testY = y + (tipCord[1] * boolToNegative[(i < 2) + 0]) + (sideCord[1] * boolToNegative[i%2]);
							const testX = x + (tipCord[0] * boolToNegative[(i < 2) + 0]) + (sideCord[0] * boolToNegative[i%2]);
							corners[i] = !(testX >= 0 && testX < 10 && testY >= 0 && testY < 40 && socket.boardData.board[testY][testX] == 0);
						}
						
						
						const mini = (corners[2] && corners[3] && (corners[0] || corners[1]));
						
						const tspin = (kick3 && mini) || (corners[0] && corners[1] && (corners[2] || corners[3]));
						
						
						
						
						if (tspin){
							outgoingLines = tspinLines[lines - 1];
							b2bmove = true;
						}else if (mini){
							outgoingLines = tspinLines[lines - 1] / 2;
							b2bmove = true;
						}else{
							outgoingLines = normalLines[lines - 1];
							b2bmove = false;
						}
					}else{
						/*
						calculate b2b along with pc
						*/
						b2bmove = lines == 4;
						outgoingLines = normalLines[lines - 1];
					}	
					let raw = outgoingLines;
					if (!b2bmove){
						socket.boardData.b2b = 0;
					}
					
					
					outgoingLines *= socket.boardData.combo > 0 ? 1 + (socket.boardData.combo * 0.15) : 1;
					outgoingLines += Math.floor(Math.cbrt(socket.boardData.b2b));
					outgoingLines += Math.floor(Math.sqrt(socket.boardData.combo));
					outgoingLines += pc ? 10 : 0;
					outgoingLines = Math.floor(outgoingLines);
					
					
					if (b2bmove){
						socket.boardData.b2b++;
					}
					
					
					
					
					
					/*
					valid move = 
					number of blocks on the board aligns
					the peice is not in a completely enclosed space (doesnt work for crazy kick systems)
					line cleared cannot be greater than 4
					
					if it is a tspin must be shaped like t peice
						this can be acheived by subracting the cords to raw pData and then summing it up, the t-peice is the only one that can sum up to one
					must have just rotated (can be skipped if lazy)
					must meet normal tspin / mini tspin checks
					
					PIECE
					
					
					ALSO THE I PEICE CAN WORK WITH Y = -1 BECAUSE CENTER IS IN THE MIDDLE OF BLOCKS
					*/
					socket.boardData.board = board;
					socket.broadcast.emit('recieve board',board,socket.publicID);
					
					//REMOVE USER GARBAGE
					if (outgoingLines > 0 && socket.boardData.garbageQueue > 0){
						const canceled = Math.min(outgoingLines,socket.boardData.garbageQueue);
						socket.boardData.garbageQueue -= canceled;
						outgoingLines -= canceled;
						socket.emit('cancel garbage', canceled);
					}
					
					//SEND LINES
					if (outgoingLines > 0){
						if (currentRoom.aliveUsers.size > 1){
							const user = getRandomUser();
							const garbageHole = Math.floor(Math.random() * 10);
							user.garbageQueue += outgoingLines;
							user.socket.emit('recieve garbage',outgoingLines,garbageHole);

							socket.boardData.linesSent += outgoingLines;
							user.socket.boardData.linesReceived += outgoingLines;
						}
						
						function getRandomUser(){
							const users = [...currentRoom.aliveUsers];
							const len = users.length;
							do{
								var obj = users[Math.floor(Math.random() * len)]
								var id = obj.id;
								
							}while(id == socket.id);
							return obj;
						}
					}
				}else if (socket.boardData.board === undefined){
					//socket.boardData.board = board;
					//socket.broadcast.emit('recieve board',board,socket.id);
					// you cant clear a line on an empty board
				}
				socket.boardData.combo++;
			});
			
			socket.on('send peice', (cords,ghost,color) => {
				socket.broadcast.emit('recieve peice',cords,ghost,color,socket.publicID);
			});

			function getColoredTotal(arr){
				return arr.reduce((a,b) => a.concat(b)).reduce((a,b) => a + (b != 0 && b != 9), 0);
			}
			
			function getSum(arr){
				return arr.reduce((a,b) => a.concat(b)).reduce((a,b) => a + b, 0);
			}
			
			function getGarbageRows(arr){
				return arr.reduce((a,b) => a + (b.reduce((a,b) => a + (b == 9 ? 1 : 0),0) == 9),0);
			}
		});

		socket.on('create room',function(callback){
			let roomcode = generateRoomCode();
			new Room(roomcode,{uuid:socket.uuid,username:socket.username},false);
			callback(roomcode);
		});
	});

	function generateRoomCode(){
		let number = Math.floor(Math.random() * 2176782335);
		let str = number.toString(36).toUpperCase();
		return str;
	}
}

module.exports = bind;