import React from 'react';
import { io } from 'socket.io-client';

import Game from './modules/game.js';
import Chat from './modules/chat';
import Opponents from './modules/opponents.js';
import StatMenu from './modules/statmenu.js';
import WinMenu from './modules/winmenu.js';
import LobbyMenu from './modules/lobbymenu.js';
import './wrapper.css';

const socket = io('%PUBLIC_URL%');
socket.constants = {
    cellSize:20,
	displayLines:true,
	fallMultiplier:1
};
let globals = {socket};

class Wrapper extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            online:true,
            opponents:[]
        };
        
        let path = window.location.pathname;
        let parsed = path.slice(path.lastIndexOf('/') + 1);
        if (['sprint','blitz','endless'].includes(parsed)){
            globals.gameMode = parsed;
        }else{
            globals.gameMode = 'online';
            socket.emit('join room',parsed,function(data,err){
                if (err){
                    alert(err);
                }else{
                    globals.lobbymenu.setState({lobbyinfo:data});
                }
            });
        }        
    }

    componentDidMount(){
        window.onbeforeunload = function(){
            socket.removeAllListeners();
            socket.disconnect();
        }
    }
    
    render() {
        let onlineContent = '';
        if (globals.gameMode === 'online'){
            onlineContent = (
                <React.Fragment>
                    <Chat globals = {globals}/>
                    <Opponents globals = {globals}/>
                    <LobbyMenu globals = {globals}/>
                    <WinMenu globals = {globals}/>
                </React.Fragment>
            );
        }
        
        return (
            <div className = 'main_wrapper' ref = {this.wrapperRef}>
                <Game globals = {globals}/>
                <StatMenu globals = {globals}/>
                {onlineContent}
            </div>
        )
    }
}
  
export default Wrapper;
