import React from 'react';

import {initalize, keyDownHandler, keyUpHandler} from './logic.js'

import './game.css';

const defaultState = {

};

class Game extends React.Component {
    constructor(props){
        super(props);
        this.state = defaultState;

        //CANVASES
        this.holdRef = React.createRef();
        this.meterRef = React.createRef();
        this.mainRef = React.createRef();
        this.queueRef = React.createRef();

        //STATS
        this.scoreRef = React.createRef();
        this.levelRef = React.createRef();
        this.linesRef = React.createRef();
        this.timeRef = React.createRef();

        this.b2bref = React.createRef();
        this.broadcastRef = React.createRef();
        this.comboRef = React.createRef();

        this.titleRef = React.createRef();
    }

    componentDidMount() {
        let DOM = {
            hold: this.holdRef.current,
            meter: this.meterRef.current,
            main: this.mainRef.current,
            queue: this.queueRef.current,
            score: this.scoreRef.current,
            level: this.levelRef.current,
            lines: this.linesRef.current,
            time: this.timeRef.current,
            b2b: this.b2bref.current,
            broadcast: this.broadcastRef.current,
            combo: this.comboRef.current,
            title: this.titleRef.current
        }

        let callbacks = {
            updateStats:this.props.updateStatMenu
        }

        initalize(DOM,callbacks);

        document.addEventListener('keydown', keyDownHandler, false);
        document.addEventListener('keyup', keyUpHandler, false);
    }

    componentWillUnmount(){
        document.removeEventListener('keydown', keyDownHandler, false);
        document.removeEventListener('keyup', keyUpHandler, false);
    }

    render() {
        return (
            <React.Fragment>
            <div className = 'clientWrapper'>
                <div className = "inner_left_wrapper">
                    <canvas width = '100' height = '100' ref={this.holdRef} className = "box"></canvas>
                    <div className = "broadcast_wrapper" > {/*this is for lines being cleared, the css is not yet implemented / transfered; should be re-named to minor broadcast wrapper */}
                        <span className = "minor_broadcast" ref={this.b2bref}/>
                        <span className = "broadcast" ref={this.broadcastRef}/>
                        <span className = "minor_broadcast" ref={this.comboRef}/>
                    </div>
                    <div className = "statBox">
                        Score
                        <span className = "statOutput" ref={this.scoreRef}>0</span>
                    </div>
                    <div className = "statBox">
                        Level
                        <span className = "statOutput" ref={this.levelRef}>1</span>
                    </div>
                    <div className = "statBox">
                        Lines
                        <span className = "statOutput" ref={this.linesRef}>0</span>
                    </div>
                    <div className = "statBox">
                        Time
                        <span className = "statOutput" ref={this.timeRef}>0:00.000</span>
                    </div>
                </div>
                <div>
                    <canvas height = '400' width = '20' ref={this.meterRef} className = 'meter'></canvas>
                </div>
                <div className = 'inner_center_wrapper'>
                    <span className = "center_output" ref={this.titleRef}></span>
                    <canvas height = '400' width = '200' ref={this.mainRef} className = "box"></canvas>
                    <span className = 'inner_username_wrapper'>PLAYER</span>
                </div>
                <div className = "inner_right_wrapper">
                    <canvas id = "queueDisp" height = '400' width = '100' ref={this.queueRef} className = "box"></canvas>
                </div>
            </div>
            </React.Fragment>
        )
    }
}
  
export default Game;
