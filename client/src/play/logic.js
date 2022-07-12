//CONSTANTS 

    //ROTATION SYSTEM
    const T = [[0,1,0],[1,1,1],[0,0,0]];
    const J = [[1,0,0],[1,1,1],[0,0,0]];
    const L = [[0,0,1],[1,1,1],[0,0,0]];
    const Z = [[1,1,0],[0,1,1],[0,0,0]];
    const S = [[0,1,1],[1,1,0],[0,0,0]];
    const I = [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]];
    const O = [[1,1],[1,1]];
    const pTypes = [T,J,I,Z,L,S,O];

    const cWiseIKicks = [[[-2,0],[1,0],[-2,-1],[1, 2]],[[-1,0],[2,0],[-1,2],[2, -1]],[[2,0],[-1,0],[2,1],[-1,-2]],[[1,0],[-2, 0],[1,-2],[-2, 1]]];
    const ccWiseIKicks = [[[-1,0],[2,0],[-1,2],[2,-1]],[[2,0],[-1,0],[2,1],[-1,-2]],[[1,0],[-2,0],[1,-2],[-2,1]],[[-2,0],[1,0],[-2,-1],[1,2]]];
    const cWiseElseKicks = [[[-1,0],[-1,1],[0,-2],[-1,-2]],[[1,0],[1,-1],[0,2],[1,2]],[[1,0],[1,1],[0,-2],[1,-2]],[[-1,0],[-1,-1],[0,2],[-1,2]]];
    const ccWiseElseKicks = [[[1,0],[1,1],[0,-2],[1,-2]],[[1,0],[1,-1],[0,2],[1,2]],[[-1,0],[-1,1],[0,-2],[-1,-2]],[[-1,0],[-1,-1],[0,2],[-1,2]]];
    const aKicks = [[[0,1],[1,1],[-1,1],[1,0],[-1,0]],[[1,0],[1,2],[1,1],[0,2],[0,1]],[[0,-1],[-1,-1],[1,-1],[-1,0],[1,0]],[[-1,0],[-1,2],[-1,1],[0,2],[0,1]]];

    //SCORING
    const linesToText = ["SINGLE","DOUBLE","TRIPLE","QUAD","PENTA","SEXTA","HEPTA","OCTA","NONA","DECA","MEGA"];
    const linesToPoints = [100,300,500,800];
    const colors = ["#0000","#D91ED9", "#1E1EBF", "#1EBFBF", "#BF1E1E", "#BF601E", "#1EBF1E", "#D4D421","#6A6A6A","#1A1A1A"];
    const colors2 = ["#FFFFFF","#BF1BBF", "#1B1BA6", "#1BA6A6", "#A61B1B", "#A6551B", "#1BA61B", "#A6A61B","#5C5C5C","#090909"];

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

//HANDLING
const fallSpeed = 1000;
var handling = {DAS:133, ARR:10, DCD:0, SDF:1, ISDF:true};
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
var timer;
var currentFrame = Date.now();
var previousFrame =  Date.now();

//GAME STATE
var gameRunning = false;
var gameMode = false;

var DOM;

var resetCount = 0;

var exitPercent = 0;


//CONTROLS
const controls = {
    exit:{
        key:'Escape',
        function:null,
        held:false
    },
    reset:{
        key:'r',
        function:reset,
        held:false
    },
    left:{
        key:'ArrowLeft',
        function:function(){
            if (gameRunning){
                DAS = handling.DAS;
            }
        },
        held:false
    },
    right:{
        key:'ArrowRight',
        function:function(){
            if (gameRunning){
                DAS = handling.DAS;
            }
        },
        held:false
    },
    soft:{
        key:'ArrowDown',
        function:null,
        held:false
    },
    rotate90:{
        key:'ArrowUp',
        function:function(){
            if (gameRunning){
                current.rotate(90);
                display();
            }
        },
        held:false
    },
    rotate180:{
        key:'a',
        function:function(){
            if (gameRunning){
                current.rotate(180);
                display();
            }
        },
        held:false
    },
    rotate270:{
        key:'z',
        function:function(){
            if (gameRunning){
                current.rotate(270);
                display();
            }
        },
        held:false
    },
    hold:{
        key:'c',
        function:function(){
            if (gameRunning){
                holdCurrent();
                display();
            }
        },
        held:false
    },
    hard:{
        key:' ',
        function:function(){
            if (gameRunning){
                while (current.shift(0,-1)){
                    DOM.score.innerHTML = parseInt(DOM.score.innerHTML) + 1;
                }
                place();
                display();
                DAS = Math.max(DAS,handling.DCD);
            }
        },
        held:false
    }
}

