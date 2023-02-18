//CONSTANTS

//ROTATION SYSTEM
const T = [[0, 1, 0], [1, 1, 1], [0, 0, 0]];
const J = [[1, 0, 0], [1, 1, 1], [0, 0, 0]];
const L = [[0, 0, 1], [1, 1, 1], [0, 0, 0]];
const Z = [[1, 1, 0], [0, 1, 1], [0, 0, 0]];
const S = [[0, 1, 1], [1, 1, 0], [0, 0, 0]];
const I = [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]];
const O = [[1, 1], [1, 1]];
const pTypes = [T, J, I, Z, L, S, O];

const cWiseIKicks = [[[-2, 0], [1, 0], [-2, -1], [1, 2]], [[-1, 0], [2, 0], [-1, 2], [2, -1]], [[2, 0], [-1, 0], [2, 1], [-1, -2]], [[1, 0], [-2, 0], [1, -2], [-2, 1]]];
const ccWiseIKicks = [[[-1, 0], [2, 0], [-1, 2], [2, -1]], [[2, 0], [-1, 0], [2, 1], [-1, -2]], [[1, 0], [-2, 0], [1, -2], [-2, 1]], [[-2, 0], [1, 0], [-2, -1], [1, 2]]];
const cWiseElseKicks = [[[-1, 0], [-1, 1], [0, -2], [-1, -2]], [[1, 0], [1, -1], [0, 2], [1, 2]], [[1, 0], [1, 1], [0, -2], [1, -2]], [[-1, 0], [-1, -1], [0, 2], [-1, 2]]];
const ccWiseElseKicks = [[[1, 0], [1, 1], [0, -2], [1, -2]], [[1, 0], [1, -1], [0, 2], [1, 2]], [[-1, 0], [-1, 1], [0, -2], [-1, -2]], [[-1, 0], [-1, -1], [0, 2], [-1, 2]]];
const aKicks = [[[0, 1], [1, 1], [-1, 1], [1, 0], [-1, 0]], [[1, 0], [1, 2], [1, 1], [0, 2], [0, 1]], [[0, -1], [-1, -1], [1, -1], [-1, 0], [1, 0]], [[-1, 0], [-1, 2], [-1, 1], [0, 2], [0, 1]]];

//SCORING
const linesToText = ["SINGLE", "DOUBLE", "TRIPLE", "QUAD", "PENTA", "SEXTA", "HEPTA", "OCTA", "NONA", "DECA", "MEGA"];
const linesToPoints = [100, 300, 500, 800];
const innerColors = ["#0000", "#D91ED9", "#1E1EBF", "#1EBFBF", "#BF1E1E", "#BF601E", "#1EBF1E", "#D4D421", "#6A6A6A", "#1A1A1A"];
const outerColors = ["#FFFFFF", "#BF1BBF", "#1B1BA6", "#1BA6A6", "#A61B1B", "#A6551B", "#1BA61B", "#A6A61B", "#5C5C5C", "#090909"];

//INSTANCES
const killCountdown = new Event("killCountdown");

//SIZING
const cellSize = 20;

//BAG
var bags = 1;
var bagSalt;

//SCORE
var b2bCounter = -1;
var combo = -1;
var justHeld = false;
var lastMovement;

//STATS
var normalClears = new Array(4).fill(0);
var fullSpins = new Array(3).fill(0);
var miniSpins = new Array(2).fill(0);
var pcCount = 0;
var b2bMax = 0;

//HANDLING
const fallSpeed = 1000;
var DAS = 10;

//PIECES
var queue;
var current;
var hold;

var board = genBlankBoard();

//PLACEMENT
var fallTimer = fallSpeed;
var falling = true;
var lockDelay = 500;
var shiftsLeft = 10;

//TIME
var currentFrame = Date.now();
var previousFrame = Date.now();

//INTERVAL IDS
var TimerID = null;
var backupLoopID = null;
var animationFrameID = null;

//GAME STATE
var gameRunning = false;

//ONLINE
var garbageQueue = [];
var garbageMeter = [];
var dropBonusCounter = 0;
var onlineFallRate = 1000;

//SOCKET FUNCTIONS
var receiveGarbageFunction;
var cancelGarbageFunction;
var endFunction;
var startFunction;

//ANIMATION
let currentAnimation = null;

