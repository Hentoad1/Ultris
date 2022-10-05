import {useRef,useEffect} from 'react';


import {initalize, keyDownHandler, keyUpHandler} from './logic.js'
import './game.css';

function Game(props){
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

  let removeListeners = function(){
      document.removeEventListener('keydown', keyDownHandler, false);
      document.removeEventListener('keyup', keyUpHandler, false);
  }

  let addListeners = function(){
      document.addEventListener('keydown', keyDownHandler, false);
      document.addEventListener('keyup', keyUpHandler, false);
  }

  let reset = function(){
    addListeners();
    initalize();
  }

  props.globals.game = {
    reset,
    addListeners,
    removeListeners
  }

  useEffect(() => {
      let globals = props.globals;
      let DOM = {
          hold: holdRef.current,
          meter: meterRef.current,
          main: mainRef.current,
          queue: queueRef.current,
          score: scoreRef.current,
          level: levelRef.current,
          lines: linesRef.current,
          time: timeRef.current,
          b2b: b2bref.current,
          broadcast: broadcastRef.current,
          combo: comboRef.current,
          title: titleRef.current,
          full: wrapperRef.current
      }
      globals.game.clientRef = wrapperRef;


      let callbacks = {
          end:globals.statmenu.gameEnd
      }

      initalize(DOM,callbacks,globals.gameMode,globals.socket);

      addListeners();

      return function(){
        removeListeners();
      }
  },[]);

  return (
    <div className = 'clientWrapper' ref = {wrapperRef}>
      <div className = "inner_left_wrapper">
        <canvas width = '100' height = '100' ref={holdRef} className = "box"></canvas>
        <div className = "broadcast_wrapper" > {/*this is for lines being cleared, the css is not yet implemented / transfered; should be re-named to minor broadcast wrapper */}
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