export default class Tetrimino{
	constructor(p){
		this.pType = pTypes[p];
		this.color = colors[p + 1];
		this.colorIndex = p + 1;
		this.iKicks = (p == 2);
		this.x = 5 - this.pType.length % 2;
		this.y = 18;
		this.state = 0;
		this.genShadowY();
		this.tSpin = false;
		this.miniSpin = false;
		this.kick3 = false;
	}
	
	reset(){
		this.pType = pTypes[this.colorIndex - 1];
		this.x = 5 - this.pType.length % 2;
		this.y = 18;
		this.state = 0;
		this.genShadowY();
		this.genShadowY();
	}
	
	display(){
        let canvas = DOM.main;
        let ctx = canvas.getContext('2d');

		ctx.fillStyle = this.color + "88";

		pOffsets(this.pType).forEach(e => ctx.fillRect((this.x + e[0]) * cellSize+1.5,(19 - (this.shadowY + e[1])) * cellSize+1.5,cellSize - 2,cellSize - 2));
		pOffsets(this.pType).forEach(e => pasteOnGrid(this.x + e[0], this.y + e[1],this.colorIndex));
	}
	
	export(){
		var cords = pOffsets(this.pType);
		cords.forEach(e => {e[0] += this.x; e[1] += this.y});
		return(cords);
	}
	
	exportShadow(){
		var cords = pOffsets(this.pType);
		cords.forEach(e => {e[0] += this.x; e[1] += this.shadowY});
		return(cords);
	}

	rotate(deg){
		var tempX,tempY;
		var temp = [];
		var kicks;
		var newState;
		
		this.pType.forEach((e,i) => temp[i] = e.slice());
		
		temp.forEach((a,i) => a.forEach((e,j) => {
			if (deg == 90){
				this.iKicks ? kicks = cWiseIKicks : kicks = cWiseElseKicks;
				tempY = j;
				tempX = (temp.length - 1 - i);
				temp[tempY][tempX] = this.pType[i][j];
				newState = (this.state + 5) % 4;
			}else if (deg == 270){
				this.iKicks ? kicks = ccWiseIKicks : kicks = ccWiseElseKicks;
    		tempY = (temp.length - 1 - j);
        tempX = i;
				temp[tempY][tempX] = this.pType[i][j];
				newState = (this.state + 3) % 4;
			}else if (deg == 180){	
				kicks = aKicks;
				tempX = temp.length - 1 - i;
				tempY = temp.length - 1 - j;
				temp[tempX][tempY] = this.pType[i][j];
				newState = (this.state + 2) % 4;
			}
		}));
		
		
		var tempOffsets = pOffsets(temp);
		
		if (this.shift(0,0,tempOffsets)){//does spin attempt without kicks
				this.pType = temp;
				this.state = newState;
				this.genShadowY();
				lastMovement = "rotate";
				DAS = Math.max(DAS,handling.DCD);
				falling = this.shift(0,-1,null,true);
				return;
		}
		
		
		for (let i = 0; i < 4; i++){
			if (this.shift(kicks[this.state][i][0],kicks[this.state][i][1],tempOffsets)){
				this.pType = temp;
				this.state = newState;
				this.kick3 = (i == 3);
				this.genShadowY();
				lastMovement = "rotate";
				DAS = Math.max(DAS,handling.DCD);
				falling = this.shift(0,-1,null,true);
				return;
			}
		}
	}
	
	genShadowY(){
		this.shadowY = 0;
		for (let i = 0; i > -20; i--){
			if(this.shift(0,i,null,true)){
				this.shadowY = this.y + i;
			}else{
				return;
			}
		}
	}
	
