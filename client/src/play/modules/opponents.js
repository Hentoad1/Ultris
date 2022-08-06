import React from 'react';

import './opponents.css';

//var {bind, reset} = require('./bind.js');

import {bind, reset} from './bind.js';

const defaultState = {
    userData:[]
};

class Opponents extends React.Component {
    constructor(props){
        super(props);
        this.state = defaultState;

        this.initialize = this.initialize.bind(this);
    }

    clearOpponents(){
        reset();
        this.setState({userData:[]});
    }

    initialize(gameMode,socket){
        bind(socket,React.createRef.bind(this),this.setState.bind(this));
    }

    render() {
        return (
            <div className = 'multiplayerWrapper'>
                {this.state.userData.map(data => <div key = {data.index} name = {data.username} className = 'opponentWrapper'>{data.canvas}<span>{data.username}</span></div>)}
            </div>
        )
    }
}

export default Opponents;
