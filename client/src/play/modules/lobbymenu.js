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
        let props = this.props;
        console.log(props);

        socket.on('update lobby',function(users){
            setState({players:users});
        });

        socket.on('countdown',function(secondsLeft){
            setState({countDownValue:secondsLeft});
        });

        socket.on('start',function(){
            setState({countDownValue:'',display:false});
            props.setWinState(false);
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
