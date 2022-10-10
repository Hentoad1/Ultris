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

    resetBinds(socket);
	}));
}

function resetBinds(socket){
  console.log('reset');
  socket.removeAllListeners();

  socket.on('join room',handle(function(roomcode,callback){
    resetBinds(socket)
    if (!rooms.has(roomcode)){
      callback(null,'Room does not exist.');
      return;
    }

    let currentRoom = rooms.get(roomcode);
    let userObject = currentRoom.addUser(socket);
    
    let outgoingData = Object.assign({},currentRoom.settings);
    outgoingData.admin = (currentRoom.owner.uuid === socket.uuid && socket.uuid);
    callback(outgoingData,false);

    //add rest of the listeners for procesing the game
    socket.join(roomcode);

    socket.publicID = userObject.pid;
  
    socket.emit('sendPID', socket.publicID);
    
    socket.on('defeat',handle(function(){
      currentRoom.killUser(userObject);
    }));
    
    socket.on('spectate', handle(function(){
      currentRoom.setInActive(userObject);
    }));
    
    socket.on('play', handle(function(){
      currentRoom.setActive(userObject);
    }));
    
    socket.on('disconnect', handle(function(){
      currentRoom.removeUser(userObject);
      socket.removeAllLisenters();
    }));
    
    socket.on('send message', handle(function(message){ // MESSAGES
      io.in(roomcode).emit('message','userMessage',socket.username,message);
    }));
    
    socket.on('hold', handle(function(){
      socket.boardData.hold();
    }))

    //MANAGE GAME EVENTS
    socket.on('placed',handle(function(board, movement){
      let [valid, pointInfo] = socket.boardData.newMove(board, movement);

      socket.broadcast.emit('recieve board',board,socket.publicID);
    }));
    
    socket.on('send peice',handle(function(cords,ghost,color){
      socket.broadcast.emit('recieve peice',cords,ghost,color,socket.publicID);
    }));
  }));

  socket.on('sprint', handle(function(salt){
    resetBinds(socket);
    socket.boardData.reset(salt);

    let totalLinesCleared = 0; //finish condition
    let startDate = Date.now(); //score measurement

    let synced = true;
    socket.on('hold', handle(function(){
      socket.boardData.hold();
    }))

    //MANAGE GAME EVENTS
    socket.on('placed',handle(function(board, movement){
      let [valid, pointInfo] = socket.boardData.newMove(board, movement);
      if (synced){
        if (valid){
          totalLinesCleared += pointInfo.lines;
          if (totalLinesCleared >= 40){
            console.log(Date.now() - startDate);
            socket.emit('end');
          };
        }else{
          synced = false;
        }
      }
    }));
  }));

  socket.on('blitz', handle(function(salt){
    resetBinds(socket);
    socket.boardData.reset(salt);

    let startDate = Date.now(); //finish condition
    let totalPoints = 0; //score measurement

    let synced = true;
    socket.on('hold', handle(function(){
      socket.boardData.hold();
    }))

    //MANAGE GAME EVENTS
    socket.on('placed',handle(function(board, movement, fallPoints){
      let [valid, pointInfo] = socket.boardData.newMove(board, movement);
      if (synced){
        if (valid){
          if (fallPoints > 80){
            synced = false;
          }else{
            totalPoints += fallPoints;
          }

          if (Date.now() - startDate < 1000 * 60 * 20){
            totalPoints += calcPoints(pointInfo);
            console.log(totalPoints);
          };
        }else{
          synced = false;
        }
      }
    }));

    socket.on('timeout', function(fallPoints){
      if (synced){ 
        if (fallPoints > 80){
          synced = false;
          return;
        }else{
          totalPoints += fallPoints;
        }

        console.log(totalPoints);
        console.log('would be sending points here');
      }
    })

    function calcPoints(data){
      if (data.lines === 0){
        return 0;
      }
      console.log(data);
      const linesToPoints = [100, 300, 500, 800];
      
      var points = linesToPoints[Math.min(data.lines, 4) - 1];
      var spinMultiplier = data.type === 'T-Spin' ? 4 : data.type === 'T-Spin-Mini' ? 4 / 3 : 1;
      var b2bMultiplier = data.b2b > 1 ? 1.5 : 1;
      var pcBonus = data.pc ? 3500 : 0;

      var points = ((Math.floor(points * spinMultiplier * b2bMultiplier / 100) * 100) + pcBonus + ((data.combo - 1) * 50)) * data.level;

      return points;
    }
  }));

  socket.on('create room',handle(function(callback){
    if (socket.uuid && socket.username){
      let roomcode = generateRoomCode();
      new Room(roomcode,{uuid:socket.uuid,username:socket.username},false);
      callback(roomcode);
    }
  }));

  socket.on('reset', handle(() => resetBinds(socket)))
}

module.exports = bind;