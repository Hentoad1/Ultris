import React from 'react';
import { io } from "socket.io-client";

import Game from './game.js';
import Chat from './chat';
import StatMenu from './statmenu.js';
import './gameWrapper.css';

const socket = io();
const defaultState = {
    
};

class GameWrapper extends React.Component {
    constructor(props){
        super(props);
        this.state = defaultState;

        this.statRef = React.createRef();
        this.gameRef = React.createRef();
        this.chatRef = React.createRef();


        this.passFunction = this.passFunction.bind(this);
    }

    passFunction(ref,func,...args){
        this[ref].current[func](...args);
    }

    componentDidMount(){
        let gameMode = 'sprint';
        let path = window.location.pathname;
        let parsed = path.slice(path.lastIndexOf('/') + 1);
        if (['sprint','blitz','endless'].includes(parsed)){
            gameMode = parsed;
        }else{
            let code = parsed;
            if (code === 'online'){ // temporary
                gameMode = 'online';
            }
        }
        console.log(gameMode);
        this.gameRef.current.initialize(gameMode,socket);
        this.statRef.current.initialize(gameMode,socket);
        this.chatRef.current.initialize(gameMode,socket);
    }

    render() {
        return (
            <div className = 'main_wrapper'>
                <Game ref = {this.gameRef} gameEnd = {(...args) => this.passFunction('statRef','gameEnd',...args)}/>
                <StatMenu ref = {this.statRef} reset = {(...args) => this.passFunction('gameRef','reset',...args)}/>
                <Chat ref = {this.chatRef}/>
            </div>
        )
    }
}
  
export default GameWrapper;
