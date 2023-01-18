const cellChangeRate = 5;
const innerColors = ["#0000", "#D91ED9", "#1E1EBF", "#1EBFBF", "#BF1E1E", "#BF601E", "#1EBF1E", "#D4D421", "#6A6A6A", "#1A1A1A"];
const outerColors = ["#FFFFFF", "#BF1BBF", "#1B1BA6", "#1BA6A6", "#A61B1B", "#A6551B", "#1BA61B", "#A6A61B", "#5C5C5C", "#090909"];
var currentPid = undefined;
var userData = [];
var cellSize = 20;

function bind(socket, createRef, setUserData) {
  
  const endFunction = function () {
    userData = [];
    setUserData({users:userData});
  };

  const PIDFunction = function (id) {
    currentPid = id;
  };

  const updateFunction = function (users) {
    const size = cellSize;
    userData = [];
    for (let i = 0, index = 0; i < users.length; i++) {
      let user = users[i];
      if (user.pid === currentPid) {
        continue;
      }
      let ref = createRef();
      let data = {
        ref,
        canvas: <canvas width={size * 10} height={size * 20} className='box' ref={ref}></canvas>,
        username: user.username,
        board: genBlankBoard(),
        pid: user.pid,
        index
      };
      userData.push(data);
      index++;
    }


    setUserData({users:userData, redraw:true});
  }

  const removeFunction = function (id) {
    let [userIndex] = getUser(id);
    if (userIndex !== -1) {
      userData.splice(userIndex, 1);
      setUserData({users:userData, redraw:false});
    }
  };

  const boardsFunction = function (data) {
    data.forEach(e => replaceBoard(e.board, e.pid));
  };

  function replaceBoard(board, id) {
    let [userIndex, user] = getUser(id);
    if (userIndex !== -1 && id !== currentPid) {
      if (board === undefined) {
        user.board = genBlankBoard();
      } else {
        user.board = board;
      }

      display(user);
    }
  }

  const pieceFunction = function (piece, ghost, color, id) {
    let [userIndex, user] = getUser(id);
    if (userIndex !== -1 && id !== currentPid) {
      display(user, function (ctx, size) {

        if (cellSize > 5) {
          ctx.fillStyle = innerColors[color] + "88";
          ghost.forEach(e => ctx.fillRect(e[0] * size + 1.5, (19 - e[1]) * size + 1.5, size - 2, size - 2));
        }

        piece.forEach(e => pasteOnGrid(e[0], e[1], color, ctx, size));
      });
    }
  };

  function display(user, callback = function () { }) {
    if (user.ref.current === null) {
      return;
    }

    let elem = user.ref.current;
    let ctx = elem.getContext('2d');
    let board = user.board;
    let size = cellSize;
    elem.width = size * 10;
    elem.height = size * 20;

    ctx.clearRect(0, 0, elem.width, elem.height);//clears all

    ctx.lineWidth = 1;
    ctx.strokeStyle = '#FFFFFF55';
    if (cellSize > 5) {
      for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 20; j++) {
          ctx.strokeRect(i * size + 0.5, (19 - j) * size + 0.5, size, size);
        }
      }
    }

    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
        if (board[i][j] !== 0) {
          pasteOnGrid(j, i, board[i][j], ctx);
        }
      }
    }

    if (typeof callback === 'function') {
      callback(ctx, size);
    }
  }

  function pasteOnGrid(x, y, colorIndex, ctx) {
    let size = cellSize;
    if (size < cellChangeRate) {
      ctx.fillStyle = outerColors[colorIndex];
      ctx.fillRect(x * size, (19 - y) * size, size, size);
    } else {
      ctx.fillStyle = outerColors[colorIndex];
      ctx.fillRect(x * size + 0.5, (19 - y) * size + 0.5, size, size);
      ctx.fillStyle = innerColors[colorIndex];
      ctx.fillRect(x * size + size * 0.25, (19 - y) * size + size * 0.25, size * 0.5, size * 0.5);
    }
  }

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

  function getUser(pid) {
    for (let i = 0; i < userData.length; i++) {
      if (userData[i].pid === pid) {
        return [i, userData[i]];
      }
    }
    return [-1, null];
  }

  
  let resize = function(forceRedraw = false) {
    const margin = 10;
    const textHeight = 30;

    let clientWidth = 0;
    if (socket.game.clientRef.current !== null) {
      clientWidth = socket.game.clientRef.current.offsetWidth;
    }

    let availibleWidth = (window.innerWidth - clientWidth - 200) / 2; // divied by 2 for 2 halves
    let availibleHeight = window.innerHeight - 100;


    let acceptableSizes = [5, 10, 15, 20];
    let size = 5;
    for (let i = acceptableSizes.length - 1; i >= 0; i--) {
      let rows = Math.floor(availibleHeight / (acceptableSizes[i] * 20 + margin + textHeight)) * 2; // multiply by 2 for 2 halves
      let columns = Math.floor(availibleWidth / (acceptableSizes[i] * 10 + margin));

      if (rows * columns >= userData.length) {
        size = acceptableSizes[i];
        break;
      }
    }

    let sizeChanged = size !== cellSize;
    cellSize = size;
    if (sizeChanged || forceRedraw) {
      userData.forEach(display);
    }

    return sizeChanged;
  }

  let resizeHandler = () => {
    resize(false); //its important that the event element isnt passed here which would overwrite forceRewdraw variable.
  }

  socket.on('end', endFunction);
  socket.on('sendPID', PIDFunction);
  socket.on('updateUsers', updateFunction);
  socket.on('remove user', removeFunction);
  socket.on('receive boards', boardsFunction);
  socket.on('receive board', replaceBoard);
  socket.on('receive piece', pieceFunction);
  
  window.addEventListener('resize', resizeHandler);

  let cleanup = function (){
    socket.off('end', endFunction);
    socket.off('sendPID', PIDFunction);
    socket.off('updateUsers', updateFunction);
    socket.off('remove user', removeFunction);
    socket.off('receive boards', boardsFunction);
    socket.off('receive board', replaceBoard);
    socket.off('receive piece', pieceFunction);
    window.removeEventListener('resize', resizeHandler);
  }

  return [resize, cleanup];
}

export { bind };