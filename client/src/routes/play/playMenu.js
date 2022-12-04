import React from 'react';
import { Link, useNavigate  } from 'react-router-dom';
import { io } from 'socket.io-client';

import './playMenu.css';

const socket = io('localhost:9000');

function PlayMenu(){
  let Navigate = useNavigate();

  let createRoom = function(){
    socket.emit('create room',roomcode => {
      Navigate('/play/' + roomcode);
    });
  }

  return (
    <div>
        <Link to = "sprint">sprint</Link>
        <button onClick = {createRoom}>create room</button>
    </div>
  )
}

export default PlayMenu;
