import { Fragment, useState, useEffect, createContext } from 'react';
import { io } from 'socket.io-client';

import { useParams } from 'react-router';

import Game from './modules/game.js';
import Chat from './modules/chat';
import Opponents from './modules/opponents.js';
import StatMenu from './modules/statmenu.js';
import WinMenu from './modules/winmenu.js';
import LobbyMenu from './modules/lobbymenu.js';
import './wrapper.css';

const socket = io('localhost:9000');
const SocketContext = createContext();
const GameModeContext = createContext();

const singlePlayerModes = new Set(['sprint','blitz','endless']);

function Wrapper(){
  let [mode, setMode] = useState();
  let params = useParams();

  useEffect(() => {
    let gameMode = params.gameMode;
    if (singlePlayerModes.has(gameMode)){
      setMode(gameMode);
    }else{
      setMode('online');
      socket.emit('join room',gameMode,function(data,err){
        if (err){
          alert(err);
        }else{
          socket.setLobbyInfo(data);
        }
      });
    }
  },[params.gameMode])

  useEffect(() => {
    window.onbeforeunload = () => {
      socket.removeAllListeners();
      socket.disconnect();
    }
  },[])

  let onlineContent = null;
  if (mode === 'online'){
    onlineContent = (
      <Fragment>
        <Chat/>
        <Opponents/>
        <LobbyMenu/>
        <WinMenu/>
      </Fragment>
    );
  }

  return (
    <SocketContext.Provider value = {socket}>
      <GameModeContext.Provider value = {mode}>
        <div className = 'main_wrapper page_content noscroll'>
          <Game/>
          <StatMenu/>
          {onlineContent}
        </div>
      </GameModeContext.Provider>
    </SocketContext.Provider>
  )
}

export {SocketContext, GameModeContext};
export default Wrapper;