function passVars(io){
  return class Room{
    constructor({id,owner,automatic}, onExpire){
      //room information
      this.id = id;
      this.owner = owner; //owner should be an object with uuid, pid, and username.
      this.automated = automatic;
      //customizable settings (name in here because all of these are the vars that can be changed by the owner, nothing else)
      this.settings = {
        private:true,
        name:this.automated ? this.id : owner.username + "'s Room",
        maxPlayers:0
      }
      //lobby states
      this.countingDown = false;
      this.breakCountdown = false;
      this.inMatch = false;
      //game variables
      this.totalUsers = new Set();
      this.spectatingUsers = new Set(); // these are users who are choosing to sit out every round.
      this.deadUsers = new Set();
      this.aliveUsers = new Set();
      this.startingPlayers = 0;
      this.playerDeathList = [];
      //set the onExpire function
      this.onExpire = onExpire;
      //IDs for setTimeout
      this.gravityID = null;
      this.expireID = null;
      this.ownerID = null;
    }
    
    update(){
      let totalAlive = this.aliveUsers.size;
      let totalDead = this.deadUsers.size;
      let totalPlayers = totalAlive + totalDead;
      
      
      if (totalAlive == 1){
        this.inMatch = false;

        let finalPlayer = Array.from(this.aliveUsers)[0];
        this.playerDeathList.unshift(finalPlayer);
        let playerData = this.playerDeathList.map(user =>
          ({
            username:user.username,
            linesSent:user.socket.boardData.linesSent,
            linesReceived:user.socket.boardData.linesReceived
          })
        );
        io.in(this.id).emit('end',playerData);
        this.deadUsers.add(finalPlayer);
        this.aliveUsers.clear();

        clearTimeout(this.gravityID);
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
        io.in(this.id).emit('countdown',i);
        await new Promise(r => setTimeout(r,1000));
        if (this.breakCountdown){
          io.in(this.id).emit('message','server','[SERVER]','There are no longer enough players left to start the game. The countdown has been canceled.');
          io.in(this.id).emit('countdown','');
          this.breakCountdown = false;
          this.countingDown = false;
          return;
        }
      }
        
      this.inMatch = true;

      this.aliveUsers =  new Set([...this.aliveUsers, ...this.deadUsers]); //reset the alive users to include the dead users.
      this.deadUsers.clear(); //clear the dead users.
      this.playerDeathList = []; //reset the player death list.
  
      this.startingPlayers = this.aliveUsers.size; //save the number of players at the start of the game.
        
      const userData = [...this.aliveUsers].map(e => ({pid:e.pid, username:e.username})); //send the user data to the clients.
      io.in(this.id).emit('updateUsers',userData);
  
      let bagSalt = Math.random();
      let currentDate = Date.now();
      let gameStartDate = currentDate + 1000 * 15;
      io.in(this.id).emit('start',gameStartDate,bagSalt); //starts the game

      this.aliveUsers.forEach(obj => this.resetUser(obj, bagSalt)); //resets the user data.
      
      this.startGravity();

      this.countingDown = false; //reset the counting down flag.
    }

    startGravity(delay = 10000, rate = 1000){
      
      io.in(this.id).emit('gravity', rate);

      rate *= 0.9;
      delay *= 1.05;

      this.gravityID = setTimeout(() => this.startGravity(delay, rate), delay);
    }

    expire(){
      clearTimeout(this.expireID);

      this.expireID = setTimeout(() => {
        if (this.totalUsers.size !== 0){
          //failsafe for expire somehow going through even though there still players in it
          return;
        }

        this.onExpire(this.id); //call the onExpire function
      }, 30 * 1000); // 30 seconds.
    }
  
    newOwner(){
      //wait 1 second if user still has not returned then add a new owner.

      this.ownerID = setTimeout(() => {
        let earliestJoin = null;
        let correspondingUser = null;

        this.totalUsers.forEach(user => {
          if (earliestJoin === null || user.joinDate < earliestJoin){
            earliestJoin = user.joinDate;
            correspondingUser = user;
          }
        })

        if (correspondingUser === null){
          return;
        }

        this.owner = {
          username:correspondingUser.username,
          uuid:correspondingUser.socket.uuid,
          pid:correspondingUser.pid
        }

        this.broadcastPlayerInfo();
        this.broadcastRoomInfo();

        correspondingUser.socket.emit('message', 'serverMessage', '[SERVER]', 'The previous owner has left, you have been transferred the room ownership.');

      }, 1000) //1 second.
    }

    //USER FUNCTIONS
    addUser(socket){
      if (this.owner.uuid === socket.uuid){ //if the owner rejoins, then overwrite the old pid with the new one.
        this.owner.pid = socket.publicID;

        clearTimeout(this.ownerID) //clear timeout that will swap new owner as well.
      }

      let obj = {
        id:socket.id,
        pid:socket.publicID,
        username:socket.username,
        socket:socket,
        spectating:false,
        joinDate:Date.now()
      };
      this.totalUsers.add(obj);
      this.deadUsers.add(obj);
      //this.resetUser(obj);

      this.broadcastPlayerInfo();
  
      this.update();

      if (!this.inMatch){
        if (this.automated){
          socket.emit('message', 'serverMessage', '[SERVER]', 'Welcome to the room! The next game should begin shortly.');
        }else{
          socket.emit('message', 'serverMessage', '[SERVER]', 'Welcome to the room! The owner will start the match when they are ready.');
        }
      }else{
        if (this.totalUsers.size < 2){
          if (this.automated){
            socket.emit('message', 'serverMessage', '[SERVER]', 'Welcome to the room! There are currently not enough players to start, please wait for more players to join.');
          }else{
            socket.emit('message', 'serverMessage', '[SERVER]', 'Welcome to the room! The owner will start the match when they are ready.');
          }
        }else{
          socket.emit('message', 'serverMessage', '[SERVER]', 'Welcome to the room! You have joined during the middle of the match and will be able to play after the current round finishes.');
          


          //allow the player to spectate
          
          //generate user data
          let userData = [];
          let boardData = [];
          this.aliveUsers.forEach(function(data){
            userData.push({pid:data.pid, username:data.username});
            boardData.push({pid:data.pid, board:data.socket.boardData.board});
          });

          socket.emit('spectate');
          socket.emit('updateUsers',userData);
          boardData.forEach(e => socket.emit('receive board', e.board, e.pid));
        }
      }

      clearTimeout(this.expireID);
  
      return obj;
    }
    
    removeUser(obj){
      this.totalUsers.delete(obj); //remove the user from all of the sets.
      this.spectatingUsers.delete(obj);
      this.deadUsers.delete(obj);
      this.aliveUsers.delete(obj);
  
      io.in(this.id).emit('remove user', obj.pid);
      
      this.broadcastPlayerInfo();
      
      if (this.totalUsers.size === 0 && !this.automated){
        this.expire();
      }
  
      if (this.owner.uuid === obj.socket.uuid){
        this.newOwner();
      }

      this.update();
    }
    
    kickUser(obj){
      this.removeUser(obj);

      io.in(this.id).emit('message', 'serverMessage', '[SERVER]', `${obj.socket.username} was kicked from the room.`);

      obj.socket.emit('kicked');
    }

    killUser(obj){
      if (this.aliveUsers.delete(obj)){
        io.in(this.id).emit('remove user', obj.pid);
        this.deadUsers.add(obj);
        this.playerDeathList.unshift(obj);
        this.update();
      }
    }
    
    resetUser(obj, salt){
      obj.socket.boardData.reset(salt);
    }
    
    setActive(obj){
      this.spectatingUsers.delete(obj);
      this.deadUsers.add(obj);
      
      obj.spectating = false;
      
      obj.socket.emit('server message', 'You will now participate in the next match.');

      this.broadcastPlayerInfo();
      
      this.update();
    }
    
    setInActive(obj){
      this.aliveUsers.delete(obj);
      this.deadUsers.delete(obj);
      this.spectatingUsers.add(obj);
      
      obj.spectating = true;

      obj.socket.emit('server message', 'You will now automatically spectate every future match.');

      this.broadcastPlayerInfo();

      this.update();
    }

    broadcastPlayerInfo(){
      const mapFunc = e => ({username:e.username, pid:e.pid, owner:e.pid === this.owner.pid});
      const sortFunc = (a,b) => {
        if (b.owner || a.username > b.username){
          return 1;
        }else{
          return -1;
        }
      }

      let players = [...this.aliveUsers, ...this.deadUsers].map(mapFunc).sort(sortFunc);
      let spectators = [...this.spectatingUsers].map(mapFunc).sort(sortFunc);
      io.in(this.id).emit('update lobby players', players, spectators);
    }

    broadcastRoomInfo(settings = this.settings){
      this.settings = settings;

      this.totalUsers.forEach(user => {
        let socket = user.socket;

        
        let outgoingData = Object.assign({},settings);
        outgoingData.admin = (this.owner.uuid === socket.uuid);
        outgoingData.spectating = user.spectating;
        socket.emit('update lobby info', outgoingData);
      });
    }
  }
}

module.exports = passVars;