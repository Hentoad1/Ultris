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

function bind(io){
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

	io.on('connection',handle(function(socket){
    io.use((socket, next) => {
      if (socket.handshake.session.initalized){
        socket.username = socket.handshake.session.user.username;
        socket.uuid = socket.handshake.session.user.uuid;

        next();
      }else{
        next(new Error("Unauthorized"));
      }
    })
    
		socket.boardData = new Board();
    socket.ownedRoom = null;

    addUserBinds(socket);
	}));

  function addUserBinds(socket){
   
    let join_room_cleanup = () => {};
    const join_room = handle(function(roomcode,callback){
      removeSecondaryListeners()
      if (!rooms.has(roomcode)){
        return socket.emit('request_error', {error:'Room does not exist.', redirect: '/play'});
      }

      let currentRoom = rooms.get(roomcode);

      for (let i = 0; i < currentRoom.totalUsers.length; i++){
        let userData = currentRoom.totalUsers[i];
        if (userData.socket.uuid === socket.uuid){
          return socket.emit('request_error', {error:'Your account has already logged into this lobby.', redirect: '/play'});
        }
      }

      
      socket.join(roomcode); // joining the socket room is important here because the addUser functions calls the socket room functions

      let userObject = currentRoom.addUser(socket);

      let maxPlayers = currentRoom.settings.maxPlayers;
      //only less than is used because the user that joined is included in this count.
      if (maxPlayers !== 0 && maxPlayers < currentRoom.aliveUsers.size + currentRoom.deadUsers.size){
        currentRoom.setInActive(userObject);
        
        socket.emit('request_notify', 'Room is currently full, you will be set to a spectator.');
      }

      let outgoingData = Object.assign({},currentRoom.settings);
      outgoingData.admin = (currentRoom.owner.uuid === socket.uuid);
      outgoingData.spectating = userObject.spectating;
      callback(outgoingData);
  
  
      socket.publicID = userObject.pid;
    
      socket.emit('sendPID', socket.publicID);
      
      const update_lobby = handle((newData) => {
        if (socket.uuid !== currentRoom.owner.uuid){
          return;
        }

        let settings = currentRoom.settings;
        for (let property in settings){
          if (newData[property] !== undefined){
            settings[property] = newData[property];
          }
        }

        if (settings.private){ //if the room is private
          publicRooms.delete(roomcode)
        }else{
          publicRooms.add(roomcode);
        }

        currentRoom.totalUsers.forEach(user => {
          let socket = user.socket;

          
          let outgoingData = Object.assign({},settings);
          outgoingData.admin = (currentRoom.owner.uuid === socket.uuid);
          outgoingData.spectating = user.spectating;
          socket.emit('update lobby info', outgoingData);
        })
      })

      const start_game = handle(() => {
        if (currentRoom.aliveUsers.size + currentRoom.deadUsers.size > 1){
          currentRoom.beginCountdown();
        }else{
          socket.emit('request_error', {error:'You cannot start the game with only 1 player!'});
        }
      });

      const swap_activity = handle((callback) => {
        if (!userObject.spectating){
          currentRoom.setInActive(userObject);
        }else{
          let maxPlayers = currentRoom.settings.maxPlayers;
          if (maxPlayers === 0 || maxPlayers > currentRoom.aliveUsers.size + currentRoom.deadUsers.size){
            currentRoom.setActive(userObject);
          }else{
            socket.emit('request_error', {error:'Room is currently full!'});
          }
        }

        let outgoingData = Object.assign({},currentRoom.settings);
        outgoingData.admin = (currentRoom.owner.uuid === socket.uuid);
        outgoingData.spectating = userObject.spectating;
        callback(outgoingData);
      });

      const defeat = handle(function(){
        currentRoom.killUser(userObject);
      });

      const spectate = handle(function(){
        currentRoom.setInActive(userObject);
      });

      const play = handle(function(){
        currentRoom.setActive(userObject);
      });

      const disconnect = handle(function(){
        currentRoom.removeUser(userObject);
        socket.removeAllListeners();
      });

      const reset = handle(function(){
        currentRoom.removeUser(userObject);
      });

      const send_message = handle(function(message){ // MESSAGES
        io.in(roomcode).emit('message','userMessage',socket.username,message);
      });

      const hold = handle(function(){
        socket.boardData.hold();
      });

      const placed = handle(function(beforeClear, movement){
        let [valid, pointInfo] = socket.boardData.newMove(beforeClear, movement);

        if (!valid){
          socket.emit('sync', socket.boardData.board, ...socket.boardData.queue.sync());
        }else{
          let outgoingLines = calcLines(pointInfo);
          if (outgoingLines > 0){
            socket.boardData.linesSent += outgoingLines;


            //cancel any garbage in the queue
            if (socket.boardData.incomingGarbage > 0){
              let canceledLines = Math.min(socket.boardData.incomingGarbage, outgoingLines);

              outgoingLines -= canceledLines;
              socket.boardData.removeGarbage(canceledLines);
              socket.emit('cancel garbage', canceledLines);
            }

            if (outgoingLines > 0){
              let opponentArray = [...currentRoom.aliveUsers];

              let randomOpponent;
              do{
                randomOpponent = opponentArray[Math.floor(Math.random() * opponentArray.length)];
              }while(randomOpponent === userObject);

              let holePos = Math.floor(Math.random() * 10);

              randomOpponent.socket.boardData.addGarbage(outgoingLines, holePos);
              randomOpponent.socket.emit('receive garbage', outgoingLines, holePos);
              randomOpponent.socket.boardData.linesReceived += outgoingLines;
            }
          }
        }
        
        socket.broadcast.emit('receive board',socket.boardData.board,socket.publicID);

        function calcLines(pointInfo){
          if (pointInfo.lines === 0){
            return 0;
          }

          let normalLines = [0,1,2,4];
          let tSpinLines = [2,4,6];
          let tSpinMiniLines = [1,2];

          let moveMap = new Map([['Normal', normalLines], ['T-Spin', tSpinLines], ['T-Spin-Mini', tSpinMiniLines]]);

          let outgoingLines = moveMap.get(pointInfo.type)[pointInfo.lines - 1];

          if (outgoingLines === undefined){
            return 0;
          }

          let b2bBonus = 0;
          for (let i = 0; Math.pow(2,i + 0.7) - 1 < (pointInfo.b2b - 1); i++){
            b2bBonus++;
          }

          outgoingLines += b2bBonus;

          let comboMultiplier = 1 + 0.25 * (pointInfo.combo - 1) 
          outgoingLines *= comboMultiplier;

          let pcBonus = pointInfo.pc ? 10 : 0;

          outgoingLines += pcBonus;

          return Math.round(outgoingLines);
        }
      });

      const send_piece = handle(function(cords,ghost,color){
        socket.broadcast.emit('receive piece',cords,ghost,color,socket.publicID);
      });

      socket.on('update lobby', update_lobby);
      socket.on('start game', start_game);
      socket.on('swap activity', swap_activity);
      socket.on('defeat', defeat);
      socket.on('spectate', spectate);
      socket.on('play', play);
      socket.on('disconnect', disconnect);
      socket.on('reset', reset);
      socket.on('send message', send_message);
      socket.on('hold', hold);
      socket.on('placed', placed);
      socket.on('send piece', send_piece);

      join_room_cleanup = () => {
        socket.off('update lobby', update_lobby);
        socket.off('start game', start_game);
        socket.off('swap activity', swap_activity);
        socket.off('defeat', defeat);
        socket.off('spectate', spectate);
        socket.off('play', play);
        socket.off('disconnect', disconnect);
        socket.off('reset', reset);
        socket.off('send message', send_message);
        socket.off('hold', hold);
        socket.off('placed', placed);
        socket.off('send piece', send_piece);
      }
    });

    socket.on('join room',join_room);
  
    let sprint_cleanup = () => {};
    const sprint = handle(function(salt){
      removeSecondaryListeners();
      socket.boardData.reset(salt);
  
      let totalLinesCleared = 0; //finish condition
      let startDate = Date.now(); //score measurement
  
      let synced = true;

      const hold = handle(function(){
        socket.boardData.hold();
      });
  
      const placed = handle(function(board, movement){
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
      });

      socket.on('hold', hold);
      socket.on('placed', placed);

      sprint_cleanup = () => {
        socket.off('hold', hold);
        socket.off('placed', placed);
      }
    });

    socket.on('sprint', sprint);

  
    let blitz_cleanup = () => {};
    const blitz = handle(function(salt){
      removeSecondaryListeners();
      socket.boardData.reset(salt);
  
      let startDate = Date.now(); //finish condition
      let totalPoints = 0; //score measurement
  
      let synced = true;
      socket.on('hold', handle(function(){
        socket.boardData.hold();
      }))
  
      const placed = handle(function(board, movement, fallPoints){
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
            };
          }else{
            synced = false;
          }
        }
      })

      const timeout = handle(function(fallPoints){
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

      //MANAGE GAME EVENTS
      socket.on('placed', placed);
      socket.on('timeout', timeout);

      blitz_cleanup = () => {
        socket.off('placed', placed);
        socket.off('timeout', timeout);
      }
  
      function calcPoints(data){
        if (data.lines === 0){
          return 0;
        }
        const linesToPoints = [100, 300, 500, 800];
        
        var points = linesToPoints[Math.min(data.lines, 4) - 1];
        var spinMultiplier = data.type === 'T-Spin' ? 4 : data.type === 'T-Spin-Mini' ? 4 / 3 : 1;
        var b2bMultiplier = data.b2b > 1 ? 1.5 : 1;
        var pcBonus = data.pc ? 3500 : 0;
  
        var points = ((Math.floor(points * spinMultiplier * b2bMultiplier / 100) * 100) + pcBonus + ((data.combo - 1) * 50)) * data.level;
  
        return points;
      }
    })

    socket.on('blitz', blitz);
  
    const create_room = handle(function(callback){
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
      callback(roomcode);
    });

    socket.on('create room', create_room);

    const get_rooms = handle(function(callback){
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
    });

    socket.on('get rooms', get_rooms);

    const reset = handle(() => {
      removeSecondaryListeners();
    });

    socket.on('reset', reset)

    let removeSecondaryListeners = () => {
      /*socket.off('join room', join_room);
      socket.off('sprint', sprint);
      socket.off('blitz', blitz);
      socket.off('get rooms', get_rooms);
      socket.off('create room', create_room);*/

      join_room_cleanup();
      sprint_cleanup();
      blitz_cleanup();

      join_room_cleanup = () => {};
      sprint_cleanup = () => {};
      blitz_cleanup = () => {};
    }
  }
}

module.exports = bind;