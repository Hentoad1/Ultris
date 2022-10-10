const getMoveData = require('./moveData');
const getClearData = require('./clearData');
const Queue = require('./queue');

class Board {
  constructor (){
    this.board = genBlankBoard(),
    this.queue = new Queue(),
    this.b2b = 0,
    this.combo = 0,
    this.garbageMeter = [],
    this.garbageQueue = [],
    this.linesSent = 0,
    this.linesReceived = 0,
    this.totalLines = 0, 
    this.level = 0
  }

  reset(salt){ //needs salt for queue and then queue uses .reset
    this.board = genBlankBoard(),
    this.queue.reset(salt),
    this.b2b = 0,
    this.combo = 0,
    this.garbageMeter = [],
    this.garbageQueue = [],
    this.linesSent = 0,
    this.linesReceived = 0,
    this.totalLines = 0, 
    this.level = 0
  }

  //add garbage to the queue
  addGarbage(lines, x){
    let fullGarbage = new Array(10).fill(9);
    fullGarbage[x] = 0;

    for (let i = 0; i < lines; i++){
      this.garbageQueue.unshift(fullGarbage.slice());
    }
    
    this.garbageMeter.push(lines);
  }

  //remove garbage from the queue
  removeGarbage(lines){
    for (let i = 0; i < lines; i++){
      this.garbageQueue.pop();
      if (this.garbageMeter.length !== 0 && this.garbageMeter[0] <= 1){
        this.garbageMeter.shift();
      }else if (this.garbageMeter.length !== 0){
        this.garbageMeter[0] -= 1;
      }
    }
  }

  //garbage garbage from queue to the board, always will convert up to 8 when a piece is placed.
  convertGarbage(){
    if (this.garbageQueue.length > 0){
      for (let i = Math.min(this.garbageQueue.length,8); i > 0; i--){
        this.board.unshift(this.garbageQueue.pop());
        this.board.pop();
        if (this.garbageMeter.length !==  0 && this.garbageMeter[0] <= 1){
          this.garbageMeter.shift();
        }else if (this.garbageMeter.length !==  0){
          this.garbageMeter[0] -= 1;
        }
      }
    }
  }

  newMove(newBoard, movementType){
    let preGarbageData = getMoveData(this.board, newBoard); //this only should be used for clear data as clear data only uses the move data if a line is cleared and garabage wouldnt be added in that case
    let [clearData, clearedBoard] = getClearData(newBoard, preGarbageData, movementType);

    if (clearData.linesCleared === 0){
      this.convertGarbage();//only convert garbage if line isnt cleared
      this.combo = 0;
    }else{
      this.totalLines += clearData.linesCleared;
      this.level = Math.floor(this.totalLines / 10) + 1;

      this.combo++;
      if (clearData.complexMove){
        this.b2b++;
      }else{
        this.b2b = 0;
      }
    }

    console.log('combo ' + this.combo);
    console.log('b2b ' + this.b2b);

    //make sure there is alignment with what the queue should be with the given salt
    let moveData = getMoveData(this.board, newBoard);
    let expectedType = this.queue.next();

    if (expectedType !== moveData.type){
      console.log('incorrect type');
      console.log(expectedType);
      console.log(moveData.type);
      return [false, null];
    }

    if (!moveData.valid){
      console.log('invalid move');
      return [false, null];
    }


    //update board for next time, needs to be done before calculate points
    this.board = clearedBoard;

    //pass off point data for server to use depending on game mode
    let pointData = {
      lines: clearData.linesCleared,
      type: clearData.type, 
      combo: this.combo,
      b2b: this.b2b,
      level: this.level,
      pc: clearData.perfectClear
    }

    //returns [valid, outgoing lines]
    return [true, pointData];
  }

  hold(){
    this.queue.hold();
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

module.exports = Board;