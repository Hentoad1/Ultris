import React from 'react';

import './winmenu.css';

const defaultState = {
    display:false,
    playerList:[{username:'EPIC GAMER 420',linesSent:10,linesReceived:10},
                {username:'USERNAME',linesSent:10,linesReceived:10},
                {username:'USERNAME',linesSent:10,linesReceived:10},
                {username:'USERNAME',linesSent:10,linesReceived:10},
                {username:'USERNAME',linesSent:10,linesReceived:10},
                {username:'USERNAME',linesSent:10,linesReceived:10},
                {username:'USERNAME',linesSent:10,linesReceived:10},
                {username:'USERNAME',linesSent:10,linesReceived:10},
                {username:'USERNAME',linesSent:10,linesReceived:10},
                {username:'USERNAME',linesSent:10,linesReceived:10},
                {username:'USERNAME',linesSent:10,linesReceived:10},
                {username:'USERNAME',linesSent:10,linesReceived:10},
                {username:'USERNAME',linesSent:10,linesReceived:10},
                {username:'USERNAME',linesSent:10,linesReceived:10},
            ],
};
const suffixList = ['ST','ND','RD','TH'];


class WinMenu extends React.Component {
    constructor(props){
        super(props);
        this.state = defaultState;

        this.KeyHandler = this.KeyHandler.bind(this);

        props.globals.winmenu = {
            setState:this.setState.bind(this)
        }
    }

    componentDidMount(){
        let socket = this.props.globals.socket;

        socket.on('end',function(players){
            this.setState({display:true,playerList:players});
            new Promise(resolve => setTimeout(resolve, 1000)).then(function(){
                document.addEventListener('keyup', this.KeyHandler, false);
                this.props.globals.lobbymenu.setState({display:true});
            }.bind(this));
        }.bind(this));
    }

    KeyHandler(e){
        e.preventDefault();
        this.setState({display:false});
        document.removeEventListener('keyup', this.KeyHandler, false);
    }

    render() {
        return (
            <div className = {'winMenu ' + (this.state.display ? 'visible' : 'hidden')} onKeyDown = {e => e.preventDefault()}>
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
