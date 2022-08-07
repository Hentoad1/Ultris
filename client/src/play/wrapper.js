import React from 'react';
import { io } from 'socket.io-client';

import Game from './modules/game.js';
import Chat from './modules/chat';
import Opponents from './modules/opponents.js';
import StatMenu from './modules/statmenu.js';
import WinMenu from './modules/winmenu.js';
import LobbyMenu from './modules/lobbymenu.js';
import './wrapper.css';

const socket = io('localhost:9000');
socket.constants = {
    cellSize:20,
	displayLines:true,
	fallMultiplier:1
};

class Wrapper extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            online:true,
            opponents:[]
        };

        this.statRef = React.createRef();
        this.gameRef = React.createRef();
        this.chatRef = React.createRef();
        this.oppoRef = React.createRef();
        this.lobbyRef = React.createRef();
        this.winRef = React.createRef();

        this.passFunction = this.passFunction.bind(this);
    }

    passFunction(ref,func,...args){
        if (this[ref].current !== null){
            this[ref].current[func](...args);
        }
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

        //i think all the sockets are different conncetions.
        //this fucks up everything

        //add a verification check on the initial connection or something like that.
        this.gameRef.current.initialize(gameMode,socket);
        if (this.state.online){ 
            this.chatRef.current.initialize(gameMode,socket);
            this.oppoRef.current.initialize(gameMode,socket);
            this.lobbyRef.current.initialize(gameMode,socket);
            this.winRef.current.initialize(gameMode,socket);
        }


        window.onbeforeunload = function(){
            socket.removeAllListeners();
            socket.disconnect();
        }

        this.setState({online:gameMode === 'online'});
    }
    
    render() {
        let onlineContent = '';
        if (this.state.online){
            onlineContent = (
                <React.Fragment>
                    <Chat ref={this.chatRef} />
                    <Opponents ref = {this.oppoRef}/>
                    <LobbyMenu ref = {this.lobbyRef} setWinState = {(...args) => this.passFunction('winRef','setVisibility',...args)} setLobbyState = {(...args) => this.passFunction('chatRef','setLobbyState',...args)}/>
                    <WinMenu ref = {this.winRef} forceDisplayState = {(...args) => this.passFunction('lobbyRef','forceDisplayState',...args)}/>
                </React.Fragment>
            );
        }
        
        return (
            <div className = 'main_wrapper'>
                <Game ref = {this.gameRef} clearOpponents = {(...args) => this.passFunction('oppoRef','clearOpponents',...args)} setLobbyDisplay = {(...args) => this.passFunction('lobbyRef','forceDisplayState',...args)} gameEnd = {(...args) => this.passFunction('statRef','gameEnd',...args)}/>
                <StatMenu ref = {this.statRef} reset = {(...args) => this.passFunction('gameRef','reset',...args)}/>
                {onlineContent}
            </div>
        )
    }
}
  
export default Wrapper;