	shift(x,y,offsets,test){
		var legal = true;
		var testX = 0;
		var testY = 0;
		
		if (offsets == null){
			offsets = pOffsets(this.pType);
		}
		
		offsets.forEach(e => {
			testX = this.x + x + e[0];
			testY = this.y + y + e[1];
			legal = testX >= 0 && testX < 10 && testY >= 0 && board[testY][testX] == 0 && legal;
		});
		
		if (legal && !test){
			this.x += x;
			this.y += y;
			if (x != 0){
				this.genShadowY();
			}
			lastMovement = "shift";
			
			falling = this.shift(0,-1,null,true);
			
			if (shiftsLeft >= 0 && !falling){
				lockDelay = 500;
				shiftsLeft--;
			}
		}
		return legal;
	}
	
	place(){
		pOffsets(this.pType).forEach(e => board[this.y + e[1]][this.x + e[0]] = this.colorIndex);
		
		if (this.colorIndex == 1 && (lastMovement.valueOf() == "rotate" || false)){
			const tipCords = [[-1,1],[1,1],[1,-1],[-1,-1]];
			var cors = [];
			for (let i = 0; i < 4; i++){
				let x = this.x + tipCords[(this.state + i) % 4][0];
				let y = this.y + tipCords[(this.state + i) % 4][1];
				if (x >= 0 && x < 10 && y >= 0){
					cors[i] = board[y][x] != 0;
				}else{
					cors[i] = true;
				}
			}
			
			var col = true;
			
			this.tSpin = this.kick3 || (col && cors[0] && cors[1] && (cors[2] || cors[3]));
			
			this.miniSpin = col && cors[2] && cors[3] && (cors[0] != cors[1]);
		}
	}
}

//RESETTING
async function reset(salt = Math.random()){
    bags = 1;
	bagSalt = salt;

	window.dispatchEvent(killCountdown);
	board = genBlankBoard();
    
	queue = newBag().concat(newBag());
	current = new Tetrimino(queue[0]);
	hold = null;
	justHeld = false;
	queue.shift();

	display();
	displayQueue();
	displayHold();

	clearInterval(timer);
	DOM.time.innerHTML = "0:00.000";
	DOM.score.innerHTML = 0;
	DOM.level.innerHTML = 1;
	DOM.lines.innerHTML = 0;
	gameRunning = false;

    if (await countdown(resetCount)){
		gameRunning = true;
		currentFrame = Date.now();
		clearInterval(timer);
		createTimer();
	}
}

async function countdown(resets){
    let elem = DOM.title;

    elem.style.animation = "";
    let bypass = elem.offsetHeight; //refresh;
    elem.className = "centerOutput countdownStyle";
    elem.style.fontSize = "60px";
    elem.style.opacity = 1;
    for(let i = 3; i > 0; i--){
        elem.innerHTML = i;
        let bypass = elem.offsetHeight; //refresh;
        var killed = await new Promise(resolve => {
            setTimeout(() => resolve(false),1000);
            window.addEventListener("killCountdown",() => resolve(true))
        });
        if (killed){
            return false;
        }
    }
    elem.innerHTML = "GO!";
    elem.style.animation = "fadeOut 1s linear";
    elem.style.opacity = 0;
    return true;
}

//DISPLAY CANVAS
function display(){
    let canvas = DOM.main;
    let ctx = canvas.getContext('2d');

	ctx.clearRect(0,0,canvas.width,canvas.height);//clears all
	
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#FFFFFF';
	for (let i = 0; i < 10; i++){
		for (let j = 0; j < 20; j++){
			ctx.strokeRect(i * cellSize + 0.5,(19 - j) * cellSize + 0.5,cellSize,cellSize);
		}
	}
	
    for (let i = 0; i < board.length; i++){
        for (let j = 0; j < board[i].length; j++){
            if (board[i][j] != 0){
			    pasteOnGrid(j,i,board[i][j]);
            }
        }
    }
	if (current != null){
		current.display();
		/*if (gameMode == 'online' && onlineConstants.displayLines){
			socket.emit('send peice',current.export(), current.exportShadow(),current.colorIndex);
		}*/
	}
}

function displayHold(){
    let canvas = DOM.hold;
    let ctx = canvas.getContext('2d');

	ctx.clearRect(0,0,canvas.width,canvas.height);
	if (hold != null){
		pasteIcon(0,0,hold.pType,hold.colorIndex,pOffsets(hold.pType),canvas);
	}
}