//EXPORTS
function initalize(DOM, socket, gameMode, keybinds) {
  class Tetrimino {
    constructor(p) {
      this.pType = pTypes[p];
      this.color = innerColors[p + 1];
      this.colorIndex = p + 1;
      this.iKicks = (p === 2);
      this.x = 5 - this.pType.length % 2;
      this.y = 20;
      this.state = 0;
      this.genShadowY();
      this.tSpin = false;
      this.miniSpin = false;
      this.kick3 = false;
    }

    reset() {
      this.pType = pTypes[this.colorIndex - 1];
      this.x = 5 - this.pType.length % 2;
      this.y = 20;
      this.state = 0;
      this.genShadowY();
      this.genShadowY();
    }

    display() {
      let canvas = DOM.main.current;
      let ctx = canvas.getContext('2d');

      ctx.fillStyle = this.color + "88";

      pOffsets(this.pType).forEach(e => ctx.fillRect((this.x + e[0]) * cellSize + 1.5, (19 - (this.shadowY + e[1])) * cellSize + 1.5, cellSize - 2, cellSize - 2));
      pOffsets(this.pType).forEach(e => pasteOnGrid(this.x + e[0], this.y + e[1], this.colorIndex));
    }

    export() {
      var cords = pOffsets(this.pType);
      cords.forEach(e => { e[0] += this.x; e[1] += this.y });
      return (cords);
    }

    exportShadow() {
      var cords = pOffsets(this.pType);
      cords.forEach(e => { e[0] += this.x; e[1] += this.shadowY });
      return (cords);
    }

    rotate(deg) {
      var tempX, tempY;
      var temp = [];
      var kicks;
      var newState;

      this.pType.forEach((e, i) => temp[i] = e.slice());

      temp.forEach((a, i) => a.forEach((e, j) => {
        if (deg === 90) {
          this.iKicks ? kicks = cWiseIKicks : kicks = cWiseElseKicks;
          tempY = j;
          tempX = (temp.length - 1 - i);
          temp[tempY][tempX] = this.pType[i][j];
          newState = (this.state + 5) % 4;
        } else if (deg === 270) {
          this.iKicks ? kicks = ccWiseIKicks : kicks = ccWiseElseKicks;
          tempY = (temp.length - 1 - j);
          tempX = i;
          temp[tempY][tempX] = this.pType[i][j];
          newState = (this.state + 3) % 4;
        } else if (deg === 180) {
          kicks = aKicks;
          tempX = temp.length - 1 - i;
          tempY = temp.length - 1 - j;
          temp[tempX][tempY] = this.pType[i][j];
          newState = (this.state + 2) % 4;
        }
      }));


      var tempOffsets = pOffsets(temp);

      if (this.shift(0, 0, tempOffsets)) {//does spin attempt without kicks
        this.pType = temp;
        this.state = newState;
        this.genShadowY();
        lastMovement = "rotate";
        //DAS = Math.max(DAS, handling.DCD); //with dcd removed this is now commented out, used to cause a delay when shifting a piece against a wall which im not even sure is what DCD is supposed to do.
        falling = this.shift(0, -1, null, true);
        return;
      }


      for (let i = 0; i < 4; i++) {
        if (this.shift(kicks[this.state][i][0], kicks[this.state][i][1], tempOffsets)) {
          this.pType = temp;
          this.state = newState;
          this.kick3 = (i === 3);
          this.genShadowY();
          lastMovement = "rotate";
          //DAS = Math.max(DAS, handling.DCD);
          falling = this.shift(0, -1, null, true);
          return;
        }
      }
    }

    genShadowY() {
      this.shadowY = 0;
      for (let i = 0; i < board.length; i++) {
        if (this.shift(0, -i, null, true)) {
          this.shadowY = this.y - i;
        } else {
          return;
        }
      }
    }

    shift(x, y, offsets, test) {
      var legal = true;
      var testX = 0;
      var testY = 0;

      if (offsets === null || offsets === undefined) {
        offsets = pOffsets(this.pType);
      }

      offsets.forEach(e => {
        testX = this.x + x + e[0];
        testY = this.y + y + e[1];
        legal = testX >= 0 && testX < 10 && testY >= 0 && board[testY][testX] === 0 && legal;
      });

      if (legal && !test) {
        this.x += x;
        this.y += y;
        if (x !== 0) {
          this.genShadowY();
        }
        lastMovement = "shift";

        falling = this.shift(0, -1, null, true);

        if (shiftsLeft >= 0 && !falling) {
          lockDelay = 500;
          shiftsLeft--;
        }
      }
      return legal;
    }

    place() {
      pOffsets(this.pType).forEach(e => board[this.y + e[1]][this.x + e[0]] = this.colorIndex);

      if (this.colorIndex === 1 && (lastMovement.valueOf() === "rotate" || false)) {
        const tipCords = [[-1, 1], [1, 1], [1, -1], [-1, -1]];
        var cors = [];
        for (let i = 0; i < 4; i++) {
          let x = this.x + tipCords[(this.state + i) % 4][0];
          let y = this.y + tipCords[(this.state + i) % 4][1];
          if (x >= 0 && x < 10 && y >= 0) {
            cors[i] = board[y][x] !== 0;
          } else {
            cors[i] = true;
          }
        }

        var col = true;

        this.tSpin = this.kick3 || (col && cors[0] && cors[1] && (cors[2] || cors[3]));

        this.miniSpin = col && cors[2] && cors[3] && (cors[0] !== cors[1]);
      }
    }
  }
  var handling = { DAS: localStorage.getItem('DAS') ?? 133, ARR: localStorage.getItem('ARR') ?? 167, SDF: localStorage.getItem('SDF') ?? 2, ISDF: localStorage.getItem('SDF') === 'Instant' }

  DOM.full.current.style = null; // makes it so it will cancel the animation if it is still running.
  refreshDOM(DOM.full);
  DOM.full.current.style = null;

  receiveGarbageFunction = function(lines,x){
    let fullGarbage = new Array(10).fill(9);
    fullGarbage[x] = 0;

    for (let i = 0; i < lines; i++){
      garbageQueue.unshift(fullGarbage.slice());
    }
    
    garbageMeter.push(lines);
    
    displayGarbage();
  }

  cancelGarbageFunction = function(lines){
    for (let i = 0; i < lines; i++){
      garbageQueue.pop();
      if (garbageMeter.length !== 0 && garbageMeter[0] <= 1){
        garbageMeter.shift();
      }else if (garbageMeter.length !== 0){
        garbageMeter[0] -= 1;
      }
    }
    
    displayGarbage();
  }

  endFunction = function(){
    gameRunning = false;
    current = null;
    clearInterval(TimerID);
  };

  startFunction = function(startDate,salt){
    socket.playerAlive(true);
    reset(salt);
    displayGarbage();
  }

  let setGravity = (rate) => {
    onlineFallRate = rate;
  }
  
  let sync = (newBoard, newBagSalt, newBags) => {
    bags = newBags;
    bagSalt = newBagSalt;
    board = newBoard;

    queue = newBag().concat(newBag());
    current = new Tetrimino(queue.shift());

    displayQueue();
  }

  socket.on('receive garbage', receiveGarbageFunction);
  
  socket.on('cancel garbage', cancelGarbageFunction);

  socket.on('gravity', setGravity);

  socket.on('sync', sync);

  socket.on('end',endFunction);

  if (gameMode === 'online'){ //if online wait for the start from the server
    socket.on('start',startFunction);
  }else{ // if not online then juts initialize the game immidiately.
    reset();
  }

  animationFrameID = window.requestAnimationFrame(fullLoop);
  backupLoopID = setInterval(backupLoop,100);

  //CONTROLS
  const controls = {
    exit: {
      key: keybinds.exit,
      function: null,
      held: false
    },
    reset: {
      key: keybinds.reset,
      function: function(){    
        if (gameMode !== 'online'){
          reset();
        }
      },
      held: false
    },
    left: {
      key: keybinds.left,
      function: function () {
        if (gameRunning) {
          current.shift(-1, 0);
          display();
          DAS = handling.DAS;
        }
      },
      held: false
    },
    right: {
      key: keybinds.right,
      function: function () {
        if (gameRunning) {
          current.shift(1, 0);
          display();
          DAS = handling.DAS;
        }
      },
      held: false
    },
    soft: {
      key: keybinds.soft,
      function: null,
      held: false
    },
    rotate90: {
      key: keybinds.rotate90,
      function: function () {
        if (gameRunning) {
          current.rotate(90);
          display();
        }
      },
      held: false
    },
    rotate180: {
      key: keybinds.rotate180,
      function: function () {
        if (gameRunning) {
          current.rotate(180);
          display();
        }
      },
      held: false
    },
    rotate270: {
      key: keybinds.rotate270,
      function: function () {
        if (gameRunning) {
          current.rotate(270);
          display();
        }
      },
      held: false
    },
    hold: {
      key: keybinds.hold,
      function: function () {
        if (gameRunning) {
          holdCurrent();
          display();
        }
      },
      held: false
    },
    hard: {
      key: keybinds.hard,
      function: function () {
        if (gameRunning) {
          while (current.shift(0, -1)) {
            DOM.score.current.innerHTML = parseInt(DOM.score.current.innerHTML) + 1;
            dropBonusCounter++;
          }
          place();
          display();
          //DAS = Math.max(DAS, handling.DCD);
        }
      },
      held: false
    }
  }

  //RESETTING
  function reset(salt = Math.random()) {
    bagSalt = salt;
    bags = 1;

    window.dispatchEvent(killCountdown);
    board = genBlankBoard();

    queue = newBag().concat(newBag());
    current = new Tetrimino(queue.shift());
    hold = null;
    justHeld = false;
    

    display();
    displayQueue();
    displayHold();
    displayGarbage();

    clearInterval(TimerID);
    DOM.time.current.innerHTML = "0:00.000";
    DOM.score.current.innerHTML = 0;
    DOM.level.current.innerHTML = 0;
    DOM.lines.current.innerHTML = 0;
    gameRunning = false;

    garbageQueue = [];
    garbageMeter = [];

    DOM.full.current.style = null;
    DOM.full.current.onanimationend = null;

    countdown().then(() => {
      socket.emit(gameMode, salt);
      gameRunning = true;
      currentFrame = Date.now();
      clearInterval(TimerID);
      createTimer();
    }).catch(() => {});
  }

  function countdown() {
    return new Promise(async (resolve, reject) => {
      let killed = false;
      let rejectFunc = () => killed = true;
      window.addEventListener("killCountdown", rejectFunc);

      let elem = DOM.title.current;

      elem.classList.remove(currentAnimation);
      refreshDOM(elem); //refresh;
      elem.style.fontSize = "60px";
      elem.style.opacity = 1;
      for (let i = 3; i > 0; i--) {
        elem.innerHTML = i;
        refreshDOM(elem); //refresh;

        await new Promise(r => setTimeout(r, 1000));
        
        if (killed){
          return reject();
        }
      }
      elem.innerHTML = "GO!";
      elem.classList.add('fadeOut');
      currentAnimation = 'fadeOut';
      elem.style.opacity = 0;
      
      window.removeEventListener("killCountdown", rejectFunc);
      resolve();
    })
  }

  //DISPLAY CANVAS
  function display() {
    let canvas = DOM.main.current;
    let ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);//clears all

    ctx.lineWidth = 1;
    ctx.strokeStyle = '#AAAAAA'; 
    for (let i = 0; i < 10; i++) { //draw lines
      for (let j = 0; j < 20; j++) {
        ctx.strokeRect(i * cellSize + 0.5, (19 - j) * cellSize + 0.5, cellSize, cellSize);
      }
    }

    for (let i = 0; i < board.length; i++) { //draw board colors
      for (let j = 0; j < board[i].length; j++) {
        if (board[i][j] !== 0) {
          pasteOnGrid(j, i, board[i][j]);
        }
      }
    }
    if (current !== null) { //draw piece
      current.display();
      if (gameMode === 'online') {
        socket.emit('send piece', current.export(), current.exportShadow(), current.colorIndex);
      }
    }
  }

  function displayHold() {
    let canvas = DOM.hold.current;
    let ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (hold !== null) {
      pasteIcon(0, 0, hold.pType, hold.colorIndex, pOffsets(hold.pType), canvas);
    }
  }

  function displayQueue() {
    let canvas = DOM.queue.current;
    let ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < 5; i++) {
      pasteIcon(0, i * 75, pTypes[queue[i]], queue[i] + 1, pOffsets(pTypes[queue[i]]), canvas);
    }
  }

  function displayGarbage() {
    let meter = DOM.meter.current;
    if (meter === null) {
      return;
    }
    const tierColors = ['#BF1E1E', '#BF601E', '#1EBFBF', '#1E1EBF', '#1EBF1E', '#D4D421'];
    const offset = 0;
    const totalGarbage = garbageMeter.reduce((a, b) => a + b, 0);
    const tier = Math.floor(totalGarbage / 20) + offset;
    const hiddenGarbage = (tier - offset) * 20;
    let displayMeter = garbageMeter.slice();

    let ctx = meter.getContext('2d');

    for (var count = 0; count + displayMeter[0] < hiddenGarbage; count += displayMeter.shift()) { }
    displayMeter[0] -= hiddenGarbage - count;

    ctx.fillStyle = tier === 0 ? '#191919' : tierColors[(tier - 1) % tierColors.length];
    ctx.fillRect(0, 0, meter.width, meter.height);

    let y = 0;
    for (let i = 0; i < displayMeter.length; i++) {
      const height = 20 * displayMeter[i];
      ctx.fillStyle = tierColors[tier % (tierColors.length)];
      ctx.fillRect(0, 400 - y, meter.width, -1 * height + (tier === 0 ? 1 : 0));
      if (i < displayMeter.length - 1) {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 400 - y - height, meter.width, -1);
      }
      y += height;
    }
  }

  //DISPLAY PART OF CANVAS
  function pasteIcon(x, y, pType, colorIndex, offsets, canvas) {
    let ctx = canvas.getContext('2d');

    ctx.fillStyle = outerColors[colorIndex];
    offsets.forEach(e => {
      ctx.fillRect((2.5 - (pType.length % 2) / 2 + e[0]) * cellSize + 0.5, (2.5 - e[1] + (pType.length % 3 % 2) / 2) * cellSize + 0.5 + y, cellSize, cellSize);
    });
    ctx.fillStyle = innerColors[colorIndex];
    offsets.forEach(e => {
      ctx.fillRect((2.5 - (pType.length % 2) / 2 + e[0]) * cellSize + 5.5, (2.5 - e[1] + (pType.length % 3 % 2) / 2) * cellSize + 5.5 + y, cellSize - 10, cellSize - 10);
    });
  }

  function pasteOnGrid(x, y, colorIndex) {
    let canvas = DOM.main.current;
    let ctx = canvas.getContext('2d');

    ctx.fillStyle = outerColors[colorIndex];
    ctx.fillRect(x * cellSize + 0.5, (19 - y) * cellSize + 0.5, cellSize - 0, cellSize - 0);
    ctx.fillStyle = innerColors[colorIndex];
    ctx.fillRect(x * cellSize + 5.5, (19 - y) * cellSize + 5.5, cellSize - 10, cellSize - 10);
  }

  //PIECE DATA
  function pOffsets(data) {
    var output = [];
    for (let i = 0 - Math.floor(data.length / 2); i <= Math.floor(data.length / 2 - 0.5); i++) {
      for (let j = Math.floor(data[0].length / -2 + 0.5); j <= Math.floor(data[0].length / 2 - 0.5); j++) {
        if (data[j + Math.floor((data[0].length) / 2)][i + Math.floor((data.length) / 2)]) {
          output[output.length] = [i, -j];
        }
      }
    }
    return output;
  }

  function newBag() {
    bags++;
    let salt = bagSalt * (bags + bagSalt) / (bags - bagSalt) - (bags % bagSalt) % 1;

    salt *= 10;
    let round = Math.floor(salt) % 2 === 0;
    salt %= 1;


    let randomInts = [];
    for (let i = 0; i < 7; i++) {
      salt *= 10;
      randomInts.push(Math.floor(salt));
      salt %= 1;
    }

    let remaining = new Set([0, 1, 2, 3, 4, 5, 6]);
    let output = [];

    for (let i = 0; i < 7; i++) {
      let weighted = Math.floor(randomInts[i] * 12 / 9) / 2;
      if (weighted % 1 === 0.5) {
        weighted += round ? 0.5 : -0.5;
      }
      while (!remaining.has(weighted)) {
        weighted = (weighted + 1) % 7
      }
      remaining.delete(weighted);
      output.push(weighted);
    }

    return output;
  }

  function holdCurrent() {
    if (!justHeld) {
      if (hold === null) {
        hold = current;
        current.reset();
        current = new Tetrimino(queue[0]);
        queue.shift();
        if (queue.length < 7) {
          queue = queue.concat(newBag());
        }
      } else {
        var temp = hold;
        hold = current;
        current = temp;
        hold.reset();
        current.reset();
      }

      socket.emit('hold');
    }
    justHeld = true;

    displayQueue();
    displayHold();
  }

  //TIME BASED
  function createTimer() {
    const startDate = Date.now();
    TimerID = setInterval(timerFunc, 10);

    function timerFunc(){
      var currentDate = Date.now();

      var diff = currentDate - startDate;

      var minutes = Math.floor(diff / 60000);
      var seconds = Math.floor(diff / 1000) % 60;
      var ms = Math.floor(diff) % 1000;

      minutes = Math.min(minutes, 99);

      var formattedSeconds = seconds.toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false });

      var time = minutes + ":" + formattedSeconds + "." + ms;

      if (gameMode === "blitz" && time > "2:00") {
        DOM.time.current.innerHTML = "2:00";
        end(true);
        socket.emit('timeout', dropBonusCounter);
      } else {
        DOM.time.current.innerHTML = time;
      }

    }
  }

  function physics() {
    var leftDown = controls.left.held;
    var rightDown = controls.right.held;
    var downDown = controls.soft.held;
    let fallMultiplier = Math.max(Math.pow(0.8, DOM.level.current.innerHTML), 0.005);

    if (gameRunning) {
      if (leftDown || rightDown) {
        if (DAS <= 0) {
          const movementDirection = leftDown ? -1 : 1;

          while(true){
            let movementSuccess = current.shift(movementDirection, 0);
            let DASRemaining = DAS - handling.ARR;

            if (movementSuccess && DASRemaining >= 0){
              DAS = DASRemaining;
            }else{
              break;
            }

          }
          display();
          DAS = handling.ARR;
        }
        DAS -= currentFrame - previousFrame;
      } else {
        DAS = handling.DAS;
      }

      if (downDown && handling.ISDF) {
        while (current.shift(0, -1)) {
          DOM.score.current.innerHTML = parseInt(DOM.score.current.innerHTML) + 1;
          dropBonusCounter++;
        }
        display();
      } else {
        //natural falling of piece
        const SDFmultiplier = downDown ? handling.SDF : 1;
          fallTimer -= (currentFrame - previousFrame) * SDFmultiplier;
          while (fallTimer <= 0) {
            let fallTotal = gameMode === 'online' ? onlineFallRate : fallSpeed * fallMultiplier;
            if (current.shift(0, -1) && downDown) {
              DOM.score.current.innerHTML = parseInt(DOM.score.current.innerHTML) + 1;
              dropBonusCounter++;
            }
            display();
            fallTimer += fallTotal;
          }
      }


      if (!falling) {
        lockDelay -= (currentFrame - previousFrame);
        if (lockDelay <= 0) {
          while (current.shift(0, -1)) { }
          place();
          display();
        }
      }
    }
  }

  function fullLoop() {
    previousFrame = currentFrame;
    currentFrame = Date.now();

    if (gameRunning) {
      physics();
    }

    animationFrameID = window.requestAnimationFrame(fullLoop);
  }

  function backupLoop() { //this shit needs to run on setInterval because animation frames are not called when a user is alt tabbed because no repaints occur, just stops player from donowalling gravity by alt tabbing
    previousFrame = currentFrame;
    currentFrame = Date.now();
    /*let fallMultiplier = (gameMode == 'online') ? onlineConstants.fallMultiplier : Math.pow(0.8,Level.textContent);
    let trueFallSpeed = fallSpeed * fallMultiplier;*/

    if (gameRunning) {
      physics(true);
    }
  }

  //BOARD
  function place() {
    justHeld = false;

    current.place();

    let usedKick3 = lastMovement === 'rotate' && current.kick3;
    socket.emit('placed', board, usedKick3, dropBonusCounter);

    var linesCleared = updateBoard();

    dropBonusCounter = 0;

    if (gameMode === 'online') {
      if (linesCleared === 0) {
        if (garbageQueue.length > 0) {
          for (let i = Math.min(garbageQueue.length, 8); i > 0; i--) {
            board.unshift(garbageQueue.pop());
            board.pop();
            if (garbageMeter.length !== 0 && garbageMeter[0] <= 1) {
              garbageMeter.shift();
            } else if (garbageMeter.length !== 0) {
              garbageMeter[0] -= 1;
            }
          }
          displayGarbage();
        }
      }
    }

   
    current = new Tetrimino(queue[0]);


    /*This is genius, this calls a non test of a shift of 0,0 returning a boolean value of if the piece spawns inside another piece already but also because it is not doing a test it will update the falling varabile causing pieces spawning on top of blocks to still place properly.*/
    if (!current.shift(0, 0)) {
      end(false);
      if (gameMode === 'blitz'){
        socket.emit('timeout', 0);
      }
    }

    queue.shift();

    if (queue.length < 7) {
      queue = queue.concat(newBag());
    }

    displayQueue();

    lockDelay = 500;
    shiftsLeft = 10;
  }

  function updateBoard() {
    var count = 0;
    for (let i = 0; i < board.length; i++) {
      var flag = true;
      for (let j = 0; j < 10; j++) {
        flag = board[i][j] !== 0 && flag;
      }
      if (flag) {
        for (let a = i; a < board.length - 1; a++) {
          board[a] = board[a + 1].slice();
        }
        i--;
        count++;
      }

    }
    if (count !== 0) {
      combo++;
      lineCleared(count);
    } else {
      combo = -1;
    }
    return count;
  }

  function lineCleared(justCleared) {
    let lines = DOM.lines.current;
    let level = DOM.level.current;
    let score = DOM.score.current;

    lines.innerHTML = parseInt(lines.innerHTML) + justCleared;
    level.innerHTML = Math.floor(lines.innerHTML / 10) + 1;

    //updates the broadcast text  

    let broadcast = DOM.broadcast.current;

    broadcast.style.transition = "opacity 0s linear";
    broadcast.style.opacity = "1";
    refreshDOM(broadcast);
    broadcast.style.transition = "opacity 1s linear 2s";
    broadcast.style.opacity = "0";

    let comboElem = DOM.combo.current;

    comboElem.style.transition = "opacity 0s linear";
    comboElem.style.opacity = "1";
    refreshDOM(comboElem);
    comboElem.style.transition = "opacity 1s linear 2s";
    comboElem.style.opacity = "0";

    var pc = true;
    board.every(a => a.forEach(b => {
      if (b !== 0) {
        pc = false;
        return false;
      }
    }));
    if (pc) {
      let title = DOM.title.current;

      title.innerHTML = "ALL<br>CLEAR";
      title.classList.remove(currentAnimation);
      refreshDOM(title);
      title.classList.add('allClear');
      currentAnimation = 'allClear';
      pcCount++;
    }
    if (current.tSpin) {
      broadcast.innerHTML = "T-SPIN " + linesToText[Math.min(justCleared, 11) - 1];
      fullSpins[justCleared - 1]++;
    } else if (current.miniSpin) {
      broadcast.innerHTML = "T-SPIN MINI " + linesToText[Math.min(justCleared, 11) - 1];
      miniSpins[justCleared - 1]++;
    } else {
      broadcast.innerHTML = linesToText[Math.min(justCleared, 11) - 1];
      normalClears[justCleared - 1]++;
    }

    //updates the score
    var points = linesToPoints[Math.min(justCleared, 4) - 1];
    var spinMultiplier = current.tSpin ? 4 : current.miniSpin ? 4 / 3 : 1;
    var b2bMultiplier = 1;
    var pcBonus = pc ? 3500 : 0;

    if (spinMultiplier !== 1 || justCleared >= 4) {
      b2bCounter++;
      if (b2bCounter > 0) {
        b2bMultiplier = 1.5;
        DOM.b2b.current.style.opacity = "1";
      }
    } else {
      b2bCounter = -1;
      DOM.b2b.current.style.opacity = "0";
    }
    DOM.b2b.current.innerHTML = "B2B x" + b2bCounter;
    if (combo > 0) {
      comboElem.innerHTML = "Combo x" + combo;
    } else {
      comboElem.innerHTML = "";
    }
    score.innerHTML = parseInt(score.innerHTML) + ((Math.floor(points * spinMultiplier * b2bMultiplier / 100) * 100) + pcBonus + combo * 50) * parseInt(level.innerHTML);

    b2bMax = Math.max(b2bMax, b2bCounter);

    if (gameMode === "sprint" && lines.innerHTML >= 40) {
      end(true);
    }

    //t-spin is 4 times
    //mini tspin is 4/3 times
    //b2b is 1.5 times*/
  }

  function end(victory) {
    gameRunning = false;
    current = null;
    clearInterval(TimerID);

    let stats = {
      display: true,
      displayMinors: true,
      victory,
      minorStats: [...normalClears, ...fullSpins, ...miniSpins, pcCount, b2bMax],
      primaryStat: '',
      primaryStatValue: '',
      secondaryStats: [],
      online: false,
      needsFormatting: false
    }

    let time = DOM.time.current.innerHTML;
    let score = DOM.score.current.innerHTML;
    let lines = DOM.lines.current.innerHTML;
    let level = DOM.level.current.innerHTML;


    if (gameMode === 'sprint') {
      if (victory) {
        stats.primaryStat = 'TIME';
        stats.primaryStatValue = time;
        stats.secondaryStats = [
          { title: 'SCORE', value: score }
        ]
      } else {
        stats.primaryStat = 'LINES';
        stats.primaryStatValue = lines + '/40';
        stats.displayMinors = false;
        //secondary stats dont need to be defined because display minors are false.
      }
    } else if (gameMode === 'blitz') {
      stats.primaryStat = 'SCORE';
      stats.primaryStatValue = score;
      stats.secondaryStats = [
        { title: 'LINES', value: lines },
        { title: 'LEVEL', value: level }
      ]
    } else if (gameMode === 'endless') {
      stats.primaryStat = 'SCORE';
      stats.primaryStatValue = score;
      stats.secondaryStats = [
        { title: 'TIME', value: time },
        { title: 'LINES', value: lines },
        { title: 'LEVEL', value: level }
      ]
    }

    let full = DOM.full.current;

    if (gameMode === 'online') {
      socket.playerAlive(false);
      socket.emit('defeat');

      full.classList.remove(currentAnimation);
      refreshDOM(full);
      full.classList.add('spectateAnimation');
      currentAnimation = 'spectateAnimation';

      full.onanimationend = function () {
        full.style.display = 'none';
      }
    } else {
      socket.openStatMenu(stats);

      full.style.opacity = null;
      full.classList.remove(currentAnimation);
      refreshDOM(full);
      full.classList.add('gameEnd');
      currentAnimation = 'gameEnd';
      full.style.opacity = "0";
    }

  }

  //HELPER FUNCTIONS
  function refreshDOM(elem = DOM.full.current) {
    if (elem !== undefined && elem !== null) {
      return elem.offsetHeight;
    }
  }

  function keyDownHandler(event) {
    let key = event.key;

    for (let action in controls) {
      if (controls[action].key === key && !controls[action].held) {
        if (controls[action].function !== null) {
          controls[action].function();
        }
        controls[action].held = true;
      }
    }
  }

  function keyUpHandler(event) {
    let key = event.key;

    for (let action in controls) {
      if (controls[action].key === key) {
        controls[action].held = false;
      }
    }
  }

  

  function addListeners() {    
    document.addEventListener('keydown', keyDownHandler, false);
    document.addEventListener('keyup', keyUpHandler, false);
  }

  function removeListeners() {
    document.removeEventListener('keydown', keyDownHandler, false);
    document.removeEventListener('keyup', keyUpHandler, false);
  }

  function cleanup(){
    document.removeEventListener('keydown', keyDownHandler, false);
    document.removeEventListener('keyup', keyUpHandler, false);
    socket.off('receive garbage', receiveGarbageFunction);
    socket.off('cancel garbage', cancelGarbageFunction);
    socket.off('end',endFunction);
    socket.off('start',startFunction);
    socket.off('gravity', setGravity);
    socket.off('sync', sync);
    gameRunning = false;
    current = null;
    clearInterval(TimerID);
    clearInterval(backupLoopID);
    window.cancelAnimationFrame(animationFrameID);
    window.dispatchEvent(killCountdown);
  }

  return { addListeners, removeListeners, cleanup }
}

//GENERATORS
function genBlankBoard() {
  let arr = [];
  for (let i = 0; i < 40; i++) {
    arr[i] = [];
    for (let j = 0; j < 10; j++) {
      arr[i][j] = 0;
    }
  }
  return arr;
}


export default initalize;