import {useRef,useEffect} from 'react';


import initalize from './logic.js'
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

  
  useEffect(() => {
    let globals = props.globals;
    let socket = globals.socket;

    let DOM = {
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

    let callbacks = {
      end:globals.statmenu.gameEnd
    }

    let {addListeners, removeListeners} = initalize(DOM,callbacks,globals.gameMode,socket);

    let reset = function(){
      //addListeners();
      //initalize();
    }

    globals.game = {
      reset,
      addListeners,
      removeListeners,
      clientRef: wrapperRef
    }

    addListeners();

    return () => {
      removeListeners();
      socket.emit('reset');
    }
    //the globals object shouldnt be used in this manner but whatever im too deep in my past mistakes of not knowing how react works
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