function displayQueue(){
    let canvas = DOM.queue;
    let ctx = canvas.getContext('2d');

	ctx.clearRect(0,0,canvas.width,canvas.height);
	for (let i = 0; i < 5; i++){
		pasteIcon(0,i * 75,pTypes[queue[i]],queue[i] + 1,pOffsets(pTypes[queue[i]]),canvas);
	}
}

//DISPLAY PART OF CANVAS
function pasteIcon(x,y,pType,colorIndex,offsets,canvas){
    let ctx = canvas.getContext('2d');

    ctx.fillStyle = colors2[colorIndex];
    offsets.forEach(e => {
            ctx.fillRect((2.5 - (pType.length % 2) / 2 + e[0]) * cellSize + 0.5,(2.5-e[1] + (pType.length % 3 % 2) / 2) * cellSize + 0.5 + y,cellSize,cellSize);
    });
    ctx.fillStyle = colors[colorIndex];
    offsets.forEach(e => {
            ctx.fillRect((2.5 - (pType.length % 2) / 2 + e[0]) * cellSize + 5.5,(2.5-e[1] + (pType.length % 3 % 2) / 2) * cellSize + 5.5 + y,cellSize - 10,cellSize - 10);
    });
}

function pasteOnGrid(x,y,colorIndex){
    let canvas = DOM.main;
    let ctx = canvas.getContext('2d');

    ctx.fillStyle = colors2[colorIndex];
    ctx.fillRect(x * cellSize + 0.5,(19 - y) * cellSize + 0.5,cellSize - 0,cellSize - 0);
    ctx.fillStyle = colors[colorIndex];
    ctx.fillRect(x * cellSize + 5.5,(19 - y) * cellSize + 5.5,cellSize - 10,cellSize - 10);
}

//PIECE DATA
function pOffsets(data){
    var output = [];
    for(let i = 0 - Math.floor(data.length / 2); i <= Math.floor(data.length / 2 - 0.5); i++){
        for(let j = Math.floor(data[0].length / -2 + 0.5); j <= Math.floor(data[0].length / 2 - 0.5); j++){
            if (data[j + Math.floor((data[0].length) / 2)][i + Math.floor((data.length) / 2)]){
                output[output.length] = [i,-j];
            }
        }
    }
    return output;
}

function newBag(){
	bags++;
	let salt = bagSalt * (bags + bagSalt) / (bags - bagSalt) - (bags % bagSalt) % 1;
	
	salt *= 10;
	let round = Math.floor(salt) % 2 == 0;
	salt %= 1;
	
	
	let randomInts = [];
	for (let i = 0; i < 7; i++){	
		salt *= 10;
		randomInts.push(Math.floor(salt));
		salt %= 1;
	}
	
	let remaining = new Set([0,1,2,3,4,5,6]);
	let output = [];
	
	for (let i = 0; i < 7; i++){	
		let weighted = Math.floor(randomInts[i] * 12 / 9) / 2;
		if (weighted % 1 == 0.5){
			weighted += round ? 0.5 : -0.5;
		}
		while(!remaining.has(weighted)){
			weighted = (weighted + 1) % 7
		}
		remaining.delete(weighted);
		output.push(weighted);
	}
	
	return output;
}

function holdCurrent(){
	if (!justHeld){
		if (hold == null){
			hold = current;
			current.reset();
			current = new Tetrimino(queue[0]);
			queue.shift();
			if (queue.length < 7){
				queue = queue.concat(newBag());
			}
		}else{
			var temp = hold;
			hold = current;
			current = temp;
			hold.reset();
			current.reset();
		}
	}
	justHeld = true;
	
	displayQueue();
	displayHold();
}

//TIME BASED
function createTimer(){
	const startDate = Date.now();
	timer = setInterval(
		function(){
			var currentDate = Date.now();
			
			var diff = currentDate - startDate;
			
			var minutes = Math.floor(diff / 60000);
			var seconds = Math.floor(diff / 1000) % 60;
			var ms = Math.floor(diff) % 1000;
			
			minutes = Math.min(minutes,99);
			
			var formattedSeconds = seconds.toLocaleString('en-US',{minimumIntegerDigits:2,useGrouping:false});
			
			var time = minutes + ":" + formattedSeconds + "." + ms;
			
			if (gameMode == "blitz" && time > "2:00"){
				DOM.time.innerHTML = "2:00";
				//end(true);
			}else{
				DOM.time.innerHTML = time;
			}
			
		}, 10);
}

