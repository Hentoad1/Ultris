import React from 'react';
import './lobbymenu.css';

const defaultState = {
    players:[],
    countDownValue:'',
    display:true
};

class StatMenu extends React.Component {
    constructor(props){
        super(props);
        this.state = defaultState;

        this.forceDisplayState = this.forceDisplayState.bind(this);
    }

    forceDisplayState(state){
        this.setState({display:state});
    }

    initialize(gameMode,socket){
        let setState = this.setState.bind(this);

        socket.on('update lobby',function(users){
            setState({players:users});
        });

        socket.on('countdown',function(secondsLeft){
            if (secondsLeft === 0){
                setState({countDownValue:secondsLeft,display:false});
            }else{
                setState({countDownValue:secondsLeft});
            }
        });
    }

    render() {
        if (this.state.display){
            return (
                <div className = 'lobbymenu'>
                    <h1>{this.state.countDownValue}</h1>
                    <ul className = 'userlist'>
                        {this.state.players.map((username,i) => <li key = {i}>{username}</li>)}
                    </ul>
                </div>
            )
        }else{
            return;
        }
    }
}
  
export default StatMenu;
