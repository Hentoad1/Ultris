import React from 'react';
import './gameWrapper.css';

import Game from './game.js';

const defaultState = {

};

class GameWrapper extends React.Component {
    constructor(props){
        super(props);
        this.state = defaultState;
    }

    render() {
        return (
            <div className = 'main_wrapper'>
                <Game />
            </div>
        )
    }
}
  
export default GameWrapper;
