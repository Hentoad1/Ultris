import { Fragment, createRef, useState, useEffect, useRef, useCallback } from 'react';

import './opponents.css';

//import { bind } from './bind.js';
import useSocket from '../../../assets/hooks/useSocket';

const innerColors = ["#0000", "#D91ED9", "#1E1EBF", "#1EBFBF", "#BF1E1E", "#BF601E", "#1EBF1E", "#D4D421", "#6A6A6A", "#1A1A1A"];
const outerColors = ["#FFFFFF", "#BF1BBF", "#1B1BA6", "#1BA6A6", "#A61B1B", "#A6551B", "#1BA61B", "#A6A61B", "#5C5C5C", "#090909"];
const margin = 10; //margin between opponents
const textHeight = 30; //height of the text under opponents names
const cellSizes = [5, 10, 15, 20];


function Opponents(){
  let socket = useSocket();
  let [users, setUsers] = useState([]);
  let [cellSize, setSize] = useState({})
  let [pid, setPid] = useState(null);

  let updateUser = useCallback((currentUserData, key, value) => {
    let index = users.indexOf(currentUserData);

    if (index === -1){
      return;
    }

    setUsers([
      ...users.slice(0,index),
        {
            ...users[index],
            [key]: value,
        },
        ...users.slice(index + 1)
    ])
  }, [users, setUsers])

  let setUser = useCallback((currentUserData, newUserData) => {
    let index = users.indexOf(currentUserData);

    if (index === -1){
      return;
    }

    setUsers([
      ...users.slice(0,index),
      newUserData,
      ...users.slice(index)
    ])
  }, [users, setUsers])

  useEffect(() => {
    const sendPID = function (id) {
      setPid(id);
    };

    socket.on('sendPID', sendPID);

    return () => {
      socket.off('sendPID', sendPID);
    }
  }, [socket, setPid])

  useEffect(() => {
    let updateUsers = (users) => {
      
      for (let i = 0; i < users.length; i++) {
        let user = users[i];
        if (user.pid === pid) {
          continue;
        }

        let newUser = {
          username:user.username,
          board:genBlankBoard(),
          piece:null,
          pid: user.pid,
        }

        setUsers([...users, newUser])
      }
    }

    socket.on('updateUsers', updateUsers);

    return () => {
      socket.off('updateUsers', updateUsers);
    }
  }, [socket, pid, setUsers]);

  useEffect(() => {
    let receive_board = (board, id) => {
      let user = users.find(e => e.pid === id);

      if (user !== undefined && id !== pid) {
        if (board === undefined) {
          updateUser(user, 'board', genBlankBoard());
        } else {
          updateUser(user, 'board', board);
        }
      }
    }

    let receive_boards = (data) => {
      data.forEach(e => receive_board(e.board,e.pid));
    }

    socket.on('receive board', receive_board);
    socket.on('receive boards', receive_boards);

    return () => {
      socket.off('receive board', receive_board);
      socket.on('receive boards', receive_boards);
    }
  }, [socket, users, updateUser, pid]);

  useEffect(() => {
    let receive_piece = (piece, ghost, color, id) => {
      let user = users.find(e => e.pid === id);

      if (user !== undefined && id !== pid){
        updateUser(user, 'piece', {piece, ghost, color});
      }
    }

    socket.on('receive piece', receive_piece);

    return () => {
      socket.off('receive piece', receive_piece);
    }
  }, [socket, users, pid, updateUser]);

  useEffect(() => {
    let remove_user = (id) => {
      let index = users.findIndex(e => e.pid === id);
      if (index !== -1) {
        setUsers([
          ...users.slice(0,index),
          ...users.slice(index)
        ])
      }
    };

    socket.on('remove_user', remove_user);

    return () => {
      socket.off('remove_user', remove_user);
    }
  }, [socket, users, setUsers]);

  useEffect(() => {
    let end = () => {
      setUsers([]);
    }

    socket.on('end', end);

    return () => {
      socket.off('end', end);
    }
  }, [socket, setUsers]);

  let resize = useCallback(() => {
    let playerWidth = socket.game?.clientRef?.current?.clientWidth ?? 0;

    let availibleWidth = (window.innerWidth - playerWidth - 200) / 2; // divied by 2 for 2 halves
    let availibleHeight = window.innerHeight - 100;


    let newSize = 5;
    for (let i = cellSizes.length - 1; i >= 0; i--) {
      let rows = Math.floor(availibleHeight / (cellSizes[i] * 20 + margin + textHeight)) * 2; // multiply by 2 for 2 halves
      let columns = Math.floor(availibleWidth / (cellSizes[i] * 10 + margin));

      if (rows * columns >= users.length) {
        newSize = cellSizes[i];
        break;
      }
    }

    if (newSize !== cellSize){
      setSize(newSize);
    }
  }, [users, cellSize, setSize]);

  useEffect(() => {
    resize();
  }, [resize]);

  useEffect(() => {
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
    }
  }, [resize]);

  const mapDataToObject = (data, index) => (
    <Opponent key = {index} size = {cellSize} username = {data.username} board = {data.board} piece = {data.piece}/>
  )

  if (users.length > 12){
      const left = users.slice(0,users.length / 2);
      const right = users.slice(users.length / 2);

      return (
          <Fragment>
              <div className = 'multiplayerWrapper' style = {{order:-1}}>
                  {left.map(mapDataToObject)}
              </div>
              <div className = 'multiplayerWrapper'>
                  {right.map(mapDataToObject)}
              </div>
          </Fragment>
      )
  }else{
      return (
          <div className = 'multiplayerWrapper'>
              {users.map(mapDataToObject)}
          </div>
      )
  }
}

