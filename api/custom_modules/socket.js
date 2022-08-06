const { v1: uuidv1, v1 }  = require('uuid');
var io = null;

class Room{
	constructor(name,owner = 'Admin'){
		//room information
		this.name = name;
		this.owner = owner;
		//customizeable settings
		//game variables
		this.startingPlayers = 0;
		this.breakCountdown = false;
		this.countingDown = false;
		this.totalUsers = new Set();
		this.spectatingUsers = new Set(); // these are users who are choosing to sit out every round.
		this.deadUsers = new Set();
		this.aliveUsers = new Set();
	}
	
	async updateGameState(){
		console.log('----------');
		
		console.log('totalUsers ' + this.totalUsers.size);
		console.log('spectatingUsers ' + this.spectatingUsers.size);
		console.log('deadUsers ' + this.deadUsers.size);
		console.log('aliveUsers ' + this.aliveUsers.size);
		
		let totalAlive = this.aliveUsers.size;
		let totalDead = this.deadUsers.size;
		let totalPlayers = totalAlive + totalDead;
		
		
		if (totalAlive == 1){
			let finalPlayer = Array.from(this.aliveUsers)[0];
			let username = finalPlayer.username;
			
			io.in(this.name).emit('end',username);
			this.deadUsers.add(finalPlayer);
			this.aliveUsers.clear();
		}
		
		
		if (!this.countingDown && totalAlive <= 1 && totalPlayers > 1){
			this.countingDown = true;
			this.breakCountdown = false;
			
			io.in(this.name).emit('server message','Restarting...');
			
			for (let i = 10; i > 0; i--){
				io.in(this.name).emit('countdown',i);
				await new Promise(r => setTimeout(r,1000));
				if (this.breakCountdown){
					io.in(this.name).emit('message','server','[SERVER]','There are no longer enough players left to start the game. The countdown has been canceled.');
					io.in(this.name).emit('countdown','');
					this.breakCountdown = false;
					return;
				}
			}
			
			this.aliveUsers =  new Set([...this.aliveUsers, ...this.deadUsers]);
			this.aliveUsers.forEach(this.resetUser);
			this.deadUsers.clear();


			this.startingPlayers = this.aliveUsers.size;
			
			const userData = [...this.aliveUsers].map(e => ({pid:e.pid, username:e.username}));
			io.in(this.name).emit('updateUsers',userData);

			let bagSalt = Math.random();
			let currentDate = Date.now();
			let gameStartDate = currentDate + 1000 * 15;
			io.in(this.name).emit('start',gameStartDate,bagSalt);
			
			this.countingDown = false;

			console.log('totalUsers ' + this.totalUsers.size);
			console.log('spectatingUsers ' + this.spectatingUsers.size);
			console.log('deadUsers ' + this.deadUsers.size);
			console.log('aliveUsers ' + this.aliveUsers.size);

		}else if (this.countingDown && totalPlayers < 2){ //this should cancel the countdown in the event that a player leaves while the match is starting.
			this.breakCountdown = true;
		}else if (totalPlayers > 1){
			this.breakCountdown = false;
		}
	}
	
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
		console.log('totalUsers ' + this.totalUsers.size);
		console.log('spectatingUsers ' + this.spectatingUsers.size);
		console.log('deadUsers ' + this.deadUsers.size);
		console.log('aliveUsers ' + this.aliveUsers.size);
		let usernames = [...this.totalUsers].map(e => e.username);
		io.in(this.name).emit('update lobby', usernames);

		this.updateGameState();
		
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
		
		return obj;
	}
	
	removeUser(obj){
		let deleted = this.totalUsers.delete(obj); //chaning or statements causes the code to quit early and then the dead players never get cleared
		this.spectatingUsers.delete(obj);
		this.deadUsers.delete(obj);
		this.aliveUsers.delete(obj);
		
		let usernames = [...this.totalUsers].map(e => e.username);
		io.in(this.name).emit('update lobby', usernames);
		
		
		io.in(this.name).emit('server message', obj.username + ' has left the room.');
		
		this.updateGameState();
	}
	
	killUser(obj){
		if (this.aliveUsers.delete(obj)){
			this.deadUsers.add(obj);
			this.updateGameState();
		}
	}
	
	resetUser(obj){
		obj.socket.boardData = {
			board:undefined,
			b2b:0,
			combo:0,
			garbage:0,
			garbageQueue:0,
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

const rooms = new Map();
rooms.set('quickplay', new Room('quickplay'));

function bind(input){
	io = input;
	io.on('connection',function(socket){
		console.log('connection');
		socket.room = 'quickplay';
		socket.username = 'GUEST';
		if (socket.request.session.userid !== undefined){
			socket.username = socket.request.session.userid;
		}
		
		if (!rooms.has(socket.room)){
			throw 'err'; // should eventually change once lobby browsing is availible
		}
		socket.boardData = {};
		
		socket.join(socket.room);
		var currentRoom = rooms.get(socket.room);
		var roomObject = currentRoom.addUser(socket);
		
		socket.publicID = roomObject.pid;
		
		socket.emit('sendPID', socket.publicID);
		
		socket.on('defeat',function(callback){
			callback(currentRoom.aliveUsers.size,currentRoom.startingPlayers);
			
			currentRoom.killUser(roomObject);
		});
		
		socket.on('spectate', function(){
			currentRoom.setInActive(roomObject);
		});
		
		socket.on('play', function(){
			currentRoom.setActive(roomObject);
		});
		
		socket.on('disconnect', function(){
			console.log('disconnect');
			currentRoom.removeUser(roomObject);
		});
		
		socket.on('send message', function(message){ // MESSAGES
			console.log('emitting');
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
			console.log('cleared line');
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
}

module.exports = bind;