const Board = require('./board');

function generateRoomCode(){
  let number = Math.floor(Math.random() * 2176782335);
  let str = number.toString(36).toUpperCase();
  return str;
}

const handle = function(f) {
  return function() {
    try {
      f.apply(this, arguments);
    } catch(e) {
      console.log(e)
    }
  }
}

function bind(io){
  const rooms = new Map();
  const Room = require('./room')(io, rooms);

  new Room('quickplay',{},true);

	io.on('connection',handle(function(socket){
    //this doesnt need an 'else' because even guest users will be intialized the moment a post or get request is made, socket can still come in first however so this if statement is necessary.
    if (socket.request.session.initalized){
      socket.username = socket.request.session.user.username;
      socket.uuid = socket.request.session.user.uuid;
    }

    console.log('found uuid of ' + socket.uuid);

		socket.boardData = new Board();

		socket.on('join room',handle(function(roomcode,callback){
			if (!rooms.has(roomcode)){
				callback(null,'Room does not exist.');
				return;
			}
			let currentRoom = rooms.get(roomcode);
			let roomObject = currentRoom.addUser(socket);
			
      let outgoingData = Object.assign({},currentRoom.settings);
			outgoingData.admin = (currentRoom.owner.uuid === socket.uuid && socket.uuid);
			callback(outgoingData,false);

			//add rest of the listeners for procesing the game
			socket.join(roomcode);

			socket.publicID = roomObject.pid;
		
			socket.emit('sendPID', socket.publicID);
			
			socket.on('defeat',handle(function(){
				currentRoom.killUser(roomObject);
			}));
			
			socket.on('spectate', handle(function(){
				currentRoom.setInActive(roomObject);
			}));
			
			socket.on('play', handle(function(){
				currentRoom.setActive(roomObject);
			}));
			
			socket.on('disconnect', handle(function(){
				currentRoom.removeUser(roomObject);
			}));
			
			socket.on('send message', handle(function(message){ // MESSAGES
				io.in(room_code).emit('message','userMessage',socket.username,message);
			}));
			
      socket.on('hold', handle(function(){
        socket.boardData.hold();
      }))

			//MANAGE GAME EVENTS
			socket.on('placed',handle(function(board){
        let [valid, pointInfo] = socket.boardData.newBoard(board);

        socket.broadcast.emit('recieve board',board,socket.publicID);
			}));
			
			socket.on('send peice',handle(function(cords,ghost,color){
				socket.broadcast.emit('recieve peice',cords,ghost,color,socket.publicID);
			}));
		}));

		socket.on('create room',handle(function(callback){
      if (socket.uuid && socket.username){
        let roomcode = generateRoomCode();
        new Room(roomcode,{uuid:socket.uuid,username:socket.username},false);
        callback(roomcode);
      }
		}));
	}));
}

module.exports = bind;