function Opponent(props){
  let ref = useRef();


  let pasteOnGrid = useCallback((x, y, colorIndex, ctx) => {
    if (props.size < cellSizes[0]) {
      ctx.fillStyle = outerColors[colorIndex];
      ctx.fillRect(x * props.size, (19 - y) * props.size, props.size, props.size);
    } else {
      ctx.fillStyle = outerColors[colorIndex];
      ctx.fillRect(x * props.size + 0.5, (19 - y) * props.size + 0.5, props.size, props.size);
      ctx.fillStyle = innerColors[colorIndex];
      ctx.fillRect(x * props.size + props.size * 0.25, (19 - y) * props.size + props.size * 0.25, props.size * 0.5, props.size * 0.5);
    }
  }, [props.size]);

  useEffect(() => {
    if (props.board === undefined){
      return;
    }

    let canvas = ref.current;
    let ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);//clears all
    
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#FFFFFF55';

    if (props.size > cellSizes[0]) {
      for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 20; j++) {
          ctx.strokeRect(i * props.size + 0.5, (19 - j) * props.size + 0.5, props.size, props.size);
        }
      }
    }

    for (let i = 0; i < props.board.length; i++) {
      for (let j = 0; j < props.board[i].length; j++) {
        if (props.board[i][j] !== 0) {
          pasteOnGrid(j, i, props.board[i][j], ctx);
        }
      }
    }

    if (props.piece){
      let {piece, ghost, color} = props.piece;

      if (props.size > cellSizes[0]) {
        ctx.fillStyle = innerColors[color] + "88";
        ghost.forEach(e => ctx.fillRect(e[0] * props.size + 1.5, (19 - e[1]) * props.size + 1.5, props.size - 2, props.size - 2));
      }
      
      piece.forEach(e => pasteOnGrid(e[0], e[1], color, ctx, props.size));
    }
  }, [props.size, props.board, props.piece, pasteOnGrid]);

  return (
    <div className = 'opponentWrapper'>
      <canvas ref = {ref} width = {props.size * 10} height = {props.size * 20} className = 'box'></canvas>
      <span>{props.username}</span>
    </div>
  );
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

/*function Opponents(){
  let socket = useSocket();
  let [userData, setUserData] = useState({users: [], redraw: false});
  let [resize, setResize] = useState(null);

  useEffect(() => {
    let [resize, cleanup] = bind(socket,createRef,setUserData);

    setResize(() => (resize)); //necessary otherwise it will assume function passed via reference is a function state update.

    return cleanup;
  }, [socket]);
  
  useEffect(() => {
    if (resize !== null){
      resize();
    }
  }, [resize]);

  let users = userData.users;
  if (users.length > 12){
      const left = users.slice(0,users.length / 2);
      const right = users.slice(users.length / 2);

      return (
          <Fragment>
              <div className = 'multiplayerWrapper' style = {{order:-1}}>
                  {left.map(data => <div key = {data.index} name = {data.username} className = 'opponentWrapper'>{data.canvas}<span>{data.username}</span></div>)}
              </div>
              <div className = 'multiplayerWrapper'>
                  {right.map(data => <div key = {data.index} name = {data.username} className = 'opponentWrapper'>{data.canvas}<span>{data.username}</span></div>)}
              </div>
          </Fragment>
      )
  }else{
      return (
          <div className = 'multiplayerWrapper'>
              {users.map(data => <div key = {data.index} name = {data.username} className = 'opponentWrapper'>{data.canvas}<span>{data.username}</span></div>)}
          </div>
      )
  }
}*/

export default Opponents;
