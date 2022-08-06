import React from 'react';
import './winmenu.css';

const defaultState = {
    display:false,
    playerName:''
};

class WinMenu extends React.Component {
    constructor(props){
        super(props);
        this.state = defaultState;

        this.initialize = this.initialize.bind(this);
        this.KeyHandler = this.KeyHandler.bind(this);
    }

    initialize(gameMode,socket){
        let setState = this.setState.bind(this); 
        socket.on('end',function(username){
            setState({display:true,playerName:username});
            document.addEventListener('keyup', this.KeyHandler, false);
        }.bind(this));
        /*
        ending scenarios:

        offline {
            press r to restart
        }

        online {
            - lose mid game
                press r to sprint
                to c to go to menu
        }

        */
       
    }

    KeyHandler(e){
        console.log('fired');
        this.setState({display:false});
        document.removeEventListener('keyup', this.KeyHandler, false);
    }

    render() {
        return (
            <div className = {'winMenu ' + (this.state.display ? 'visible' : 'hidden')}>
                <span className = 'title'>WINNER</span>
                <span className = 'playerName'>{this.state.playerName}</span>
                <span>PRESS ANY KEY TO RETURN TO THE MENU</span>
            </div>
        )
    }
}
  
export default WinMenu;
