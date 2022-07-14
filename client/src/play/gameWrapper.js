import React from 'react';
import './gameWrapper.css';

import Game from './game.js';
import StatMenu from './statmenu.js';

const defaultState = {

};

class GameWrapper extends React.Component {
    constructor(props){
        super(props);
        this.state = defaultState;

        this.statRef = React.createRef();

        this.updateStatMenu = this.updateStatMenu.bind(this);
    }

    updateStatMenu(stats){
        this.statRef.current.update(stats);
    }

    render() {
        return (
            <div className = 'main_wrapper'>
                <Game updateStatMenu = {this.updateStatMenu}/>
                <StatMenu ref = {this.statRef}/>
            </div>
        )
    }
}
  
export default GameWrapper;
