import React from 'react';
import './lobbymenu.css';

const defaultState = {
    players:[],
    countDownValue:'',
    display:true,
    lobbyinfo:{}
};

class LobbyMenu extends React.Component {
    constructor(props){
        super(props);
        this.state = defaultState;

        props.globals.lobbymenu = {
            setState:this.setState.bind(this)
        }
    }

    componentDidMount(){
        let globals = this.props.globals;
        let socket = globals.socket;
        let setState = this.setState.bind(this);

        socket.on('update lobby',function(users){
            setState({players:users});
        });

        socket.on('countdown',function(secondsLeft){
            setState({countDownValue:`Game Begins in ${secondsLeft} seconds.`});
        });

        socket.on('start',function(){
            setState({countDownValue:'',display:false});
            globals.winmenu.setState({display:false});
        });
    }

    render() {
        let title = <h1 className = 'title'>{this.state.lobbyinfo.name}</h1>
        if (this.state.display){
            return (
                <div className = 'lobbymenu'>
                    {title}
                    <h1 className = 'countdown'>{this.state.countDownValue}</h1>
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
  
export default LobbyMenu;
