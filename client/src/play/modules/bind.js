const cellChangeRate = 5;
const innerColors = ["#0000","#D91ED9", "#1E1EBF", "#1EBFBF", "#BF1E1E", "#BF601E", "#1EBF1E", "#D4D421","#6A6A6A","#1A1A1A"];
const outerColors = ["#FFFFFF","#BF1BBF", "#1B1BA6", "#1BA6A6", "#A61B1B", "#A6551B", "#1BA61B", "#A6A61B","#5C5C5C","#090909"];
var currentPid = undefined;
var userData = [];

function bind(socket,getRef,setState){

	socket.on('sendPID', function(id){
		currentPid = id;
	});

    socket.on('updateUsers', function(users, spectate = false){
		console.log('currentPid', currentPid);
		console.log('users', users);
		const size = socket.constants.cellSize;
		userData = [];
		for (let i = 0, index = 0; i < users.length; i++){
			let user = users[i];
			if (user.pid === currentPid){
				continue;
			}
			let ref = getRef();
			let data = {
				ref,
				canvas: <canvas width = {size * 10} height = {size * 20} className = 'box' ref = {ref}></canvas>,
				username: user.username,
				board:genBlankBoard(),
				pid: user.pid,
				index
			};
			userData.push(data);
			index++;
		}

		console.log('userData', userData);
		
		setState({userData},() => resize(true));
		console.log('mounted');	
	});

	socket.on('remove user', function(id){
		let [userIndex, user] = getUser(id);
		if (userIndex !== -1){
			userData.splice(userIndex,1);
			setState({userData},() => resize());
		}
	});

	socket.on('recieve boards', function(data){
		data.forEach(e => replaceBoard(e.board, e.pid));
	});
	
	socket.on('recieve board', replaceBoard);
	
	function replaceBoard(board,id){
		let [userIndex, user] = getUser(id);
		if (userIndex !== -1 && id !== currentPid){
			if (board === undefined){
				user.board = genBlankBoard();
			}else{
				user.board = board;
			}
			
			display(user);
		}
	}

	socket.on('recieve peice', function(peice, ghost, color, id){
		let [userIndex, user] = getUser(id);
		if (userIndex !== -1 && id !== currentPid){
			display(user,function(ctx,size){

				if (socket.constants.displayLines){
					ctx.fillStyle = innerColors[color] + "88";
					ghost.forEach(e => ctx.fillRect(e[0] * size + 1.5,(19 - e[1]) * size + 1.5,size - 2,size - 2));
				}
				
				peice.forEach(e => pasteOnGrid(e[0],e[1],color,ctx,size));
			});
		}		
	});

	function resize(forceRedraw = false){
		userData.forEach(display);
		return false;
	}

	function display(user,callback = function(){}){
		console.log('display called');
		if (user.ref.current === null){
			console.log('no canvas');
			return;
		}

		let elem = user.ref.current;
		let ctx = elem.getContext('2d');
		let board = user.board;
		let size = socket.constants.cellSize;

		ctx.clearRect(0,0,elem.width,elem.height);//clears all
		
		ctx.lineWidth = 1;
		ctx.strokeStyle = '#FFFFFF55';
		if (socket.constants.displayLines){
			for (let i = 0; i < 10; i++){
				for (let j = 0; j < 20; j++){
					ctx.strokeRect(i * size + 0.5,(19 - j) * size + 0.5,size,size);
				}
			}
		}
		
		for (let i = 0; i < board.length; i++){
			for (let j = 0; j < board[i].length; j++){
				if (board[i][j] != 0){
					pasteOnGrid(j,i,board[i][j],ctx);
				}
			}
		}

		if (typeof callback === 'function'){
			callback(ctx,size);
		}
	}

	function pasteOnGrid(x,y,colorIndex,ctx){
		let size = socket.constants.cellSize;
		if (size < cellChangeRate){
			ctx.fillStyle = outerColors[colorIndex];
			ctx.fillRect(x * size,(19 - y) * size,size,size);
		}else{
			ctx.fillStyle = outerColors[colorIndex];
			ctx.fillRect(x * size + 0.5,(19 - y) * size + 0.5,size,size);
			ctx.fillStyle = innerColors[colorIndex];
			ctx.fillRect(x * size + size * 0.25,(19 - y) * size + size * 0.25,size * 0.5,size * 0.5);
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

	function getUser(pid){
		for (let i = 0; i < userData.length; i++){
			if (userData[i].pid === pid){
				return [i, userData[i]];
			}
		}
		return [-1, null];
	}
}

function reset(){
	userData = [];
}

export { bind,reset };