function physics(){
	var leftDown = controls.left.held;
	var rightDown = controls.right.held;
	var downDown = controls.soft.held;
	let fallMultiplier = (gameMode == 'online') ? /*onlineConstants.fallMultiplier*/1 : Math.pow(0.8,DOM.level.innerHTML);
	
	if (gameRunning){
		if (leftDown || rightDown){
			if (DAS == handling.DAS || DAS <= 0){
				if (leftDown){
					while (current.shift(-1,0) && DAS <= -handling.ARR){ //it will guarentee one move
						DAS += handling.ARR;
					}
				}else{
					while (current.shift(1,0) && DAS <= -handling.ARR){
						DAS += handling.ARR;
					}
				}
				display();
				DAS = Math.max(handling.ARR,handling.DAS);
			}
			DAS -= currentFrame - previousFrame;
		}else{
			DAS = handling.DAS;
		}

		if (downDown && handling.ISDF){
			while (current.shift(0,-1)){
				DOM.score.innerHTML = parseInt(DOM.score.innerHTML) + 1;
			}
			display();
		}else{
			if (fallTimer <= 0){
				let fallTotal = fallSpeed * fallMultiplier;
				if (current.shift(0,-1) && downDown){
					DOM.score.innerHTML = parseInt(DOM.score.innerHTML) + 1;
				}
				display();
				fallTimer = fallTotal;
			}else{
				const SDFmultiplier = downDown ? handling.SDF : 1;
				fallTimer -= (currentFrame - previousFrame) * SDFmultiplier;
			}
		}
		
		
		if (!falling){
			lockDelay -= (currentFrame - previousFrame);
			if (lockDelay <= 0){
				while (current.shift(0,-1)){}
				place();
				display();
			}
		}
	}
}

function fullLoop(){
	previousFrame = currentFrame;
	currentFrame = Date.now();
	
	if (gameRunning){
		physics();
	}
	
	/*if (controls.exit.held || exitPercent > 0){
		if (controls[0][3]){
				exitPercent += (currentFrame - previousFrame) / 10;
				exitPercent = Math.min(exitPercent,100);
				if (exitPercent == 100){
					exitPercent = 0;
					escape();
				}
			}else{
				exitPercent -= (currentFrame - previousFrame) / 10;
				exitPercent = Math.max(exitPercent,0);
		}
		DOM.exit.style.setProperty("--barFilled",exitPercent + "%");
	}*/
	
	window.requestAnimationFrame(fullLoop);
}

//BOARD
function place(){
	justHeld = false;
	
	current.place();
	
	var linesCleared = updateBoard();
	
	/*if (gameMode == 'online'){
		if (linesCleared == 0){
			if (garbageQueue.length > 0){
				for (let i = Math.min(garbageQueue.length,8); i > 0; i--){
					board.unshift(garbageQueue.pop());
					board.pop();
					if (garbageMeter.length != 0 && garbageMeter[0] <= 1){
						garbageMeter.shift();
					}else if (garbageMeter.length != 0){
						garbageMeter[0] -= 1;
					}
				}
				displayGarbage();
			}
			socket.emit('send board',board);
		}else{
			socket.emit('cleared line',board,pOffsets(current.pType),current.x,current.y,current.colorIndex,current.kick3,lastMovement);
		}
	}*/
	
	current = new Tetrimino(queue[0]);
	
	
	/*This is genius, this calls a non test of a shift of 0,0 returning a boolean value of if the peice spawns inside another peice already but also because it is not doing a test it will update the falling varabile causing peices spawning on top of blocks to still place properly.*/
	if (!current.shift(0,0)){
		if (gameMode !== 'online'){
			//end(false);
		}else{
			/*socket.emit('defeat', function(place,total){
				end(false,place,total);
			});
			
			gameOver = true;*/
			current = null;
			gameRunning = false;
			clearInterval(timer);
		}
	}
	
	queue.shift();
	
	if (queue.length < 7){
		queue = queue.concat(newBag());
	}
	
	displayQueue();
	
	lockDelay = 500;
	shiftsLeft = 10;
}

