const getMoveData = require('./moveData');

function clearBoard(inital){
  let linesCleared = 0;
  let board = inital.map(e => e.slice());

  for (let i = 0; i < board.length; i++){
    if (rowIsFull(board[i])){
      board.splice(i, 1);
      board.push(new Array(10).fill(0));
      linesCleared++;
      i--;
    }
  }

  return [linesCleared, board]

  function rowIsFull(arr){
    for (let i = 0; i < arr.length; i++){
      if (arr[i] === 0){
        return false;
      }
    }
    return true;
  }
}

function getCorners(state){
  let corners = [[-1,1],[1,1],[1,-1],[-1,-1]];

  for (let i = 0; i < state; i++){
    corners.push(corners.shift());
  }

  return corners;
}

function getClearData(board, moveData){
  let [linesCleared, clearedBoard] = clearBoard(board);

  var clearData = {
    linesCleared,
    type:'Normal',
    complexMove:linesCleared == 4
  }

  if (linesCleared === 0){
    return [clearData, clearedBoard];
  }

  if (moveData.isT){
    let corners = getCorners(moveData.state);
    let cornerValues = [];
    let totalCorners = 0;
    for (let i = 0; i < corners.length; i++){
      let x = corners[i][0] + moveData.center[0];
      let y = corners[i][1] + moveData.center[1];
      if (x < 0 || y < 0 || y > board.length || x > board[y].length){ //catch out of the bounds of the array
        cornerValues[i] = true;
        totalCorners++;
      }else if (board[y][x] !== 0){
        cornerValues[i] = true;
        totalCorners++;
      }else{
        cornerValues[i] = false;
      }
    }

    if (totalCorners >= 3){
      clearData.complexMove = true;
      if (cornerValues[0] && cornerValues[1]){
        clearData.type = 'T-Spin';
      }else{
        clearData.type = 'T-Spin-Mini';
      }
    }
  }

  return [clearData, clearedBoard];
}

module.exports = getClearData;