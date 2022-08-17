import React from 'react';

import './opponents.css';

import { bind } from './bind.js';

const defaultState = {
    userData:[]
};

class Opponents extends React.Component {
    constructor(props){
        super(props);
        this.state = defaultState;

        props.globals.opponents = {
            setState:this.setState.bind(this)
        }
    }

    componentDidMount(){
        bind(this.props.globals,React.createRef.bind(this),this.setState.bind(this));
    }

    render() {
        const userData = this.state.userData;
        if (userData.length > 12){
            const left = userData.slice(0,userData.length / 2);
            const right = userData.slice(userData.length / 2);

            return (
                <React.Fragment>
                    <div className = 'multiplayerWrapper' style = {{order:-1}}>
                        {left.map(data => <div key = {data.index} name = {data.username} className = 'opponentWrapper'>{data.canvas}<span>{data.username}</span></div>)}
                    </div>
                    <div className = 'multiplayerWrapper'>
                        {right.map(data => <div key = {data.index} name = {data.username} className = 'opponentWrapper'>{data.canvas}<span>{data.username}</span></div>)}
                    </div>
                </React.Fragment>
            )
        }else{
            return (
                <div className = 'multiplayerWrapper'>
                    {userData.map(data => <div key = {data.index} name = {data.username} className = 'opponentWrapper'>{data.canvas}<span>{data.username}</span></div>)}
                </div>
            )
        } 
    }
}

export default Opponents;
