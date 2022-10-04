socket.on('cleared line', handle(function(board,cords,x,y,color,testKick3,lastMove){
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
}));