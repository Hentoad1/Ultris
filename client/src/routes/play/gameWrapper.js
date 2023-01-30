import { Fragment, useState, useEffect, createContext } from 'react';

import { useParams } from 'react-router';

import {ReactComponent as Disconnect} from '../../assets/svgs/Disconnected.svg';

import Game from './modules/game.js';
import Chat from './modules/chat';
import Opponents from './modules/opponents.js';
import StatMenu from './modules/statmenu.js';
import WinMenu from './modules/winmenu.js';
import LobbyMenu from './modules/lobbymenu.js';
import useSocket from '../../assets/hooks/useSocket';

import styles from './gameWrapper.css';

const GameModeContext = createContext();

const singlePlayerModes = new Set(['sprint','blitz','endless']);

function Wrapper(){
  let socket = useSocket();
  let [mode, setMode] = useState();
  let [connected, setConnected] = useState(socket.connected);
  let params = useParams();

  useEffect(() => {
    let gameMode = params.gameMode;
    if (singlePlayerModes.has(gameMode)){
      setMode(gameMode);
    }else{
      setMode('online');
      socket.emit('join room',gameMode,(roomData) => {
        socket.setLobbyInfo(roomData);
      });
    }
  },[socket, params.gameMode])

  useEffect(() => {
    window.onbeforeunload = () => {
      socket.removeAllListeners();
      socket.disconnect();
    }

    return () => {
      window.onbeforeunload = null;
    }
  },[socket])

  useEffect(() => {
    let connectHandler = () => setConnected(true);
    let disconnectHandler = () => setConnected(false);

    socket.on('connect', connectHandler);
    socket.on('disconnect', disconnectHandler);

    return () => {
      socket.off('connect', connectHandler);
      socket.off('disconnect', disconnectHandler);
    }
  })

  
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

  let offlineWarning = null;
  if (!connected){
    offlineWarning = (
      <div className = {styles.offline_warning}>
        <Disconnect/>
        <div className = {styles.warning_text}>
          <span>You are playing offline</span>
          <span>High scores wont be saved</span>
        </div>
      </div>
    );
  }

  return (
    <GameModeContext.Provider value = {mode}>
      <div className = {'p ' + styles.main_wrapper}>
        <Game/>
        <StatMenu/>
        {onlineContent}
        {offlineWarning}
      </div>
    </GameModeContext.Provider>
  )
}

export {GameModeContext};
export default Wrapper;