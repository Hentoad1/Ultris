import React from 'react';
import './winmenu.css';

const defaultState = {
    display:false,
    displayMinors:true,
    primaryStat:'',
    primaryStatValue:'',
    secondaryStats:[],
    minorStats:[],
    online:false
};

class WinMenu extends React.Component {
    constructor(props){
        super(props);
        this.state = defaultState;

        this.initialize = this.initialize.bind(this);
    }

    initialize(gameMode,socket){
        /*
        ending scenarios:

        offline {
            press r to restart
        }

        online {
            - lose mid game
                press r to sprint
                to c to go to menu
            - lose end of the game
                press and key to continue to menu
        }

        */
       socket.on('end',function(...args){
        console.log('fired',args);
       });
    }

    render() {
        return (
            <div className = {'winMenu ' + (this.state.display ? 'visible' : 'hidden')}>
                <span className = 'title'>{this.state.primaryStat}</span>
                <span className = 'playerName'>{this.state.primaryStatValue}</span>
                <span>
                PRESS R TO RESTART<br/>
                PRESS ESC TO EXIT TO MENU
                </span>
            </div>
        )
    }
}
  
export default WinMenu;