function updateBoard(){
	var count = 0;
	for (let i = 0; i < board.length; i++){
		var flag = true;
		for (let j = 0; j < 10; j++){
			flag = board[i][j] != 0 && flag;
		}
		if (flag){
			for (let a = i;a < board.length - 1;a++){
				board[a] = board[a + 1].slice();
			}
			i--;
			count++;
		}
		
	}
	if (count != 0){
		combo++;
		lineCleared(count);
	}else{
		combo = -1;
	}
	return count;
}

function lineCleared(justCleared){
	DOM.lines.innerHTML = parseInt(DOM.lines.innerHTML) + justCleared;
	DOM.level.innerHTML = Math.floor(DOM.lines.innerHTML / 10) + 1;
	
	//updates the broadcast text
	
	DOM.broadcast.style.transition = "opacity 0s linear";
	DOM.broadcast.style.opacity = "1";
	let x = DOM.broadcast.offsetHeight; // updates the css with the javascript
	DOM.broadcast.style.transition = "opacity 1s linear 2s";
	DOM.broadcast.style.opacity = "0";
	
	DOM.combo.style.transition = "opacity 0s linear";
	DOM.combo.style.opacity = "1";
	x = DOM.combo.offsetHeight; // updates the css with the javascript
	DOM.combo.style.transition = "opacity 1s linear 2s";
	DOM.combo.style.opacity = "0";
	/*
	var pc = true;
	board.every(a => a.forEach(b => {
		if (b != 0){
			pc = false;
			return false;
		}
	}));
	if (pc){
		perfectClear();
		pcCount++;
	}
	if (current.tSpin){
		broadcast.innerHTML = "T-SPIN " + linesToText[Math.min(justCleared,11) - 1];
		fullSpins[justCleared - 1]++;
	}else if (current.miniSpin){
		broadcast.innerHTML = "T-SPIN MINI " + linesToText[Math.min(justCleared,11) - 1];
		miniSpins[justCleared - 1]++;
	}else{
		broadcast.innerHTML = linesToText[Math.min(justCleared,11) - 1];
		normalClears[justCleared - 1]++;
	}
	
	//updates the score
	var points = linesToPoints[Math.min(justCleared,4) - 1];
	var spinMultiplier = current.tSpin ? 4 : current.miniSpin ? 4/3 : 1;
	var b2bMultiplier = 1;
	var pcBonus = pc ? 3500 : 0;
	
	if (spinMultiplier != 1 || justCleared >= 4){
		b2bCounter++;
		b2bMultiplier = 1.5;
		if (b2bCounter > 0){
			DOM.b2b.style.opacity = "1";
		}
	}else{
		b2bCounter = -1;
		DOM.b2b.style.opacity = "0";
	}
	DOM.b2b.innerHTML = "B2B x" + b2bCounter;
	if (combo > 0){
		comboOutput.innerHTML = "Combo x" + combo;
	}else{
		comboOutput.innerHTML = "";
	}
		DOM.score.innerHTML = parseInt(DOM.score.innerHTML) + ((Math.floor(points * spinMultiplier * b2bMultiplier / 100)*100) + pcBonus + combo * 50) * DOM.leves.innerHTML;
	
	b2bMax = Math.max(b2bMax,b2bCounter);
	
	if (gameMode == "sprint" && DOM.lines.innerHTML >= 40){
		end(true);
	}*/
	
	//t-spin is 4 times
	//mini tspin is 4/3 times
	//b2b is 1.5 times*/
}

//GENERATORS
function genBlankBoard(){
    let arr = [];
    for (let i = 0; i < 40; i++){
        arr[i] = [];
		for (let j = 0; j < 20; j++){
			arr[i][j] = 0;
		}
	}
    return arr;
}

//EXPORTS
function initalize(elems){
    DOM = elems;
    reset();

    window.requestAnimationFrame(fullLoop);
}

function keyDownHandler(event){
    let key = event.key;

    for (let action in controls){
        if (controls[action].key === key){
            if (controls[action].function !== null){
                controls[action].function();
            }
            controls[action].held = true;
        }
    }
}

function keyUpHandler(event){
    let key = event.key;
	
    for (let action in controls){
        if (controls[action].key === key){
            controls[action].held = false;
        }
    }
}

export {initalize, keyDownHandler, keyUpHandler};