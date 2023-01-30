import { useRef, useEffect, useContext, useState } from 'react';

import { GameModeContext } from '../gameWrapper';

import initalize from './logic.js';
import useControls from '../../../assets/hooks/useControls';
import useSocket from '../../../assets/hooks/useSocket';

import styles from './game.css';

function Game(props){
  let socket = useSocket();
  let gameMode = useContext(GameModeContext);
  let [getControls] = useControls();
  let [display, setDisplay] = useState(null);


  //CANVASES
  let holdRef = useRef();
  let meterRef = useRef();
  let mainRef = useRef();
  let queueRef = useRef();

  //STATS
  let scoreRef = useRef();
  let levelRef = useRef();
  let linesRef = useRef();
  let timeRef = useRef();

  let b2bref = useRef();
  let broadcastRef = useRef();
  let comboRef = useRef();

  let titleRef = useRef();
  
  //WRAPPER
  let wrapperRef = useRef();

  
  useEffect(() => {
    if (gameMode === undefined){
      return;
    }

    let DOM = { //this is probabbly horrible for optimaztion but it works...
      hold: holdRef,
      meter: meterRef,
      main: mainRef,
      queue: queueRef,
      score: scoreRef,
      level: levelRef,
      lines: linesRef,
      time: timeRef,
      b2b: b2bref,
      broadcast: broadcastRef,
      combo: comboRef,
      title: titleRef,
      full: wrapperRef
    }

    let controls = getControls();

    let {addListeners, removeListeners, cleanup} = initalize(DOM, socket, gameMode, controls);

    socket.game = {
      addListeners,
      removeListeners,
      clientRef: wrapperRef
    }

    addListeners();

    return () => {
      cleanup();
      socket.emit('reset');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[gameMode]);

  useEffect(() => {
    let startFunction = () => {
      setDisplay(null);
    }
    
    let specatateFunction = () => {
      setDisplay('none');
    }

    socket.on('start', startFunction);
    socket.on('spectate', specatateFunction);

    return () => {
      socket.off('start', startFunction);
      socket.off('spectate', specatateFunction)
    }
  }, [socket, setDisplay])

  return (
    <div className = {styles.clientWrapper} ref = {wrapperRef} style = {{display}}>
      <div className = {styles.inner_left_wrapper}>
        <canvas width = '100' height = '100' ref={holdRef} className = {styles.box}></canvas>
        <div className = {styles.broadcast_wrapper}>
          <span className = {styles.minor_broadcast} ref={b2bref}/>
          <span className = {styles.broadcast} ref={broadcastRef}/>
          <span className = {styles.minor_broadcast} ref={comboRef}/>
        </div>
        <div className = {styles.statBox}>
          Score
          <span className = {styles.statOutput} ref={scoreRef}>0</span>
        </div>
        <div className = {styles.statBox}>
          Level
          <span className = {styles.statOutput} ref={levelRef}>1</span>
        </div>
        <div className = {styles.statBox}>
          Lines
          <span className = {styles.statOutput} ref={linesRef}>0</span>
        </div>
        <div className = {styles.statBox}>
          Time
          <span className = {styles.statOutput} ref={timeRef}>0:00.000</span>
        </div>
      </div>
      <div>
        <canvas height = '400' width = '20' ref={meterRef} className = {styles.meter}></canvas>
      </div>
      <div className = {styles.inner_center_wrapper}>
        <span className = {styles.center_output} ref={titleRef}></span>
        <canvas height = '400' width = '200' ref={mainRef} className = {styles.box}></canvas>
        <span className = {styles.inner_username_wrapper}>PLAYER</span>
      </div>
      <div className = {styles.inner_right_wrapper}>
        <canvas height = '400' width = '100' ref={queueRef} className = {styles.box}></canvas>
      </div>
    </div>
  )
}
  
export default Game;
