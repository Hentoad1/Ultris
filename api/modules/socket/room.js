const { v1 } = require('uuid');

function passVars(io, rooms){
  return class Room{
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
        
      for (let i = 3; i > 0; i--){
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
      this.deadUsers.clear(); //clear the dead users.
      this.playerDeathList = []; //reset the player death list.
  
      this.startingPlayers = this.aliveUsers.size; //save the number of players at the start of the game.
        
      const userData = [...this.aliveUsers].map(e => ({pid:e.pid, username:e.username})); //send the user data to the clients.
      io.in(this.name).emit('updateUsers',userData);
  
      let bagSalt = Math.random();
      let currentDate = Date.now();
      let gameStartDate = currentDate + 1000 * 15;
      io.in(this.name).emit('start',gameStartDate,bagSalt); //starts the game

      this.aliveUsers.forEach(obj => this.resetUser(obj, bagSalt)); //resets the user data.
        
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
      //this.resetUser(obj);
      
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
    
    resetUser(obj, salt){
      obj.socket.boardData.reset(salt);
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
}

function genBlankBoard(){
  let arr = [];
  for (let i = 0; i < 40; i++){
      arr[i] = [];
  for (let j = 0; j < 10; j++){
    arr[i][j] = 0;
  }
}
  return arr;
}

module.exports = passVars;