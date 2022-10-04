let trimmedData = 
[
  {
    name:'O',
    state:0,
    map:[
      [1,1],
      [1,1],
    ]
  },
  {
    name:'T',
    state:0,
    map:[
      [0,1,0],
      [1,1,1],
    ],
    center: [1,0]
  },
  {
    name:'T',
    state:1,
    map:[
      [1,0],
      [1,1],
      [1,0],
    ],
    center: [0,1]
  },
  {
    name:'T',
    state:2,
    map:[
      [1,1,1],
      [0,1,0],
    ],
    center: [1,1]
  },
  {
    name:'T',
    state:3,
    map:[
      [0,1],
      [1,1],
      [0,1],
    ],
    center: [1,1]
  },
  {
    name:'L',
    state:0,
    map:[
      [0,0,1],
      [1,1,1],
    ]
  },
  {
    name:'L',
    state:1,
    map:[
      [1,0],
      [1,0],
      [1,1],
    ]
  },
  {
    name:'L',
    state:2,
    map:[
      [1,1,1],
      [1,0,0],
    ]
  },
  {
    name:'L',
    state:3,
    map:[
      [1,1],
      [0,1],
      [0,1],
    ]
  },
  {
    name:'J',
    state:0,
    map:[
      [1,0,0],
      [1,1,1],
    ]
  },
  {
    name:'J',
    state:1,
    map:[
      [1,1],
      [1,0],
      [1,0],
    ]
  },
  {
    name:'J',
    state:2,
    map:[
      [1,1,1],
      [0,0,1],
    ]
  },
  {
    name:'J',
    state:3,
    map:[
      [0,1],
      [0,1],
      [1,1],
    ]
  },
  {
    name:'S',
    state:0,
    map:[
      [0,1,1],
      [1,1,0],
    ]
  },
  {
    name:'S',
    state:1,
    map:[
      [1,0],
      [1,1],
      [0,1],
    ]
  },
  {
    name:'Z',
    state:0,
    map:[
      [1,1,0],
      [0,1,1],
    ]
  },
  {
    name:'Z',
    state:1,
    map:[
      [0,1],
      [1,1],
      [1,0],
    ]
  },
  {
    name:'I',
    state:0,
    map:[
      [1,1,1,1],
    ]
  },
  {
    name:'I',
    state:1,
    map:[
      [1],
      [1],
      [1],
      [1],
    ]
  }
];

function getDifference(oldBoard, newBoard){
  let difference = [];
  let corner = [null, null];

  for (let i = 0; i < oldBoard.length; i++){
    let row = [];
    for (let j = 0; j < oldBoard[i].length; j++){
      if (oldBoard[i][j] !== newBoard[i][j]){
        row.push(j)
      }
    }

    if (row.length > 0){
      corner[1] = corner[1] ?? i; 
      difference.unshift(row);
    }
  }

  let min = 100; //ten probs works here, 40 for sure, no way in hell 100 doesnt work
  for (let i = 0; i < difference.length; i++){
    //dont need to check all indexes for minimum because values will only INCREASE when you go to a higher index in each row
    if (difference[i][0] < min){
      min = difference[i][0];
    }
  }

  corner[0] = min;

  //remove minimum from all values here, just to get index ignoring offset of what was the board.
  for (let i = 0; i < difference.length; i++){
    for (let j = 0; j < difference[i].length; j++){
      difference[i][j] -= min;
    }
  }

  let piece = [];

  for (let row = 0; row < difference.length; row++){
    piece[row] = [];
    for (let j = 0; j < difference[row].length; j++){
      let index = difference[row][j];
      piece[row][index] = 1;
    }
  }

  let width = 0;
  for (let i = 0; i < piece.length; i++){
    if (piece[i].length > width){
      width = piece[i].length;
    }
  }

  for (let i = 0; i < piece.length; i++){
    for (let j = 0; j < width; j++){
      piece[i][j] = piece[i][j] ?? 0;
    }
  }

  return {difference:piece, corner};
}

function testMatch(first, second){
  if (first.length !== second.length){
    return false;
  }

  for (let i = 0; i < first.length; i++){
    if (first[i].length !== second[i].length){
      return false;
    }

    for (let j = 0; j < first[i].length; j++){
      if (first[i][j] !== second[i][j]){
        return false;
      }
    }
  }

  return true;
}

function getMoveData(oldBoard, newBoard){
  let {difference, corner} = getDifference(oldBoard, newBoard);

  var pieceData = {
    valid: false,
    state:null,
    type: null,
    isT: null
  }

  for (let i = 0; i < trimmedData.length; i++){
    let data = trimmedData[i];
    if (testMatch(difference, data.map)){
      pieceData = {
        valid:true,
        state: data.state,
        type: data.name,
        isT: data.name === 'T'
      }

      if (pieceData.isT){
        pieceData.center = [corner[0] + data.center[0], corner[1] + data.center[1]];
      }
      break;
    }
  }

  return pieceData;
}

module.exports = getMoveData;