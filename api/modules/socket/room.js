const { v1 } = require('uuid');

function passVars(io){
  return class Room{
    constructor({id,owner,automatic}, onExpire){
      //room information
      this.id = id;
      this.owner = owner; //owner should be an object with uuid and username.
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
      //game variables
      this.totalUsers = new Set();
      this.spectatingUsers = new Set(); // these are users who are choosing to sit out every round.
      this.deadUsers = new Set();
      this.aliveUsers = new Set();
      this.startingPlayers = 0;
      this.playerDeathList = [];
      //set the onExpire function
      this.onExpire = onExpire;
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
        io.in(this.id).emit('end',playerData);
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
        
      for (let i = 3; i > 0; i--){
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
        
      this.countingDown = false; //reset the counting down flag.
    }
  
    expire(){
      console.log('expire started');
      if (typeof this.killExpire === 'function'){
        this.killExpire();
      }
  
      new Promise((resolve) => {
        setTimeout(resolve,30 * 1000,true);
        this.killExpire = (() => {
          console.log('expire killed');
          resolve(false);
        });
      }).then((result) => {
        if (result){
          if (this.totalUsers.size !== 0){
            //failsafe for expire somehow going through even though there still ppl in it
            return console.log('expire failsafe called');
          }
          this.killExpire = null;
          this.onExpire(this.id); //call the onExpire function
        }
      });
    }
  
    //USER FUNCTIONS
    addUser(socket){
      let pid = this.generatePID();
      let obj = {
        id:socket.id,
        pid:pid,
        username:socket.username,
        socket:socket,
        spectating:false
      };
      this.totalUsers.add(obj);
      this.deadUsers.add(obj);
      //this.resetUser(obj);
      
      io.in(this.id).emit('server message', 'Welcome ' + socket.username + ' to the room!');


      let players = [...this.aliveUsers, ...this.deadUsers].map(e => e.username).sort();
      let spectators = [...this.spectatingUsers].map(e => e.username).sort();
      io.in(this.id).emit('update lobby players', players, spectators);
  
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
  
      io.in(this.id).emit('remove user', obj.pid);
      
      let players = [...this.aliveUsers, ...this.deadUsers].map(e => e.username).sort();
      let spectators = [...this.spectatingUsers].map(e => e.username).sort();
      io.in(this.id).emit('update lobby players', players, spectators);
      
      if (this.totalUsers.size === 0 && !this.automated){
        this.expire();
      }
  
      this.update();
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

      let players = [...this.aliveUsers, ...this.deadUsers].map(e => e.username).sort();
      let spectators = [...this.spectatingUsers].map(e => e.username).sort();
      io.in(this.id).emit('update lobby players', players, spectators);
    }
    
    setInActive(obj){
      this.aliveUsers.delete(obj);
      this.deadUsers.delete(obj);
      this.spectatingUsers.add(obj);
      
      obj.spectating = true;

      obj.socket.emit('server message', 'You will now automatically spectate every future match.');

      let players = [...this.aliveUsers, ...this.deadUsers].map(e => e.username).sort();
      let spectators = [...this.spectatingUsers].map(e => e.username).sort();
      io.in(this.id).emit('update lobby players', players, spectators);
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
}

module.exports = passVars;