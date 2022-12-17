const Board = require('./board');
let addLeaderboardScore = require('./leaderboard');

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

function bind(io, sessionMiddleware){
  const Room = require('./room')(io); //import rooms class
  const rooms = new Map(); //create room map
  const publicRooms = new Set(); //create public rooms set so it can be listed easily in the browse menu

  

  const RoomKillFunction = (roomid) => {
    rooms.delete(roomid);
    publicRooms.delete(roomid);
  }

  let quickplayInfo = {
    id:'quickplay',
    owner:{
      uuid:null,
      username:null
    },
    automatic:true
  }

  rooms.set('quickplay', new Room(quickplayInfo, RoomKillFunction));

  const wrap = function(middleware){ 
    return function(socket, next){
      middleware(socket.request, {}, next);
    }
  }

  io.use(wrap(sessionMiddleware));

  io.use((socket, next) => {
    if (socket.request.session.initalized){
      socket.username = socket.request.session.user.username;
      socket.uuid = socket.request.session.user.uuid;
      next();
    }else{
      console.log('got here');
      next(new Error('There was an error loading your account information, please refresh the page.'));
    }
  })

	io.on('connection',handle(function(socket){
		socket.boardData = new Board();
    socket.ownedRoom = null;

    resetBinds(socket);
	}));

  function resetBinds(socket){
    socket.removeAllListeners();
  
    socket.on('join room',handle(function(roomcode,callback){
      resetBinds(socket)
      if (!rooms.has(roomcode)){
        return callback('Room does not exist.');
      }

      let currentRoom = rooms.get(roomcode);

      let maxPlayers = currentRoom.settings.maxPlayers;
      if (maxPlayers !== 0 && maxPlayers <= currentRoom.totalUsers.size){
        return callback('Room is full.');
      }

      //add rest of the listeners for procesing the game
      socket.join(roomcode);

      let userObject = currentRoom.addUser(socket);
      
      let outgoingData = Object.assign({},currentRoom.settings);
      outgoingData.admin = (currentRoom.owner.uuid === socket.uuid);
      callback(null, outgoingData);
  
  
      socket.publicID = userObject.pid;
    
      socket.emit('sendPID', socket.publicID);
      
      socket.on('update lobby', handle(function(newData, callback){
        let settings = currentRoom.settings;
        for (let property in settings){
          if (newData[property] !== undefined){
            settings[property] = newData[property];
          }
        }

        currentRoom.totalUsers.forEach(user => {
          let socket = user.socket;

          
          let outgoingData = Object.assign({},settings);
          outgoingData.admin = (currentRoom.owner.uuid === socket.uuid);
          socket.emit('update lobby info', outgoingData);
        })
      }));

      socket.on('start game', handle(function(){
        if (currentRoom.totalUsers.size - currentRoom.spectatingUsers.size > 1){
          currentRoom.beginCountdown();
        }else{
          socket.emit('request_error', 'You cannot start the game with only 1 player!');
        }

      }));

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
        socket.removeAllListeners();
      }));

      socket.on('reset', handle(function(){
        currentRoom.removeUser(userObject);
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
            if (totalLinesCleared >= 1){
              let timePassed = Date.now() - startDate;
              let seconds = timePassed / 1000;
              let formattedMinutes = (Math.floor(seconds / 60));
              let formattedSeconds = (Math.floor(seconds % 60)).toLocaleString('en-US',{minimumIntegerDigits:2,useGrouping:false});
              let formattedMilliseconds = (timePassed % 1000);
              let formatted = `${formattedMinutes}:${formattedSeconds}.${formattedMilliseconds}`

              socket.emit('end');
              socket.emit('overwritePrimaryStat', formatted);
              
              addLeaderboardScore('sprint', socket.uuid, formatted);
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
  
          addLeaderboardScore('blitz', socket.uuid, totalPoints);
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
      if (socket.ownedRoom !== null){
        return callback(socket.ownedRoom.id);
      }


      let roomcode = generateRoomCode();
      let roomInfo = {
        id:roomcode,
        owner:{
          uuid:socket.uuid,
          username:socket.username
        },
        automated:false
      };

      let createdRoom = new Room(roomInfo, RoomKillFunction);

      socket.ownedRoom = createdRoom;

      rooms.set(roomcode, createdRoom);
      publicRooms.add(roomcode);
      callback(roomcode);
    }));

    socket.on('get rooms', handle(function(callback){
      let roomData = [];

      publicRooms.forEach(id => {
        let room = rooms.get(id);
        let info = {
          id,
          name:room.settings.name,
          players:{
            current:room.totalUsers.size,
            max:room.settings.maxPlayers
          }
        };

        roomData.push(info);
      });

      callback(roomData);
    }));
  
    socket.on('reset', handle(() => {console.log('reset callked'); resetBinds(socket)}))
  }  
}

module.exports = bind;