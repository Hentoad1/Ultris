import { useRef, useEffect, useContext } from 'react';

import { GameModeContext } from '../gameWrapper';

import initalize from './logic.js'
import './game.css';
import { useOutletContext } from 'react-router';

function Game(props){
  let socket = useOutletContext();
  let gameMode = useContext(GameModeContext);

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

    let {addListeners, removeListeners, cleanup} = initalize(DOM, socket, gameMode);

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

  return (
    <div className = 'clientWrapper' ref = {wrapperRef}>
      <div className = "inner_left_wrapper">
        <canvas width = '100' height = '100' ref={holdRef} className = "box"></canvas>
        <div className = "broadcast_wrapper" >
          <span className = "minor_broadcast" ref={b2bref}/>
          <span className = "broadcast" ref={broadcastRef}/>
          <span className = "minor_broadcast" ref={comboRef}/>
        </div>
        <div className = "statBox">
          Score
          <span className = "statOutput" ref={scoreRef}>0</span>
        </div>
        <div className = "statBox">
          Level
          <span className = "statOutput" ref={levelRef}>1</span>
        </div>
        <div className = "statBox">
          Lines
          <span className = "statOutput" ref={linesRef}>0</span>
        </div>
        <div className = "statBox">
          Time
          <span className = "statOutput" ref={timeRef}>0:00.000</span>
        </div>
      </div>
      <div>
        <canvas height = '400' width = '20' ref={meterRef} className = 'meter'></canvas>
      </div>
      <div className = 'inner_center_wrapper'>
        <span className = "center_output" ref={titleRef}></span>
        <canvas height = '400' width = '200' ref={mainRef} className = "box"></canvas>
        <span className = 'inner_username_wrapper'>PLAYER</span>
      </div>
      <div className = "inner_right_wrapper">
        <canvas id = "queueDisp" height = '400' width = '100' ref={queueRef} className = "box"></canvas>
      </div>
    </div>
  )
}
  
export default Game;
