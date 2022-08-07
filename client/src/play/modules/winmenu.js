import React from 'react';
import './winmenu.css';

const defaultState = {
    display:false,
    playerList:[{username:'EPIC GAMER 420',linesSent:10,linesReceived:10},
                {username:'test2',linesSent:10,linesReceived:10},
                {username:'test2',linesSent:10,linesReceived:10},
                {username:'test2',linesSent:10,linesReceived:10},
                {username:'test2',linesSent:10,linesReceived:10},
                {username:'test2',linesSent:10,linesReceived:10},
                {username:'test2',linesSent:10,linesReceived:10},
                {username:'test2',linesSent:10,linesReceived:10},
                {username:'test2',linesSent:10,linesReceived:10},
                {username:'test2',linesSent:10,linesReceived:10},
                {username:'test2',linesSent:10,linesReceived:10},
                {username:'test2',linesSent:10,linesReceived:10},
                {username:'test2',linesSent:10,linesReceived:10},
                {username:'test2',linesSent:10,linesReceived:10},
            ],
};
const suffixList = ['ST','ND','RD','TH'];

class WinMenu extends React.Component {
    constructor(props){
        super(props);
        this.state = defaultState;

        this.initialize = this.initialize.bind(this);
        this.KeyHandler = this.KeyHandler.bind(this);
        this.setVisibility = this.setVisibility.bind(this);
    }

    initialize(gameMode,socket){
        let setState = this.setState.bind(this); 
        socket.on('end',function(players){
            console.log(players);
            setState({display:true,playerList:players});
            new Promise(resolve => setTimeout(resolve, 1000)).then(function(){
                document.addEventListener('keyup', this.KeyHandler, false);
                this.props.forceDisplayState(true);
            }.bind(this));
        }.bind(this));
    }

    KeyHandler(e){
        e.preventDefault();
        this.setState({display:false});
        document.removeEventListener('keyup', this.KeyHandler, false);
    }

    setVisibility(state){
        this.setState({display:state});
    }

    render() {
        return (
            <div className = {'winMenu ' + (this.state.display ? 'visible' : 'hidden')} onKeyDown = {e => e.preventDefault()}>
                {/*<div className = 'winnerWrapper'>
                    <span className = 'username'>{this.state.playerList[0].username}</span>
                    <span className = 'stat'>{this.state.playerList[0].linesSent} LINES SENT</span>
                    <span className = 'stat'>{this.state.playerList[0].linesReceived} LINES RECEIVED</span>
                </div>
                <div className = 'userList'>
                 {this.state.playerList.slice(1).map(function(player,i){
                        return (
                            <div className = 'userStat' key = {i}>
                                <div className = 'place'>{(i + 2) + suffixList[Math.min(i,2)]}</div>
                                <div className = 'username'>{player.username}</div>
                                <div className = 'lines'>{player.linesSent} LINES SENT<br/>{player.linesReceived} LINES RECEIVED</div>
                            </div>
                        )
                    })}
                </div>*/}

                
                <ul className = 'userList'>
                 {this.state.playerList.map(function(player,i){
                        return (
                            <li className = 'userStat' key = {i}>
                                <div className = 'place'>{(i + 1) + suffixList[Math.min(i,3)]}</div>
                                <div className = 'username'>{player.username}</div>
                                <div className = 'lines'>{player.linesSent} LINES SENT<br/>{player.linesReceived} LINES RECEIVED</div>
                            </li>
                        )
                    })}
                </ul>


                <span>PRESS ANY KEY TO RETURN TO THE MENU</span>
            </div>
        )
    }
}
  
export default WinMenu;
