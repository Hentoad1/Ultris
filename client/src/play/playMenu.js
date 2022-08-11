import React from 'react';
import { Link, Navigate  } from 'react-router-dom';
import { io } from 'socket.io-client';

import './playMenu.css';

const socket = io('%PUBLIC_URL%');

const defaultState = {
    redirect:null,
};

class PlayMenu extends React.Component {
    constructor(props){
        super(props);
        this.state = defaultState;

        this.createRoom = this.createRoom.bind(this);
    }

    createRoom(){
        socket.emit('create room',function(code){
            this.setState({redirect:<Navigate to = {'/play/' + code} />});
        }.bind(this));
    }

    render() {
        if (this.state.redirect){
            return this.state.redirect;
        }else{
            return (
                <div>
                    <Link to = "sprint">sprint</Link>
                    <button onClick = {this.createRoom}>create room</button>
                </div>
            )
        }
        
    }
}

export default PlayMenu;
